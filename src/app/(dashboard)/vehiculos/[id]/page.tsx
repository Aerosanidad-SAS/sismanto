import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { listVehicleServiceRevenue } from "@/app/api/actions/service-revenue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateShort, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { VehicleServiceRevenuePanel } from "@/components/vehiculos/vehicle-service-revenue-panel";
import { VehicleKilometrajeForm } from "@/components/vehiculos/vehicle-kilometraje-form";
import { ElectricVehicleInsight } from "@/components/vehiculos/electric-vehicle-insight";
import { ELECTRIC_VEHICLE_PLACAS } from "@/lib/electric-reference";
import { VehicleEstadoBadge } from "@/components/vehiculos/vehicle-estado-badge";
import { puedeCambiarEstadoOperativoVehiculo } from "@/lib/auth-utils";
import { VehicleMaintenanceAlertsPanel } from "@/components/vehiculos/vehicle-maintenance-alerts-panel";
import { getAlertsForVehicle } from "@/app/api/actions/plan-mantenimiento";
import { VehicleSpecsEditor } from "@/components/vehiculos/vehicle-specs-editor";
import { VehicleGeneralEditor } from "@/components/vehiculos/vehicle-general-editor";
import { VehicleCostosAnuales } from "@/components/vehiculos/vehicle-costos-anuales";
import { listarCostosAnuales } from "@/app/api/actions/costos-anuales";
import { ROLES_EDITAN_COSTOS_ANUALES } from "@/lib/costos-anuales";

async function getVehicle(id: string) {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single();

    return data;
  } catch {
    return null;
  }
}

async function getVehicleMaintenances(vehicleId: string) {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("maintenance_records")
      .select(`
      *,
      maintenance_categories(nombre)
    `)
      .eq("vehicle_id", vehicleId)
      .order("fecha", { ascending: false })
      .limit(20);

    return data || [];
  } catch {
    return [];
  }
}

async function getVehicleIncidents(vehicleId: string) {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("incidents")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("fecha_reporte", { ascending: false })
      .limit(20);

    return data || [];
  } catch {
    return [];
  }
}

async function getVehicleMileage(vehicleId: string) {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("mileage_logs")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("fecha", { ascending: false })
      .limit(10);

    return data || [];
  } catch {
    return [];
  }
}

async function getCentrosOperativos() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("operational_centers")
      .select("id, nombre")
      .eq("activo", true)
      .order("nombre");
    return data || [];
  } catch {
    return [];
  }
}

export default async function VehicleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const vehicle = await getVehicle(params.id);

  if (!vehicle) {
    return (
      <div className="space-y-8">
        <Link href="/vehiculos" className="text-primary hover:underline">
          ← Volver a Vehículos
        </Link>
        <p className="text-muted-foreground mt-4">No se pudo cargar el vehículo</p>
      </div>
    );
  }

  const [mantenimientos, incidentes, kilometrajes, profile, maintenanceAlerts, centrosOperativos] =
    await Promise.all([
      getVehicleMaintenances(params.id),
      getVehicleIncidents(params.id),
      getVehicleMileage(params.id),
      getProfile(),
      getAlertsForVehicle(params.id),
      getCentrosOperativos(),
    ]);

  const showRevenue =
    profile?.role_codigo === "ADMIN" || profile?.role_codigo === "GERENCIAL";

  const canRegistrarKm =
    profile?.role_codigo === "ADMIN" ||
    profile?.role_codigo === "REGULACION" ||
    profile?.role_codigo === "MANTENIMIENTO";

  const canLogMaintenance =
    profile?.role_codigo === "ADMIN" || profile?.role_codigo === "MANTENIMIENTO";

  const costosAnuales = await listarCostosAnuales(params.id);
  const puedeEditarCostosAnuales = (ROLES_EDITAN_COSTOS_ANUALES as readonly string[]).includes(profile?.role_codigo ?? "");

  const esElectricoFlota = ELECTRIC_VEHICLE_PLACAS.has(String(vehicle.placa || "").toUpperCase());

  const puedeToggleEstadoVehiculo = puedeCambiarEstadoOperativoVehiculo(profile?.role_codigo);

  let revenueRows: any[] = [];
  let serviceTypeOptions: any[] = [];
  if (showRevenue) {
    const rev = await listVehicleServiceRevenue(params.id);
    revenueRows = rev.data || [];
    const supabase = createClient();
    const { data: types } = await supabase
      .from("service_types")
      .select("id, codigo, nombre")
      .eq("activo", true)
      .order("orden");
    serviceTypeOptions = types || [];
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/vehiculos" className="text-primary hover:underline">
          ← Volver a Vehículos
        </Link>
        <h1 className="mt-4 text-3xl">
          Vehículo: {vehicle.placa}
        </h1>
      </div>

      {/* Información General */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between space-y-0">
            <CardTitle className="text-lg">Información General</CardTitle>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <VehicleGeneralEditor
                vehicle={vehicle}
                centros={centrosOperativos}
                canEdit={
                  profile?.role_codigo === "ADMIN" ||
                  profile?.role_codigo === "REGULACION" ||
                  profile?.role_codigo === "MANTENIMIENTO"
                }
              />
              {canRegistrarKm ? <VehicleKilometrajeForm vehicleId={vehicle.id} placa={vehicle.placa} /> : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Placa:</span> {vehicle.placa}
            </div>
            <div>
              <span className="font-medium">Modelo:</span>{" "}
              {vehicle.modelo || "N/A"}
            </div>
            <div>
              <span className="font-medium">Línea:</span>{" "}
              {vehicle.linea || "N/A"}
            </div>
            <div>
              <span className="font-medium">Centro Operativo:</span>{" "}
              {vehicle.centro_operativo}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Estado:</span>{" "}
              <VehicleEstadoBadge
                vehicleId={vehicle.id}
                estado={vehicle.estado_actual}
                puedeEditar={puedeToggleEstadoVehiculo}
              />
              {puedeToggleEstadoVehiculo ? (
                <span className="text-[11px] text-muted-foreground">Clic en la etiqueta para alternar operativo / FDS.</span>
              ) : null}
            </div>
            <div>
              <span className="font-medium">Vencimiento SOAT:</span>{" "}
              {vehicle.vencimiento_soat
                ? formatDateShort(vehicle.vencimiento_soat)
                : "N/A"}
            </div>
            <div>
              <span className="font-medium">Vencimiento RTM:</span>{" "}
              {vehicle.vencimiento_rtm
                ? formatDateShort(vehicle.vencimiento_rtm)
                : "N/A"}
            </div>
            <div>
              <span className="font-medium">Vencimiento técnico-mecánica:</span>{" "}
              {vehicle.vencimiento_tecnicomecanica
                ? formatDateShort(vehicle.vencimiento_tecnicomecanica)
                : "N/A"}
            </div>
            <div>
              <span className="font-medium">Costo SOAT anual:</span>{" "}
              {vehicle.costo_soat_anual != null ? formatCurrency(vehicle.costo_soat_anual) : "N/A"}
            </div>
            <div>
              <span className="font-medium">Costo RTM anual:</span>{" "}
              {vehicle.costo_tecnomecanica_anual != null
                ? formatCurrency(vehicle.costo_tecnomecanica_anual)
                : "N/A"}
            </div>
            <div>
              <span className="font-medium">Costo póliza anual:</span>{" "}
              {vehicle.costo_poliza_anual != null ? formatCurrency(vehicle.costo_poliza_anual) : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Especificaciones</CardTitle>
            <VehicleSpecsEditor
              vehicle={vehicle}
              canEdit={
                profile?.role_codigo === "ADMIN" ||
                profile?.role_codigo === "REGULACION" ||
                profile?.role_codigo === "MANTENIMIENTO"
              }
            />
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Tipo de Llantas:</span>{" "}
              {vehicle.tipo_llantas || "N/A"}
            </div>
            <div>
              <span className="font-medium">Aceite de motor:</span>{" "}
              {vehicle.aceite_usado || "N/A"}
            </div>
            <div>
              <span className="font-medium">Filtro Aceite:</span>{" "}
              {vehicle.ref_filtro_aceite || "N/A"}
            </div>
            <div>
              <span className="font-medium">Filtro Aire:</span>{" "}
              {vehicle.ref_filtro_aire_motor || "N/A"}
            </div>
            <div className="space-y-1">
              <span className="font-medium">Bombillería</span>
              <div className="space-y-1 pl-4 text-sm">
                <p><span className="text-muted-foreground">Farolas:</span> {vehicle.bombilleria_farolas || "N/A"}</p>
                <p><span className="text-muted-foreground">Stops:</span> {vehicle.bombilleria_stops || "N/A"}</p>
                <p><span className="text-muted-foreground">Direccionales:</span> {vehicle.bombilleria_direccionales || "N/A"}</p>
              </div>
            </div>
            <div>
              <span className="font-medium">Refrigerante:</span>{" "}
              {vehicle.tipo_refrigerante || "N/A"}
            </div>
            <div className="space-y-1">
              <span className="font-medium">Batería</span>
              <div className="space-y-1 pl-4 text-sm">
                <p><span className="text-muted-foreground">Ppal:</span> {vehicle.bateria_principal || "N/A"}</p>
                <p><span className="text-muted-foreground">Aux:</span> {vehicle.bateria_auxiliar || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {esElectricoFlota && <ElectricVehicleInsight />}

      <Card>
        <CardHeader>
          <CardTitle>Costos anuales: SOAT, póliza y RTM</CardTitle>
          <CardDescription>
            Cada pago con su vigencia. El costo se reparte por día y alimenta los costos del dashboard y los KPIs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleCostosAnuales
            vehicleId={params.id}
            filas={costosAnuales}
            puedeEditar={puedeEditarCostosAnuales}
            puedeEliminar={profile?.role_codigo === "ADMIN"}
          />
        </CardContent>
      </Card>

      {showRevenue && (
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por prestación de servicios</CardTitle>
            <CardDescription>
              Valores por tipo de servicio (TAB, TAM, MD…) y mes, para cruces con facturación e indicador B/C.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VehicleServiceRevenuePanel
              vehicleId={params.id}
              serviceTypes={serviceTypeOptions}
              initialRows={revenueRows}
              canEdit={profile?.role_codigo === "ADMIN"}
            />
          </CardContent>
        </Card>
      )}

      {/* Último Kilometraje */}
      {kilometrajes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Último Kilometraje Registrado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kilometrajes[0].lectura_kilometraje.toLocaleString()} km
            </div>
            <p className="text-sm text-muted-foreground">
              Fecha: {formatDateShort(kilometrajes[0].fecha)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Plan de Mantenimiento Preventivo */}
      <VehicleMaintenanceAlertsPanel
        vehicleId={vehicle.id}
        placa={vehicle.placa}
        alerts={maintenanceAlerts}
        canLog={canLogMaintenance}
      />

      {/* Mantenimientos Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Mantenimientos Recientes</CardTitle>
          <CardDescription>
            Últimos mantenimientos realizados a este vehículo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Kilometraje</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mantenimientos.map((m: any) => (
                <TableRow key={m.id_manto}>
                  <TableCell>{formatDateShort(m.fecha)}</TableCell>
                  <TableCell>
                    {m.maintenance_categories?.nombre || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={m.tipo === "PREVENTIVO" ? "default" : "secondary"}
                    >
                      {m.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{m.kilometraje_actual.toLocaleString()} km</TableCell>
                  <TableCell>
                    {m.valor ? formatCurrency(m.valor) : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Incidentes Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Novedades e Incidentes</CardTitle>
          <CardDescription>
            Historial de novedades reportadas para este vehículo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha Reporte</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Clasif.</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Cierre</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidentes.map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell>{formatDateShort(inc.fecha_reporte)}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate">{inc.descripcion}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inc.severidad === "ALTA"
                          ? "destructive"
                          : inc.severidad === "MEDIA"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {inc.severidad}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(inc as any).prioridad ? (
                      <Badge variant="outline">{(inc as any).prioridad}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inc.estado === "CERRADO"
                          ? "success"
                          : inc.estado === "EN_PROCESO"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {inc.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {inc.fecha_cierre
                      ? formatDateShort(inc.fecha_cierre)
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
