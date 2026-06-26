"use server";

import { createClient } from "@/lib/supabase/server";
import { dateRangeSchema, tipoFiltroMantenimientoSchema } from "@/lib/validations";
import type { CostoPorVehiculoKPI, DisponibilidadVehiculo } from "@/types";
import { isReferenceSparkCombustionPlaca, normalizePlaca } from "@/lib/fleet-reference-plates";

type TipoFiltro = "AMBOS" | "PREVENTIVO" | "CORRECTIVO";

function calcularRtmPeriodo(
  fi: string,
  ff: string,
  rtmByYear: Record<number, number>
): number {
  const anioInicio = new Date(fi).getFullYear();
  const anioFin = new Date(ff).getFullYear();
  const aniosConocidos = Object.keys(rtmByYear).map(Number);
  const ultimoAnio = aniosConocidos.length ? Math.max(...aniosConocidos) : anioFin;
  let total = 0;
  for (let anio = anioInicio; anio <= anioFin; anio++) {
    total += rtmByYear[anio] ?? rtmByYear[ultimoAnio] ?? 0;
  }
  return total;
}

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

function coincideTextoTrabajo(
  r: {
    descripcion_trabajo?: string | null;
    maintenance_categories?: { nombre?: string | null } | null;
    id_manto?: number;
  },
  itemsByManto: Record<number, string[]>,
  q: string
): boolean {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  const hay = (s?: string | null) => (s || "").toLowerCase().includes(n);
  if (hay(r.descripcion_trabajo)) return true;
  if (hay(r.maintenance_categories?.nombre)) return true;
  const mid = r.id_manto;
  if (mid != null) {
    for (const d of itemsByManto[mid] || []) {
      if (hay(d)) return true;
    }
  }
  return false;
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

    const { fechaInicio: fi, fechaFin: ff } = dr.data;
    const tipoF = tipoOk.data;
    const centroId = opciones.centroOperativoId;
    const placasSet = normalizarPlacas(opciones.placasCsv);
    const textoQ = opciones.textoTrabajo?.trim() || "";

    const supabase = createClient();

    const { data: vehiclesRaw } = await supabase
      .from("vehicles")
      .select(
        "id, placa, marca, centro_operativo_id, costo_soat_anual, costo_poliza_anual"
      )
      .order("placa");
    if (!vehiclesRaw) return [];

    const { data: rtmRows } = await supabase
      .from("rtm_historico")
      .select("anio, valor");
    const rtmByYear: Record<number, number> = {};
    for (const r of rtmRows || []) {
      rtmByYear[r.anio] = Number(r.valor);
    }

    let vehicles = (vehiclesRaw as any[]).filter(
      (v) => !isReferenceSparkCombustionPlaca(v.placa)
    );
    if (centroId != null && Number.isFinite(centroId)) {
      vehicles = vehicles.filter((v) => v.centro_operativo_id === centroId);
    }
    if (placasSet && placasSet.size > 0) {
      vehicles = vehicles.filter((v) => placasSet.has(normalizePlaca(v.placa)));
    }
    if (vehicles.length === 0) return [];

    const vehicleIds = vehicles.map((v) => v.id as string);

    let mantQuery = supabase
      .from("maintenance_records")
      .select(
        `id_manto, vehicle_id, tipo, valor, descripcion_trabajo, maintenance_categories(nombre)`
      )
      .in("vehicle_id", vehicleIds)
      .gte("fecha", fi)
      .lte("fecha", ff);

    if (tipoF !== "AMBOS") {
      mantQuery = mantQuery.eq("tipo", tipoF);
    }

    let registros = ((await mantQuery).data || []) as any[];
    let itemsByManto: Record<number, string[]> = {};
    if (textoQ && registros.length > 0) {
      const ids = [...new Set(registros.map((r) => r.id_manto as number))];
      const { data: itemRows } = await supabase
        .from("maintenance_items")
        .select("maintenance_record_id, descripcion")
        .in("maintenance_record_id", ids);
      for (const row of itemRows || []) {
        const rid = row.maintenance_record_id as number;
        if (!itemsByManto[rid]) itemsByManto[rid] = [];
        itemsByManto[rid].push(String(row.descripcion || ""));
      }
      registros = registros.filter((r) => coincideTextoTrabajo(r, itemsByManto, textoQ));
    }

    const { data: fuelRows } = await supabase
      .from("fuel_logs")
      .select("vehicle_id, costo")
      .in("vehicle_id", vehicleIds)
      .gte("fecha", fi)
      .lte("fecha", ff);

    const diasPeriodo = Math.max(
      1,
      Math.round((new Date(ff).getTime() - new Date(fi).getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
    const factorPeriodo = diasPeriodo / 365;
    const rtmPeriodo = calcularRtmPeriodo(fi, ff, rtmByYear);

    const map: Record<string, CostoPorVehiculoKPI> = {};
    for (const v of vehicles) {
      const costoFijoAnual =
        (Number(v.costo_soat_anual || 0) + Number(v.costo_poliza_anual || 0)) *
          factorPeriodo +
        rtmPeriodo;
      map[v.id] = {
        vehicleId: v.id,
        placa: v.placa || "",
        marca: v.marca || null,
        costoPreventivo: 0,
        costoCorrectivo: 0,
        costoCombustible: 0,
        costoFijoAnual,
        costoMantenimientoTotal: 0,
        costoTotal: costoFijoAnual,
        cantidadMantenimientos: 0,
      };
    }

    for (const r of registros) {
      const reg = map[r.vehicle_id];
      if (!reg) continue;
      const valor = Number(r.valor || 0);
      reg.costoMantenimientoTotal += valor;
      reg.cantidadMantenimientos += 1;
      if (r.tipo === "PREVENTIVO") reg.costoPreventivo += valor;
      else reg.costoCorrectivo += valor;
    }

    for (const f of fuelRows || []) {
      const reg = map[f.vehicle_id];
      if (!reg) continue;
      reg.costoCombustible += Number(f.costo || 0);
    }

    const out = Object.values(map).map((r) => ({
      ...r,
      costoTotal: r.costoMantenimientoTotal + r.costoCombustible + r.costoFijoAnual,
    }));

    return out.sort((a, b) => b.costoTotal - a.costoTotal);
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

    const horasTotales =
      (new Date(ff).getTime() - new Date(fi).getTime()) /
      (1000 * 60 * 60);

    // TFDS desde mantenimientos (tiempo_fuera_servicio_horas)
    const { data: mantos } = await supabase
      .from("maintenance_records")
      .select("vehicle_id, tiempo_fuera_servicio_horas")
      .gte("fecha", fi)
      .lte("fecha", ff);

    // TFDS desde incidentes con afecta_operatividad=true
    const { data: incidents } = await supabase
      .from("incidents")
      .select("vehicle_id, fecha_reporte, fecha_cierre, afecta_operatividad")
      .eq("afecta_operatividad", true)
      .gte("fecha_reporte", fi);

    return vehiclesOperativos.map((v) => {
      // TFDS de mantenimientos
      const tfdsMantos = (mantos || [])
        .filter((m) => m.vehicle_id === v.id)
        .reduce((sum, m) => sum + (m.tiempo_fuera_servicio_horas || 0), 0);

      // TFDS de incidentes (intersección con el período)
      const tfdsIncidentes = (incidents || [])
        .filter((i) => i.vehicle_id === v.id)
        .reduce((sum, inc) => {
          const inicio = Math.max(
            new Date(inc.fecha_reporte).getTime(),
            new Date(fi).getTime()
          );
          const fin = inc.fecha_cierre
            ? Math.min(
                new Date(inc.fecha_cierre).getTime(),
                new Date(ff).getTime()
              )
            : new Date(ff).getTime();
          const horas = Math.max(0, (fin - inicio) / (1000 * 60 * 60));
          return sum + horas;
        }, 0);

      const tfdsHoras = tfdsMantos + tfdsIncidentes;
      const disponibilidadPct =
        horasTotales > 0
          ? Math.max(0, ((horasTotales - tfdsHoras) / horasTotales) * 100)
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
      .gte("fecha_reporte", fi)
      .lte("fecha_reporte", ff)
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
