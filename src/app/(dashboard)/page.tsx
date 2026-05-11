import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateShort, formatCurrency } from "@/lib/utils";
import { VehicleStatusCard } from "@/components/dashboard/vehicle-status-card";
import { getProfile } from "@/app/api/actions/auth";
import { CostoPorVehiculoCard } from "@/components/dashboard/costo-por-vehiculo-card";
import { DisponibilidadCard } from "@/components/dashboard/disponibilidad-card";
import { ResolucionNovedadesCard } from "@/components/dashboard/resolucion-novedades-card";
import {
  getCostosPorVehiculo,
  getDisponibilidadPorVehiculo,
  getResolucionNovedades,
} from "@/app/api/actions/dashboard-metrics";
import { AlertTriangle, Calendar, DollarSign, Truck } from "lucide-react";
import { EstadoFlotaDetalle, type NovedadAbiertaResumen } from "@/components/dashboard/estado-flota-detalle";
import { DashboardGlobalFiltros } from "@/components/dashboard/dashboard-global-filters";

const DEFAULT_DATA = {
  totalOperativos: 0,
  totalFueraServicio: 0,
  costoMesActual: 0,
  novedadesAbiertas: 0,
  proximosVencimientos: 0,
  vehicles: [] as any[],
  ultimoMantenimientoPorVehicleId: {} as Record<string, string>,
  novedadesAbiertasPorVehicleId: {} as Record<string, NovedadAbiertaResumen[]>,
};

async function getDashboardData() {
  try {
    const supabase = createClient();
    const { data: vehicles = [] } = await supabase.from("vehicles").select("*");

    const totalOperativos = (vehicles ?? []).filter((v: any) => v.estado_actual === "OPERATIVO").length;
    const totalFueraServicio = (vehicles ?? []).filter((v: any) => v.estado_actual === "FUERA_DE_SERVICIO").length;

    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const { data: mantenimientosMes = [] } = await supabase
      .from("maintenance_records")
      .select("valor")
      .gte("fecha", inicioMes.toISOString().split("T")[0]);

    const costoMesActual = (mantenimientosMes ?? []).reduce((sum: number, m: any) => sum + (m.valor || 0), 0);

    const { count: novedadesAbiertas } = await supabase
      .from("incidents")
      .select("*", { count: "exact", head: true })
      .eq("estado", "ABIERTO");

    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);

    const proximosVencimientos = (vehicles ?? []).filter((v: any) => {
      const vencSoat = v.vencimiento_soat ? new Date(v.vencimiento_soat) : null;
      const vencRtm = v.vencimiento_rtm ? new Date(v.vencimiento_rtm) : null;
      const vencTm = v.vencimiento_tecnicomecanica ? new Date(v.vencimiento_tecnicomecanica) : null;
      return (
        (vencSoat && vencSoat >= hoy && vencSoat <= en30Dias) ||
        (vencRtm && vencRtm >= hoy && vencRtm <= en30Dias) ||
        (vencTm && vencTm >= hoy && vencTm <= en30Dias)
      );
    }).length;

    const { data: ultimosMantenimientos = [] } = await supabase
      .from("maintenance_records")
      .select("fecha, vehicle_id")
      .order("fecha", { ascending: false });

    const ultimoMantenimientoPorVehicleId: Record<string, string> = {};
    (ultimosMantenimientos ?? []).forEach((m: any) => {
      if (!ultimoMantenimientoPorVehicleId[m.vehicle_id]) {
        ultimoMantenimientoPorVehicleId[m.vehicle_id] = m.fecha;
      }
    });

    const { data: incAbiertos = [] } = await supabase
      .from("incidents")
      .select("id, vehicle_id, descripcion, fecha_reporte, estado")
      .in("estado", ["ABIERTO", "EN_PROCESO"])
      .order("fecha_reporte", { ascending: false });

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
      novedadesAbiertas: novedadesAbiertas ?? 0,
      proximosVencimientos,
      vehicles: vehicles ?? [],
      ultimoMantenimientoPorVehicleId,
      novedadesAbiertasPorVehicleId,
    };
  } catch {
    return DEFAULT_DATA;
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
  };
}) {
  const hoy = new Date();
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const defaultInicio = inicioMes.toISOString().split("T")[0];
  const defaultFin = hoy.toISOString().split("T")[0];

  const parseDashDate = (s?: string): string | null => {
    const t = s?.trim();
    if (!t || Number.isNaN(Date.parse(t))) return null;
    return t;
  };

  const gInicioOk = parseDashDate(searchParams.gInicio);
  const gFinOk = parseDashDate(searchParams.gFin);
  const globalPeriodoValido = Boolean(
    gInicioOk &&
      gFinOk &&
      new Date(gInicioOk).getTime() <= new Date(gFinOk).getTime()
  );

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

  const [profile, data, costos, disponibilidad, resoluciones] = await Promise.all([
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
  ]);
  const isReadOnly = profile?.role_codigo === "GERENCIAL";
  const hideFinanceKpis =
    profile?.role_codigo === "REGULACION" || profile?.role_codigo === "MANTENIMIENTO";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Resumen ejecutivo de la flota de ambulancias</p>
      </div>

      <DashboardGlobalFiltros
        centros={centrosOp}
        globalInicio={globalPeriodoValido ? gInicioOk : null}
        globalFin={globalPeriodoValido ? gFinOk : null}
        globalCentroId={globalPeriodoValido ? globalCentroId ?? null : null}
        fechaDefectoInicio={searchParams.inicio || defaultInicio}
        fechaDefectoFin={searchParams.fin || defaultFin}
        modoGlobalActivo={globalPeriodoValido}
      />

      {/* KPIs resumen */}
      <div
        className={`grid gap-4 md:grid-cols-2 ${hideFinanceKpis ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border bg-green-500/10 border-green-600/25 px-3 py-2">
                <p className="text-[11px] font-medium uppercase text-muted-foreground">Operativos</p>
                <p className="text-xl font-bold text-green-800 dark:text-green-300">{data.totalOperativos}</p>
              </div>
              <div className="rounded-md border bg-red-500/10 border-red-600/25 px-3 py-2">
                <p className="text-[11px] font-medium uppercase text-muted-foreground">Fuera de servicio</p>
                <p className="text-xl font-bold text-red-800 dark:text-red-300">{data.totalFueraServicio}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!hideFinanceKpis && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Costo Mes Actual</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.costoMesActual)}</div>
              <p className="text-xs text-muted-foreground">En mantenimientos realizados</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novedades Abiertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.novedadesAbiertas}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Vencimientos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.proximosVencimientos}</div>
            <p className="text-xs text-muted-foreground">SOAT/Técnico-Mec. en 30 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas principales del período */}
      <div className={`grid gap-6 ${hideFinanceKpis ? "lg:grid-cols-1" : "lg:grid-cols-2"}`}>
        {!hideFinanceKpis && (
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
        )}
        <DisponibilidadCard
          datos={disponibilidad}
          centros={centrosOp}
          fechaInicio={fechaDispInicio}
          fechaFin={fechaDispFin}
          centroIdFiltro={centroValidDisp}
        />
      </div>

      {/* Resolución de novedades */}
      <ResolucionNovedadesCard
        novedades={resoluciones.novedades}
        resumen={resoluciones.resumen}
      />

      {/* Estado de Flota */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Flota</CardTitle>
        </CardHeader>
        <CardContent>
          {data.vehicles.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay vehículos registrados. Vaya a Configuración para crear el primero.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Centro Operativo</TableHead>
                  <TableHead>Último Mantenimiento</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.vehicles.map((vehicle: any) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.placa}</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.estado_actual === "OPERATIVO" ? "success" : "destructive"}>
                        {vehicle.estado_actual}
                      </Badge>
                    </TableCell>
                    <TableCell>{vehicle.centro_operativo}</TableCell>
                    <TableCell>
                      {data.ultimoMantenimientoPorVehicleId[vehicle.id]
                        ? formatDateShort(data.ultimoMantenimientoPorVehicleId[vehicle.id])
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <EstadoFlotaDetalle
                          placa={vehicle.placa}
                          ultimoMantenimientoFecha={data.ultimoMantenimientoPorVehicleId[vehicle.id] ?? null}
                          novedadesAbiertas={data.novedadesAbiertasPorVehicleId[vehicle.id] ?? []}
                        />
                        <VehicleStatusCard vehicle={vehicle} readOnly={isReadOnly} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
