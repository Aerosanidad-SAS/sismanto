"use server";

import { mesesDelRango } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { fuelLogSchema, metricasConsumoParamsSchema } from "@/lib/validations";
import { isReferenceSparkCombustionPlaca, normalizePlaca } from "@/lib/fleet-reference-plates";

type ConsumoScope = "operativa" | "referencia" | "todas";
const DEFAULT_OSK397_KM_PER_GAL = 35;
const MAX_REASONABLE_KM_PER_GAL = 80;

export async function getMetricasConsumo(
  fechaInicio: string,
  fechaFin: string,
  vehicleId?: string,
  centroId?: number,
  scope: ConsumoScope = "operativa"
) {
  try {
    const validated = metricasConsumoParamsSchema.safeParse({
      fechaInicio,
      fechaFin,
      vehicleId,
      centroId,
    });
    if (!validated.success) return [];

    const { fechaInicio: fi, fechaFin: ff, vehicleId: vid, centroId: cid } = validated.data;

    const supabase = createClient();

    // Obtener vehículos (con filtros opcionales)
    let vehiclesQuery = supabase
      .from("vehicles")
      .select("id, placa, marca, centro_operativo_id");
    if (vid) vehiclesQuery = vehiclesQuery.eq("id", vid);
    if (cid !== undefined) vehiclesQuery = vehiclesQuery.eq("centro_operativo_id", cid);
    const { data: vehiclesRaw } = await vehiclesQuery;
    if (!vehiclesRaw || vehiclesRaw.length === 0) return [];
    const vehicles = vehiclesRaw.filter((vehicle) => {
      const isReference = isReferenceSparkCombustionPlaca(vehicle.placa);
      if (scope === "referencia") return isReference;
      if (scope === "operativa") return !isReference;
      return true;
    });
    if (vehicles.length === 0) return [];

    const vehicleIds = vehicles.map((v) => v.id);

    // Cargas de combustible hasta fecha fin (incluye historial anterior al período para baseline)
    const { data: fuelLogsAll } = await supabase
      .from("fuel_logs")
      .select("*")
      .in("vehicle_id", vehicleIds)
      .lte("fecha", ff)
      .order("vehicle_id")
      .order("fecha");

    // Kilometrajes de mantenimientos hasta fecha fin (sirve como fallback y baseline)
    const { data: maintenanceKm } = await supabase
      .from("maintenance_records")
      .select("vehicle_id, kilometraje_actual, fecha")
      .in("vehicle_id", vehicleIds)
      .lte("fecha", ff)
      .order("vehicle_id")
      .order("fecha");

    // Baseline preferido desde mileage_logs
    const { data: mileageLogs } = await supabase
      .from("mileage_logs")
      .select("vehicle_id, lectura_kilometraje, fecha")
      .in("vehicle_id", vehicleIds)
      .lte("fecha", ff)
      .order("vehicle_id")
      .order("fecha");

    const fuelLogs = fuelLogsAll || [];

    const pickLatestKmBefore = (
      rows: Array<{ fecha: string; km: number }>,
      fechaRef: string
    ): number | null => {
      let candidate: number | null = null;
      for (const r of rows) {
        if (String(r.fecha) <= String(fechaRef)) candidate = r.km;
        else break;
      }
      return candidate;
    };

    // Calcular métricas por vehículo
    const metricas = vehicles.map((vehicle) => {
      const logsVehiculoAllSorted = fuelLogs
        .filter((f) => f.vehicle_id === vehicle.id)
        .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
      const logsVehiculoPeriodo = logsVehiculoAllSorted.filter(
        (f) => String(f.fecha) >= fi && String(f.fecha) <= ff
      );

      const kmMantoAll = (maintenanceKm || []).filter((m) => m.vehicle_id === vehicle.id);
      const kmMantoPeriodo = kmMantoAll.filter(
        (m) => String(m.fecha) >= fi && String(m.fecha) <= ff
      );
      const mileVehAll = (mileageLogs || []).filter((m) => m.vehicle_id === vehicle.id);

      const anchorsMileage = mileVehAll.map((m) => ({
        fecha: String(m.fecha),
        km: Number(m.lectura_kilometraje || 0),
      }));
      const anchorsMaintenance = kmMantoAll.map((m) => ({
        fecha: String(m.fecha),
        km: Number(m.kilometraje_actual || 0),
      }));

      let kmRecorridos = 0;
      let consumoPromedioKmGal: number | null = null;
      let totalGalones = 0;
      let cantidadCargas = logsVehiculoPeriodo.length;

      // Calcular km recorridos
      if (logsVehiculoPeriodo.length >= 2) {
        const kmMin = Math.min(...logsVehiculoPeriodo.map((f) => f.kilometraje));
        const kmMax = Math.max(...logsVehiculoPeriodo.map((f) => f.kilometraje));
        kmRecorridos = kmMax - kmMin;
      } else if (kmMantoPeriodo.length >= 2) {
        const kmMin = Math.min(...kmMantoPeriodo.map((m) => m.kilometraje_actual));
        const kmMax = Math.max(...kmMantoPeriodo.map((m) => m.kilometraje_actual));
        kmRecorridos = kmMax - kmMin;
      } else if (kmMantoPeriodo.length === 1) {
        kmRecorridos = 0;
      }

      // Calcular consumo km/gal por carga del período, usando baseline histórico en primera carga
      if (logsVehiculoPeriodo.length >= 1) {
        const consumosPorCarga: number[] = [];
        for (let i = 0; i < logsVehiculoAllSorted.length; i++) {
          const cur = logsVehiculoAllSorted[i];
          if (String(cur.fecha) < fi || String(cur.fecha) > ff) continue;

          let kmPrevio: number | null =
            i > 0 ? Number(logsVehiculoAllSorted[i - 1].kilometraje || 0) : null;

          if (kmPrevio === null) {
            // 1) baseline desde mileage_logs
            kmPrevio = pickLatestKmBefore(anchorsMileage, String(cur.fecha));
          }
          if (kmPrevio === null) {
            // 2) fallback a maintenance_records
            kmPrevio = pickLatestKmBefore(anchorsMaintenance, String(cur.fecha));
          }

          const kmDelta = Number(cur.kilometraje || 0) - Number(kmPrevio || 0);
          const galones = Number(cur.galones || 0);
          if (kmDelta > 0 && galones > 0) {
            consumosPorCarga.push(kmDelta / galones);
          }
        }
        if (consumosPorCarga.length > 0) {
          consumoPromedioKmGal =
            consumosPorCarga.reduce((a, b) => a + b, 0) / consumosPorCarga.length;
        }
        totalGalones = logsVehiculoPeriodo.reduce((sum, f) => sum + f.galones, 0);
      } else if (logsVehiculoPeriodo.length === 1) {
        totalGalones = logsVehiculoPeriodo[0].galones;
        cantidadCargas = 1;
      }

      const placaNormalizada = normalizePlaca(vehicle.placa);
      if (
        placaNormalizada === "OSK397" &&
        (consumoPromedioKmGal === null ||
          consumoPromedioKmGal <= 0 ||
          consumoPromedioKmGal > MAX_REASONABLE_KM_PER_GAL)
      ) {
        consumoPromedioKmGal = DEFAULT_OSK397_KM_PER_GAL;
      }

      return {
        vehicleId: vehicle.id,
        placa: vehicle.placa,
        marca: vehicle.marca,
        kmRecorridos,
        consumoPromedioKmGal,
        totalGalones,
        cantidadCargas,
      };
    });

    return metricas;
  } catch {
    return [];
  }
}

/** Rendimiento km/gal agregado por mes calendario (YYYY-MM) para gráficas de tendencia. */
export async function getRendimientoCombustibleSerieMensual(
  fechaInicio: string,
  fechaFin: string,
  vehicleId?: string,
  centroId?: number,
  scope: ConsumoScope = "operativa"
) {
  try {
    const validated = metricasConsumoParamsSchema.safeParse({
      fechaInicio,
      fechaFin,
      vehicleId,
      centroId,
    });
    if (!validated.success) return [];

    const { fechaInicio: fi, fechaFin: ff, vehicleId: vid, centroId: cid } = validated.data;

    const supabase = createClient();

    let vehiclesQuery = supabase.from("vehicles").select("id, placa, marca, centro_operativo_id");
    if (vid) vehiclesQuery = vehiclesQuery.eq("id", vid);
    if (cid !== undefined) vehiclesQuery = vehiclesQuery.eq("centro_operativo_id", cid);
    const { data: vehiclesRaw } = await vehiclesQuery;
    if (!vehiclesRaw || vehiclesRaw.length === 0) return [];
    const vehicles = vehiclesRaw.filter((vehicle) => {
      const isReference = isReferenceSparkCombustionPlaca(vehicle.placa);
      if (scope === "referencia") return isReference;
      if (scope === "operativa") return !isReference;
      return true;
    });
    if (vehicles.length === 0) return [];

    const vehicleIds = vehicles.map((v) => v.id);
    const plateByVehicleId = new Map(vehicles.map((v) => [v.id, normalizePlaca(v.placa)]));

    const { data: fuelLogs } = await supabase
      .from("fuel_logs")
      .select("vehicle_id, fecha, kilometraje, galones")
      .in("vehicle_id", vehicleIds)
      .gte("fecha", fi)
      .lte("fecha", ff)
      .order("fecha");

    const logs = fuelLogs || [];

    const monthKeys = mesesDelRango(fi, ff);

    const rendimientoMesVehiculo = (vehicleIdRow: string, yyyymm: string): number | null => {
      const inMonth = logs
        .filter((l) => l.vehicle_id === vehicleIdRow && String(l.fecha).slice(0, 7) === yyyymm)
        .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
      if (inMonth.length < 2) {
        return plateByVehicleId.get(vehicleIdRow) === "OSK397" ? DEFAULT_OSK397_KM_PER_GAL : null;
      }
      const vals: number[] = [];
      for (let i = 1; i < inMonth.length; i++) {
        const kmDelta = inMonth[i].kilometraje - inMonth[i - 1].kilometraje;
        const gal = inMonth[i].galones;
        if (kmDelta > 0 && gal > 0) vals.push(kmDelta / gal);
      }
      if (vals.length === 0) {
        return plateByVehicleId.get(vehicleIdRow) === "OSK397" ? DEFAULT_OSK397_KM_PER_GAL : null;
      }
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      if (plateByVehicleId.get(vehicleIdRow) === "OSK397" && avg > MAX_REASONABLE_KM_PER_GAL) {
        return DEFAULT_OSK397_KM_PER_GAL;
      }
      return avg;
    };

    return monthKeys.map((mes) => {
      const porVehiculo = vehicleIds
        .map((id) => rendimientoMesVehiculo(id, mes))
        .filter((x): x is number => x !== null);
      const rendimientoKmGal =
        porVehiculo.length > 0
          ? porVehiculo.reduce((a, b) => a + b, 0) / porVehiculo.length
          : null;
      return { mes, rendimientoKmGal };
    });
  } catch {
    return [];
  }
}

export async function registrarCombustible(data: {
  vehicleId: string;
  fecha: string;
  kilometraje: number;
  galones: number;
  costo?: number;
  notas?: string;
}) {
  const parsed = fuelLogSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const row = parsed.data;
  const { error } = await supabase.from("fuel_logs").insert({
    vehicle_id: row.vehicleId,
    fecha: row.fecha,
    kilometraje: row.kilometraje,
    galones: row.galones,
    costo: row.costo ?? null,
    notas: row.notas ?? null,
  });
  if (error) return { error: error.message };
  return { success: true };
}
