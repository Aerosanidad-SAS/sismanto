import { hoyBogota } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateShort } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getCoordinacionData() {
  try {
    const supabase = createClient();
    const hoy = hoyBogota();

    const [{ data: vehicles }, { data: roles }] = await Promise.all([
      supabase.from("vehicles").select("id, placa, estado_actual, centro_operativo"),
      supabase.from("roles").select("id, codigo"),
    ]);

    const roleById = new Map((roles || []).map((r) => [r.id, r.codigo]));
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

    const totalVehiculos = (vehicles || []).length;
    const operativos = (vehicles || []).filter((v) => v.estado_actual === "OPERATIVO").length;
    const fds = totalVehiculos - operativos;

    return {
      totalVehiculos,
      operativos,
      fds,
      ovemActivos: ovemUsers.length,
      asignacionesActivas: rowsAsignacion.length,
      incidentesAbiertos: incidentes || [],
      asignaciones: rowsAsignacion,
      alerts: alerts || [],
      centros: Array.from(new Set((vehicles || []).map((v) => v.centro_operativo))).sort(),
    };
  } catch {
    return {
      totalVehiculos: 0,
      operativos: 0,
      fds: 0,
      ovemActivos: 0,
      asignacionesActivas: 0,
      incidentesAbiertos: [] as any[],
      asignaciones: [] as any[],
      alerts: [] as any[],
      centros: [] as string[],
    };
  }
}

export default async function CoordinacionPage() {
  const profile = await getProfile();
  if (!profile || !["ADMIN", "COORDINACION"].includes(profile.role_codigo)) {
    redirect("/");
  }

  const data = await getCoordinacionData();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl">Coordinación CRA</h1>
          <p className="mt-2 text-muted-foreground">
            Estado operativo, conductores OVEM activos, novedades y alertas de mantenimiento.
          </p>
        </div>
        <Link href="/capacitaciones" className="text-primary hover:underline text-sm">
          Ver capacitaciones y resultados
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Vehículos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data.totalVehiculos}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Operativos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">{data.operativos}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fuera de servicio</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">{data.fds}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">OVEM activos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data.ovemActivos}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Asignaciones activas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data.asignacionesActivas}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OVEM activos y vehículo asignado</CardTitle>
          <CardDescription>Asignaciones con rango vigente para hoy</CardDescription>
        </CardHeader>
        <CardContent>
          {data.asignaciones.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No hay asignaciones activas.</p>
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
                {data.asignaciones.map((a: any) => (
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
            {data.incidentesAbiertos.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Sin novedades activas.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-auto">
                {data.incidentesAbiertos.map((n: any) => (
                  <div key={n.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{n.vehicles?.placa || "N/A"}</p>
                      <Badge variant={n.estado === "EN_PROCESO" ? "default" : "destructive"}>
                        {n.estado}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">{n.descripcion}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reporte: {formatDateShort(n.fecha_reporte)}
                    </p>
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
            {data.alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Sin alertas preventivas activas.</p>
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
                  {data.alerts.map((a: any, i: number) => (
                    <TableRow key={`${a.placa}-${a.descripcion}-${i}`}>
                      <TableCell className="font-medium">{a.placa}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{a.descripcion}</p>
                      </TableCell>
                      <TableCell>{a.km_restantes ?? "N/A"}</TableCell>
                      <TableCell>{a.dias_restantes ?? "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={a.nivel_alerta === "ROJA" ? "destructive" : "secondary"}>
                          {a.nivel_alerta}
                        </Badge>
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
          {data.centros.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin centros.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.centros.map((c) => (
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
}
