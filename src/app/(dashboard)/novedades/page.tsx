import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile } from "@/app/api/actions/auth";
import { centroVisible, isAdminLike } from "@/lib/auth-utils";
import { NovedadesTabla } from "@/components/novedades/novedades-tabla";
import { NuevaNovedadBoton } from "@/components/novedades/nueva-novedad-boton";
import { SolicitudesNoApto } from "@/components/regulacion/solicitudes-no-apto";
import { getSolicitudesNoAptoPendientes } from "@/app/api/actions/solicitudes-no-apto";

export const metadata = { title: "Novedades" };

const ROLES_CIERRE = ["ADMIN", "ANALISTA", "REGULACION", "MANTENIMIENTO"];
// Quiénes pueden reportar una novedad desde aquí: los mismos que permite la política de inserción de `incidents`.
const ROLES_REPORTAN = ["ADMIN", "ANALISTA", "REGULACION", "MANTENIMIENTO"];
// Quiénes pueden crear un mantenimiento nuevo desde el cierre de una
// novedad — mismo set que la RLS de insert en maintenance_records.
// REGULACION puede cerrar novedades (nota o ligar a uno existente) pero
// no crear mantenimientos, así que no ve esa opción específica.
const ROLES_CREAN_MANTENIMIENTO = ["ADMIN", "ANALISTA", "MANTENIMIENTO"];

async function getNovedades(centroCodigo: string | null) {
  try {
    const supabase = createClient();
    let query = supabase
      .from("incidents")
      .select(`
        *,
        vehicles!inner(placa, centro_operativo)
      `)
      .order("fecha_reporte", { ascending: false });
    // Regulación y Coordinación ven las novedades de los vehículos de su centro (DEU-05 de PARIDAD_REGULACION.md).
    if (centroCodigo) query = query.eq("vehicles.centro_operativo", centroCodigo);
    const { data } = await query;

    return data || [];
  } catch {
    return [];
  }
}

/** Vehículos para el botón «Nueva novedad»: los del centro de quien consulta (todos, si no tiene centro). */
async function getVehiculosParaNovedad(centroCodigo: string | null): Promise<{ id: string; placa: string }[]> {
  try {
    let query = createClient().from("vehicles").select("id, placa").order("placa");
    if (centroCodigo) query = query.eq("centro_operativo", centroCodigo);
    const { data } = await query;
    return (data ?? []) as { id: string; placa: string }[];
  } catch {
    return [];
  }
}

export default async function NovedadesPage() {
  const profile = await getProfile();
  const centroCodigo = centroVisible(profile)?.codigo ?? null;
  const [novedades, solicitudesNoApto, vehiculosNovedad] = await Promise.all([
    getNovedades(centroCodigo),
    getSolicitudesNoAptoPendientes().catch(() => []),
    getVehiculosParaNovedad(centroCodigo),
  ]);
  const isAdmin = profile ? isAdminLike(profile.role_codigo) : false;
  const puedeCerrar = ROLES_CIERRE.includes(profile?.role_codigo ?? "");
  const puedeCrearMantenimiento = ROLES_CREAN_MANTENIMIENTO.includes(profile?.role_codigo ?? "");

  const abiertas = novedades.filter((n: any) => n.estado === "ABIERTO");
  const enProceso = novedades.filter((n: any) => n.estado === "EN_PROCESO");
  const cerradas = novedades.filter((n: any) => n.estado === "CERRADO");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl">Novedades e Incidentes</h1>
          <p className="mt-2 text-muted-foreground">
            Gestión de reportes de novedades de los vehículos: reportar, seguir y cerrar.
          </p>
        </div>
        {ROLES_REPORTAN.includes(profile?.role_codigo ?? "") && (
          <NuevaNovedadBoton vehiculos={vehiculosNovedad} reportadoPor={profile?.nombre_completo || profile?.email || ""} />
        )}
      </div>

      <SolicitudesNoApto
        solicitudes={solicitudesNoApto}
        puedeResolver={["ADMIN", "COORDINACION", "MANTENIMIENTO"].includes(profile?.role_codigo ?? "")}
      />

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
