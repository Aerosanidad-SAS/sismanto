"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { createHash } from "node:crypto";
import { z } from "zod";
import { getProfile } from "@/app/api/actions/auth";
import {
  FORMATOS_POR_PAGINA,
  hoyColombia,
  palabrasBusqueda,
  type EstadoFirma,
} from "@/lib/formatos-ti/comun";
import { anclaFecha, integridadOk, calcularHashRegistro } from "@/lib/formatos-ti/firma";
import {
  actaEntregaSchema,
  camposClaveDevolucion,
  camposClaveEntrega,
  LADOS_ACTA_ENTREGA,
  type ActaEntregaEntrada,
  type ActaEntregaFila,
  type LadoActaEntrega,
} from "@/lib/formatos-ti/acta-entrega";
import { borrarFirmas, descargarFirma, errorSiNoEsTi, guardarFirma, urlFirmada } from "@/lib/formatos-ti/servidor";
import { ActaEntregaPdf, type FirmaPdf } from "@/lib/pdf/acta-entrega";

export interface FiltrosActaEntrega {
  q: string;
  tipo: string;
  sede: string;
  pagina: number;
}

/** Firmas que llegan del formulario, por lado (data URI PNG de la firma dibujada; ausente = no se firmó/cambió). */
export type FirmasActaEntrega = Partial<Record<LadoActaEntrega, string | null>>;

export type ActaEntregaLista = ActaEntregaFila & { estadoFirmas: Record<LadoActaEntrega, EstadoFirma> };

const COLUMNAS_BUSQUEDA = ["func_nombre", "func_cedula", "equipo_placa", "equipo_referencia", "numero_orden"] as const;
const EXPORT_MAX = 5000;

/** Estado de integridad de cada firma con lo guardado (sin descargar los PNG). */
function estadoFirmas(fila: ActaEntregaFila): Record<LadoActaEntrega, EstadoFirma> {
  const claves = { entrega: camposClaveEntrega(fila), devolucion: camposClaveDevolucion(fila) };
  const out = {} as Record<LadoActaEntrega, EstadoFirma>;
  for (const l of LADOS_ACTA_ENTREGA) {
    const ruta = fila[l.ruta];
    if (!ruta) out[l.lado] = "sin_firma";
    else out[l.lado] = integridadOk(claves[l.clave], fila.firmas_png?.[l.lado], fila.created_at, fila[l.hash]) ? "ok" : "modificada";
  }
  return out;
}

function aplicarFiltros<T extends { or: (f: string) => T; eq: (c: string, v: string) => T; ilike: (c: string, v: string) => T }>(
  query: T,
  f: FiltrosActaEntrega
): T {
  let q = query;
  if (f.tipo) q = q.eq("tipo_equipo", f.tipo);
  if (f.sede) q = q.eq("func_sede", f.sede);
  for (const palabra of palabrasBusqueda(f.q)) {
    q = q.or(COLUMNAS_BUSQUEDA.map((c) => `${c}.ilike.%${palabra}%`).join(","));
  }
  return q;
}

/** Una página del listado (25) con búsqueda en el servidor y los filtros de mostrarActaEntrega.php: tipo y sede. */
export async function listarActasEntrega(filtros: FiltrosActaEntrega) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { actas: [] as ActaEntregaLista[], total: 0, sedes: [] as string[], error: sinPermiso };

  const supabase = createClient();
  const desde = (Math.max(1, filtros.pagina) - 1) * FORMATOS_POR_PAGINA;
  const consulta = supabase
    .from("ti_acta_entrega")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(desde, desde + FORMATOS_POR_PAGINA - 1);
  const [{ data, count, error }, sedesRes] = await Promise.all([
    aplicarFiltros(consulta, filtros),
    supabase.from("ti_acta_entrega").select("func_sede").neq("func_sede", "").limit(2000),
  ]);
  if (error) return { actas: [] as ActaEntregaLista[], total: 0, sedes: [] as string[], error: error.message as string };

  const filas = (data ?? []) as unknown as ActaEntregaFila[];
  const sedes = Array.from(new Set(((sedesRes.data ?? []) as { func_sede: string }[]).map((s) => s.func_sede))).sort();
  return {
    actas: filas.map((f) => ({ ...f, estadoFirmas: estadoFirmas(f) })),
    total: count ?? 0,
    sedes,
  };
}

/** Prepara las columnas de firma de un lado a partir de lo que llegó del formulario. */
async function resolverFirmas(
  supabase: ReturnType<typeof createClient>,
  id: number,
  fila: ActaEntregaFila,
  firmas: FirmasActaEntrega,
  celular: boolean
) {
  const claves = { entrega: camposClaveEntrega(fila), devolucion: camposClaveDevolucion(fila) };
  const cambios: Record<string, string | null> = {};
  const png: Record<string, string> = { ...(fila.firmas_png ?? {}) };
  const viejas: string[] = [];
  const avisos: string[] = [];
  for (const l of LADOS_ACTA_ENTREGA) {
    if (l.clave === "devolucion" && !celular) continue; // la devolución solo existe en Celular
    const dataUri = firmas[l.lado];
    if (!dataUri) continue;
    try {
      const g = await guardarFirma(supabase, "acta-entrega", id, l.lado, dataUri, claves[l.clave], fila.created_at);
      if (!g) continue;
      const anterior = fila[l.ruta];
      if (anterior) viejas.push(anterior);
      cambios[l.ruta] = g.ruta;
      cambios[l.hash] = g.hash;
      png[l.lado] = g.hashPng;
    } catch (e) {
      avisos.push(e instanceof Error ? e.message : "No se pudo guardar una firma");
    }
  }
  return { cambios, png, viejas, avisos };
}

export async function crearActaEntrega(entrada: ActaEntregaEntrada, firmas: FirmasActaEntrega) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const parsed = actaEntregaSchema.safeParse(entrada);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  // La fecha de entrega es la de hoy en Colombia y no se acepta del formulario; la fecha de creación ancla el hash.
  const fechaEntrega = hoyColombia();
  const creadoEn = anclaFecha(new Date());

  const { data: creada, error } = await supabase
    .from("ti_acta_entrega")
    .insert({
      tipo_equipo: d.tipo_equipo,
      func_nombre: d.func_nombre, func_cedula: d.func_cedula, func_cargo: d.func_cargo, func_sede: d.func_sede, func_correo: d.func_correo,
      equipo_referencia: d.equipo_referencia, equipo_marca: d.equipo_marca, equipo_modelo: d.equipo_modelo, equipo_placa: d.equipo_placa,
      equipo_imei: d.equipo_imei, equipo_sim: d.equipo_sim, equipo_activo: d.equipo_activo,
      equipo_tarjeta_sd: d.equipo_tarjeta_sd, equipo_operador: d.equipo_operador,
      checklist: d.checklist,
      fecha_entrega: fechaEntrega, lugar_entrega: d.lugar_entrega, entrega_nombre: d.entrega_nombre, recibe_nombre: d.recibe_nombre,
      fecha_devolucion: d.fecha_devolucion, lugar_devolucion: d.lugar_devolucion,
      devolucion_entrega_nombre: d.devolucion_entrega_nombre, devolucion_recibe_nombre: d.devolucion_recibe_nombre,
      observaciones: d.observaciones,
      created_by: userData.user?.id ?? null,
      created_at: creadoEn,
    })
    .select("*")
    .single();
  if (error || !creada) return { error: error?.message ?? "No se pudo crear el acta" };
  const fila = { ...(creada as unknown as ActaEntregaFila), created_at: creadoEn };

  const { cambios, png, avisos } = await resolverFirmas(supabase, fila.id, fila, firmas, d.tipo_equipo === "CELULAR");
  if (Object.keys(cambios).length > 0) {
    const { error: e2 } = await supabase.from("ti_acta_entrega").update({ ...cambios, firmas_png: png }).eq("id", fila.id);
    if (e2) avisos.push(`El acta se creó pero no se pudieron enlazar las firmas: ${e2.message}`);
  }
  revalidatePath("/formatos-ti/acta-entrega");
  return { success: true, id: fila.id, numero_orden: fila.numero_orden, avisos };
}

/** Edita el acta. La fecha de entrega y la de creación no cambian; las firmas solo se reemplazan si se dibujó una nueva. */
export async function actualizarActaEntrega(id: number, entrada: ActaEntregaEntrada, firmas: FirmasActaEntrega) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };
  const parsed = actaEntregaSchema.safeParse(entrada);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;

  const supabase = createClient();
  const { data: actual } = await supabase.from("ti_acta_entrega").select("*").eq("id", idParsed.data).maybeSingle();
  if (!actual) return { error: "Acta no encontrada" };
  const previa = actual as unknown as ActaEntregaFila;

  const nueva = {
    ...previa,
    tipo_equipo: d.tipo_equipo,
    func_nombre: d.func_nombre, func_cedula: d.func_cedula, func_cargo: d.func_cargo, func_sede: d.func_sede, func_correo: d.func_correo,
    equipo_referencia: d.equipo_referencia, equipo_marca: d.equipo_marca, equipo_modelo: d.equipo_modelo, equipo_placa: d.equipo_placa,
    lugar_entrega: d.lugar_entrega, entrega_nombre: d.entrega_nombre, recibe_nombre: d.recibe_nombre,
    fecha_devolucion: d.fecha_devolucion, lugar_devolucion: d.lugar_devolucion,
    devolucion_entrega_nombre: d.devolucion_entrega_nombre, devolucion_recibe_nombre: d.devolucion_recibe_nombre,
    created_at: anclaFecha(previa.created_at),
  } as ActaEntregaFila;

  const { cambios, png, viejas, avisos } = await resolverFirmas(supabase, previa.id, nueva, firmas, d.tipo_equipo === "CELULAR");

  const { error } = await supabase
    .from("ti_acta_entrega")
    .update({
      tipo_equipo: d.tipo_equipo,
      func_nombre: d.func_nombre, func_cedula: d.func_cedula, func_cargo: d.func_cargo, func_sede: d.func_sede, func_correo: d.func_correo,
      equipo_referencia: d.equipo_referencia, equipo_marca: d.equipo_marca, equipo_modelo: d.equipo_modelo, equipo_placa: d.equipo_placa,
      equipo_imei: d.equipo_imei, equipo_sim: d.equipo_sim, equipo_activo: d.equipo_activo,
      equipo_tarjeta_sd: d.equipo_tarjeta_sd, equipo_operador: d.equipo_operador,
      checklist: d.checklist,
      lugar_entrega: d.lugar_entrega, entrega_nombre: d.entrega_nombre, recibe_nombre: d.recibe_nombre,
      fecha_devolucion: d.fecha_devolucion, lugar_devolucion: d.lugar_devolucion,
      devolucion_entrega_nombre: d.devolucion_entrega_nombre, devolucion_recibe_nombre: d.devolucion_recibe_nombre,
      observaciones: d.observaciones,
      ...cambios,
      firmas_png: png,
      updated_at: new Date().toISOString(),
    })
    .eq("id", previa.id);
  if (error) return { error: error.message };

  await borrarFirmas(supabase, viejas); // limpieza de las firmas reemplazadas
  revalidatePath("/formatos-ti/acta-entrega");
  return { success: true, avisos };
}

/** Eliminación física (igual que delete.php de SISRES para estos formatos) y limpieza de sus firmas. */
export async function eliminarActaEntrega(id: number) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data: actual } = await supabase.from("ti_acta_entrega").select("*").eq("id", idParsed.data).maybeSingle();
  if (!actual) return { error: "Acta no encontrada" };
  const fila = actual as unknown as ActaEntregaFila;

  const { error } = await supabase.from("ti_acta_entrega").delete().eq("id", idParsed.data);
  if (error) return { error: error.message };
  await borrarFirmas(supabase, LADOS_ACTA_ENTREGA.map((l) => fila[l.ruta]));
  revalidatePath("/formatos-ti/acta-entrega");
  return { success: true };
}

/** URL temporal para ver una firma en pantalla. Se resuelve desde el registro: el cliente nunca elige la ruta. */
export async function urlFirmaActaEntrega(id: number, lado: LadoActaEntrega) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return null;
  const def = LADOS_ACTA_ENTREGA.find((l) => l.lado === lado);
  const idParsed = z.number().int().positive().safeParse(id);
  if (!def || !idParsed.success) return null;
  const supabase = createClient();
  const { data } = await supabase.from("ti_acta_entrega").select(def.ruta).eq("id", idParsed.data).maybeSingle();
  const ruta = (data as Record<string, string | null> | null)?.[def.ruta];
  return urlFirmada(supabase, ruta);
}

/** Filas para el Excel (mismos filtros del listado, hasta 5.000). */
export async function exportarActasEntrega(filtros: Omit<FiltrosActaEntrega, "pagina">) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const supabase = createClient();
  const consulta = supabase
    .from("ti_acta_entrega")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(EXPORT_MAX + 1);
  const { data, error } = await aplicarFiltros(consulta, { ...filtros, pagina: 1 });
  if (error) return { error: error.message };
  const filas = (data ?? []) as unknown as ActaEntregaFila[];
  return { filas: filas.slice(0, EXPORT_MAX), truncado: filas.length > EXPORT_MAX };
}

/**
 * PDF del acta (G-TECN-F 028/031). Descarga los PNG de las firmas desde Storage, recalcula su hash y lo
 * compara con el guardado: una firma cuyos datos cambiaron después de firmar sale marcada "Modificado".
 */
export async function generarActaEntregaPdf(id: number) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data } = await supabase.from("ti_acta_entrega").select("*").eq("id", idParsed.data).maybeSingle();
  if (!data) return { error: "Acta no encontrada" };
  const fila = data as unknown as ActaEntregaFila;
  const claves = { entrega: camposClaveEntrega(fila), devolucion: camposClaveDevolucion(fila) };

  const firmas: Partial<Record<LadoActaEntrega, FirmaPdf>> = {};
  for (const l of LADOS_ACTA_ENTREGA) {
    const ruta = fila[l.ruta];
    if (!ruta) continue;
    const bytes = await descargarFirma(supabase, ruta);
    if (!bytes) {
      firmas[l.lado] = { imagen: null, modificada: false, faltante: true };
      continue;
    }
    const hashPng = createHash("sha256").update(bytes).digest("hex");
    const coincideImagen = !fila.firmas_png?.[l.lado] || fila.firmas_png[l.lado] === hashPng;
    const coincideRegistro = calcularHashRegistro(claves[l.clave], hashPng, fila.created_at) === fila[l.hash];
    firmas[l.lado] = { imagen: bytes, modificada: !(coincideImagen && coincideRegistro), faltante: false };
  }

  const profile = await getProfile();
  try {
    const buffer = await renderToBuffer(
      createElement(ActaEntregaPdf, {
        acta: fila,
        firmas,
        generadoPor: profile?.nombre_completo || profile?.email || "Usuario SISMANTO",
      })
    );
    return { success: true, data: buffer.toString("base64"), filename: `acta-entrega-${fila.numero_orden}.pdf` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo generar el PDF" };
  }
}
