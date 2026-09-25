import { hoyBogota, sumarDias } from "@/lib/fechas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEquiposBiomedicos, getMantenimientosBiomedicos } from "@/app/api/actions/inventario-biomedico";
import { getProfile, requireRole } from "@/app/api/actions/auth";
import { EquiposTabla } from "@/components/equipos/equipos-tabla";

const ROLES_EDICION = ["ADMIN", "MANTENIMIENTO", "ANALISTA"];

export default async function EquiposPage() {
  await requireRole(["ADMIN", "MANTENIMIENTO", "COORDINACION", "ANALISTA", "VISTA"]);
  const [profile, equipos, mantenimientos] = await Promise.all([
    getProfile(),
    getEquiposBiomedicos(),
    getMantenimientosBiomedicos(),
  ]);
  const puedeEditar = ROLES_EDICION.includes(profile?.role_codigo ?? "");

  const hoy = hoyBogota();
  const en30dias = sumarDias(hoyBogota(), 30);
  const mantenimientoVencido = equipos.filter(
    (e) => e.proximo_mantenimiento && e.proximo_mantenimiento < hoy
  ).length;
  const mantenimientoProximo = equipos.filter(
    (e) => e.proximo_mantenimiento && e.proximo_mantenimiento >= hoy && e.proximo_mantenimiento <= en30dias
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Equipos biomédicos</h1>
        <p className="mt-2 text-muted-foreground">
          Inventario, mantenimientos y hoja de vida de equipos médicos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Equipos activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mantenimiento vencido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mantenimientoVencido}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vence en 30 días</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mantenimientoProximo}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventario de equipos</CardTitle>
          <CardDescription>
            La hoja de vida de cada equipo reúne su ficha técnica y el historial completo de
            mantenimientos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EquiposTabla equipos={equipos} mantenimientos={mantenimientos} puedeEditar={puedeEditar} />
        </CardContent>
      </Card>
    </div>
  );
}
