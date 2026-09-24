/**
 * ETL de usuarios SISRES → SISMANTO (lógica pura, sin red ni base de datos: se prueba con dobles).
 *
 * Diferencias reales entre los dos sistemas que obligan a rechazar filas (cada rechazo sale con su motivo, nunca en silencio):
 *  - SISRES entra con la cédula (`usuario`); SISMANTO entra con CORREO → sin correo no hay cómo iniciar sesión.
 *  - SISRES permite correos repetidos entre personas; en Supabase Auth el correo es único.
 *  - El cargo se traduce con `rolParaCargoSisres`; un cargo sin equivalente (p. ej. 0) se rechaza, nunca recibe un rol por defecto.
 *  - Las contraseñas NO se migran: cada usuario nuevo recibe una clave aleatoria que nadie conoce y entra por «olvidé mi contraseña».
 *  - Los usuarios inactivos (estado ≠ 1) no se importan: en SISRES ya no podían entrar.
 */
import { rolParaCargoSisres } from "../../scripts/cargo-sisres-a-rol";

export type FilaUsuario = Record<string, string>;

export interface UsuarioNuevo {
  sisresId: string;
  cedula: string;
  email: string;
  nombre: string;
  ciudad: string | null;
  rol: string;
}

export interface Omitido {
  motivo: string;
  fila: FilaUsuario;
}

export interface PlanUsuarios {
  crear: UsuarioNuevo[];
  omitidos: Omitido[];
}

/** Sin barras invertidas (se pierden al pasar por scripts). Solo ASCII: un correo con caracteres raros lo rechazaría Auth de todos modos. */
export function correoValido(correo: string): boolean {
  if (correo.length > 254) return false;
  const partes = correo.split("@");
  if (partes.length !== 2) return false;
  const [local, dominio] = partes;
  if (!/^[A-Za-z0-9._%+-]+$/.test(local) || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  const etiquetas = dominio.split(".");
  if (etiquetas.length < 2) return false;
  if (!etiquetas.every((e) => e.length > 0 && /^[A-Za-z0-9-]+$/.test(e) && !e.startsWith("-") && !e.endsWith("-"))) return false;
  return /^[A-Za-z]{2,}$/.test(etiquetas[etiquetas.length - 1]);
}

/**
 * Solo dígitos (con `.0` final opcional, que deja MySQL en un DOUBLE). NO se interpreta notación científica ni se pasa por
 * Number: por encima de 2^53 corrompería la cédula sin avisar. Lo ilegible se rechaza con motivo.
 */
export function cedulaDe(fila: FilaUsuario): string | null {
  for (const campo of ["usuario", "identificacion"]) {
    const m = (fila[campo] ?? "").trim().match(/^([0-9]+)([.]0+)?$/);
    if (!m) continue;
    const digitos = m[1].replace(/^0+/, "");
    if (digitos) return digitos;
  }
  return null;
}

export function nombreDe(fila: FilaUsuario): string {
  return ["nombre1", "nombre2", "apellido1", "apellido2"]
    .map((c) => (fila[c] ?? "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/ +/g, " ");
}

export function planificarUsuarios(filas: FilaUsuario[]): PlanUsuarios {
  const crear: UsuarioNuevo[] = [];
  const omitidos: Omitido[] = [];
  const porCorreo = new Map<string, string>(); // correo → id SISRES que se quedó con él
  const porCedula = new Map<string, string>();
  const omitir = (fila: FilaUsuario, motivo: string) => omitidos.push({ motivo, fila });

  // El id más bajo gana un correo/cédula repetidos: es el registro más antiguo, y el resultado no depende del orden del archivo.
  const conId = filas.filter((f) => {
    const valido = /^[0-9]+$/.test((f.id ?? "").trim());
    if (!valido) omitir(f, "Sin id de SISRES válido");
    return valido;
  });
  const ordenadas = conId.sort((a, b) => Number(a.id) - Number(b.id));

  for (const f of ordenadas) {
    if ((f.estado ?? "").trim() !== "1") {
      omitir(f, `Inactivo en SISRES (estado ${f.estado ?? "?"})`);
      continue;
    }
    const rol = rolParaCargoSisres(f.cargo);
    if (!rol) {
      omitir(f, `Cargo ${f.cargo ?? "?"} sin equivalente en SISMANTO`);
      continue;
    }
    const email = (f.correo ?? "").trim().toLowerCase();
    if (!email) {
      omitir(f, "Sin correo: SISMANTO inicia sesión con correo");
      continue;
    }
    if (!correoValido(email)) {
      omitir(f, `Correo inválido: ${email}`);
      continue;
    }
    const cedula = cedulaDe(f);
    if (!cedula) {
      omitir(f, "Sin cédula legible");
      continue;
    }
    const otroCorreo = porCorreo.get(email);
    if (otroCorreo !== undefined) {
      omitir(f, `Correo repetido con el usuario SISRES ${otroCorreo}: definir a quién pertenece`);
      continue;
    }
    const otraCedula = porCedula.get(cedula);
    if (otraCedula !== undefined) {
      omitir(f, `Cédula repetida con el usuario SISRES ${otraCedula}`);
      continue;
    }
    porCorreo.set(email, f.id);
    porCedula.set(cedula, f.id);
    crear.push({
      sisresId: f.id,
      cedula,
      email,
      nombre: nombreDe(f) || email,
      ciudad: (f.ciudad ?? "").trim() || null,
      rol,
    });
  }
  return { crear, omitidos };
}

// ─── Ejecución (contra un "puerto" para poder probarla sin Supabase) ─────────────────────────────

export interface PuertoUsuarios {
  /** Motivo por el que el usuario ya existe (perfil con ese correo o cédula), o null si es nuevo. */
  yaExiste: (email: string, cedula: string) => Promise<string | null>;
  rolId: (codigo: string) => Promise<number | null>;
  crearAuth: (email: string, clave: string) => Promise<{ id: string } | { error: string }>;
  crearPerfil: (p: { userId: string; roleId: number; u: UsuarioNuevo }) => Promise<string | null>;
  borrarAuth: (userId: string) => Promise<void>;
  claveAleatoria: () => string;
}

export interface ResultadoCreacion {
  creados: UsuarioNuevo[];
  omitidos: Omitido[];
  fallidos: { usuario: UsuarioNuevo; error: string }[];
}

/**
 * Crea los usuarios del plan. Idempotente: quien ya tiene perfil (mismo correo o cédula) se omite SIN tocar su rol.
 * Si el perfil no se puede crear, se borra el usuario de Auth recién creado (no quedan cuentas sin rol).
 */
export async function crearUsuarios(plan: PlanUsuarios, puerto: PuertoUsuarios): Promise<ResultadoCreacion> {
  const res: ResultadoCreacion = { creados: [], omitidos: [...plan.omitidos], fallidos: [] };
  const roles = new Map<string, number | null>();

  for (const u of plan.crear) {
    let authId: string | null = null;
    try {
      const existe = await puerto.yaExiste(u.email, u.cedula);
      if (existe) {
        res.omitidos.push({ motivo: `Ya existe en SISMANTO: ${existe}`, fila: { id: u.sisresId, correo: u.email, usuario: u.cedula } });
        continue;
      }
      if (!roles.has(u.rol)) roles.set(u.rol, await puerto.rolId(u.rol));
      const roleId = roles.get(u.rol);
      if (!roleId) {
        res.fallidos.push({ usuario: u, error: `El rol ${u.rol} no existe en la base (¿migración 076 aplicada?)` });
        continue;
      }
      const auth = await puerto.crearAuth(u.email, puerto.claveAleatoria());
      if ("error" in auth) {
        res.fallidos.push({ usuario: u, error: `Auth: ${auth.error}` });
        continue;
      }
      authId = auth.id;
      const errPerfil = await puerto.crearPerfil({ userId: auth.id, roleId, u });
      if (errPerfil) throw new Error(`Perfil: ${errPerfil}`);
      res.creados.push(u);
    } catch (e) {
      // Una excepción de red en un usuario no aborta el lote; si ya existía la cuenta de Auth se borra (sin perfil no serviría).
      let detalle = e instanceof Error ? e.message : String(e);
      if (authId) {
        try {
          await puerto.borrarAuth(authId);
        } catch (e2) {
          detalle += ` | ATENCIÓN: no se pudo borrar la cuenta de Auth huérfana ${authId}: ${e2 instanceof Error ? e2.message : String(e2)}`;
        }
      }
      res.fallidos.push({ usuario: u, error: detalle });
    }
  }
  return res;
}

/** CSV con BOM (Excel lo abre bien) y celdas a prueba de fórmulas. */
export function aCsv(columnas: string[], filas: string[][]): string {
  const celda = (x: string) => {
    const seguro = /^[=+@\t\r-]/.test(x) ? `'${x}` : x;
    return `"${seguro.replace(/"/g, '""')}"`;
  };
  return "﻿" + [columnas, ...filas].map((f) => f.map(celda).join(",")).join("\n");
}

/** Parser CSV RFC 4180 (comillas, comas y saltos de línea embebidos). Encabezados en minúscula. */
export function parseCsvUsuarios(texto: string): FilaUsuario[] {
  const contenido = texto.replace(/^﻿/, "");
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let enComillas = false;
  for (let i = 0; i < contenido.length; i++) {
    const c = contenido[i];
    if (enComillas) {
      if (c === '"') {
        if (contenido[i + 1] === '"') { campo += '"'; i++; } else enComillas = false;
      } else campo += c;
    } else if (c === '"') enComillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && contenido[i + 1] === "\n") i++;
      fila.push(campo); campo = "";
      if (fila.some((x) => x !== "")) filas.push(fila);
      fila = [];
    } else campo += c;
  }
  if (campo !== "" || fila.length > 0) { fila.push(campo); if (fila.some((x) => x !== "")) filas.push(fila); }
  if (filas.length === 0) return [];
  const enc = filas[0].map((h) => h.trim().toLowerCase());
  return filas.slice(1).map((f) => Object.fromEntries(enc.map((h, i) => [h, (f[i] ?? "").trim()])));
}
