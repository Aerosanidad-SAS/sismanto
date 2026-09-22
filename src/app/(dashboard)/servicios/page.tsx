import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import {
  buscarServicios,
  getOpcionesFiltroServicios,
  getServiciosMedicos,
} from "@/app/api/actions/servicios-medicos";
import { getResumenOperativoDiario } from "@/app/api/actions/estadisticas-servicios";
import { getClientes } from "@/app/api/actions/clientes";
import { getProfile } from "@/app/api/actions/auth";
import { getFleetWithAssignments, getUsuariosPorRol } from "@/app/api/actions/regulacion";
import { ServiciosTabla } from "@/components/servicios/servicios-tabla";
import { MisServicios } from "@/components/servicios/mis-servicios";
import { ResumenOperativo } from "@/components/gerencial/resumen-operativo";
import { centroVisible } from "@/lib/auth-utils";
import { leerFiltros } from "@/lib/servicios-lista";
import { ServiciosFiltros } from "@/components/servicios/servicios-filtros";
import { ServiciosPaginacion } from "@/components/servicios/servicios-paginacion";
import { ExportarServicios } from "@/components/servicios/exportar-servicios";
import { AvisosServicios } from "@/components/servicios/avisos-servicios";

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

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const hoyIso = new Date().toISOString().slice(0, 10);
  const { filtros, pagina } = leerFiltros(searchParams);
  const profile = await getProfile();
  const mostrarMisServicios = ROLES_MIS_SERVICIOS.includes(profile?.role_codigo ?? "");
  const [
    { servicios, total, error: errorLista },
    opciones,
    misServicios,
    vehiculos,
    clientes,
    flota,
    medicosDisponibles,
    reguladoresDisponibles,
    resumenHoy,
  ] =
    await Promise.all([
      buscarServicios(filtros, pagina),
      getOpcionesFiltroServicios(),
      // "Mis servicios" sigue siendo la lista corta de lo asignado a médico/auxiliar.
      mostrarMisServicios ? getServiciosMedicos() : Promise.resolve([]),
      getVehiculosActivos(),
      getClientes(),
      getFleetWithAssignments(),
      getUsuariosPorRol("MEDICO"),
      getUsuariosPorRol("REGULACION"),
      getResumenOperativoDiario({ desde: hoyIso, hasta: hoyIso }),
    ]);
  const puedeEditar = ROLES_EDICION.includes(profile?.role_codigo ?? "");
  const etapasVisibles = Object.fromEntries((servicios as { id: number; etapa: string }[]).map((s) => [s.id, s.etapa]));

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl">Servicios registrados</h1>
          <p className="mt-2 text-muted-foreground">
            Despacho y seguimiento de traslados y servicios asistenciales.
          </p>
        </div>
        <AvisosServicios etapasVisibles={etapasVisibles} />
      </div>

      {mostrarMisServicios && (
        <div>
          <h2 className="text-xl mb-3">Mis servicios asignados</h2>
          <MisServicios servicios={misServicios as any} />
        </div>
      )}

      <Card>
        <CardContent className="space-y-4 pt-6">
          <ServiciosFiltros
            key={JSON.stringify(filtros)}
            inicial={filtros}
            clientes={opciones.clientes}
            origenes={opciones.origenes}
            destinos={opciones.destinos}
          />
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <ExportarServicios filtros={filtros} />
          </div>
          {errorLista && (
            <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
              No se pudo cargar la lista de servicios: {errorLista}
            </p>
          )}
          <ServiciosPaginacion filtros={filtros} pagina={pagina} total={total} />
          <ServiciosTabla
            servicios={servicios as any}
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
          {total > 0 && <ServiciosPaginacion filtros={filtros} pagina={pagina} total={total} />}
        </CardContent>
      </Card>

      <ResumenOperativo inicial={resumenHoy} />
    </div>
  );
}
