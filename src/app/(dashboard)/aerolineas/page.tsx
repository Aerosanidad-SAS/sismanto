import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole, getProfile } from "@/app/api/actions/auth";
import { getAerolineas } from "@/app/api/actions/aerolineas";
import { AerolineasTabla } from "@/components/aeropuertos/aerolineas-tabla";
import { ROLES_ADMIN_AEROLINEAS } from "@/lib/aeropuertos";

export default async function AerolineasPage() {
  await requireRole(["ADMIN", "MEDICO", "ANALISTA", "VISTA"]);
  const [profile, aerolineas] = await Promise.all([getProfile(), getAerolineas()]);
  const puedeAdministrar = ROLES_ADMIN_AEROLINEAS.includes(profile?.role_codigo ?? "");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Aerolíneas</h1>
        <p className="mt-2 text-muted-foreground">Catálogo de aerolíneas que se elige al registrar una valoración.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listado de aerolíneas</CardTitle>
          <CardDescription>Solo Administración y Analista pueden crear, editar o desactivar</CardDescription>
        </CardHeader>
        <CardContent>
          <AerolineasTabla aerolineas={aerolineas} puedeAdministrar={puedeAdministrar} />
        </CardContent>
      </Card>
    </div>
  );
}
