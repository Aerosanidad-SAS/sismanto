import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { KPIDashboard } from "@/components/charts/kpi-dashboard";

type TcoTipoFiltro = "AMBOS" | "PREVENTIVO" | "CORRECTIVO";

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

    let vehiclesFiltrados = vehicles || [];
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

    // KPI 2: TCO (Total Cost of Ownership)
    const { data: mantenimientosRaw } = await supabase
    .from("maintenance_records")
    .select(`
      tipo,
      valor,
      vehicles!inner(placa, centro_operativo, centro_operativo_id)
    `)
    .gte("fecha", fechaInicio)
    .lte("fecha", fechaFin);

    let mantenimientos = mantenimientosRaw || [];
    if (tcoFiltros?.centroId != null && !Number.isNaN(tcoFiltros.centroId)) {
      mantenimientos = mantenimientos.filter(
        (m: any) => Number(m.vehicles?.centro_operativo_id) === tcoFiltros!.centroId
      );
    }
    if (tcoFiltros?.tipo && tcoFiltros.tipo !== "AMBOS") {
      mantenimientos = mantenimientos.filter((m: any) => m.tipo === tcoFiltros!.tipo);
    }
    if (tcoFiltros?.placaFragment?.trim()) {
      const q = tcoFiltros.placaFragment.trim().toUpperCase();
      mantenimientos = mantenimientos.filter((m: any) =>
        String(m.vehicles?.placa || "")
          .toUpperCase()
          .includes(q)
      );
    }

    const tcoData: Record<string, any> = {};
    mantenimientos.forEach((m: any) => {
      const key = `${m.vehicles.centro_operativo}_${m.vehicles.placa}`;
      if (!tcoData[key]) {
        tcoData[key] = {
          placa: m.vehicles.placa,
          centroOperativo: m.vehicles.centro_operativo,
          costoPreventivo: 0,
          costoCorrectivo: 0,
          costoTotal: 0,
          cantidadMantenimientos: 0,
        };
      }
      const valor = m.valor || 0;
      tcoData[key].costoTotal += valor;
      tcoData[key].cantidadMantenimientos += 1;
      if (m.tipo === "PREVENTIVO") {
        tcoData[key].costoPreventivo += valor;
      } else {
        tcoData[key].costoCorrectivo += valor;
      }
    });

    // KPI 3: Ratio Preventivo/Correctivo (mismo subconjunto que TCO si hay filtros)
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
  const inicio3Meses = new Date();
  inicio3Meses.setMonth(inicio3Meses.getMonth() - 3);
  inicio3Meses.setDate(1);
  inicio3Meses.setHours(0, 0, 0, 0);

  const fechaInicio =
    searchParams.inicio || inicio3Meses.toISOString().split("T")[0];
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
    new Set((vehiclesKpi || []).map((v: { placa: string }) => String(v.placa || "").trim()).filter(Boolean))
  );

  const kpiData = await getKPIData(
    fechaInicio,
    fechaFin,
    { centroId: tcoCentroId, tipo: tcoTipo, placaFragment: tcoPlaca },
    dispCentroId
  );

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
        />
      </Suspense>
    </div>
  );
}
