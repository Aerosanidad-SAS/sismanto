import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPacientes, getEpsCatalog } from "@/app/api/actions/pacientes";
import { getProfile } from "@/app/api/actions/auth";
import { PacientesTabla } from "@/components/pacientes/pacientes-tabla";
import { ExportarPacientes } from "@/components/pacientes/exportar-pacientes";
import { ROLES_EXPORTAR_PACIENTES } from "@/lib/pacientes-export";

const ROLES_EDICION = ["ADMIN", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA", "ANALISTA"];

export default async function PacientesPage() {
  const [profile, pacientes, epsOptions] = await Promise.all([getProfile(), getPacientes(), getEpsCatalog()]);
  const puedeEditar = ROLES_EDICION.includes(profile?.role_codigo ?? "");
  const puedeExportar = (ROLES_EXPORTAR_PACIENTES as readonly string[]).includes(profile?.role_codigo ?? "");

  const conCelular = pacientes.filter((p) => p.celular).length;
  const conEps = pacientes.filter((p) => p.eps).length;

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
            <div className="text-2xl font-bold">{pacientes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Con celular registrado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conCelular}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Con EPS registrada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conEps}</div>
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
        <CardContent>
          <PacientesTabla pacientes={pacientes} puedeEditar={puedeEditar} epsOptions={epsOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
