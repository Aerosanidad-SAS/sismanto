import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buscarValoraciones, getResumenValoraciones } from "@/app/api/actions/valoraciones";
import { getProfile } from "@/app/api/actions/auth";
import { getAerolineas } from "@/app/api/actions/aerolineas";
import { ValoracionesTabla } from "@/components/pacientes/valoraciones-tabla";
import { ValoracionesPaginacion } from "@/components/pacientes/valoraciones-paginacion";
import { ROLES_ELIMINAR_VALORACION, leerBusquedaValoraciones } from "@/lib/valoraciones-lista";
import { formatNumber } from "@/lib/utils";

const ROLES_EDICION = ["ADMIN", "MEDICO", "ANALISTA"];

export default async function ValoracionesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { q, pagina } = leerBusquedaValoraciones(searchParams);
  const [profile, { valoraciones, total, error: errorLista }, resumen, aerolineas] = await Promise.all([
    getProfile(),
    buscarValoraciones(q, pagina),
    getResumenValoraciones(),
    getAerolineas(true),
  ]);
  const puedeEditar = ROLES_EDICION.includes(profile?.role_codigo ?? "");
  const puedeEliminar = ROLES_ELIMINAR_VALORACION.includes(profile?.role_codigo ?? "");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Valoraciones médicas</h1>
        <p className="mt-2 text-muted-foreground">
          Conceptos de aptitud médica para vuelo (pasajeros y acompañantes).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valoraciones registradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(resumen.total)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Con concepto APTO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatNumber(resumen.aptos)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Con concepto NO APTO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatNumber(resumen.noAptos)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de valoraciones</CardTitle>
          <CardDescription>Solo Médico y Administración pueden registrar o editar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorLista && (
            <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
              No se pudo cargar la lista de valoraciones: {errorLista}
            </p>
          )}
          <ValoracionesTabla valoraciones={valoraciones} puedeEditar={puedeEditar} puedeEliminar={puedeEliminar} aerolineas={aerolineas.map((a) => a.nombre)} busqueda={q} />
          <ValoracionesPaginacion q={q} pagina={pagina} total={total} />
        </CardContent>
      </Card>
    </div>
  );
}
