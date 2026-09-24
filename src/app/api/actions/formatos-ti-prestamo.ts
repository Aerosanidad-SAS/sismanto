"use server";

import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { z } from "zod";
import { getProfile } from "@/app/api/actions/auth";
import { FORMATOS_POR_PAGINA, hoyColombia, palabrasBusqueda, type EstadoFirma, type FirmaPdf } from "@/lib/formatos-ti/comun";
import { anclaFecha } from "@/lib/formatos-ti/firma";
import * as motor from "@/lib/formatos-ti/firmas-registro";
import {
  camposClaveDevolucionPrestamo,
  camposClaveEntregaPrestamo,
  LADOS_PRESTAMO,
  prestamoSchema,
  type LadoPrestamo,
  type PrestamoEntrada,
  type PrestamoFila,
} from "@/lib/formatos-ti/prestamo";
import { errorSiNoEsTi } from "@/lib/formatos-ti/servidor";
import { borrarFirmas, urlFirmada } from "@/lib/formatos-ti/storage-firmas";
import { PrestamoPdf } from "@/lib/pdf/prestamo";

export interface FiltrosPrestamo {
  q: string;
  estado: string;
  pagina: number;
}

export type FirmasPrestamo = Partial<Record<LadoPrestamo, string | null>>;
export type PrestamoLista = PrestamoFila & { estadoFirmas: Record<LadoPrestamo, EstadoFirma> };

const COLUMNAS_BUSQUEDA = ["equipo_descripcion", "equipo_placa", "usuario_recibe_nombre", "func_entrega_nombre", "numero_orden"] as const;
const EXPORT_MAX = 5000;

const clavesDe = (f: PrestamoFila) => ({ entrega: camposClaveEntregaPrestamo(f), devolucion: camposClaveDevolucionPrestamo(f) });

function estadoFirmas(fila: PrestamoFila): Record<LadoPrestamo, EstadoFirma> {
  return motor.estadoFirmas(fila, LADOS_PRESTAMO, clavesDe(fila)) as Record<LadoPrestamo, EstadoFirma>;
}

/** PRESTADO = sin fecha de devolución; DEVUELTO = con fecha (filtro de prestamoQuery.php). */
function aplicarFiltros<T extends { or: (f: string) => T; is: (c: string, v: null) => T; not: (c: string, o: string, v: null) => T }>(
  query: T,
  f: FiltrosPrestamo
): T {
  let q = query;
  if (f.estado === "PRESTADO") q = q.is("fecha_devolucion", null);
  else if (f.estado === "DEVUELTO") q = q.not("fecha_devolucion", "is", null);
  for (const palabra of palabrasBusqueda(f.q)) {
    q = q.or(COLUMNAS_BUSQUEDA.map((c) => `${c}.ilike.%${palabra}%`).join(","));
  }
  return q;
}

/** Una página del listado (25) con búsqueda en el servidor y el filtro de estado de mostrarPrestamo.php. */
export async function listarPrestamos(filtros: FiltrosPrestamo) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { filas: [] as PrestamoLista[], total: 0, error: sinPermiso };

  const supabase = createClient();
  const desde = (Math.max(1, filtros.pagina) - 1) * FORMATOS_POR_PAGINA;
  const consulta = supabase
    .from("ti_prestamo_equipo")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(desde, desde + FORMATOS_POR_PAGINA - 1);
  const { data, count, error } = await aplicarFiltros(consulta, filtros);
  if (error) return { filas: [] as PrestamoLista[], total: 0, error: error.message as string };
  const filas = (data ?? []) as unknown as PrestamoFila[];
  return { filas: filas.map((f) => ({ ...f, estadoFirmas: estadoFirmas(f) })), total: count ?? 0 };
}

/** Crea el préstamo solo con el lado de la entrega (queda PRESTADO); la devolución se completa después editando. */
export async function crearPrestamo(entrada: PrestamoEntrada, firmas: FirmasPrestamo) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const parsed = prestamoSchema.safeParse(entrada);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const fechaEntrega = hoyColombia(); // siempre hoy: no se acepta del formulario
  const creadoEn = anclaFecha(new Date());

  const { data: creada, error } = await supabase
    .from("ti_prestamo_equipo")
    .insert({
      fecha_entrega: fechaEntrega,
      equipo_descripcion: d.equipo_descripcion, equipo_placa: d.equipo_placa, equipo_incluye: d.equipo_incluye,
      usuario_recibe_nombre: d.usuario_recibe_nombre, usuario_recibe_cargo: d.usuario_recibe_cargo,
      func_entrega_nombre: d.func_entrega_nombre, func_entrega_cargo: d.func_entrega_cargo,
      observaciones: d.observaciones,
      created_by: userData.user?.id ?? null,
      created_at: creadoEn,
    })
    .select("*")
    .single();
  if (error || !creada) return { error: error?.message ?? "No se pudo crear el préstamo" };
  const fila = { ...(creada as unknown as PrestamoFila), created_at: creadoEn };

  // Al crear solo existen las firmas de la entrega.
  const r = await motor.resolverFirmas(supabase, "prestamo", fila.id, fila, firmas, LADOS_PRESTAMO, clavesDe(fila), (l) => l.clave === "devolucion");
  const avisos = [...r.avisos];
  if (Object.keys(r.cambios).length > 0) {
    const { error: e2 } = await supabase.from("ti_prestamo_equipo").update({ ...r.cambios, firmas_png: r.png }).eq("id", fila.id);
    if (e2) avisos.push(`El préstamo se creó pero no se pudieron enlazar las firmas: ${e2.message}`);
  }
  await auditar("INSERTAR", "formatos_ti", fila.id, `Préstamo ${fila.numero_orden} creada`);
  revalidatePath("/formatos-ti/prestamo");
  return { success: true, id: fila.id, numero_orden: fila.numero_orden, avisos };
}

/**
 * Edita el préstamo y registra la devolución. La fecha de entrega y la de creación no cambian. Cada par de firmas
 * (entrega / devolución) tiene su propio hash: editar la devolución no invalida las firmas de la entrega.
 */
export async function actualizarPrestamo(id: number, entrada: PrestamoEntrada, firmas: FirmasPrestamo) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };
  const parsed = prestamoSchema.safeParse(entrada);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;

  const supabase = createClient();
  const { data: actual } = await supabase.from("ti_prestamo_equipo").select("*").eq("id", idParsed.data).maybeSingle();
  if (!actual) return { error: "Préstamo no encontrado" };
  const previa = actual as unknown as PrestamoFila;
  if (d.fecha_devolucion && d.fecha_devolucion < previa.fecha_entrega) {
    return { error: "La fecha de devolución no puede ser anterior a la de entrega" };
  }
  const nueva = { ...previa, ...d, created_at: anclaFecha(previa.created_at) } as unknown as PrestamoFila;

  const r = await motor.resolverFirmas(supabase, "prestamo", previa.id, nueva, firmas, LADOS_PRESTAMO, clavesDe(nueva));
  const { error } = await supabase
    .from("ti_prestamo_equipo")
    .update({ ...d, ...r.cambios, firmas_png: r.png, updated_at: new Date().toISOString() })
    .eq("id", previa.id);
  if (error) return { error: error.message };

  await borrarFirmas(supabase, r.viejas);
  await auditar("MODIFICAR", "formatos_ti", idParsed.data, `Préstamo actualizada`);
  revalidatePath("/formatos-ti/prestamo");
  return { success: true, avisos: r.avisos };
}

/** Eliminación física (igual que delete.php de SISRES para estos formatos) y limpieza de las firmas. */
export async function eliminarPrestamo(id: number) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data: actual } = await supabase.from("ti_prestamo_equipo").select("*").eq("id", idParsed.data).maybeSingle();
  if (!actual) return { error: "Préstamo no encontrado" };
  const fila = actual as unknown as PrestamoFila;

  const { error } = await supabase.from("ti_prestamo_equipo").delete().eq("id", idParsed.data);
  if (error) return { error: error.message };
  await borrarFirmas(supabase, LADOS_PRESTAMO.map((l) => fila[l.ruta]));
  await auditar("ELIMINAR", "formatos_ti", idParsed.data, `Préstamo eliminada`);
  revalidatePath("/formatos-ti/prestamo");
  return { success: true };
}

/** URL temporal para ver una firma en pantalla; se resuelve desde el registro, el cliente nunca elige la ruta. */
export async function urlFirmaPrestamo(id: number, lado: LadoPrestamo) {
  if (await errorSiNoEsTi()) return null;
  const def = LADOS_PRESTAMO.find((l) => l.lado === lado);
  const idParsed = z.number().int().positive().safeParse(id);
  if (!def || !idParsed.success) return null;
  const supabase = createClient();
  const { data } = await supabase.from("ti_prestamo_equipo").select(def.ruta).eq("id", idParsed.data).maybeSingle();
  return urlFirmada(supabase, (data as Record<string, string | null> | null)?.[def.ruta]);
}

/** Filas para el Excel (mismos filtros del listado, hasta 5.000). */
export async function exportarPrestamos(filtros: Omit<FiltrosPrestamo, "pagina">) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const supabase = createClient();
  const consulta = supabase
    .from("ti_prestamo_equipo")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(EXPORT_MAX + 1);
  const { data, error } = await aplicarFiltros(consulta, { ...filtros, pagina: 1 });
  if (error) return { error: error.message };
  const filas = (data ?? []) as unknown as PrestamoFila[];
  // Nombres y cédulas de funcionarios salen del sistema: queda quién lo hizo y cuántas filas (no el contenido).
  await auditar("EXPORTAR", "formatos_ti", "", `Exportación de préstamos (${Math.min(filas.length, EXPORT_MAX)} filas${filas.length > EXPORT_MAX ? ", truncada" : ""})`);
  return { filas: filas.slice(0, EXPORT_MAX), truncado: filas.length > EXPORT_MAX };
}

/** PDF del préstamo (G-TECN-F 018): la devolución solo aparece si existe; las firmas modificadas salen marcadas. */
export async function generarPrestamoPdf(id: number) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data } = await supabase.from("ti_prestamo_equipo").select("*").eq("id", idParsed.data).maybeSingle();
  if (!data) return { error: "Préstamo no encontrado" };
  const fila = data as unknown as PrestamoFila;
  const [firmas, profile] = await Promise.all([motor.firmasParaPdf(supabase, fila, LADOS_PRESTAMO, clavesDe(fila)), getProfile()]);

  try {
    const buffer = await renderToBuffer(
      createElement(PrestamoPdf, {
        prestamo: fila,
        firmas: firmas as Partial<Record<LadoPrestamo, FirmaPdf>>,
        generadoPor: profile?.nombre_completo || profile?.email || "Usuario SISMANTO",
      })
    );
    return { success: true, data: buffer.toString("base64"), filename: `prestamo-${fila.numero_orden}.pdf` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo generar el PDF" };
  }
}
