import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateShort, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";

async function getMantenimientos() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("maintenance_records")
      .select(`
        *,
        vehicles!inner(placa),
        maintenance_categories(nombre)
      `)
      .order("fecha", { ascending: false })
      .limit(100);

    return data || [];
  } catch {
    return [];
  }
}

export default async function MantenimientosPage() {
  const mantenimientos = await getMantenimientos();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mantenimientos</h1>
          <p className="text-gray-600 mt-2">
            Historial completo de mantenimientos realizados
          </p>
        </div>
        <Link href="/mantenimientos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Mantenimiento
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Mantenimientos</CardTitle>
          <CardDescription>
            Lista de todos los mantenimientos registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Kilometraje</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Factura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mantenimientos.map((m: any) => (
                <TableRow key={m.id_manto}>
                  <TableCell>{formatDateShort(m.fecha)}</TableCell>
                  <TableCell className="font-medium">{m.vehicles?.placa}</TableCell>
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
                  <TableCell>{m.proveedor || "N/A"}</TableCell>
                  <TableCell>
                    {m.valor ? formatCurrency(m.valor) : "N/A"}
                  </TableCell>
                  <TableCell>{m.numero_factura || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
