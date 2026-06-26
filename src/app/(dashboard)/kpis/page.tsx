import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { KPIDashboard } from "@/components/charts/kpi-dashboard";
import { isReferenceSparkCombustionPlaca } from "@/lib/fleet-reference-plates";
import { getMetricasConsumo } from "@/app/api/actions/consumo";

function calcularRtmPeriodoKpi(
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

type TcoTipoFiltro = "AMBOS" | "PREVENTIVO" | "CORRECTIVO";
type FuelResumenKPI = {
  kmTotales: number;
  galonesTotales: number;
  consumoPromedioFlota: number | null;
  vehiculosConDatos: number;
  vehiculosAnalizados: number;
};

async function getKPIData(
  fechaInicio: string,
  fechaFin: string,
  tcoFiltros?: {
    centroId?: number;
    tipo: TcoTipoFiltro;
    placaFragment?: string;
  },
  dispCentroId?: number
) {
  try {
    const supabase = createClient();

    // KPI 1: Tasa de Disponibilidad (Uptime)
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("id, placa, centro_operativo, centro_operativo_id");

    const horasTotales =
    (new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) /
    (1000 * 60 * 60);

    const { data: incidents } = await supabase
    .from("incidents")
    .select("vehicle_id, fecha_reporte, fecha_cierre, afecta_operatividad")
    .eq("afecta_operatividad", true)
    .gte("fecha_reporte", fechaInicio)
    .lte("fecha_reporte", fechaFin);

    let vehiclesFiltrados = (vehicles || []).filter(
      (v: any) => !isReferenceSparkCombustionPlaca(v.placa)
    );
    if (dispCentroId != null) {
      vehiclesFiltrados = vehiclesFiltrados.filter(
        (v: any) => Number(v.centro_operativo_id) === dispCentroId
      );
    }

    const uptimeData =
    vehiclesFiltrados.map((v: any) => {
      const incidentesVehiculo = incidents?.filter(
        (i) => i.vehicle_id === v.id
      ) || [];
      const horasFuera = incidentesVehiculo.reduce((sum, inc) => {
        const inicio = new Date(inc.fecha_reporte).getTime();
        const fin = inc.fecha_cierre
          ? new Date(inc.fecha_cierre).getTime()
          : new Date().getTime();
        return sum + (fin - inicio) / (1000 * 60 * 60);
      }, 0);
      const porcentaje = ((horasTotales - horasFuera) / horasTotales) * 100;

      return {
        vehicleId: v.id,
        placa: v.placa,
        centroOperativo: String(v.centro_operativo || ""),
        horasTotales,
        horasFueraServicio: horasFuera,
        porcentajeDisponibilidad: Math.max(0, porcentaje),
        cumpleMeta: Math.max(0, porcentaje) >= 95,
      };
    });

    // KPI 2: CTO (Costo Total de Operación)
    const { data: vehiclesCostRaw } = await supabase
      .from("vehicles")
      .select(
        "id, placa, centro_operativo, centro_operativo_id, costo_soat_anual, costo_poliza_anual"
      );
    const { data: rtmRowsKpi } = await supabase
      .from("rtm_historico")
      .select("anio, valor");
    const rtmByYearKpi: Record<number, number> = {};
    for (const r of rtmRowsKpi || []) {
      rtmByYearKpi[r.anio] = Number(r.valor);
    }
    let vehiclesCost = (vehiclesCostRaw || []).filter(
      (v: any) => !isReferenceSparkCombustionPlaca(v.placa)
    );
    if (tcoFiltros?.centroId != null && !Number.isNaN(tcoFiltros.centroId)) {
      vehiclesCost = vehiclesCost.filter(
        (v: any) => Number(v.centro_operativo_id) === tcoFiltros.centroId
      );
    }
    if (tcoFiltros?.placaFragment?.trim()) {
      const q = tcoFiltros.placaFragment.trim().toUpperCase();
      vehiclesCost = vehiclesCost.filter((v: any) =>
        String(v.placa || "").toUpperCase().includes(q)
      );
    }
    const vehicleIds = vehiclesCost.map((v: any) => v.id);

    let mantenimientos: any[] = [];
    if (vehicleIds.length > 0) {
      let mantQuery = supabase
        .from("maintenance_records")
        .select(
          `tipo, valor, vehicle_id, vehicles!inner(placa, centro_operativo, centro_operativo_id)`
        )
        .in("vehicle_id", vehicleIds)
        .gte("fecha", fechaInicio)
        .lte("fecha", fechaFin);
      if (tcoFiltros?.tipo && tcoFiltros.tipo !== "AMBOS") {
        mantQuery = mantQuery.eq("tipo", tcoFiltros.tipo);
      }
      mantenimientos = (await mantQuery).data || [];
    }

    const { data: fuelRows } = vehicleIds.length
      ? await supabase
          .from("fuel_logs")
          .select("vehicle_id, costo")
          .in("vehicle_id", vehicleIds)
          .gte("fecha", fechaInicio)
          .lte("fecha", fechaFin)
      : { data: [] as any[] };

    const diasPeriodo = Math.max(
      1,
      Math.round(
        (new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
    );
    const factorPeriodo = diasPeriodo / 365;
    const rtmPeriodoKpi = calcularRtmPeriodoKpi(fechaInicio, fechaFin, rtmByYearKpi);

    const tcoData: Record<string, any> = {};
    for (const v of vehiclesCost) {
      const costoFijoAnual =
        (Number(v.costo_soat_anual || 0) + Number(v.costo_poliza_anual || 0)) *
          factorPeriodo +
        rtmPeriodoKpi;
      tcoData[v.id] = {
        placa: v.placa,
        centroOperativo: v.centro_operativo,
        costoPreventivo: 0,
        costoCorrectivo: 0,
        costoCombustible: 0,
        costoFijoAnual,
        costoTotal: costoFijoAnual,
        cantidadMantenimientos: 0,
      };
    }

    for (const m of mantenimientos) {
      const entry = tcoData[m.vehicle_id];
      if (!entry) continue;
      const valor = Number(m.valor || 0);
      entry.cantidadMantenimientos += 1;
      if (m.tipo === "PREVENTIVO") entry.costoPreventivo += valor;
      if (m.tipo === "CORRECTIVO") entry.costoCorrectivo += valor;
      entry.costoTotal += valor;
    }

    for (const f of fuelRows || []) {
      const entry = tcoData[f.vehicle_id];
      if (!entry) continue;
      const costo = Number(f.costo || 0);
      entry.costoCombustible += costo;
      entry.costoTotal += costo;
    }

    // KPI 3: Ratio Preventivo/Correctivo (subconjunto de mantenimientos filtrado)
    const totalPreventivo = mantenimientos.reduce(
      (sum, m: any) => sum + (m.tipo === "PREVENTIVO" ? m.valor || 0 : 0),
      0
    );
    const totalCorrectivo = mantenimientos.reduce(
      (sum, m: any) => sum + (m.tipo === "CORRECTIVO" ? m.valor || 0 : 0),
      0
    );
    const cantidadPreventivo = mantenimientos.filter((m: any) => m.tipo === "PREVENTIVO").length;
    const cantidadCorrectivo = mantenimientos.filter((m: any) => m.tipo === "CORRECTIVO").length;

    const ratioPC = {
      costoPreventivo: totalPreventivo,
      costoCorrectivo: totalCorrectivo,
      ratio: totalCorrectivo > 0 ? totalPreventivo / totalCorrectivo : 0,
      cantidadPreventivo,
      cantidadCorrectivo,
    };

    // KPI 4: Tiempo Medio de Resolución
    const { data: incidentsResolucion } = await supabase
    .from("incidents")
    .select("severidad, fecha_reporte, fecha_cierre, estado")
    .gte("fecha_reporte", fechaInicio)
    .lte("fecha_reporte", fechaFin);

    const resolucionPorSeveridad: Record<string, any> = {};
    incidentsResolucion?.forEach((inc) => {
      if (!resolucionPorSeveridad[inc.severidad]) {
        resolucionPorSeveridad[inc.severidad] = {
          severidad: inc.severidad,
          totalHoras: 0,
          cantidadCerradas: 0,
          cantidadAbiertas: 0,
        };
      }
      if (inc.estado === "CERRADO" && inc.fecha_cierre) {
        const horas =
          (new Date(inc.fecha_cierre).getTime() -
            new Date(inc.fecha_reporte).getTime()) /
          (1000 * 60 * 60);
        resolucionPorSeveridad[inc.severidad].totalHoras += horas;
        resolucionPorSeveridad[inc.severidad].cantidadCerradas += 1;
      } else {
        resolucionPorSeveridad[inc.severidad].cantidadAbiertas += 1;
      }
    });

    const resolucionData = Object.values(resolucionPorSeveridad).map((r: any) => ({
      severidad: r.severidad,
      promedioHoras:
        r.cantidadCerradas > 0 ? r.totalHoras / r.cantidadCerradas : 0,
      cantidadCerradas: r.cantidadCerradas,
      cantidadAbiertas: r.cantidadAbiertas,
    }));


    return {
      uptimeData,
      tcoData: Object.values(tcoData),
      ratioPC,
      resolucionData,
    };
  } catch {
    return {
      uptimeData: [],
      tcoData: [],
      ratioPC: {
        costoPreventivo: 0,
        costoCorrectivo: 0,
        ratio: 0,
        cantidadPreventivo: 0,
        cantidadCorrectivo: 0,
      },
      resolucionData: [],
    };
  }
}

async function getFuelResumen(fechaInicio: string, fechaFin: string): Promise<FuelResumenKPI> {
  const metricas = await getMetricasConsumo(fechaInicio, fechaFin, undefined, undefined, "operativa");
  const conConsumo = metricas.filter((m) => m.consumoPromedioKmGal !== null);
  return {
    kmTotales: metricas.reduce((sum, m) => sum + m.kmRecorridos, 0),
    galonesTotales: metricas.reduce((sum, m) => sum + m.totalGalones, 0),
    consumoPromedioFlota:
      conConsumo.length > 0
        ? conConsumo.reduce((sum, m) => sum + (m.consumoPromedioKmGal || 0), 0) / conConsumo.length
        : null,
    vehiculosConDatos: conConsumo.length,
    vehiculosAnalizados: metricas.length,
  };
}

export default async function KPIsPage({
  searchParams,
}: {
  searchParams: {
    inicio?: string;
    fin?: string;
    kCentro?: string;
    kTipo?: string;
    kPlaca?: string;
    kDispCentro?: string;
  };
}) {
  const hoy = new Date();
  const fechaInicio = searchParams.inicio || "2024-01-01";
  const fechaFin = searchParams.fin || hoy.toISOString().split("T")[0];

  const kCentroParsed = searchParams.kCentro ? parseInt(searchParams.kCentro, 10) : NaN;
  const tcoCentroId =
    !Number.isNaN(kCentroParsed) && kCentroParsed > 0 ? kCentroParsed : undefined;
  const kTipoRaw = (searchParams.kTipo || "AMBOS").toUpperCase();
  const tcoTipo: TcoTipoFiltro =
    kTipoRaw === "PREVENTIVO" || kTipoRaw === "CORRECTIVO" ? kTipoRaw : "AMBOS";
  const tcoPlaca = searchParams.kPlaca?.trim() || undefined;

  const kDispCentroParsed = searchParams.kDispCentro ? parseInt(searchParams.kDispCentro, 10) : NaN;
  const dispCentroId = !Number.isNaN(kDispCentroParsed) && kDispCentroParsed > 0
    ? kDispCentroParsed : undefined;

  const supabase = createClient();
  const [{ data: centrosKpi }, { data: vehiclesKpi }] = await Promise.all([
    supabase.from("operational_centers").select("id, nombre").eq("activo", true).order("nombre"),
    supabase.from("vehicles").select("placa").order("placa"),
  ]);
  const placasKpi = Array.from(
    new Set(
      (vehiclesKpi || [])
        .map((v: { placa: string }) => String(v.placa || "").trim())
        .filter((placa) => placa && !isReferenceSparkCombustionPlaca(placa))
    )
  );

  const [kpiData, fuelResumen] = await Promise.all([
    getKPIData(
      fechaInicio,
      fechaFin,
      { centroId: tcoCentroId, tipo: tcoTipo, placaFragment: tcoPlaca },
      dispCentroId
    ),
    getFuelResumen(fechaInicio, fechaFin),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">KPIs y Métricas</h1>
        <p className="mt-2 text-muted-foreground">
          Indicadores clave de rendimiento de la flota
        </p>
      </div>

      <Suspense fallback={<div>Cargando KPIs...</div>}>
        <KPIDashboard
          uptimeData={kpiData.uptimeData}
          tcoData={kpiData.tcoData}
          ratioPC={kpiData.ratioPC}
          resolucionData={kpiData.resolucionData}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          centrosOperativos={centrosKpi ?? []}
          placasDisponibles={placasKpi}
          tcoCentroIdInicial={tcoCentroId}
          tcoTipoInicial={tcoTipo}
          tcoPlacaInicial={tcoPlaca ?? ""}
          dispCentroIdInicial={dispCentroId}
          fuelResumen={fuelResumen}
        />
      </Suspense>
    </div>
  );
}
