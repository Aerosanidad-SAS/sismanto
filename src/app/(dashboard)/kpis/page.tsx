import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { KPIDashboard } from "@/components/charts/kpi-dashboard";
import { isReferenceSparkCombustionPlaca } from "@/lib/fleet-reference-plates";
import { getMetricasConsumo } from "@/app/api/actions/consumo";
import { requireRole } from "@/app/api/actions/auth";
import { costosPorVehiculo } from "@/lib/costos-vehiculo";
import { diasDelRango, esDia, hoyBogota, limitesInstante } from "@/lib/fechas";

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

    const horasTotales = diasDelRango(fechaInicio, fechaFin) * 24;
    // Las columnas de novedades son timestamptz: el último día del rango tiene que entrar completo (hora de Colombia).
    const lim = limitesInstante(fechaInicio, fechaFin);

    const { data: incidents } = await supabase
    .from("incidents")
    .select("vehicle_id, fecha_reporte, fecha_cierre, afecta_operatividad")
    .eq("afecta_operatividad", true)
    .gte("fecha_reporte", lim.desde)
    .lt("fecha_reporte", lim.hastaExclusivo);

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

    // KPI 2: CTO (Costo Total de Operación). Misma función SQL que el dashboard: una sola fuente de costos.
    const centroCosto = tcoFiltros?.centroId;
    const costos = await costosPorVehiculo(supabase, {
      desde: fechaInicio,
      hasta: fechaFin,
      tipo: tcoFiltros?.tipo,
      centroOperativoId: centroCosto != null && !Number.isNaN(centroCosto) ? centroCosto : undefined,
      placaFragmento: tcoFiltros?.placaFragment,
    });
    const tcoData = costos.map((c) => ({
      placa: c.placa,
      centroOperativo: c.centroOperativo,
      costoPreventivo: c.costoPreventivo,
      costoCorrectivo: c.costoCorrectivo,
      costoCombustible: c.costoCombustible,
      costoFijoAnual: c.costoFijoAnual,
      costoTotal: c.costoTotal,
      cantidadMantenimientos: c.cantidadMantenimientos,
    }));

    // KPI 3: Ratio Preventivo/Correctivo (del mismo subconjunto filtrado)
    const totalPreventivo = costos.reduce((s, c) => s + c.costoPreventivo, 0);
    const totalCorrectivo = costos.reduce((s, c) => s + c.costoCorrectivo, 0);
    const cantidadPreventivo = costos.reduce((s, c) => s + c.cantidadPreventivo, 0);
    const cantidadCorrectivo = costos.reduce((s, c) => s + c.cantidadCorrectivo, 0);

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
    .gte("fecha_reporte", lim.desde)
    .lt("fecha_reporte", lim.hastaExclusivo);

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
      tcoData,
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
  await requireRole(["ADMIN", "GERENCIAL", "ANALISTA"]);
  const hoy = hoyBogota();
  const fechaInicio = esDia(searchParams.inicio) ? searchParams.inicio : "2024-01-01";
  const fechaFin = esDia(searchParams.fin) && searchParams.fin >= fechaInicio ? searchParams.fin : hoy;

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
