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

  const [mantenimientos, incidentes, kilometrajes, profile] = await Promise.all([
    getVehicleMaintenances(params.id),
    getVehicleIncidents(params.id),
    getVehicleMileage(params.id),
    getProfile(),
  ]);

  const showRevenue =
    profile?.role_codigo === "ADMIN" || profile?.role_codigo === "GERENCIAL";

  const canRegistrarKm =
    profile?.role_codigo === "ADMIN" ||
    profile?.role_codigo === "REGULACION" ||
    profile?.role_codigo === "MANTENIMIENTO";

  const esElectricoFlota = ELECTRIC_VEHICLE_PLACAS.has(String(vehicle.placa || "").toUpperCase());

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
            {canRegistrarKm ? <VehicleKilometrajeForm vehicleId={vehicle.id} placa={vehicle.placa} /> : null}
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
            <div>
              <span className="font-medium">Estado:</span>{" "}
              <Badge
                variant={
                  vehicle.estado_actual === "OPERATIVO"
                    ? "success"
                    : "destructive"
                }
              >
                {vehicle.estado_actual}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
            {(vehicle.costo_soat_anual != null ||
              vehicle.costo_tecnomecanica_anual != null ||
              vehicle.costo_poliza_anual != null) && (
              <>
                <div>
                  <span className="font-medium">Costo anual SOAT:</span>{" "}
                  {vehicle.costo_soat_anual != null
                    ? formatCurrency(vehicle.costo_soat_anual)
                    : "—"}
                </div>
                <div>
                  <span className="font-medium">Costo anual técnico-mecánica:</span>{" "}
                  {vehicle.costo_tecnomecanica_anual != null
                    ? formatCurrency(vehicle.costo_tecnomecanica_anual)
                    : "—"}
                </div>
                <div>
                  <span className="font-medium">Costo anual póliza:</span>{" "}
                  {vehicle.costo_poliza_anual != null ? formatCurrency(vehicle.costo_poliza_anual) : "—"}
                </div>
              </>
            )}
            <div>
              <span className="font-medium">Tipo de Llantas:</span>{" "}
              {vehicle.tipo_llantas || "N/A"}
            </div>
            <div>
              <span className="font-medium">Combustible:</span>{" "}
              {vehicle.combustible || "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {esElectricoFlota && <ElectricVehicleInsight />}

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
