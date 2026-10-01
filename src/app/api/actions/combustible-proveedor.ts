"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import {
  analizarCarga,
  leerVentas,
  localizarEncabezados,
  notasDeVenta,
  type AdvertenciaVenta,
  type ErrorVenta,
  type VehiculoCombustible,
  type VentaAnalizada,
} from "@/lib/combustible-proveedor";
import { createClient } from "@/lib/supabase/server";

const MAX_FILAS = 20_000;
const LOTE = 500;

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este repo (ver CLAUDE.md).
type Fila = Record<string, any>;

export interface UltimaCargaCombustible {
  fecha: string;
  archivo: string | null;
  nuevas: number;
  duplicadas: number;
  conError: number;
}

export interface ReporteCombustible {
  aplicado: boolean;
  filasArchivo: number;
  nuevas: number;
  duplicadas: number;
  errores: ErrorVenta[];
  placasDesconocidas: { placa: string; filas: number }[];
  advertencias: AdvertenciaVenta[];
  kmSospechosos: number;
  lecturasKm: number;
  rango: { desde: string; hasta: string } | null;
  ultimaCarga: UltimaCargaCombustible | null;
}

async function leerUltimaCarga(supabase: any): Promise<UltimaCargaCombustible | null> {
  const { data } = await supabase
    .from("fuel_import_batches")
    .select("created_at, archivo, filas_nuevas, filas_duplicadas, filas_con_error")
    .order("created_at", { ascending: false })
    .limit(1);
  const f = data?.[0];
  return f ? { fecha: f.created_at, archivo: f.archivo, nuevas: f.filas_nuevas, duplicadas: f.filas_duplicadas, conError: f.filas_con_error } : null;
}

/** «Última carga de combustible»: para ver de un vistazo si la semana ya se subió. */
export async function getUltimaCargaCombustible(): Promise<UltimaCargaCombustible | null> {
  await requireRole(["ADMIN", "ANALISTA"]);
  return leerUltimaCarga(createClient() as any);
}

const trozos = <T,>(xs: T[], n: number): T[][] => Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, (i + 1) * n));

/**
 * Carga del archivo semanal del proveedor de combustible. `hoja` es la primera hoja tal cual viene (filas × columnas).
 * Con `confirmar = false` solo analiza (vista previa); con `true` escribe. Idempotente por No. Venta: re-subir el mismo
 * archivo, o uno que se solape con el de la semana pasada, no duplica. Nunca borra nada.
 */
export async function cargarCombustibleProveedor(
  hoja: unknown[][],
  archivo: string,
  confirmar: boolean
): Promise<ReporteCombustible | { error: string }> {
  const profile = await requireRole(["ADMIN", "ANALISTA"]);
  if (!Array.isArray(hoja) || hoja.length === 0) return { error: "El archivo está vacío." };
  if (hoja.length > MAX_FILAS) return { error: `El archivo tiene más de ${MAX_FILAS} filas; súbelo por partes.` };

  const enc = localizarEncabezados(hoja);
  if ("error" in enc) return { error: enc.error };
  const { ventas, errores } = leerVentas(hoja, enc);

  const supabase = createClient() as any;

  const placas = Array.from(new Set(ventas.map((v) => v.placa)));
  const vehiculos = new Map<string, VehiculoCombustible>();
  for (const lote of trozos(placas, LOTE)) {
    const { data, error } = await supabase.from("vehicles").select("id, placa, combustible, tipo_combustible, km_actual").in("placa", lote);
    if (error) return { error: error.message };
    for (const v of (data ?? []) as Fila[]) {
      vehiculos.set(v.placa, { id: v.id, combustible: v.combustible ?? v.tipo_combustible ?? null, kmActual: v.km_actual ?? null });
    }
  }

  const existentes = new Set<string>();
  for (const lote of trozos(Array.from(new Set(ventas.map((v) => v.numeroVenta))), LOTE)) {
    const { data, error } = await supabase.from("fuel_logs").select("numero_venta").in("numero_venta", lote);
    if (error) return { error: error.message };
    for (const f of (data ?? []) as Fila[]) existentes.add(f.numero_venta);
  }

  const analisis = analizarCarga(ventas, errores, vehiculos, existentes);
  const reporte: ReporteCombustible = {
    aplicado: confirmar,
    filasArchivo: ventas.length + errores.length,
    nuevas: analisis.nuevas.length,
    duplicadas: analisis.duplicadas,
    errores: analisis.errores,
    placasDesconocidas: analisis.placasDesconocidas,
    advertencias: analisis.advertencias,
    kmSospechosos: analisis.nuevas.filter((v) => v.kmSospechoso).length,
    lecturasKm: analisis.lecturasValidas.length,
    rango: analisis.rango,
    ultimaCarga: null,
  };

  if (!confirmar) {
    reporte.ultimaCarga = await leerUltimaCarga(supabase);
    return reporte;
  }

  const aFila = (v: VentaAnalizada): Fila => ({
    vehicle_id: v.vehicleId,
    fecha: v.dia,
    fecha_hora: v.hora ? `${v.dia}T${v.hora}:00-05:00` : null,
    kilometraje: v.km,
    galones: v.galones,
    costo: v.costo,
    notas: notasDeVenta(v),
    numero_venta: v.numeroVenta,
    km_sospechoso: v.kmSospechoso,
    estacion: v.estacion,
    tipo_combustible: v.combustible,
  });

  let insertadas = 0;
  let duplicadasAlEscribir = 0;
  for (const lote of trozos(analisis.nuevas, LOTE)) {
    const { error } = await supabase.from("fuel_logs").insert(lote.map(aFila));
    if (!error) { insertadas += lote.length; continue; }
    // Un No. Venta apareció entre el análisis y la escritura (otra carga en paralelo): fila por fila, sin abortar.
    for (const v of lote) {
      const { error: e } = await supabase.from("fuel_logs").insert(aFila(v));
      if (!e) insertadas++;
      else if (e.code === "23505") duplicadasAlEscribir++;
      else reporte.errores.push({ fila: v.fila, placa: v.placa, mensaje: e.message });
    }
  }
  reporte.nuevas = insertadas;
  reporte.duplicadas += duplicadasAlEscribir;

  // Km único: la mejor lectura válida por vehículo entra por mileage_logs; el trigger (092) mueve km_actual solo si avanza.
  let lecturas = 0;
  for (const l of analisis.lecturasValidas) {
    const { error } = await supabase.from("mileage_logs").upsert({ vehicle_id: l.vehicleId, fecha: l.dia, lectura_kilometraje: l.km }, { onConflict: "vehicle_id,fecha" });
    if (!error) lecturas++;
  }
  reporte.lecturasKm = lecturas;

  await supabase.from("fuel_import_batches").insert({
    created_by: profile.user_id,
    archivo: archivo.slice(0, 200),
    filas_totales: reporte.filasArchivo,
    filas_nuevas: insertadas,
    filas_duplicadas: reporte.duplicadas,
    filas_con_error: reporte.errores.length + analisis.placasDesconocidas.reduce((s, p) => s + p.filas, 0),
    fecha_desde: analisis.rango?.desde ?? null,
    fecha_hasta: analisis.rango?.hasta ?? null,
  });

  await auditar(
    "INSERTAR",
    "carga_masiva",
    "",
    `Carga de combustible del proveedor (${insertadas} nuevas, ${reporte.duplicadas} duplicadas, ${reporte.errores.length} con error, ${reporte.kmSospechosos} km sospechosos)`
  );

  reporte.ultimaCarga = await leerUltimaCarga(supabase);
  revalidatePath("/combustible");
  revalidatePath("/consumo");
  revalidatePath("/vehiculos");
  return reporte;
}
