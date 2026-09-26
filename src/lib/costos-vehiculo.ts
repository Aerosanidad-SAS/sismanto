import type { SupabaseClient } from "@supabase/supabase-js";

import { REFERENCE_SPARK_COMBUSTION_PLACAS, normalizePlaca } from "@/lib/fleet-reference-plates";
import type { CostoPorVehiculoKPI } from "@/types";

export type FiltrosCostosVehiculo = {
  /** YYYY-MM-DD, ambos inclusive. */
  desde: string;
  hasta: string;
  tipo?: "AMBOS" | "PREVENTIVO" | "CORRECTIVO";
  centroOperativoId?: number;
  /** Placas exactas; se normalizan igual que en la base. */
  placas?: string[];
  placaFragmento?: string;
  /** Coincidencia parcial en trabajo, categoría o ítem de factura. */
  texto?: string;
};

export type CostoVehiculoFila = CostoPorVehiculoKPI & {
  centroOperativo: string | null;
  cantidadPreventivo: number;
  cantidadCorrectivo: number;
};

type FilaRpc = {
  vehicle_id: string;
  placa: string;
  marca: string | null;
  centro_operativo: string | null;
  costo_preventivo: number | string;
  costo_correctivo: number | string;
  costo_combustible: number | string;
  costo_fijo: number | string;
  costo_mantenimiento: number | string;
  costo_total: number | string;
  cantidad_mantenimientos: number;
  cantidad_preventivo: number;
  cantidad_correctivo: number;
};

/**
 * Costo por vehículo (mantenimiento + combustible + costos anuales por vigencia) en un periodo.
 * Es la ÚNICA vía de cálculo: delega en la función SQL `costos_por_vehiculo` (migración 089), que trabaja con fechas
 * DATE y por eso da lo mismo en local y en Vercel. Los vehículos de referencia quedan fuera.
 * Lanza si la base responde con error: quien llama decide qué mostrar, aquí no se devuelve una lista vacía que
 * parezca "costo cero".
 */
export async function costosPorVehiculo(
  supabase: SupabaseClient<any>,
  f: FiltrosCostosVehiculo
): Promise<CostoVehiculoFila[]> {
  const placas = (f.placas ?? []).map((p) => normalizePlaca(p)).filter(Boolean);
  const { data, error } = await supabase.rpc("costos_por_vehiculo", {
    p_desde: f.desde,
    p_hasta: f.hasta,
    p_tipo: f.tipo ?? "AMBOS",
    p_centro_id: f.centroOperativoId ?? null,
    p_placas: placas.length > 0 ? placas : null,
    p_placa_fragmento: f.placaFragmento?.trim() || null,
    p_texto: f.texto?.trim() || null,
    p_excluir_placas: [...REFERENCE_SPARK_COMBUSTION_PLACAS],
  });
  if (error) {
    console.error("costos_por_vehiculo falló:", error.message);
    throw new Error(`costos_por_vehiculo: ${error.message}`);
  }
  return ((data ?? []) as FilaRpc[]).map((r) => ({
    vehicleId: r.vehicle_id,
    placa: r.placa ?? "",
    marca: r.marca ?? null,
    centroOperativo: r.centro_operativo ?? null,
    costoPreventivo: Number(r.costo_preventivo),
    costoCorrectivo: Number(r.costo_correctivo),
    costoCombustible: Number(r.costo_combustible),
    costoFijoAnual: Number(r.costo_fijo),
    costoMantenimientoTotal: Number(r.costo_mantenimiento),
    costoTotal: Number(r.costo_total),
    cantidadMantenimientos: r.cantidad_mantenimientos,
    cantidadPreventivo: r.cantidad_preventivo,
    cantidadCorrectivo: r.cantidad_correctivo,
  }));
}
