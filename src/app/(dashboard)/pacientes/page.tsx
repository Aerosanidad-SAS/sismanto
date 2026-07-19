import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPacientes } from "@/app/api/actions/pacientes";
import { getProfile } from "@/app/api/actions/auth";
import { PacientesTabla } from "@/components/pacientes/pacientes-tabla";

const ROLES_EDICION = ["ADMIN", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA"];

export default async function PacientesPage() {
  const [profile, pacientes] = await Promise.all([getProfile(), getPacientes()]);
  const puedeEditar = ROLES_EDICION.includes(profile?.role_codigo ?? "");

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
        <CardHeader>
          <CardTitle>Listado de pacientes</CardTitle>
          <CardDescription>Búsqueda por documento, nombre o EPS</CardDescription>
        </CardHeader>
        <CardContent>
          <PacientesTabla pacientes={pacientes} puedeEditar={puedeEditar} />
        </CardContent>
      </Card>
    </div>
  );
}
