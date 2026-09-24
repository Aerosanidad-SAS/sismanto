import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buscarPacientes, getEpsCatalog, getResumenPacientes } from "@/app/api/actions/pacientes";
import { formatNumber } from "@/lib/utils";
import { getProfile } from "@/app/api/actions/auth";
import { PacientesTabla } from "@/components/pacientes/pacientes-tabla";
import { ExportarPacientes } from "@/components/pacientes/exportar-pacientes";
import { PacientesPaginacion } from "@/components/pacientes/pacientes-paginacion";
import { ROLES_EXPORTAR_PACIENTES } from "@/lib/pacientes-export";
import { leerBusquedaPacientes } from "@/lib/pacientes-lista";

const ROLES_EDICION = ["ADMIN", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA", "ANALISTA"];

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { q, pagina } = leerBusquedaPacientes(searchParams);
  const [profile, { pacientes, total, error: errorLista }, resumen, epsOptions] = await Promise.all([
    getProfile(),
    buscarPacientes(q, pagina),
    getResumenPacientes(),
    getEpsCatalog(),
  ]);
  const puedeEditar = ROLES_EDICION.includes(profile?.role_codigo ?? "");
  const puedeExportar = (ROLES_EXPORTAR_PACIENTES as readonly string[]).includes(profile?.role_codigo ?? "");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Pacientes</h1>
        <p className="mt-2 text-muted-foreground">
          Registro maestro de pacientes para servicios médicos y valoraciones.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pacientes activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(resumen.total)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Con celular registrado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(resumen.conCelular)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Con EPS registrada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(resumen.conEps)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Listado de pacientes</CardTitle>
            <CardDescription>Búsqueda por documento, nombre o EPS</CardDescription>
          </div>
          {puedeExportar && <ExportarPacientes />}
        </CardHeader>
        <CardContent className="space-y-4">
          {errorLista && (
            <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
              No se pudo cargar la lista de pacientes: {errorLista}
            </p>
          )}
          <PacientesTabla pacientes={pacientes} puedeEditar={puedeEditar} epsOptions={epsOptions} busqueda={q} />
          <PacientesPaginacion q={q} pagina={pagina} total={total} />
        </CardContent>
      </Card>
    </div>
  );
}
