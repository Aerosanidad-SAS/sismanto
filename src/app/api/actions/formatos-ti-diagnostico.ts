"use server";

import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { z } from "zod";
import { getProfile } from "@/app/api/actions/auth";
import { FORMATOS_POR_PAGINA, palabrasBusqueda, type EstadoFirma, type FirmaPdf } from "@/lib/formatos-ti/comun";
import { anclaFecha } from "@/lib/formatos-ti/firma";
import * as motor from "@/lib/formatos-ti/firmas-registro";
import {
  camposClaveDiagnostico,
  diagnosticoSchema,
  LADOS_DIAGNOSTICO,
  type DiagnosticoEntrada,
  type DiagnosticoFila,
  type LadoDiagnostico,
  type RepuestoFila,
} from "@/lib/formatos-ti/diagnostico";
import { errorSiNoEsTi } from "@/lib/formatos-ti/servidor";
import { borrarFirmas, urlFirmada } from "@/lib/formatos-ti/storage-firmas";
import { DiagnosticoPdf } from "@/lib/pdf/diagnostico";

export interface FiltrosDiagnostico {
  q: string;
  tipo: string;
  sede: string;
  pagina: number;
}

export type FirmasDiagnostico = Partial<Record<LadoDiagnostico, string | null>>;
export type DiagnosticoLista = DiagnosticoFila & { estadoFirmas: Record<LadoDiagnostico, EstadoFirma> };

const COLUMNAS_BUSQUEDA = ["equipo", "placa", "serial", "usuario_equipo", "responsable_equipo", "numero_orden"] as const;
const EXPORT_MAX = 5000;

const clavesDe = (f: DiagnosticoFila) => ({ diagnostico: camposClaveDiagnostico(f) });

function estadoFirmas(fila: DiagnosticoFila): Record<LadoDiagnostico, EstadoFirma> {
  return motor.estadoFirmas(fila, LADOS_DIAGNOSTICO, clavesDe(fila)) as Record<LadoDiagnostico, EstadoFirma>;
}

function aplicarFiltros<T extends { or: (f: string) => T; eq: (c: string, v: string) => T }>(query: T, f: FiltrosDiagnostico): T {
  let q = query;
  if (f.tipo) q = q.eq("tipo_mtto", f.tipo);
  if (f.sede) q = q.eq("sede", f.sede);
  for (const palabra of palabrasBusqueda(f.q)) {
    q = q.or(COLUMNAS_BUSQUEDA.map((c) => `${c}.ilike.%${palabra}%`).join(","));
  }
  return q;
}

/** Una página del listado (25) con búsqueda en el servidor y los filtros de mostrarDiagnostico.php: tipo y sede. */
export async function listarDiagnosticos(filtros: FiltrosDiagnostico) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { filas: [] as DiagnosticoLista[], total: 0, sedes: [] as string[], error: sinPermiso };

  const supabase = createClient();
  const desde = (Math.max(1, filtros.pagina) - 1) * FORMATOS_POR_PAGINA;
  const consulta = supabase
    .from("ti_diagnostico")
    .select("*", { count: "exact" })
    .order("fecha_diagnostico", { ascending: false })
    .order("id", { ascending: false })
    .range(desde, desde + FORMATOS_POR_PAGINA - 1);
  const [{ data, count, error }, sedesRes] = await Promise.all([
    aplicarFiltros(consulta, filtros),
    supabase.from("ti_diagnostico").select("sede").neq("sede", "").limit(2000),
  ]);
  if (error) return { filas: [] as DiagnosticoLista[], total: 0, sedes: [] as string[], error: error.message as string };

  const filas = (data ?? []) as unknown as DiagnosticoFila[];
  const sedes = Array.from(new Set(((sedesRes.data ?? []) as { sede: string }[]).map((s) => s.sede))).sort();
  return { filas: filas.map((f) => ({ ...f, estadoFirmas: estadoFirmas(f) })), total: count ?? 0, sedes };
}

/** Repuestos de un diagnóstico (para el formulario de edición). */
export async function getRepuestosDiagnostico(id: number): Promise<RepuestoFila[]> {
  if (await errorSiNoEsTi()) return [];
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("ti_diagnostico_repuestos")
    .select("id, repuesto, referencia_serial, cantidad")
    .eq("diagnostico_id", idParsed.data)
    .order("id");
  return (data ?? []) as RepuestoFila[];
}

/** Reemplaza todos los repuestos del diagnóstico por los recibidos (el formulario siempre manda la lista completa). */
async function guardarRepuestos(supabase: ReturnType<typeof createClient>, diagnosticoId: number, repuestos: RepuestoFila[]) {
  const { error: e1 } = await supabase.from("ti_diagnostico_repuestos").delete().eq("diagnostico_id", diagnosticoId);
  if (e1) return e1.message;
  if (repuestos.length === 0) return null;
  const { error: e2 } = await supabase.from("ti_diagnostico_repuestos").insert(
    repuestos.map((r) => ({
      diagnostico_id: diagnosticoId,
      repuesto: r.repuesto,
      referencia_serial: r.referencia_serial,
      cantidad: r.cantidad,
    }))
  );
  return e2 ? e2.message : null;
}

export async function crearDiagnostico(entrada: DiagnosticoEntrada, firmas: FirmasDiagnostico) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const parsed = diagnosticoSchema.safeParse(entrada);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const { repuestos, ...d } = parsed.data;

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const creadoEn = anclaFecha(new Date());

  const { data: creada, error } = await supabase
    .from("ti_diagnostico")
    .insert({ ...d, created_by: userData.user?.id ?? null, created_at: creadoEn })
    .select("*")
    .single();
  if (error || !creada) return { error: error?.message ?? "No se pudo crear el diagnóstico" };
  const fila = { ...(creada as unknown as DiagnosticoFila), created_at: creadoEn };
  const avisos: string[] = [];

  const errRep = await guardarRepuestos(supabase, fila.id, repuestos);
  if (errRep) avisos.push(`Se guardó el diagnóstico pero no los repuestos: ${errRep}`);

  const r = await motor.resolverFirmas(supabase, "diagnostico", fila.id, fila, firmas, LADOS_DIAGNOSTICO, clavesDe(fila));
  avisos.push(...r.avisos);
  if (Object.keys(r.cambios).length > 0) {
    const { error: e2 } = await supabase.from("ti_diagnostico").update({ ...r.cambios, firmas_png: r.png }).eq("id", fila.id);
    if (e2) avisos.push(`El diagnóstico se creó pero no se pudieron enlazar las firmas: ${e2.message}`);
  }
  await auditar("INSERTAR", "formatos_ti", fila.id, `Diagnóstico ${fila.numero_orden} creada`);
  revalidatePath("/formatos-ti/diagnostico");
  return { success: true, id: fila.id, numero_orden: fila.numero_orden, avisos };
}

/** Edita el diagnóstico. Las firmas solo se reemplazan si se dibujó una nueva; el resto queda "modificado" si cambiaron sus campos. */
export async function actualizarDiagnostico(id: number, entrada: DiagnosticoEntrada, firmas: FirmasDiagnostico) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };
  const parsed = diagnosticoSchema.safeParse(entrada);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const { repuestos, ...d } = parsed.data;

  const supabase = createClient();
  const { data: actual } = await supabase.from("ti_diagnostico").select("*").eq("id", idParsed.data).maybeSingle();
  if (!actual) return { error: "Diagnóstico no encontrado" };
  const previa = actual as unknown as DiagnosticoFila;
  const nueva = { ...previa, ...d, created_at: anclaFecha(previa.created_at) } as unknown as DiagnosticoFila;

  const r = await motor.resolverFirmas(supabase, "diagnostico", previa.id, nueva, firmas, LADOS_DIAGNOSTICO, clavesDe(nueva));
  const { error } = await supabase
    .from("ti_diagnostico")
    .update({ ...d, ...r.cambios, firmas_png: r.png, updated_at: new Date().toISOString() })
    .eq("id", previa.id);
  if (error) return { error: error.message };

  const avisos = [...r.avisos];
  const errRep = await guardarRepuestos(supabase, previa.id, repuestos);
  if (errRep) avisos.push(`Se guardó el diagnóstico pero no los repuestos: ${errRep}`);
  await borrarFirmas(supabase, r.viejas);
  await auditar("MODIFICAR", "formatos_ti", idParsed.data, `Diagnóstico actualizada`);
  revalidatePath("/formatos-ti/diagnostico");
  return { success: true, avisos };
}

/** Eliminación física (los repuestos caen por ON DELETE CASCADE) y limpieza de las firmas. */
export async function eliminarDiagnostico(id: number) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data: actual } = await supabase.from("ti_diagnostico").select("*").eq("id", idParsed.data).maybeSingle();
  if (!actual) return { error: "Diagnóstico no encontrado" };
  const fila = actual as unknown as DiagnosticoFila;

  const { error } = await supabase.from("ti_diagnostico").delete().eq("id", idParsed.data);
  if (error) return { error: error.message };
  await borrarFirmas(supabase, [fila.firma_realizo_ruta, fila.firma_reviso_ruta]);
  await auditar("ELIMINAR", "formatos_ti", idParsed.data, `Diagnóstico eliminada`);
  revalidatePath("/formatos-ti/diagnostico");
  return { success: true };
}

/** URL temporal para ver una firma en pantalla; se resuelve desde el registro, el cliente nunca elige la ruta. */
export async function urlFirmaDiagnostico(id: number, lado: LadoDiagnostico) {
  if (await errorSiNoEsTi()) return null;
  const def = LADOS_DIAGNOSTICO.find((l) => l.lado === lado);
  const idParsed = z.number().int().positive().safeParse(id);
  if (!def || !idParsed.success) return null;
  const supabase = createClient();
  const { data } = await supabase.from("ti_diagnostico").select(def.ruta).eq("id", idParsed.data).maybeSingle();
  return urlFirmada(supabase, (data as Record<string, string | null> | null)?.[def.ruta]);
}

/** Filas para el Excel (mismos filtros del listado, hasta 5.000). */
export async function exportarDiagnosticos(filtros: Omit<FiltrosDiagnostico, "pagina">) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const supabase = createClient();
  const consulta = supabase
    .from("ti_diagnostico")
    .select("*")
    .order("fecha_diagnostico", { ascending: false })
    .limit(EXPORT_MAX + 1);
  const { data, error } = await aplicarFiltros(consulta, { ...filtros, pagina: 1 });
  if (error) return { error: error.message };
  const filas = (data ?? []) as unknown as DiagnosticoFila[];
  return { filas: filas.slice(0, EXPORT_MAX), truncado: filas.length > EXPORT_MAX };
}

/** PDF del diagnóstico (G-TECN-F 047) con repuestos y firmas; marca "Modificado" las firmas cuya huella ya no coincide. */
export async function generarDiagnosticoPdf(id: number) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data } = await supabase.from("ti_diagnostico").select("*").eq("id", idParsed.data).maybeSingle();
  if (!data) return { error: "Diagnóstico no encontrado" };
  const fila = data as unknown as DiagnosticoFila;
  const [repuestos, firmas, profile] = await Promise.all([
    getRepuestosDiagnostico(idParsed.data),
    motor.firmasParaPdf(supabase, fila, LADOS_DIAGNOSTICO, clavesDe(fila)),
    getProfile(),
  ]);

  try {
    const buffer = await renderToBuffer(
      createElement(DiagnosticoPdf, {
        diagnostico: fila,
        repuestos,
        firmas: firmas as Partial<Record<LadoDiagnostico, FirmaPdf>>,
        generadoPor: profile?.nombre_completo || profile?.email || "Usuario SISMANTO",
      })
    );
    return { success: true, data: buffer.toString("base64"), filename: `diagnostico-${fila.numero_orden}.pdf` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo generar el PDF" };
  }
}
