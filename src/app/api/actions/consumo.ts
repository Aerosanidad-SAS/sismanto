"use server";

import { createClient } from "@/lib/supabase/server";
import { fuelLogSchema, metricasConsumoParamsSchema } from "@/lib/validations";

export async function getMetricasConsumo(
  fechaInicio: string,
  fechaFin: string,
  vehicleId?: string,
  centroId?: number
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
    const { data: vehicles } = await vehiclesQuery;
    if (!vehicles || vehicles.length === 0) return [];

    const vehicleIds = vehicles.map((v) => v.id);

    // Cargas de combustible en el período
    const { data: fuelLogs } = await supabase
      .from("fuel_logs")
      .select("*")
      .in("vehicle_id", vehicleIds)
      .gte("fecha", fi)
      .lte("fecha", ff)
      .order("vehicle_id")
      .order("fecha");

    // Kilometrajes de mantenimientos (para calcular km recorridos cuando no hay fuel_logs)
    const { data: maintenanceKm } = await supabase
      .from("maintenance_records")
      .select("vehicle_id, kilometraje_actual, fecha")
      .in("vehicle_id", vehicleIds)
      .gte("fecha", fi)
      .lte("fecha", ff)
      .order("vehicle_id")
      .order("fecha");

    // Calcular métricas por vehículo
    const metricas = vehicles.map((vehicle) => {
      const logsVehiculo = (fuelLogs || []).filter(
        (f) => f.vehicle_id === vehicle.id
      );
      const kmManto = (maintenanceKm || []).filter(
        (m) => m.vehicle_id === vehicle.id
      );

      let kmRecorridos = 0;
      let consumoPromedioKmGal: number | null = null;
      let totalGalones = 0;
      let cantidadCargas = logsVehiculo.length;

      // Calcular km recorridos
      if (logsVehiculo.length >= 2) {
        const kmMin = Math.min(...logsVehiculo.map((f) => f.kilometraje));
        const kmMax = Math.max(...logsVehiculo.map((f) => f.kilometraje));
        kmRecorridos = kmMax - kmMin;
      } else if (kmManto.length >= 2) {
        const kmMin = Math.min(...kmManto.map((m) => m.kilometraje_actual));
        const kmMax = Math.max(...kmManto.map((m) => m.kilometraje_actual));
        kmRecorridos = kmMax - kmMin;
      } else if (kmManto.length === 1) {
        kmRecorridos = 0;
      }

      // Calcular consumo km/gal para cada carga
      if (logsVehiculo.length >= 2) {
        const consumosPorCarga: number[] = [];
        for (let i = 1; i < logsVehiculo.length; i++) {
          const kmDelta = logsVehiculo[i].kilometraje - logsVehiculo[i - 1].kilometraje;
          const galones = logsVehiculo[i].galones;
          if (kmDelta > 0 && galones > 0) {
            consumosPorCarga.push(kmDelta / galones);
          }
        }
        if (consumosPorCarga.length > 0) {
          consumoPromedioKmGal =
            consumosPorCarga.reduce((a, b) => a + b, 0) / consumosPorCarga.length;
        }
        totalGalones = logsVehiculo.reduce((sum, f) => sum + f.galones, 0);
      } else if (logsVehiculo.length === 1) {
        totalGalones = logsVehiculo[0].galones;
        cantidadCargas = 1;
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
  centroId?: number
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
    const { data: vehicles } = await vehiclesQuery;
    if (!vehicles || vehicles.length === 0) return [];

    const vehicleIds = vehicles.map((v) => v.id);

    const { data: fuelLogs } = await supabase
      .from("fuel_logs")
      .select("vehicle_id, fecha, kilometraje, galones")
      .in("vehicle_id", vehicleIds)
      .gte("fecha", fi)
      .lte("fecha", ff)
      .order("fecha");

    const logs = fuelLogs || [];

    const monthKeys: string[] = [];
    const start = new Date(fi + "T12:00:00");
    const end = new Date(ff + "T12:00:00");
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cur <= endMonth) {
      monthKeys.push(
        `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`
      );
      cur.setMonth(cur.getMonth() + 1);
    }

    const rendimientoMesVehiculo = (vehicleIdRow: string, yyyymm: string): number | null => {
      const inMonth = logs
        .filter((l) => l.vehicle_id === vehicleIdRow && String(l.fecha).slice(0, 7) === yyyymm)
        .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
      if (inMonth.length < 2) return null;
      const vals: number[] = [];
      for (let i = 1; i < inMonth.length; i++) {
        const kmDelta = inMonth[i].kilometraje - inMonth[i - 1].kilometraje;
        const gal = inMonth[i].galones;
        if (kmDelta > 0 && gal > 0) vals.push(kmDelta / gal);
      }
      if (vals.length === 0) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
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
