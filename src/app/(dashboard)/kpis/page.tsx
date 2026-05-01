import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPIDashboard } from "@/components/charts/kpi-dashboard";
import { formatCurrency } from "@/lib/utils";

async function getKPIData(fechaInicio: string, fechaFin: string) {
  try {
    const supabase = createClient();

    // KPI 1: Tasa de Disponibilidad (Uptime)
    const { data: vehicles } = await supabase.from("vehicles").select("id, placa");

    const horasTotales =
    (new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) /
    (1000 * 60 * 60);

    const { data: incidents } = await supabase
    .from("incidents")
    .select("vehicle_id, fecha_reporte, fecha_cierre, afecta_operatividad")
    .eq("afecta_operatividad", true)
    .gte("fecha_reporte", fechaInicio)
    .lte("fecha_reporte", fechaFin);

    const uptimeData =
    vehicles?.map((v) => {
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
        vehicleId: (v as any).id,
        placa: (v as any).placa,
        horasTotales,
        horasFueraServicio: horasFuera,
        porcentajeDisponibilidad: Math.max(0, porcentaje),
        cumpleMeta: Math.max(0, porcentaje) >= 95,
      };
    }) || [];

    // KPI 2: TCO (Total Cost of Ownership)
    const { data: mantenimientos } = await supabase
    .from("maintenance_records")
    .select(`
      tipo,
      valor,
      vehicles!inner(placa, centro_operativo)
    `)
    .gte("fecha", fechaInicio)
    .lte("fecha", fechaFin);

    const tcoData: Record<string, any> = {};
    mantenimientos?.forEach((m: any) => {
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

    // KPI 3: Ratio Preventivo/Correctivo
    const totalPreventivo = mantenimientos?.reduce(
      (sum, m: any) => sum + (m.tipo === "PREVENTIVO" ? m.valor || 0 : 0),
      0
    ) || 0;
    const totalCorrectivo = mantenimientos?.reduce(
      (sum, m: any) => sum + (m.tipo === "CORRECTIVO" ? m.valor || 0 : 0),
      0
    ) || 0;
    const cantidadPreventivo =
      mantenimientos?.filter((m: any) => m.tipo === "PREVENTIVO").length || 0;
    const cantidadCorrectivo =
      mantenimientos?.filter((m: any) => m.tipo === "CORRECTIVO").length || 0;

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
  searchParams: { inicio?: string; fin?: string };
}) {
  const hoy = new Date();
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const fechaInicio =
    searchParams.inicio || inicioMes.toISOString().split("T")[0];
  const fechaFin = searchParams.fin || hoy.toISOString().split("T")[0];

  const kpiData = await getKPIData(fechaInicio, fechaFin);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">KPIs y Métricas</h1>
        <p className="text-gray-600 mt-2">
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
        />
      </Suspense>
    </div>
  );
}
