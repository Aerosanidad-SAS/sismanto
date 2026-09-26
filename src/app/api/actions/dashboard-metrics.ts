"use server";

import { createClient } from "@/lib/supabase/server";
import { dateRangeSchema, tipoFiltroMantenimientoSchema } from "@/lib/validations";
import type { CostoPorVehiculoKPI, DisponibilidadVehiculo } from "@/types";
import { isReferenceSparkCombustionPlaca, normalizePlaca } from "@/lib/fleet-reference-plates";
import { costosPorVehiculo } from "@/lib/costos-vehiculo";
import { limitesInstante } from "@/lib/fechas";

type TipoFiltro = "AMBOS" | "PREVENTIVO" | "CORRECTIVO";

export type CostosPorVehiculoOpciones = {
  centroOperativoId?: number;
  /** Placas separadas por coma; vacío no filtra */
  placasCsv?: string;
  /** Coincidencia parcial en trabajo, categoría o ítem de factura */
  textoTrabajo?: string;
};

function normalizarPlacas(csv: string | undefined): Set<string> | null {
  if (!csv || !csv.trim()) return null;
  const parts = csv
    .split(/[,;\s]+/)
    .map((p) => normalizePlaca(p))
    .filter(Boolean);
  return parts.length ? new Set(parts) : null;
}

export async function getCostosPorVehiculo(
  fechaInicio: string,
  fechaFin: string,
  tipo: TipoFiltro = "AMBOS",
  opciones: CostosPorVehiculoOpciones = {}
): Promise<CostoPorVehiculoKPI[]> {
  try {
    const dr = dateRangeSchema.safeParse({ fechaInicio, fechaFin });
    if (!dr.success) return [];
    const tipoOk = tipoFiltroMantenimientoSchema.safeParse(tipo);
    if (!tipoOk.success) return [];

    const centroId = opciones.centroOperativoId;
    const placasSet = normalizarPlacas(opciones.placasCsv);

    return await costosPorVehiculo(createClient(), {
      desde: dr.data.fechaInicio,
      hasta: dr.data.fechaFin,
      tipo: tipoOk.data,
      centroOperativoId: centroId != null && Number.isFinite(centroId) ? centroId : undefined,
      placas: placasSet ? [...placasSet] : undefined,
      texto: opciones.textoTrabajo,
    });
  } catch {
    return [];
  }
}

export async function getDisponibilidadPorVehiculo(
  fechaInicio: string,
  fechaFin: string,
  centroOperativoId?: number
): Promise<DisponibilidadVehiculo[]> {
  try {
    const dr = dateRangeSchema.safeParse({ fechaInicio, fechaFin });
    if (!dr.success) return [];
    const { fechaInicio: fi, fechaFin: ff } = dr.data;

    const supabase = createClient();
    const META_DISPONIBILIDAD = 95;

    let vehQuery = supabase
      .from("vehicles")
      .select("id, placa, marca, estado_actual")
      .order("placa");
    if (centroOperativoId != null && Number.isFinite(centroOperativoId)) {
      vehQuery = vehQuery.eq("centro_operativo_id", centroOperativoId);
    }
    const { data: vehicles } = await vehQuery;
    if (!vehicles) return [];
    const vehiclesOperativos = vehicles.filter((v) => !isReferenceSparkCombustionPlaca(v.placa));
    if (vehiclesOperativos.length === 0) return [];

    // Período en ms — incluye el último día completo (hasta las 23:59:59)
    // Límites del periodo en hora de Colombia (las fechas de cambio son timestamptz), no en UTC.
    const lim = limitesInstante(fi, ff);
    const periodStartMs = Date.parse(lim.desde);
    const periodEndMs = Date.parse(lim.hastaExclusivo) - 1;
    const horasTotales = (periodEndMs - periodStartMs + 1) / (1000 * 60 * 60);

    // Historial de cambios de estado: fuente de verdad para TFDS
    const { data: statusHistory } = await supabase
      .from("vehicle_status_history")
      .select("vehicle_id, estado_nuevo, estado_anterior, fecha_cambio")
      .order("fecha_cambio", { ascending: true });

    const history = statusHistory ?? [];

    return vehiclesOperativos.map((v) => {
      // Entradas de este vehículo ordenadas cronológicamente
      const vHistory = history.filter((h) => h.vehicle_id === v.id);

      // Estado del vehículo al inicio del período: última entrada ANTES de fi
      const beforePeriod = vHistory.filter((h) => new Date(h.fecha_cambio).getTime() <= periodStartMs);
      let stateAtStart: string;
      if (beforePeriod.length > 0) {
        stateAtStart = beforePeriod[beforePeriod.length - 1].estado_nuevo;
      } else {
        // Sin historial previo: usar estado_anterior de la primera entrada, o OPERATIVO
        const firstEntry = vHistory.find((h) => new Date(h.fecha_cambio).getTime() <= periodEndMs);
        stateAtStart = firstEntry?.estado_anterior ?? "OPERATIVO";
      }

      // Entradas dentro del período
      const withinPeriod = vHistory.filter((h) => {
        const t = new Date(h.fecha_cambio).getTime();
        return t > periodStartMs && t <= periodEndMs;
      });

      // Acumular horas FDS recorriendo las transiciones
      let tfdsMs = 0;
      let segStart = periodStartMs;
      let segState = stateAtStart;

      for (const entry of withinPeriod) {
        const entryMs = Math.min(new Date(entry.fecha_cambio).getTime(), periodEndMs);
        if (segState === "FUERA_DE_SERVICIO") {
          tfdsMs += entryMs - segStart;
        }
        segState = entry.estado_nuevo;
        segStart = entryMs;
      }
      // Tramo final hasta el cierre del período
      if (segState === "FUERA_DE_SERVICIO") {
        tfdsMs += periodEndMs - segStart;
      }

      const tfdsHoras = tfdsMs / (1000 * 60 * 60);
      const disponibilidadPct =
        horasTotales > 0
          ? Math.max(0, Math.min(100, ((horasTotales - tfdsHoras) / horasTotales) * 100))
          : 100;

      const estadoOp =
        String(v.estado_actual || "").toUpperCase() === "OPERATIVO" ? ("DISP" as const) : ("FDS" as const);
      return {
        vehicleId: v.id,
        placa: v.placa,
        marca: v.marca,
        estadoOperativo: estadoOp,
        horasTotales,
        tfdsHoras,
        disponibilidadPct,
        cumpleMeta: disponibilidadPct >= META_DISPONIBILIDAD,
      };
    });
  } catch {
    return [];
  }
}

export async function getResolucionNovedades(
  fechaInicio: string,
  fechaFin: string
) {
  try {
    const dr = dateRangeSchema.safeParse({ fechaInicio, fechaFin });
    if (!dr.success) return { novedades: [], resumen: null };
    const { fechaInicio: fi, fechaFin: ff } = dr.data;

    const supabase = createClient();

    const { data } = await supabase
      .from("incidents")
      .select(
        `id, fecha_reporte, descripcion, severidad, reportado_por, estado, fecha_cierre, tiempo_resolucion_horas, afecta_operatividad,
         vehicles!inner(placa, marca)`
      )
      .gte("fecha_reporte", limitesInstante(fi, ff).desde)
      .lt("fecha_reporte", limitesInstante(fi, ff).hastaExclusivo)
      .order("fecha_reporte", { ascending: false });

    if (!data) return { novedades: [], resumen: null };
    const dataOperativa = data.filter(
      (n: any) => !isReferenceSparkCombustionPlaca(n.vehicles?.placa)
    );

    const cerradas = dataOperativa.filter((n: any) => n.estado === "CERRADO");
    const abiertas = dataOperativa.filter((n: any) => n.estado !== "CERRADO");

    const promedioResolucion =
      cerradas.length > 0
        ? cerradas.reduce(
            (sum: number, n: any) => sum + (n.tiempo_resolucion_horas || 0),
            0
          ) / cerradas.length
        : 0;

    const pctResueltas =
      dataOperativa.length > 0 ? (cerradas.length / dataOperativa.length) * 100 : 0;

    return {
      novedades: dataOperativa,
      resumen: {
        total: dataOperativa.length,
        cerradas: cerradas.length,
        abiertas: abiertas.length,
        promedioHorasResolucion: promedioResolucion,
        pctResueltas,
      },
    };
  } catch {
    return { novedades: [], resumen: null };
  }
}
