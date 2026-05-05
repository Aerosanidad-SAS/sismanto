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
import { getCostosPorVehiculo, getDisponibilidadPorVehiculo, getResolucionNovedades } from "@/app/api/actions/dashboard-metrics";
import { AlertTriangle, Calendar, DollarSign, Truck } from "lucide-react";

const DEFAULT_DATA = {
  totalOperativos: 0,
  totalFueraServicio: 0,
  costoMesActual: 0,
  novedadesAbiertas: 0,
  proximosVencimientos: 0,
  vehicles: [] as any[],
  mantenimientosPorVehiculo: [] as any[],
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
      .select("id_manto, fecha, vehicle_id, vehicles!inner(placa, estado_actual, centro_operativo)")
      .order("fecha", { ascending: false });

    const map = new Map();
    (ultimosMantenimientos ?? []).forEach((m: any) => {
      if (!map.has(m.vehicle_id)) {
        map.set(m.vehicle_id, { vehicle: m.vehicles, ultimoMantenimiento: m.fecha });
      }
    });

    return {
      totalOperativos,
      totalFueraServicio,
      costoMesActual,
      novedadesAbiertas: novedadesAbiertas ?? 0,
      proximosVencimientos,
      vehicles: vehicles ?? [],
      mantenimientosPorVehiculo: Array.from(map.values()),
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { inicio?: string; fin?: string; tipoCosto?: string };
}) {
  const hoy = new Date();
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const fechaInicio = searchParams.inicio || inicioMes.toISOString().split("T")[0];
  const fechaFin = searchParams.fin || hoy.toISOString().split("T")[0];
  const tipoCosto = (searchParams.tipoCosto as "AMBOS" | "PREVENTIVO" | "CORRECTIVO") || "AMBOS";

  const [profile, data, costos, disponibilidad, resoluciones] = await Promise.all([
    getProfile(),
    Promise.race([
      getDashboardData(),
      new Promise<typeof DEFAULT_DATA>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8000)
      ),
    ]).catch(() => DEFAULT_DATA),
    getCostosPorVehiculo(fechaInicio, fechaFin, tipoCosto),
    getDisponibilidadPorVehiculo(fechaInicio, fechaFin),
    getResolucionNovedades(fechaInicio, fechaFin),
  ]);
  const isReadOnly = profile?.role_codigo === "GERENCIAL";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Resumen ejecutivo de la flota de ambulancias</p>
      </div>

      {/* KPIs resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos Operativos</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOperativos}</div>
            <p className="text-xs text-muted-foreground">{data.totalFueraServicio} fuera de servicio</p>
          </CardContent>
        </Card>

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
      <div className="grid gap-6 lg:grid-cols-2">
        <CostoPorVehiculoCard
          datos={costos}
          tipo={tipoCosto}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
        <DisponibilidadCard datos={disponibilidad} />
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
                      {data.mantenimientosPorVehiculo.find((m: any) => m.vehicle?.id === vehicle.id)
                        ?.ultimoMantenimiento
                        ? formatDateShort(
                            data.mantenimientosPorVehiculo.find((m: any) => m.vehicle?.id === vehicle.id)
                              .ultimoMantenimiento
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <VehicleStatusCard vehicle={vehicle} readOnly={isReadOnly} />
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
