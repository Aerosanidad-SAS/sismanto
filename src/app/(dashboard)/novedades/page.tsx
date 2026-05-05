import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import Link from "next/link";

async function getNovedades() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("incidents")
      .select(`
        *,
        vehicles!inner(placa, centro_operativo)
      `)
      .order("fecha_reporte", { ascending: false });

    return data || [];
  } catch {
    return [];
  }
}

function getSeverityBadgeVariant(severidad: string) {
  switch (severidad) {
    case "ALTA":
      return "destructive";
    case "MEDIA":
      return "default";
    case "BAJA":
      return "secondary";
    default:
      return "outline";
  }
}

function getStatusBadgeVariant(estado: string) {
  switch (estado) {
    case "CERRADO":
      return "success";
    case "EN_PROCESO":
      return "default";
    case "ABIERTO":
      return "destructive";
    default:
      return "outline";
  }
}

export default async function NovedadesPage() {
  const novedades = await getNovedades();

  const abiertas = novedades.filter((n: any) => n.estado === "ABIERTO");
  const enProceso = novedades.filter((n: any) => n.estado === "EN_PROCESO");
  const cerradas = novedades.filter((n: any) => n.estado === "CERRADO");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Novedades e Incidentes</h1>
        <p className="mt-2 text-muted-foreground">
          Gestión de reportes de novedades y incidentes de la flota
        </p>
      </div>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Abiertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{abiertas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{enProceso.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cerradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{cerradas.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Novedades</CardTitle>
          <CardDescription>
            Todas las novedades e incidentes reportados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha Reporte</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Reportado Por</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Afecta Operatividad</TableHead>
                <TableHead>Fecha Cierre</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {novedades.map((novedad: any) => (
                <TableRow key={novedad.id}>
                  <TableCell>{formatDateShort(novedad.fecha_reporte)}</TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/vehiculos/${novedad.vehicle_id}`}
                      className="text-primary hover:underline"
                    >
                      {novedad.vehicles?.placa}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate">{novedad.descripcion}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityBadgeVariant(novedad.severidad)}>
                      {novedad.severidad}
                    </Badge>
                  </TableCell>
                  <TableCell>{novedad.reportado_por}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(novedad.estado)}>
                      {novedad.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {novedad.afecta_operatividad ? (
                      <Badge variant="destructive">Sí</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {novedad.fecha_cierre
                      ? formatDateShort(novedad.fecha_cierre)
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
