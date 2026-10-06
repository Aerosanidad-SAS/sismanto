import { diasEntre, esDia, hoyBogota, primerDiaDelMes, sumarDias } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard, KpiCaption, KpiValue } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { getProfile } from "@/app/api/actions/auth";
import { CostoPorVehiculoCard } from "@/components/dashboard/costo-por-vehiculo-card";
import { DisponibilidadCard } from "@/components/dashboard/disponibilidad-card";
import { ResolucionNovedadesCard } from "@/components/dashboard/resolucion-novedades-card";
import { DashboardTabs, type DashboardTabDef } from "@/components/dashboard/dashboard-tabs";
import {
  getCostosPorVehiculo,
  getDisponibilidadPorVehiculo,
  getResolucionNovedades,
} from "@/app/api/actions/dashboard-metrics";
import { getEstadisticasServiciosPorCiudad, getResumenOperativoDiario } from "@/app/api/actions/estadisticas-servicios";
import { getAlertasBiomedicos } from "@/app/api/actions/inventario-biomedico";
import { ResumenOperativo } from "@/components/gerencial/resumen-operativo";
import { ServiciosPorCiudadChart } from "@/components/gerencial/gerencial-charts";
import { FiltroCiudadUrl } from "@/components/servicios/filtro-ciudad";
import { prefijoCiudad } from "@/lib/servicios-lista";
import { Activity, Ambulance, AlertTriangle, DollarSign, Truck } from "lucide-react";
import { HelpTrigger } from "@/components/ui/help-trigger";
import { puedeCambiarEstadoOperativoVehiculo } from "@/lib/auth-utils";
import { type NovedadAbiertaResumen } from "@/components/dashboard/estado-flota-detalle";
import { DashboardGlobalFiltros } from "@/components/dashboard/dashboard-global-filters";
import { getUsuariosPorRol } from "@/app/api/actions/regulacion";
import { isReferenceSparkCombustionPlaca } from "@/lib/fleet-reference-plates";
import { ProximosVencimientosModal } from "@/components/dashboard/proximos-vencimientos-modal";
import { EstadoFlotaTablaPaginada } from "@/components/dashboard/estado-flota-tabla-paginada";
import { puedeVerPestanaDashboard } from "@/lib/dashboard-tabs";
import { CoordinacionInicio } from "@/components/dashboard/coordinacion-inicio";
import { SolicitudesNoApto } from "@/components/regulacion/solicitudes-no-apto";
import { getSolicitudesNoAptoPendientes } from "@/app/api/actions/solicitudes-no-apto";
import { ciudadDelCentro, getFlotaDelDia } from "@/app/api/actions/coordinacion";
import { getPreoperacionalHoy } from "@/app/api/actions/preoperacional-pendiente";
import { getCierresDeTurnoHoy } from "@/app/api/actions/cierre-turno";
import Link from "next/link";


export const metadata = { title: "Inicio" };

const DEFAULT_DATA = {
  totalOperativos: 0,
  totalFueraServicio: 0,
  costoMesActual: 0,
  novedadesAbiertas: 0,
  proximosVencimientos: 0,
  vencimientosSoat: [] as { placa: string; fecha: string; diasRestantes: number }[],
  vencimientosTecnicomecanica: [] as { placa: string; fecha: string; diasRestantes: number }[],
  vencimientosPolizas: [] as { placa: string; costoPolizaAnual: number }[],
  vehicles: [] as any[],
  ultimoMantenimientoPorVehicleId: {} as Record<string, string>,
  novedadesAbiertasPorVehicleId: {} as Record<string, NovedadAbiertaResumen[]>,
};

// "2026-01-15" → "15 ene 2026"
const MESES_CORTOS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"] as const;
const formatFechaCortaPeriodo = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MESES_CORTOS[m - 1]} ${y}`;
};

const getDiffDays = (targetIso: string, fromIso: string): number =>
  esDia(targetIso) && esDia(fromIso) ? Math.max(0, diasEntre(fromIso, targetIso)) : 0;

async function getDashboardData() {
  try {
    const supabase = createClient();
    const { data: vehiclesRaw = [] } = await supabase.from("vehicles").select("*");
    const vehicles = (vehiclesRaw ?? []).filter((v: any) => !isReferenceSparkCombustionPlaca(v.placa));
    const vehicleIds = new Set(vehicles.map((v: any) => v.id));
    const vehicleIdList = Array.from(vehicleIds);

    const totalOperativos = vehicles.filter((v: any) => v.estado_actual === "OPERATIVO").length;
    const totalFueraServicio = vehicles.filter((v: any) => v.estado_actual === "FUERA_DE_SERVICIO").length;

    const hoyDia = hoyBogota();
    const limiteBogota = sumarDias(hoyDia, 30);
    const inicioMesBogota = primerDiaDelMes(hoyDia);

    const isInNext30Days = (dateIso: string | null | undefined): dateIso is string => {
      if (!dateIso) return false;
      return dateIso >= hoyDia && dateIso <= limiteBogota;
    };

    const mantenimientosMes = vehicleIdList.length
      ? (
          await supabase
            .from("maintenance_records")
            .select("valor, vehicle_id")
            .in("vehicle_id", vehicleIdList)
            .gte("fecha", inicioMesBogota)
        ).data ?? []
      : [];

    const costoMesActual = (mantenimientosMes ?? []).reduce(
      (sum: number, m: any) => sum + (m.valor || 0),
      0
    );

    const vencimientosSoat = vehicles
      .flatMap((v: any) =>
        isInNext30Days(v.vencimiento_soat)
          ? [
              {
                placa: String(v.placa || ""),
                fecha: v.vencimiento_soat,
                diasRestantes: getDiffDays(v.vencimiento_soat, hoyDia),
              },
            ]
          : []
      )
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.placa.localeCompare(b.placa));

    const vencimientosTecnicomecanica = vehicles
      .flatMap((v: any) => {
        const fecha = v.vencimiento_tecnicomecanica || v.vencimiento_rtm;
        if (!isInNext30Days(fecha)) return [];
        return [
          {
            placa: String(v.placa || ""),
            fecha,
            diasRestantes: getDiffDays(fecha, hoyDia),
          },
        ];
      })
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.placa.localeCompare(b.placa));

    const vencimientosPolizas = vehicles
      .flatMap((v: any) =>
        typeof v.costo_poliza_anual === "number"
          ? [
              {
                placa: String(v.placa || ""),
                costoPolizaAnual: v.costo_poliza_anual,
              },
            ]
          : []
      )
      .sort((a, b) => a.placa.localeCompare(b.placa));

    const placasConVencimiento = new Set([
      ...vencimientosSoat.map((v) => v.placa),
      ...vencimientosTecnicomecanica.map((v) => v.placa),
    ]);
    const proximosVencimientos = placasConVencimiento.size;

    const ultimosMantenimientos = vehicleIdList.length
      ? (
          await supabase
            .from("maintenance_records")
            .select("fecha, vehicle_id")
            .in("vehicle_id", vehicleIdList)
            .order("fecha", { ascending: false })
        ).data ?? []
      : [];

    const ultimoMantenimientoPorVehicleId: Record<string, string> = {};
    (ultimosMantenimientos ?? []).forEach((m: any) => {
      if (!ultimoMantenimientoPorVehicleId[m.vehicle_id]) {
        ultimoMantenimientoPorVehicleId[m.vehicle_id] = m.fecha;
      }
    });

    const incAbiertos = vehicleIdList.length
      ? (
          await supabase
            .from("incidents")
            .select("id, vehicle_id, descripcion, fecha_reporte, estado")
            .in("estado", ["ABIERTO", "EN_PROCESO"])
            .in("vehicle_id", vehicleIdList)
            .order("fecha_reporte", { ascending: false })
        ).data ?? []
      : [];
    const novedadesAbiertas = incAbiertos.filter((inc: any) => inc.estado === "ABIERTO").length;

    const novedadesAbiertasPorVehicleId: Record<string, NovedadAbiertaResumen[]> = {};
    for (const inc of incAbiertos as any[]) {
      const vid = inc.vehicle_id;
      if (!novedadesAbiertasPorVehicleId[vid]) novedadesAbiertasPorVehicleId[vid] = [];
      novedadesAbiertasPorVehicleId[vid].push({
        id: inc.id,
        descripcion: inc.descripcion,
        fecha_reporte: inc.fecha_reporte,
        estado: inc.estado,
      });
    }

    return {
      totalOperativos,
      totalFueraServicio,
      costoMesActual,
      novedadesAbiertas,
      proximosVencimientos,
      vencimientosSoat,
      vencimientosTecnicomecanica,
      vencimientosPolizas,
      vehicles,
      ultimoMantenimientoPorVehicleId,
      novedadesAbiertasPorVehicleId,
    };
  } catch {
    return DEFAULT_DATA;
  }
}

// Fusionado desde la antigua página de Coordinación (ver PR de retabulación): estado operativo, conductores
// OVEM activos, novedades y alertas de mantenimiento — lo que antes solo veía el rol COORDINACION en /coordinacion
// vive ahora dentro de la pestaña "Vehículos y Operación" de Dashboard, visible a todos los roles que la ven.
async function getCoordinacionSectionData() {
  try {
    const supabase = createClient();
    const hoy = hoyBogota();

    const [{ data: vehicles }, { data: roles }] = await Promise.all([
      supabase.from("vehicles").select("id, placa, estado_actual, centro_operativo"),
      supabase.from("roles").select("id, codigo"),
    ]);

    const ovemRoleIds = (roles || []).filter((r) => r.codigo === "OVEM").map((r) => r.id);

    const [{ data: users }, { data: assignments }, { data: incidentes }, { data: alerts }] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("user_id, nombre_completo, email, role_id, activo")
        .eq("activo", true),
      supabase
        .from("vehicle_assignments")
        .select("id, user_id, vehicle_id, fecha_inicio, fecha_fin, activo, vehicles(placa, estado_actual)")
        .eq("activo", true)
        .or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`)
        .order("fecha_inicio", { ascending: false }),
      supabase
        .from("incidents")
        .select("id, fecha_reporte, descripcion, estado, vehicle_id, vehicles(placa)")
        .in("estado", ["ABIERTO", "EN_PROCESO"])
        .order("fecha_reporte", { ascending: false })
        .limit(20),
      supabase
        .from("vehicle_maintenance_alerts")
        .select("placa, descripcion, categoria, km_restantes, dias_restantes, nivel_alerta")
        .in("nivel_alerta", ["ROJA", "NARANJA"])
        .limit(20),
    ]);

    const ovemUsers = (users || []).filter((u) => ovemRoleIds.includes(u.role_id));
    const usersById = new Map(ovemUsers.map((u) => [u.user_id, u]));

    const rowsAsignacion = (assignments || []).map((a: any) => ({
      id: a.id,
      user: usersById.get(a.user_id),
      placa: a.vehicles?.placa || "N/A",
      estadoVehiculo: a.vehicles?.estado_actual || "N/A",
      inicio: a.fecha_inicio,
      fin: a.fecha_fin,
    }));

    return {
      ovemActivos: ovemUsers.length,
      asignacionesActivas: rowsAsignacion.length,
      incidentesAbiertos: incidentes || [],
      asignaciones: rowsAsignacion,
      alerts: alerts || [],
      centros: Array.from(new Set((vehicles || []).map((v) => v.centro_operativo))).sort(),
    };
  } catch {
    return {
      ovemActivos: 0,
      asignacionesActivas: 0,
      incidentesAbiertos: [] as any[],
      asignaciones: [] as any[],
      alerts: [] as any[],
      centros: [] as string[],
    };
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: {
    inicio?: string;
    fin?: string;
    tipoCosto?: string;
    costoCentro?: string;
    costoPlacas?: string;
    costoBusqueda?: string;
    dispInicio?: string;
    dispFin?: string;
    dispCentro?: string;
    gInicio?: string;
    gFin?: string;
    gCentro?: string;
    ciudad?: string;
  };
}) {
  // COORDINACION tiene su propio inicio (resumen de servicios de su CRA, flota del día, informes): no carga
  // costos, disponibilidad ni biomédicos del tablero ejecutivo.
  if ((await getProfile())?.role_codigo === "COORDINACION") {
    const hoy = hoyBogota();
    const [resumen, flota, ciudadCentro, preoperacional, solicitudesNoApto, cierresTurno] = await Promise.all([
      getResumenOperativoDiario({ desde: hoy, hasta: hoy }),
      getFlotaDelDia(),
      ciudadDelCentro(),
      getPreoperacionalHoy(),
      getSolicitudesNoAptoPendientes(),
      getCierresDeTurnoHoy(),
    ]);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl">Coordinación</h1>
          <p className="mt-2 text-muted-foreground">Operación del día de tu CRA</p>
        </div>
        <SolicitudesNoApto solicitudes={solicitudesNoApto} puedeResolver />
        <CoordinacionInicio resumen={resumen} ciudad={ciudadCentro} flota={flota} preoperacional={preoperacional} cierresTurno={cierresTurno} />
      </div>
    );
  }

  const defaultInicio = "2024-01-01"; // inicio del historial real de combustible y mantenimientos
  const defaultFin = hoyBogota();

  const parseDashDate = (s?: string): string | null => {
    const t = s?.trim();
    return esDia(t) ? t : null;
  };

  const gInicioOk = parseDashDate(searchParams.gInicio);
  const gFinOk = parseDashDate(searchParams.gFin);
  const globalPeriodoValido = Boolean(gInicioOk && gFinOk && gInicioOk <= gFinOk);

  let globalCentroId: number | undefined;
  if (globalPeriodoValido && searchParams.gCentro?.trim()) {
    const n = parseInt(searchParams.gCentro, 10);
    if (!Number.isNaN(n) && n > 0) globalCentroId = n;
  }

  const fechaInicio = globalPeriodoValido
    ? gInicioOk!
    : searchParams.inicio || defaultInicio;
  const fechaFin = globalPeriodoValido ? gFinOk! : searchParams.fin || defaultFin;
  const tipoCosto = (searchParams.tipoCosto as "AMBOS" | "PREVENTIVO" | "CORRECTIVO") || "AMBOS";

  const costoCentroId = searchParams.costoCentro ? parseInt(searchParams.costoCentro, 10) : undefined;
  const centroValidoCostoCard =
    costoCentroId != null && !Number.isNaN(costoCentroId) ? costoCentroId : undefined;
  const centroValidoCosto = globalPeriodoValido ? globalCentroId : centroValidoCostoCard;

  const dispCentroParsed = searchParams.dispCentro ? parseInt(searchParams.dispCentro, 10) : undefined;
  const centroValidDispCard =
    dispCentroParsed != null && !Number.isNaN(dispCentroParsed) ? dispCentroParsed : undefined;
  const centroValidDisp = globalPeriodoValido ? globalCentroId : centroValidDispCard;

  const fechaDispInicio = globalPeriodoValido
    ? gInicioOk!
    : searchParams.dispInicio?.trim() || fechaInicio;
  const fechaDispFin = globalPeriodoValido
    ? gFinOk!
    : searchParams.dispFin?.trim() || fechaFin;

  const ciudad = prefijoCiudad(searchParams.ciudad) ? (searchParams.ciudad as string) : "";

  const supabaseLite = createClient();
  const { data: centrosRaw } = await supabaseLite
    .from("operational_centers")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  const centrosOp = centrosRaw ?? [];

  const opcionesCosto = globalPeriodoValido
    ? {
        centroOperativoId: globalCentroId,
        placasCsv: undefined as string | undefined,
        textoTrabajo: undefined as string | undefined,
      }
    : {
        centroOperativoId: centroValidoCosto,
        placasCsv: searchParams.costoPlacas,
        textoTrabajo: searchParams.costoBusqueda,
      };

  const [profile, data, costos, disponibilidad, resoluciones, coordinacion] = await Promise.all([
    getProfile(),
    Promise.race([
      getDashboardData(),
      new Promise<typeof DEFAULT_DATA>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8000)
      ),
    ]).catch(() => DEFAULT_DATA),
    getCostosPorVehiculo(fechaInicio, fechaFin, tipoCosto, opcionesCosto),
    getDisponibilidadPorVehiculo(fechaDispInicio, fechaDispFin, centroValidDisp),
    getResolucionNovedades(fechaInicio, fechaFin),
    getCoordinacionSectionData(),
  ]);
  const role = profile?.role_codigo ?? "";
  const isReadOnly = role === "GERENCIAL";
  const hideFinanceKpis = role === "REGULACION" || role === "MANTENIMIENTO";
  const puedeToggleEstadoEnTabla = puedeCambiarEstadoOperativoVehiculo(profile?.role_codigo);
  const canAssignOvem = role === "ADMIN" || role === "REGULACION";

  const puedeVerServicios = puedeVerPestanaDashboard("servicios", role);
  const puedeVerBiomedicos = puedeVerPestanaDashboard("biomedicos", role);
  const puedeVerFinanciero = puedeVerPestanaDashboard("financiero", role) && !hideFinanceKpis;

  const hoyIso = hoyBogota();
  let ovemUsers: Awaited<ReturnType<typeof getUsuariosPorRol>> = [];
  const vehicleAssignmentMap: Record<string, { id: number; ovemName: string }> = {};

  const [, resumenServiciosHoy, estadisticasServiciosCiudad, biomedicos] = await Promise.all([
    (async () => {
      if (!canAssignOvem) return;
      const [ousers, assignments] = await Promise.all([
        getUsuariosPorRol("OVEM"),
        createClient()
          .from("vehicle_assignments")
          .select("id, vehicle_id, user_id, user_profiles(nombre_completo, email)")
          .eq("activo", true)
          .eq("rol_en_turno", "OVEM")
          .or(`fecha_fin.is.null,fecha_fin.gte.${hoyIso}`),
      ]);
      ovemUsers = ousers;
      for (const a of assignments.data ?? []) {
        const up = (a as any).user_profiles;
        vehicleAssignmentMap[a.vehicle_id] = {
          id: a.id,
          ovemName: up?.nombre_completo || up?.email || "OVEM",
        };
      }
    })(),
    puedeVerServicios ? getResumenOperativoDiario({ desde: hoyIso, hasta: hoyIso }) : Promise.resolve(null),
    puedeVerServicios ? getEstadisticasServiciosPorCiudad() : Promise.resolve(null),
    puedeVerBiomedicos ? getAlertasBiomedicos() : Promise.resolve(null),
  ]);

  const placasFueraServicio = (data.vehicles as { placa?: string; estado_actual?: string }[])
    .filter((v) => v.estado_actual === "FUERA_DE_SERVICIO")
    .map((v) => String(v.placa || "").trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const contenidoOperacion = (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch">
        <Card className="min-w-0 xl:w-[40%] xl:max-w-[40%]">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex min-w-0 items-center gap-2">
              <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
              <HelpTrigger text="Conteo de unidades en estado operativo frente a fuera de servicio (despacho). Las placas en rojo corresponden al FDS actual en inventario." />
            </div>
            <Truck className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-green-600/25 bg-green-500/10 px-3 py-2">
                <p className="text-[11px] font-medium uppercase text-muted-foreground">Operativos</p>
                <p className="text-xl font-bold text-green-800 dark:text-green-300">{data.totalOperativos}</p>
              </div>
              <div className="rounded-md border border-red-600/25 bg-red-500/10 px-3 py-2">
                <p className="text-[11px] font-medium uppercase text-muted-foreground">Fuera de servicio</p>
                <p className="text-xl font-bold text-red-800 dark:text-red-300">{data.totalFueraServicio}</p>
              </div>
            </div>
            {placasFueraServicio.length > 0 ? (
              <div className="mt-3 border-t pt-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Placas fuera de servicio
                </p>
                <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto">
                  {placasFueraServicio.map((p) => (
                    <Badge key={p} variant="destructive" className="font-mono text-[10px]">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid min-w-0 flex-1 grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
          <KpiCard
            title="Novedades abiertas"
            icon={AlertTriangle}
            help={<HelpTrigger text="Incidencias en estado ABIERTO que aún no se cierran en el sistema." />}
          >
            <KpiValue>{data.novedadesAbiertas}</KpiValue>
            <KpiCaption>Requieren atención</KpiCaption>
          </KpiCard>

          <ProximosVencimientosModal
            total={data.proximosVencimientos}
            soat={data.vencimientosSoat}
            tecnicomecanica={data.vencimientosTecnicomecanica}
            polizas={data.vencimientosPolizas}
          />
        </div>
      </div>

      <DisponibilidadCard
        datos={disponibilidad}
        centros={centrosOp}
        fechaInicio={fechaDispInicio}
        fechaFin={fechaDispFin}
        centroIdFiltro={centroValidDisp}
        puedeToggleEstado={role === "ADMIN" || role === "REGULACION" || role === "MANTENIMIENTO"}
      />

      <ResolucionNovedadesCard novedades={resoluciones.novedades} resumen={resoluciones.resumen} />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Estado de flota</CardTitle>
            <HelpTrigger text="Listado de todas las unidades con estado administrativo, centro, fecha del último mantenimiento y acceso al detalle de novedades abiertas o en proceso." />
          </div>
        </CardHeader>
        <CardContent>
          {data.vehicles.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay vehículos registrados. Vaya a Configuración para crear el primero.
            </p>
          ) : (
            <EstadoFlotaTablaPaginada
              vehicles={data.vehicles}
              ultimoMantenimientoPorVehicleId={data.ultimoMantenimientoPorVehicleId}
              novedadesAbiertasPorVehicleId={data.novedadesAbiertasPorVehicleId}
              canAssignOvem={canAssignOvem}
              ovemUsers={ovemUsers}
              vehicleAssignmentMap={vehicleAssignmentMap}
              puedeToggleEstadoEnTabla={puedeToggleEstadoEnTabla}
              isReadOnly={isReadOnly}
            />
          )}
        </CardContent>
      </Card>

      {/* Fusionado desde Coordinación */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle>OVEM activos y vehículo asignado</CardTitle>
          <Link href="/capacitaciones" className="text-sm text-primary hover:underline">
            Ver capacitaciones y resultados
          </Link>
        </CardHeader>
        <CardContent>
          {coordinacion.asignaciones.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No hay asignaciones activas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OVEM</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Estado vehículo</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coordinacion.asignaciones.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.user?.nombre_completo || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground">{a.user?.email || "N/A"}</TableCell>
                    <TableCell className="font-medium">{a.placa}</TableCell>
                    <TableCell>
                      <Badge variant={a.estadoVehiculo === "OPERATIVO" ? "success" : "destructive"}>
                        {a.estadoVehiculo === "OPERATIVO" ? "OPERATIVO" : "FDS"}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.inicio ? formatDateShort(a.inicio) : "N/A"}</TableCell>
                    <TableCell>{a.fin ? formatDateShort(a.fin) : "Abierta"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Novedades reportadas (abiertas/en proceso)</CardTitle>
          </CardHeader>
          <CardContent>
            {coordinacion.incidentesAbiertos.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Sin novedades activas.</p>
            ) : (
              <div className="max-h-80 space-y-2 overflow-auto">
                {coordinacion.incidentesAbiertos.map((n: any) => (
                  <div key={n.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{n.vehicles?.placa || "N/A"}</p>
                      <Badge variant={n.estado === "EN_PROCESO" ? "default" : "destructive"}>{n.estado}</Badge>
                    </div>
                    <p className="mt-1 text-sm">{n.descripcion}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Reporte: {formatDateShort(n.fecha_reporte)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos mantenimientos preventivos (alertas)</CardTitle>
            <CardDescription>Tomado de plan preventivo (niveles roja/naranja)</CardDescription>
          </CardHeader>
          <CardContent>
            {coordinacion.alerts.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Sin alertas preventivas activas.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Tarea</TableHead>
                    <TableHead>Km rest.</TableHead>
                    <TableHead>Días rest.</TableHead>
                    <TableHead>Nivel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coordinacion.alerts.map((a: any, i: number) => (
                    <TableRow key={`${a.placa}-${a.descripcion}-${i}`}>
                      <TableCell className="font-medium">{a.placa}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{a.descripcion}</p>
                      </TableCell>
                      <TableCell>{a.km_restantes ?? "N/A"}</TableCell>
                      <TableCell>{a.dias_restantes ?? "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={a.nivel_alerta === "ROJA" ? "destructive" : "secondary"}>{a.nivel_alerta}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cobertura por centro</CardTitle>
        </CardHeader>
        <CardContent>
          {coordinacion.centros.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin centros.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {coordinacion.centros.map((c) => (
                <Badge key={c} variant="outline">
                  {c}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const contenidoServicios = resumenServiciosHoy && estadisticasServiciosCiudad && (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl">Servicios — Bogotá y Medellín</h2>
          <HelpTrigger text="Segmentado por ciudad de registro: la del CRA al que está asignado el usuario de Regulación que recibió la solicitud." />
        </div>
        <FiltroCiudadUrl />
      </div>
      <ResumenOperativo inicial={resumenServiciosHoy} ciudad={ciudad} />
      <ServiciosPorCiudadChart inicial={estadisticasServiciosCiudad} ciudad={ciudad} />
    </div>
  );

  const contenidoBiomedicos = biomedicos && (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Equipos activos</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{biomedicos.totalActivos}</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Vencidos / ≤15 días</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-red-600">{biomedicos.totalRojas}</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Vencen en ≤30 días</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-amber-600">{biomedicos.totalNaranjas}</CardContent>
      </Card>
    </div>
  );

  const contenidoFinanciero = (
    <div className="space-y-6">
      <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
        <KpiCard
          title="Costo"
          icon={DollarSign}
          help={<HelpTrigger text="Costo total de operación (mantenimiento + combustible + costos fijos prorrateados) para el período del filtro global." />}
        >
          <KpiValue>{formatCurrency(costos.reduce((sum, c) => sum + c.costoTotal, 0))}</KpiValue>
          <KpiCaption>
            {formatFechaCortaPeriodo(fechaInicio)} – {formatFechaCortaPeriodo(fechaFin)}
          </KpiCaption>
        </KpiCard>
      </div>
      <CostoPorVehiculoCard
        datos={costos}
        tipo={tipoCosto}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        centros={centrosOp}
        centroIdFiltro={centroValidoCosto}
        placasFiltro={globalPeriodoValido ? "" : searchParams.costoPlacas || ""}
        textoTrabajo={globalPeriodoValido ? "" : searchParams.costoBusqueda || ""}
      />
    </div>
  );

  const tabs: DashboardTabDef[] = [
    {
      key: "operacion",
      label: "Vehículos y Operación",
      icon: <Truck className="h-4 w-4" aria-hidden />,
      content: contenidoOperacion,
    },
    ...(puedeVerServicios && contenidoServicios
      ? [{ key: "servicios", label: "Servicios", icon: <Ambulance className="h-4 w-4" aria-hidden />, content: contenidoServicios }]
      : []),
    ...(puedeVerBiomedicos && contenidoBiomedicos
      ? [{ key: "biomedicos", label: "Biomédicos", icon: <Activity className="h-4 w-4" aria-hidden />, content: contenidoBiomedicos }]
      : []),
    ...(puedeVerFinanciero
      ? [{ key: "financiero", label: "Financiero", icon: <DollarSign className="h-4 w-4" aria-hidden />, content: contenidoFinanciero }]
      : []),
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Resumen ejecutivo de la flota de ambulancias</p>
        </div>
        <DashboardGlobalFiltros
          className="shrink-0 lg:max-w-[min(100%,36rem)]"
          centros={centrosOp}
          globalInicio={globalPeriodoValido ? gInicioOk : null}
          globalFin={globalPeriodoValido ? gFinOk : null}
          globalCentroId={globalPeriodoValido ? globalCentroId ?? null : null}
          fechaDefectoInicio={searchParams.inicio || defaultInicio}
          fechaDefectoFin={searchParams.fin || defaultFin}
          modoGlobalActivo={globalPeriodoValido}
        />
      </div>

      <DashboardTabs tabs={tabs} defaultTab="operacion" />
    </div>
  );
}
