"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { z } from "zod";
import { getProfile } from "@/app/api/actions/auth";
import { FORMATOS_POR_PAGINA, palabrasBusqueda, type EstadoFirma, type FirmaPdf } from "@/lib/formatos-ti/comun";
import { anclaFecha } from "@/lib/formatos-ti/firma";
import * as motor from "@/lib/formatos-ti/firmas-registro";
import {
  bajaSchema,
  camposClaveBaja,
  LADOS_BAJA,
  type BajaEntrada,
  type BajaFila,
  type LadoBaja,
} from "@/lib/formatos-ti/baja";
import { errorSiNoEsTi } from "@/lib/formatos-ti/servidor";
import { borrarFirmas, urlFirmada } from "@/lib/formatos-ti/storage-firmas";
import { BajaPdf } from "@/lib/pdf/baja";

export interface FiltrosBaja {
  q: string;
  tipo: string;
  causa: string;
  pagina: number;
}

export type FirmasBaja = Partial<Record<LadoBaja, string | null>>;
export type BajaLista = BajaFila & { estadoFirmas: Record<LadoBaja, EstadoFirma> };

const COLUMNAS_BUSQUEDA = ["nombre_equipo", "serie", "numero_inventario", "responsable_nombre", "numero_orden"] as const;
const EXPORT_MAX = 5000;

const clavesDe = (f: BajaFila) => ({ baja: camposClaveBaja(f) });

function estadoFirmas(fila: BajaFila): Record<LadoBaja, EstadoFirma> {
  return motor.estadoFirmas(fila, LADOS_BAJA, clavesDe(fila)) as Record<LadoBaja, EstadoFirma>;
}

function aplicarFiltros<T extends { or: (f: string) => T; eq: (c: string, v: string) => T }>(query: T, f: FiltrosBaja): T {
  let q = query;
  if (f.tipo) q = q.eq("tipo_equipo", f.tipo);
  if (f.causa) q = q.eq("causa_baja", f.causa);
  for (const palabra of palabrasBusqueda(f.q)) {
    q = q.or(COLUMNAS_BUSQUEDA.map((c) => `${c}.ilike.%${palabra}%`).join(","));
  }
  return q;
}

/** Una página del listado (25) con búsqueda en el servidor y los filtros de mostrarBaja.php: tipo y causa. */
export async function listarBajas(filtros: FiltrosBaja) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { filas: [] as BajaLista[], total: 0, error: sinPermiso };

  const supabase = createClient();
  const desde = (Math.max(1, filtros.pagina) - 1) * FORMATOS_POR_PAGINA;
  const consulta = supabase
    .from("ti_baja_equipo")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(desde, desde + FORMATOS_POR_PAGINA - 1);
  const { data, count, error } = await aplicarFiltros(consulta, filtros);
  if (error) return { filas: [] as BajaLista[], total: 0, error: error.message as string };
  const filas = (data ?? []) as unknown as BajaFila[];
  return { filas: filas.map((f) => ({ ...f, estadoFirmas: estadoFirmas(f) })), total: count ?? 0 };
}

export async function crearBaja(entrada: BajaEntrada, firmas: FirmasBaja) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const parsed = bajaSchema.safeParse(entrada);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const creadoEn = anclaFecha(new Date());

  const { data: creada, error } = await supabase
    .from("ti_baja_equipo")
    .insert({ ...d, created_by: userData.user?.id ?? null, created_at: creadoEn })
    .select("*")
    .single();
  if (error || !creada) return { error: error?.message ?? "No se pudo crear la baja" };
  const fila = { ...(creada as unknown as BajaFila), created_at: creadoEn };

  const r = await motor.resolverFirmas(supabase, "baja", fila.id, fila, firmas, LADOS_BAJA, clavesDe(fila));
  const avisos = [...r.avisos];
  if (Object.keys(r.cambios).length > 0) {
    const { error: e2 } = await supabase.from("ti_baja_equipo").update({ ...r.cambios, firmas_png: r.png }).eq("id", fila.id);
    if (e2) avisos.push(`La baja se creó pero no se pudo enlazar la firma: ${e2.message}`);
  }
  revalidatePath("/formatos-ti/baja");
  return { success: true, id: fila.id, numero_orden: fila.numero_orden, avisos };
}

/** Edita la baja. La firma solo se reemplaza si se dibujó una nueva; si cambian los campos que cubre, queda "Modificada". */
export async function actualizarBaja(id: number, entrada: BajaEntrada, firmas: FirmasBaja) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };
  const parsed = bajaSchema.safeParse(entrada);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;

  const supabase = createClient();
  const { data: actual } = await supabase.from("ti_baja_equipo").select("*").eq("id", idParsed.data).maybeSingle();
  if (!actual) return { error: "Baja no encontrada" };
  const previa = actual as unknown as BajaFila;
  const nueva = { ...previa, ...d, created_at: anclaFecha(previa.created_at) } as unknown as BajaFila;

  const r = await motor.resolverFirmas(supabase, "baja", previa.id, nueva, firmas, LADOS_BAJA, clavesDe(nueva));
  const { error } = await supabase
    .from("ti_baja_equipo")
    .update({ ...d, ...r.cambios, firmas_png: r.png, updated_at: new Date().toISOString() })
    .eq("id", previa.id);
  if (error) return { error: error.message };

  await borrarFirmas(supabase, r.viejas);
  revalidatePath("/formatos-ti/baja");
  return { success: true, avisos: r.avisos };
}

/** Eliminación física (igual que delete.php de SISRES para estos formatos) y limpieza de la firma. */
export async function eliminarBaja(id: number) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data: actual } = await supabase.from("ti_baja_equipo").select("*").eq("id", idParsed.data).maybeSingle();
  if (!actual) return { error: "Baja no encontrada" };
  const fila = actual as unknown as BajaFila;

  const { error } = await supabase.from("ti_baja_equipo").delete().eq("id", idParsed.data);
  if (error) return { error: error.message };
  await borrarFirmas(supabase, [fila.firma_responsable_ruta]);
  revalidatePath("/formatos-ti/baja");
  return { success: true };
}

/** URL temporal para ver la firma en pantalla; se resuelve desde el registro, el cliente nunca elige la ruta. */
export async function urlFirmaBaja(id: number) {
  if (await errorSiNoEsTi()) return null;
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return null;
  const supabase = createClient();
  const { data } = await supabase.from("ti_baja_equipo").select("firma_responsable_ruta").eq("id", idParsed.data).maybeSingle();
  return urlFirmada(supabase, (data as { firma_responsable_ruta: string } | null)?.firma_responsable_ruta);
}

/** Filas para el Excel (mismos filtros del listado, hasta 5.000). */
export async function exportarBajas(filtros: Omit<FiltrosBaja, "pagina">) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const supabase = createClient();
  const consulta = supabase
    .from("ti_baja_equipo")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(EXPORT_MAX + 1);
  const { data, error } = await aplicarFiltros(consulta, { ...filtros, pagina: 1 });
  if (error) return { error: error.message };
  const filas = (data ?? []) as unknown as BajaFila[];
  return { filas: filas.slice(0, EXPORT_MAX), truncado: filas.length > EXPORT_MAX };
}

/** PDF de la baja (G-TECN-F 020) con la firma del responsable; marca "Modificado" si los datos cambiaron tras firmar. */
export async function generarBajaPdf(id: number) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data } = await supabase.from("ti_baja_equipo").select("*").eq("id", idParsed.data).maybeSingle();
  if (!data) return { error: "Baja no encontrada" };
  const fila = data as unknown as BajaFila;
  const [firmas, profile] = await Promise.all([motor.firmasParaPdf(supabase, fila, LADOS_BAJA, clavesDe(fila)), getProfile()]);

  try {
    const buffer = await renderToBuffer(
      createElement(BajaPdf, {
        baja: fila,
        firmas: firmas as Partial<Record<LadoBaja, FirmaPdf>>,
        generadoPor: profile?.nombre_completo || profile?.email || "Usuario SISMANTO",
      })
    );
    return { success: true, data: buffer.toString("base64"), filename: `baja-${fila.numero_orden}.pdf` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo generar el PDF" };
  }
}
