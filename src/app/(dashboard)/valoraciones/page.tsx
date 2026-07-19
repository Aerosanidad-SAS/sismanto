import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getValoraciones } from "@/app/api/actions/valoraciones";
import { getProfile } from "@/app/api/actions/auth";
import { ValoracionesTabla } from "@/components/pacientes/valoraciones-tabla";

const ROLES_EDICION = ["ADMIN", "MEDICO"];

export default async function ValoracionesPage() {
  const [profile, valoraciones] = await Promise.all([getProfile(), getValoraciones()]);
  const puedeEditar = ROLES_EDICION.includes(profile?.role_codigo ?? "");

  const aptos = valoraciones.filter((v) => (v.valoracion ?? "").toUpperCase().includes("APTO")).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Valoraciones médicas</h1>
        <p className="mt-2 text-muted-foreground">
          Conceptos de aptitud médica para vuelo (pasajeros y acompañantes).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valoraciones registradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valoraciones.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Con concepto APTO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{aptos}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de valoraciones</CardTitle>
          <CardDescription>Solo Médico y Administración pueden registrar o editar</CardDescription>
        </CardHeader>
        <CardContent>
          <ValoracionesTabla valoraciones={valoraciones} puedeEditar={puedeEditar} />
        </CardContent>
      </Card>
    </div>
  );
}
