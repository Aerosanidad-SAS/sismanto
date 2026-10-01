"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  correoInterno,
  generarCodigo,
  validarUsuario,
  type ErrorUsuario,
  type FilaUsuarioCruda,
  type UsuarioFila,
} from "@/lib/usuarios-carga";

export interface UsuarioCreado {
  cedula: string;
  nombre: string;
  rol: string;
  centro: string | null;
  codigo: string;
}

export interface ReporteUsuarios {
  aplicado: boolean;
  nuevos: number;
  /** Cédula ya registrada: no se toca. */
  existentes: { fila: number; cedula: string }[];
  errores: ErrorUsuario[];
  creados: UsuarioCreado[];
}

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este repo (ver CLAUDE.md).
type Fila = Record<string, any>;

/**
 * Carga masiva de usuarios. Con `confirmar = false` solo valida y dice qué haría; con `true` crea la cuenta en Auth y el
 * perfil (rol, centro, código de acceso) y marca que debe cambiar la clave en su primer ingreso. Solo ADMIN y ANALISTA;
 * solo un ADMIN puede crear otro ADMIN. Nunca modifica a un usuario que ya existe. El navegador la llama por lotes
 * (`FILAS_POR_LOTE_USUARIOS`).
 */
export async function cargarUsuarios(filas: FilaUsuarioCruda[], confirmar: boolean): Promise<ReporteUsuarios | { error: string }> {
  const caller = await requireRole(["ADMIN", "ANALISTA"]);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { error: "SUPABASE_SERVICE_ROLE_KEY no configurado." };
  if (filas.length > 500) return { error: "Máximo 500 filas por archivo." };

  const admin = createAdminClient() as any;
  const reporte: ReporteUsuarios = { aplicado: confirmar, nuevos: 0, existentes: [], errores: [], creados: [] };
  const error = (fila: number, columna: string | undefined, mensaje: string) => reporte.errores.push({ fila, columna, mensaje });

  const { data: centros } = await admin.from("operational_centers").select("id, codigo").eq("activo", true);
  const centroId = new Map<string, number>((centros ?? []).map((c: Fila) => [c.codigo, c.id]));
  const { data: roles } = await admin.from("roles").select("id, codigo");
  const rolId = new Map<string, number>((roles ?? []).map((r: Fila) => [r.codigo, r.id]));

  // ── Validación de filas y duplicados dentro del archivo ───────────────────
  const validas: { fila: number; u: UsuarioFila }[] = [];
  const cedulas = new Map<string, number>();
  const correos = new Map<string, number>();
  const codigos = new Map<string, number>();
  for (const { fila, datos } of filas) {
    const r = validarUsuario(datos, new Set(centroId.keys()));
    if (!r.ok) { r.errores.forEach((e) => error(fila, e.columna, e.mensaje)); continue; }
    const u = r.valor;
    if (u.rol === "ADMIN" && caller.role_codigo !== "ADMIN") { error(fila, "rol", "Solo un Administrador puede crear otro Administrador."); continue; }
    if (cedulas.has(u.cedula)) { error(fila, "cedula", `La cédula ${u.cedula} ya está en la fila ${cedulas.get(u.cedula)}.`); continue; }
    if (u.email && correos.has(u.email)) { error(fila, "email", `El correo ${u.email} ya está en la fila ${correos.get(u.email)}.`); continue; }
    if (u.codigo && codigos.has(u.codigo)) { error(fila, "codigo_acceso", `El código ${u.codigo} ya está en la fila ${codigos.get(u.codigo)}.`); continue; }
    cedulas.set(u.cedula, fila);
    if (u.email) correos.set(u.email, fila);
    if (u.codigo) codigos.set(u.codigo, fila);
    validas.push({ fila, u });
  }

  // ── Contra lo que ya existe ───────────────────────────────────────────────
  const { data: porCedula } = validas.length
    ? await admin.from("user_profiles").select("cedula").in("cedula", validas.map((v) => v.u.cedula))
    : { data: [] as Fila[] };
  const cedulasExistentes = new Set<string>((porCedula ?? []).map((p: Fila) => p.cedula));
  const { data: todosCodigos } = await admin.from("user_profiles").select("codigo_acceso").not("codigo_acceso", "is", null);
  const codigosUsados = new Set<string>((todosCodigos ?? []).map((p: Fila) => p.codigo_acceso));
  // Un código no puede coincidir con una cédula: ambos se escriben en el mismo campo de login.
  const { data: cedulasSeisDigitos } = await admin.from("user_profiles").select("cedula").like("cedula", "______");
  for (const p of (cedulasSeisDigitos ?? []) as Fila[]) codigosUsados.add(p.cedula);

  const nuevos: { fila: number; u: UsuarioFila }[] = [];
  for (const v of validas) {
    if (cedulasExistentes.has(v.u.cedula)) { reporte.existentes.push({ fila: v.fila, cedula: v.u.cedula }); continue; }
    if (v.u.codigo && codigosUsados.has(v.u.codigo)) { error(v.fila, "codigo_acceso", `El código ${v.u.codigo} ya lo tiene otra persona.`); continue; }
    if (v.u.codigo) codigosUsados.add(v.u.codigo);
    nuevos.push(v);
  }
  reporte.nuevos = nuevos.length;
  if (!confirmar) return reporte;

  // ── Creación ──────────────────────────────────────────────────────────────
  let creados = 0;
  for (const { fila, u } of nuevos) {
    const codigo = u.codigo ?? generarCodigo(codigosUsados);
    const { data: auth, error: errAuth } = await admin.auth.admin.createUser({
      email: u.email ?? correoInterno(u.cedula),
      password: u.password,
      email_confirm: true,
    });
    if (errAuth || !auth?.user) {
      error(fila, errAuth?.message?.toLowerCase().includes("already") ? "email" : undefined, errAuth?.message?.toLowerCase().includes("already") ? "Ese correo ya tiene una cuenta." : (errAuth?.message ?? "No se pudo crear la cuenta."));
      continue;
    }
    const { error: errPerfil } = await admin.from("user_profiles").insert({
      user_id: auth.user.id,
      role_id: rolId.get(u.rol),
      nombre_completo: u.nombre,
      email: u.email,
      cedula: u.cedula,
      ciudad: u.ciudad,
      operational_center_id: u.centro ? (centroId.get(u.centro) ?? null) : null,
      activo: true,
      codigo_acceso: codigo,
      debe_cambiar_password: true,
    });
    if (errPerfil) {
      await admin.auth.admin.deleteUser(auth.user.id); // sin perfil la cuenta no sirve y bloquearía el correo
      error(fila, undefined, errPerfil.code === "23505" ? "Esa cédula o ese código ya existen." : errPerfil.message);
      continue;
    }
    creados++;
    reporte.creados.push({ cedula: u.cedula, nombre: u.nombre, rol: u.rol, centro: u.centro, codigo });
  }
  reporte.nuevos = creados;

  if (creados > 0) {
    await auditar("INSERTAR", "usuarios", "", `Carga masiva de usuarios: ${creados} creados, ${reporte.existentes.length} ya existían, ${reporte.errores.length} con error`);
    revalidatePath("/admin/usuarios");
  }
  return reporte;
}
