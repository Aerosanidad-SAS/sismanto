import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile } from "@/app/api/actions/auth";
import { isAdminLike } from "@/lib/auth-utils";
import { NovedadesTabla } from "@/components/novedades/novedades-tabla";

const ROLES_CIERRE = ["ADMIN", "ANALISTA", "REGULACION", "MANTENIMIENTO"];
// Quiénes pueden crear un mantenimiento nuevo desde el cierre de una
// novedad — mismo set que la RLS de insert en maintenance_records.
// REGULACION puede cerrar novedades (nota o ligar a uno existente) pero
// no crear mantenimientos, así que no ve esa opción específica.
const ROLES_CREAN_MANTENIMIENTO = ["ADMIN", "ANALISTA", "MANTENIMIENTO"];

async function getNovedades() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("incidents")
      .select(`
        *,
        vehicles!inner(placa, centro_operativo)
      `)
      .order("fecha_reporte", { ascending: false });

    return data || [];
  } catch {
    return [];
  }
}

export default async function NovedadesPage() {
  const [profile, novedades] = await Promise.all([getProfile(), getNovedades()]);
  const isAdmin = profile ? isAdminLike(profile.role_codigo) : false;
  const puedeCerrar = ROLES_CIERRE.includes(profile?.role_codigo ?? "");
  const puedeCrearMantenimiento = ROLES_CREAN_MANTENIMIENTO.includes(profile?.role_codigo ?? "");

  const abiertas = novedades.filter((n: any) => n.estado === "ABIERTO");
  const enProceso = novedades.filter((n: any) => n.estado === "EN_PROCESO");
  const cerradas = novedades.filter((n: any) => n.estado === "CERRADO");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Novedades e Incidentes</h1>
        <p className="mt-2 text-muted-foreground">
          Gestión de reportes de novedades. La columna Prioridad solo la establece Administración tras
          aplicar la migración 006 en la base de datos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Abiertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{abiertas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{enProceso.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cerradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{cerradas.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Novedades</CardTitle>
          <CardDescription>Todas las novedades e incidentes reportados</CardDescription>
        </CardHeader>
        <CardContent>
          <NovedadesTabla
            novedades={novedades as any}
            isAdmin={isAdmin}
            puedeCerrar={puedeCerrar}
            puedeCrearMantenimiento={puedeCrearMantenimiento}
          />
        </CardContent>
      </Card>
    </div>
  );
}
