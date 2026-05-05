import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import Link from "next/link";

async function getVehicles() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .order("placa");

    return data || [];
  } catch {
    return [];
  }
}

export default async function VehiculosPage() {
  const vehicles = await getVehicles();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Vehículos</h1>
        <p className="mt-2 text-muted-foreground">Gestión de la flota de ambulancias</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vehículos</CardTitle>
          <CardDescription>
            Todos los vehículos registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Línea</TableHead>
                <TableHead>Centro Operativo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Vencimiento SOAT</TableHead>
                <TableHead>Vencimiento RTM</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.placa}</TableCell>
                  <TableCell>{vehicle.modelo || "N/A"}</TableCell>
                  <TableCell>{vehicle.linea || "N/A"}</TableCell>
                  <TableCell>{vehicle.centro_operativo}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        vehicle.estado_actual === "OPERATIVO"
                          ? "success"
                          : "destructive"
                      }
                    >
                      {vehicle.estado_actual}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {vehicle.vencimiento_soat
                      ? formatDateShort(vehicle.vencimiento_soat)
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {vehicle.vencimiento_rtm
                      ? formatDateShort(vehicle.vencimiento_rtm)
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/vehiculos/${vehicle.id}`}>
                      <span className="cursor-pointer text-primary hover:underline">
                        Ver Detalle
                      </span>
                    </Link>
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
