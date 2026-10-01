"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/app/api/actions/auth";
import { costosPorVehiculo } from "@/lib/costos-vehiculo";
import { isReferenceSparkCombustionPlaca } from "@/lib/fleet-reference-plates";
import { hoyBogota, type Dia } from "@/lib/fechas";
import {
  costoPorKm,
  cumplimientoPreoperacional,
  kmRecorridosPorVehiculo,
  resumenCombustible,
  resumenHojasDeVida,
  type CostoPorKmFila,
  type CumplimientoPreoperacional,
  type ResumenCombustible,
  type ResumenHojasDeVida,
} from "@/lib/kpis-mantenimiento";

export interface KpisMantenimiento {
  preoperacional: CumplimientoPreoperacional | null;
  combustible: ResumenCombustible | null;
  hojasDeVida: ResumenHojasDeVida | null;
  costoPorKm: CostoPorKmFila[] | null;
}

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este repo (ver CLAUDE.md).
type Fila = Record<string, any>;

/** Cada bloque falla por separado: un error en uno no tumba el resto del tablero (se registra y queda en null). */
async function seguro<T>(nombre: string, f: () => Promise<T>): Promise<T | null> {
  try {
    return await f();
  } catch (e) {
    console.error(`KPI mantenimiento «${nombre}» falló:`, e instanceof Error ? e.message : e);
    return null;
  }
}

export async function getKpisMantenimiento(desde: Dia, hasta: Dia): Promise<KpisMantenimiento> {
  await requireRole(["ADMIN", "GERENCIAL", "ANALISTA"]);
  const supabase = createClient();
  const hoy = hoyBogota();

  const vehiculos = async (): Promise<Fila[]> => {
    const { data, error } = await supabase.from("vehicles").select("*");
    if (error) throw new Error(error.message);
    return ((data ?? []) as Fila[]).filter((v) => !isReferenceSparkCombustionPlaca(v.placa));
  };
  const flota = await seguro("flota", vehiculos);
  const idsFlota = new Set((flota ?? []).map((v) => v.id as string));

  const [preoperacional, combustible, hojasDeVida, porKm] = await Promise.all([
    seguro("preoperacional", async () => {
      const { data, error } = await supabase.from("daily_checks").select("vehicle_id, fecha, checklist_ok").gte("fecha", desde).lte("fecha", hasta).limit(20000);
      if (error) throw new Error(error.message);
      const filas = ((data ?? []) as Fila[]).filter((f) => idsFlota.has(f.vehicle_id));
      const operativa = (flota ?? []).filter((v) => v.estado_actual === "OPERATIVO").length;
      return cumplimientoPreoperacional(filas as any, operativa);
    }),
    seguro("combustible", async () => {
      const { data, error } = await supabase.from("fuel_logs").select("vehicle_id, galones, costo, km_sospechoso").gte("fecha", desde).lte("fecha", hasta).limit(20000);
      if (error) throw new Error(error.message);
      return resumenCombustible(((data ?? []) as Fila[]).filter((f) => idsFlota.has(f.vehicle_id)) as any);
    }),
    seguro("hojas de vida", async () => resumenHojasDeVida((flota ?? []) as any, hoy)),
    seguro("costo por km", async () => {
      const [costos, lecturas] = await Promise.all([
        costosPorVehiculo(supabase, { desde, hasta }),
        supabase.from("mileage_logs").select("vehicle_id, fecha, lectura_kilometraje").gte("fecha", desde).lte("fecha", hasta).limit(50000),
      ]);
      if (lecturas.error) throw new Error(lecturas.error.message);
      const kmActual = new Map<string, number | null>((flota ?? []).map((v) => [v.id as string, v.km_actual ?? null]));
      return costoPorKm(
        costos.map((c) => ({ vehicleId: c.vehicleId, placa: c.placa, costoTotal: c.costoTotal })),
        kmRecorridosPorVehiculo((lecturas.data ?? []) as any),
        kmActual,
      );
    }),
  ]);

  return { preoperacional, combustible, hojasDeVida, costoPorKm: porKm };
}
