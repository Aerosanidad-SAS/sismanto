import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/app/api/actions/auth";
import { listarAeropuertos } from "@/app/api/actions/aeropuertos";
import { AeropuertosPaginacion } from "@/components/aeropuertos/aeropuertos-paginacion";
import { codigoAeropuerto, leerBusquedaAeropuertos, tipoAeropuertoLegible } from "@/lib/aeropuertos";
import { formatNumber } from "@/lib/utils";

export default async function AeropuertosPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireRole(["ADMIN", "MEDICO", "ANALISTA", "VISTA"]);
  const { q, pais, pagina } = leerBusquedaAeropuertos(searchParams);
  const { aeropuertos, total, error } = await listarAeropuertos(q, pais, pagina);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Aeropuertos</h1>
        <p className="mt-2 text-muted-foreground">
          Catálogo mundial de aeropuertos (OurAirports) que alimenta el origen y destino de las valoraciones.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{formatNumber(total)} aeropuertos</CardTitle>
          <CardDescription>Catálogo de consulta: no se edita desde la aplicación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form method="get" className="flex flex-col gap-2 sm:flex-row">
            <Input name="q" defaultValue={q} placeholder="Nombre, municipio o código IATA/ICAO" className="sm:max-w-sm" />
            <Input name="pais" defaultValue={pais} placeholder="País (ej. CO)" maxLength={2} className="sm:w-32" />
            <Button type="submit" variant="outline">
              Buscar
            </Button>
            {(q || pais) && (
              <Button asChild variant="ghost">
                <Link href="/aeropuertos">Limpiar</Link>
              </Button>
            )}
          </form>

          {error && (
            <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
              No se pudo cargar el catálogo: {error}
            </p>
          )}

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Municipio</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Servicio regular</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aeropuertos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {q || pais
                        ? "Sin resultados para esa búsqueda."
                        : "El catálogo está vacío (llega con la migración de datos de SISRES)."}
                    </TableCell>
                  </TableRow>
                )}
                {aeropuertos.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{codigoAeropuerto(a) || "—"}</TableCell>
                    <TableCell>{a.nombre}</TableCell>
                    <TableCell>{a.municipio ?? "—"}</TableCell>
                    <TableCell>{a.pais ?? "—"}</TableCell>
                    <TableCell>{tipoAeropuertoLegible(a.tipo) || "—"}</TableCell>
                    <TableCell>
                      {a.servicio_regular ? <Badge variant="success">Sí</Badge> : <Badge variant="outline">No</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AeropuertosPaginacion q={q} pais={pais} pagina={pagina} total={total} />
        </CardContent>
      </Card>
    </div>
  );
}
