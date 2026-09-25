"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { CaptacionPdf, type CaptacionPdfDatos } from "@/lib/pdf/captacion";
import { aTimestamptzColombia } from "@/lib/hora-colombia";
import { captacionSchema } from "@/lib/validations";
import {
  diaColombia,
  filaSispro,
  puedeAdministrarCaptacion,
  puedeUsarCaptacion,
  type CaptacionParaSispro,
  type CatalogosSispro,
} from "@/lib/captacion";

// Captación aeroportuaria + reporte SISPRO. Esquema y RLS: migración 080/081.
// Cada acción revisa el rol aquí (mensaje claro) y la base lo vuelve a exigir (RLS).

export interface CaptacionRow extends CaptacionParaSispro {
  paciente_id: number | null;
  tipo_atencion: string | null;
  resultado_autorizacion: string | null;
  lugar_atencion: string | null;
  lado_atencion: string | null;
  ubicacion_atencion: string | null;
  detalle_ubicacion: string | null;
  tiempo_activacion: string | null;
  tiempo_llegada: string | null;
  condicion: string | null;
  patologia_sistema: string | null;
  otra_patologia: string | null;
  post_operatorio: string | null;
  accidente_especial: string | null;
  notificacion_obligatoria: string | null;
  tipo_vuelo: string | null;
  aerolinea: string | null;
  procedimientos: string[];
  emergencia_tipo: string | null;
  emergencia_notas: string | null;
  activo: boolean;
  nombre_registrado_por: string | null;
  created_at: string;
}

export interface CatalogosCaptacion {
  aeropuertosAtencion: string[];
  aeropuertosProcedencia: string[];
  paises: string[];
  ips: string[];
  /** Aerolíneas activas del catálogo (tabla airlines). Vacío si el catálogo aún no está cargado. */
  aerolineas: string[];
}

// PostgREST devuelve como máximo 1000 filas por consulta (max-rows) aunque se pida un .limit() mayor, y
// lo hace en silencio. Los catálogos de aquí pasan de eso (aeropuertos: 1125; CIE-10: 12.634), así que
// las listas grandes se leen por páginas y el CIE-10 se consulta solo por los códigos que se usan.
const TAM_PAGINA = 1000;
async function leerTodo<T>(pagina: (desde: number, hasta: number) => PromiseLike<{ data: unknown[] | null }>): Promise<T[]> {
  const todo: T[] = [];
  for (let desde = 0; ; desde += TAM_PAGINA) {
    const { data } = await pagina(desde, desde + TAM_PAGINA - 1);
    const filas = (data ?? []) as T[];
    todo.push(...filas);
    if (filas.length < TAM_PAGINA) return todo;
  }
}

async function usuario() {
  const profile = await getProfile();
  return profile && puedeUsarCaptacion(profile.role_codigo) ? profile : null;
}

export async function getCatalogosCaptacion(): Promise<CatalogosCaptacion> {
  if (!(await usuario())) return { aeropuertosAtencion: [], aeropuertosProcedencia: [], paises: [], ips: [], aerolineas: [] };
  const s = createClient();
  const nombres = async (tabla: "sispro_aeropuertos_atencion" | "sispro_aeropuertos" | "sispro_paises" | "sispro_ips") => {
    const filas = await leerTodo<{ nombre: string }>((d, h) => s.from(tabla).select("nombre").order("nombre").range(d, h));
    return filas.map((r) => r.nombre);
  };
  const [aeropuertosAtencion, aeropuertosProcedencia, paises, ips] = await Promise.all([
    nombres("sispro_aeropuertos_atencion"),
    nombres("sispro_aeropuertos"),
    nombres("sispro_paises"),
    nombres("sispro_ips"),
  ]);
  const aerolineas = (await leerTodo<{ nombre: string }>((d, h) => s.from("airlines").select("nombre").eq("activo", true).order("nombre").range(d, h))).map((r) => r.nombre);
  return { aeropuertosAtencion, aeropuertosProcedencia, paises, ips, aerolineas };
}

export async function buscarCie10Captacion(busqueda: string): Promise<{ codigo: string; descripcion: string }[]> {
  const q = z.string().trim().min(2).max(60).safeParse(busqueda);
  if (!q.success || !(await usuario())) return [];
  // Se quitan los caracteres con significado dentro del filtro .or() de PostgREST.
  const limpio = q.data.replace(/[%_,()\\*"]/g, " ").trim();
  if (!limpio) return [];
  const { data } = await createClient()
    .from("cie10")
    .select("codigo, descripcion")
    .or(`codigo.ilike.${limpio}%,descripcion.ilike.%${limpio}%`)
    .order("codigo")
    .limit(15);
  return (data ?? []) as unknown as { codigo: string; descripcion: string }[];
}

export interface PacienteCaptacion {
  id: number;
  tipo_documento: string;
  cedula: string;
  nombre1: string;
  nombre2: string | null;
  apellido1: string;
  apellido2: string | null;
  fecha_nacimiento: string | null;
  sexo: string | null;
  celular: string | null;
}

/** Autocompleta el formulario con el maestro de pacientes (los datos se copian al registro). */
export async function buscarPacienteCaptacion(cedula: string): Promise<PacienteCaptacion | null> {
  const c = z.string().trim().min(4).max(20).safeParse(cedula);
  if (!c.success || !(await usuario())) return null;
  const { data } = await createClient()
    .from("patients")
    .select("id, tipo_documento, cedula, nombre1, nombre2, apellido1, apellido2, fecha_nacimiento, sexo, celular")
    .eq("cedula", c.data)
    .eq("activo", true)
    .maybeSingle();
  return (data as unknown as PacienteCaptacion | null) ?? null;
}

const COLUMNAS_LISTA =
  "id, fecha_atencion, aeropuerto_atencion, paciente_id, tipo_identificacion, numero_identificacion, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo, nacionalidad, pais_residencia, pais_procedencia, aeropuerto_procedencia, telefono, tipo_usuario, momento_atencion, motivo_consulta, tipo_egreso, tipo_atencion, resultado_autorizacion, lugar_atencion, lado_atencion, ubicacion_atencion, detalle_ubicacion, tiempo_activacion, tiempo_llegada, condicion, cie10, patologia_sistema, otra_patologia, post_operatorio, accidente_especial, notificacion_obligatoria, tipo_vuelo, aerolinea, procedimientos, emergencia_tipo, emergencia_notas, remision, ips_receptora, origen, destino, recibio_medicamentos, medicamento, evento_adverso_medicamento, uso_dispositivo, dispositivo, evento_adverso_dispositivo, medico_atendio, activo, nombre_registrado_por, created_at";

const fechaIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export interface FiltrosCaptacion {
  buscar?: string;
  desde?: string; // YYYY-MM-DD (día de Bogotá)
  hasta?: string;
  aeropuerto?: string;
}

export async function getCaptaciones(filtros: FiltrosCaptacion = {}): Promise<CaptacionRow[]> {
  if (!(await usuario())) return [];
  let query = createClient().from("captaciones_aeroportuarias").select(COLUMNAS_LISTA).eq("activo", true);
  if (fechaIso.safeParse(filtros.desde).success) query = query.gte("fecha_atencion", `${filtros.desde}T00:00:00-05:00`);
  if (fechaIso.safeParse(filtros.hasta).success) query = query.lte("fecha_atencion", `${filtros.hasta}T23:59:59.999-05:00`);
  if (filtros.aeropuerto) query = query.eq("aeropuerto_atencion", filtros.aeropuerto.slice(0, 150));
  const texto = (filtros.buscar ?? "").trim().slice(0, 60).replace(/[%_,()\\*"]/g, " ").trim();
  if (texto) {
    query = query.or(`numero_identificacion.ilike.${texto}%,primer_nombre.ilike.%${texto}%,primer_apellido.ilike.%${texto}%,segundo_apellido.ilike.%${texto}%`);
  }
  const { data } = await query.order("fecha_atencion", { ascending: false }).limit(500);
  return (data ?? []) as unknown as CaptacionRow[];
}

export async function getCaptacion(id: number): Promise<CaptacionRow | null> {
  const parsed = z.number().int().positive().safeParse(id);
  if (!parsed.success || !(await usuario())) return null;
  const { data } = await createClient().from("captaciones_aeroportuarias").select(COLUMNAS_LISTA).eq("id", parsed.data).maybeSingle();
  return (data as unknown as CaptacionRow | null) ?? null;
}

/** Comprueba los valores que deben venir de los catálogos (el formulario no es de fiar). */
async function validarContraCatalogos(d: z.output<typeof captacionSchema>): Promise<string | null> {
  const s = createClient();
  const existe = async (tabla: "sispro_aeropuertos_atencion" | "sispro_aeropuertos" | "sispro_paises" | "sispro_ips", valor: string) => {
    const { data } = await s.from(tabla).select("nombre").eq("nombre", valor).maybeSingle();
    return !!data;
  };
  if (!(await existe("sispro_aeropuertos_atencion", d.aeropuerto_atencion))) return "El aeropuerto de atención no está en el catálogo";
  if (!(await existe("sispro_aeropuertos", d.aeropuerto_procedencia))) return "El aeropuerto de procedencia no está en el catálogo";
  if (!(await existe("sispro_paises", d.pais_residencia))) return "El país de residencia no está en el catálogo";
  if (!(await existe("sispro_paises", d.pais_procedencia))) return "El país de procedencia no está en el catálogo";
  if (d.remision && d.ips_receptora && !(await existe("sispro_ips", d.ips_receptora))) return "La IPS receptora no está en el catálogo";
  const { data: cie } = await s.from("cie10").select("codigo").eq("codigo", d.cie10).maybeSingle();
  if (!cie) return `El código CIE-10 "${d.cie10}" no existe en el catálogo. Búscalo por nombre con el botón Buscar (ej.: Z000 = examen médico general).`;
  return null;
}

function aFila(d: z.output<typeof captacionSchema>) {
  const mayus = (v: string | undefined) => (v ? v.replace(/\s+/g, " ").trim().toUpperCase() : null);
  return {
    fecha_atencion: aTimestamptzColombia(d.fecha_atencion) as string,
    aeropuerto_atencion: d.aeropuerto_atencion,
    paciente_id: d.paciente_id ?? null,
    tipo_identificacion: d.tipo_identificacion,
    numero_identificacion: d.numero_identificacion.toUpperCase(),
    primer_nombre: mayus(d.primer_nombre) as string,
    segundo_nombre: mayus(d.segundo_nombre),
    primer_apellido: mayus(d.primer_apellido) as string,
    segundo_apellido: mayus(d.segundo_apellido),
    fecha_nacimiento: d.fecha_nacimiento ?? null,
    sexo: d.sexo,
    nacionalidad: mayus(d.nacionalidad) as string,
    pais_residencia: d.pais_residencia,
    pais_procedencia: d.pais_procedencia,
    aeropuerto_procedencia: d.aeropuerto_procedencia,
    telefono: d.telefono ?? null,
    tipo_usuario: d.tipo_usuario,
    momento_atencion: d.momento_atencion,
    motivo_consulta: d.motivo_consulta,
    tipo_egreso: d.tipo_egreso,
    tipo_atencion: d.tipo_atencion ?? null,
    resultado_autorizacion: d.tipo_atencion === "AUTORIZACION DE VUELO" ? (d.resultado_autorizacion ?? null) : null,
    lugar_atencion: d.lugar_atencion ?? null,
    lado_atencion: d.lado_atencion ?? null,
    ubicacion_atencion: d.ubicacion_atencion ?? null,
    detalle_ubicacion: d.detalle_ubicacion ?? null,
    tiempo_activacion: d.tiempo_activacion ?? null,
    tiempo_llegada: d.tiempo_llegada ?? null,
    condicion: d.condicion ?? null,
    cie10: d.cie10,
    patologia_sistema: d.patologia_sistema ?? null,
    otra_patologia: d.otra_patologia ?? null,
    post_operatorio: d.post_operatorio ?? null,
    accidente_especial: d.accidente_especial ?? null,
    notificacion_obligatoria: d.notificacion_obligatoria ?? null,
    tipo_vuelo: d.tipo_vuelo ?? null,
    aerolinea: d.aerolinea ?? null,
    procedimientos: d.procedimientos,
    emergencia_tipo: d.emergencia_tipo ?? null,
    emergencia_notas: d.emergencia_notas ?? null,
    remision: d.remision,
    ips_receptora: d.remision ? (d.ips_receptora ?? null) : null,
    origen: mayus(d.origen),
    destino: mayus(d.destino),
    recibio_medicamentos: d.recibio_medicamentos,
    medicamento: d.recibio_medicamentos ? (d.medicamento ?? null) : null,
    evento_adverso_medicamento: d.recibio_medicamentos ? (d.evento_adverso_medicamento ?? null) : null,
    uso_dispositivo: d.uso_dispositivo,
    dispositivo: d.uso_dispositivo ? (d.dispositivo ?? null) : null,
    evento_adverso_dispositivo: d.uso_dispositivo ? (d.evento_adverso_dispositivo ?? null) : null,
    medico_atendio: mayus(d.medico_atendio),
  };
}

export async function crearCaptacion(datos: z.input<typeof captacionSchema>) {
  const profile = await usuario();
  if (!profile) return { error: "Sin permisos para registrar captaciones" };
  const parsed = captacionSchema.safeParse(datos);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const errorCatalogo = await validarContraCatalogos(parsed.data);
  if (errorCatalogo) return { error: errorCatalogo };

  const fila = aFila(parsed.data);
  if (new Date(fila.fecha_atencion).getTime() > Date.now() + 5 * 60_000) return { error: "La fecha de la atención no puede ser futura" };

  const supabase = createClient();
  // Guarda de idempotencia: el mismo registro (misma persona, fecha y CIE-10) en 60 s es un doble clic.
  const hace60s = new Date(Date.now() - 60_000).toISOString();
  const { data: duplicado } = await supabase
    .from("captaciones_aeroportuarias")
    .select("id")
    .eq("registrado_por_id", profile.user_id)
    .eq("numero_identificacion", fila.numero_identificacion)
    .eq("fecha_atencion", fila.fecha_atencion)
    .gt("created_at", hace60s)
    .limit(1)
    .maybeSingle();
  if (duplicado) return { success: true as const, id: (duplicado as { id: number }).id };

  const { data, error } = await supabase
    .from("captaciones_aeroportuarias")
    .insert({
      ...fila,
      registrado_por_id: profile.user_id,
      nombre_registrado_por: profile.nombre_completo ?? profile.email ?? "Usuario",
    } as never)
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "No se pudo registrar la captación" };

  const nuevoId = (data as { id: number }).id;
  await auditar("INSERTAR", "captacion", nuevoId, "Captación aeroportuaria registrada");
  revalidatePath("/captacion");
  return { success: true as const, id: nuevoId };
}

export async function actualizarCaptacion(id: number, datos: z.input<typeof captacionSchema>) {
  const idOk = z.number().int().positive().safeParse(id);
  const profile = await getProfile();
  if (!idOk.success) return { error: "Registro inválido" };
  if (!profile || !puedeAdministrarCaptacion(profile.role_codigo)) return { error: "Solo un Administrador puede editar captaciones" };
  const parsed = captacionSchema.safeParse(datos);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const errorCatalogo = await validarContraCatalogos(parsed.data);
  if (errorCatalogo) return { error: errorCatalogo };

  const { data, error } = await createClient()
    .from("captaciones_aeroportuarias")
    .update({ ...aFila(parsed.data), updated_at: new Date().toISOString() } as never)
    .eq("id", idOk.data)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "No se pudo guardar (el registro no existe)" };

  await auditar("MODIFICAR", "captacion", idOk.data, "Captación aeroportuaria actualizada");
  revalidatePath("/captacion");
  revalidatePath(`/captacion/${idOk.data}`);
  return { success: true as const };
}

/** Eliminar = desactivar (como en SISRES): el registro deja de listarse y de exportarse. */
export async function eliminarCaptacion(id: number) {
  const idOk = z.number().int().positive().safeParse(id);
  const profile = await getProfile();
  if (!idOk.success) return { error: "Registro inválido" };
  if (!profile || !puedeAdministrarCaptacion(profile.role_codigo)) return { error: "Solo un Administrador puede eliminar captaciones" };

  const { data, error } = await createClient()
    .from("captaciones_aeroportuarias")
    .update({ activo: false, updated_at: new Date().toISOString() } as never)
    .eq("id", idOk.data)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "No se pudo eliminar (el registro no existe)" };
  await auditar("ELIMINAR", "captacion", idOk.data, "Captación aeroportuaria desactivada");
  revalidatePath("/captacion");
  return { success: true as const };
}

// ─── Exportación SISPRO ─────────────────────────────────────────────────────

/** Filas del reporte de un mes (yyyy-MM), listas para escribir en la hoja. Solo roles de captación. */
export async function getFilasSisproMes(mes: string): Promise<{ filas: (string | number)[][]; total: number } | { error: string }> {
  const m = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).safeParse(mes);
  if (!m.success) return { error: "Mes inválido (usa aaaa-mm)" };
  if (!(await usuario())) return { error: "Sin permisos" };

  const [anio, num] = m.data.split("-").map(Number);
  const siguiente = num === 12 ? `${anio + 1}-01` : `${anio}-${String(num + 1).padStart(2, "0")}`;
  const s = createClient();

  const lista = await leerTodo<CaptacionRow>((d, h) =>
    s
      .from("captaciones_aeroportuarias")
      .select(COLUMNAS_LISTA)
      .eq("activo", true)
      .gte("fecha_atencion", `${m.data}-01T00:00:00-05:00`)
      .lt("fecha_atencion", `${siguiente}-01T00:00:00-05:00`)
      .order("fecha_atencion", { ascending: true })
      .order("id", { ascending: true })
      .range(d, h),
  );

  // CIE-10: solo los códigos que aparecen en el mes (la tabla tiene 12.634 y la consulta corta en 1000).
  const codigos = [...new Set(lista.map((c) => (c.cie10 ?? "").trim().toUpperCase()).filter(Boolean))];
  const cie10 = new Map<string, string>();
  for (let i = 0; i < codigos.length; i += 200) {
    const { data } = await s.from("cie10").select("codigo, descripcion").in("codigo", codigos.slice(i, i + 200));
    for (const r of (data ?? []) as unknown as { codigo: string; descripcion: string }[]) cie10.set(r.codigo, r.descripcion);
  }

  const [paises, aeropuertos, ips] = await Promise.all([
    leerTodo<{ nombre: string; codigo: string }>((d, h) => s.from("sispro_paises").select("nombre, codigo").order("nombre").range(d, h)),
    leerTodo<{ nombre: string; ciudad: string; codigo_ciudad: string | null }>((d, h) =>
      s.from("sispro_aeropuertos").select("nombre, ciudad, codigo_ciudad").order("nombre").range(d, h),
    ),
    leerTodo<{ nombre: string; codigo: string }>((d, h) => s.from("sispro_ips").select("nombre, codigo").order("nombre").range(d, h)),
  ]);

  const cat: CatalogosSispro = {
    paises: new Map(paises.map((r) => [r.nombre, r.codigo])),
    aeropuertos: new Map(aeropuertos.map((r) => [r.nombre, { ciudad: r.ciudad, codigo_ciudad: r.codigo_ciudad }])),
    ips: new Map(ips.map((r) => [r.nombre, r.codigo])),
    cie10,
  };

  // Garantía extra por si el rango de la consulta se desplazara: solo días del mes pedido (hora de Bogotá).
  const delMes = lista.filter((c) => diaColombia(c.fecha_atencion).startsWith(m.data));
  return { filas: delMes.map((c, i) => filaSispro(c, i + 1, cat)), total: delMes.length };
}

// ─── PDF individual ─────────────────────────────────────────────────────────

/** Formato individual en PDF (base64, mismo patrón que el certificado de valoraciones: sin Route Handler). */
export async function generarCaptacionPdf(id: number) {
  const captacion = await getCaptacion(id);
  if (!captacion) return { error: "Captación no encontrada o sin permiso" };

  // El logo es opcional: si el archivo no está en el despliegue, el PDF sale igual, sin logo.
  let logo: Buffer | undefined;
  try {
    logo = await readFile(path.join(process.cwd(), "public", "brand", "alianza.png"));
  } catch {
    logo = undefined;
  }

  try {
    // El componente devuelve un <Document>; el tipo de createElement no lo sabe (mismo cast que el certificado de valoraciones).
    const documento = createElement(CaptacionPdf, { captacion: captacion as unknown as CaptacionPdfDatos, logo }) as unknown as ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(documento);
    await auditar("EXPORTAR", "captacion", captacion.id, "PDF individual de captación");
    return { success: true as const, data: buffer.toString("base64"), filename: `captacion-${captacion.id}.pdf` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo generar el PDF" };
  }
}
