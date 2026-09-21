import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServiciosMedicos } from "@/app/api/actions/servicios-medicos";
import { getResumenOperativoDiario } from "@/app/api/actions/estadisticas-servicios";
import { getClientes } from "@/app/api/actions/clientes";
import { getProfile } from "@/app/api/actions/auth";
import { getFleetWithAssignments, getUsuariosPorRol } from "@/app/api/actions/regulacion";
import { ServiciosTabla } from "@/components/servicios/servicios-tabla";
import { MisServicios } from "@/components/servicios/mis-servicios";
import { ResumenOperativo } from "@/components/gerencial/resumen-operativo";
import { centroVisible } from "@/lib/auth-utils";

const ROLES_EDICION = ["ADMIN", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA", "ANALISTA"];
const ROLES_MIS_SERVICIOS = ["MEDICO", "AUXILIAR_ENFERMERIA"];

async function getVehiculosActivos() {
  try {
    const supabase = createClient();
    let query = supabase
      .from("vehicles")
      .select("id, placa")
      .eq("estado_actual", "OPERATIVO")
      .order("placa");
    const centro = centroVisible(await getProfile());
    if (centro) query = query.eq("centro_operativo", centro.codigo);
    const { data } = await query;
    return data || [];
  } catch {
    return [];
  }
}

export default async function ServiciosPage() {
  const hoyIso = new Date().toISOString().slice(0, 10);
  const [profile, servicios, vehiculos, clientes, flota, medicosDisponibles, reguladoresDisponibles, resumenHoy] =
    await Promise.all([
      getProfile(),
      getServiciosMedicos(),
      getVehiculosActivos(),
      getClientes(),
      getFleetWithAssignments(),
      getUsuariosPorRol("MEDICO"),
      getUsuariosPorRol("REGULACION"),
      getResumenOperativoDiario({ desde: hoyIso, hasta: hoyIso }),
    ]);
  const puedeEditar = ROLES_EDICION.includes(profile?.role_codigo ?? "");
  const mostrarMisServicios = ROLES_MIS_SERVICIOS.includes(profile?.role_codigo ?? "");

  // Tripulación activa hoy por vehículo (armada en Regulación) — para
  // autocompletar al elegir el móvil en el formulario de servicio.
  const tripulacionPorVehiculo: Record<
    string,
    { ovem?: { user_id: string; nombre_completo: string | null; email: string | null }; medico?: { user_id: string; nombre_completo: string | null; email: string | null }; auxiliar?: { user_id: string; nombre_completo: string | null; email: string | null } }
  > = {};
  for (const v of flota as any[]) {
    const entry: (typeof tripulacionPorVehiculo)[string] = {};
    for (const a of v.assignments ?? []) {
      if (a.rol_en_turno === "OVEM") entry.ovem = a.driver;
      if (a.rol_en_turno === "MEDICO") entry.medico = a.driver;
      if (a.rol_en_turno === "AUXILIAR_ENFERMERIA") entry.auxiliar = a.driver;
    }
    tripulacionPorVehiculo[v.id] = entry;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Servicios médicos</h1>
        <p className="mt-2 text-muted-foreground">
          Despacho y seguimiento de traslados y servicios asistenciales.
        </p>
      </div>

      {mostrarMisServicios && (
        <div>
          <h2 className="text-xl mb-3">Mis servicios asignados</h2>
          <MisServicios servicios={servicios as any} />
        </div>
      )}

      <ResumenOperativo inicial={resumenHoy} />

      <Card>
        <CardHeader>
          <CardTitle>Listado de servicios</CardTitle>
          <CardDescription>
            Últimos 500 servicios. El cambio rápido de etapa usa guarda optimista: si otro usuario
            ya movió el servicio, el cambio se rechaza.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiciosTabla
            servicios={servicios}
            vehiculos={vehiculos}
            clientes={clientes.map((c) => c.nombre)}
            viewerRole={profile?.role_codigo}
            viewerNombreCompleto={profile?.nombre_completo ?? profile?.email ?? null}
            puedeEditar={puedeEditar}
            medicosDisponibles={medicosDisponibles}
            reguladoresDisponibles={reguladoresDisponibles}
            tripulacionPorVehiculo={tripulacionPorVehiculo}
            ciudadDefault={profile?.ciudad}
          />
        </CardContent>
      </Card>
    </div>
  );
}
