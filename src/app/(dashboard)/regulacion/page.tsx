import { redirect } from "next/navigation";
import {
  getFleetWithAssignments,
  getTableroRegulacion,
  getUsuariosPorRol,
} from "@/app/api/actions/regulacion";
import { getProfile } from "@/app/api/actions/auth";
import { RegulacionFleet } from "@/components/regulacion/regulacion-fleet";
import { ServiciosDelDia, type ServicioDelDia } from "@/components/regulacion/servicios-del-dia";
import { MantenimientoCard, VencimientosCard } from "@/components/regulacion/alertas-flota";
import { BarraTablero } from "@/components/regulacion/barra-tablero";
import { AvisosServicios } from "@/components/servicios/avisos-servicios";
import { ProgramacionDiaria } from "@/components/regulacion/programacion-diaria";
import { SolicitudesNoApto } from "@/components/regulacion/solicitudes-no-apto";
import { getSolicitudesNoAptoPendientes } from "@/app/api/actions/solicitudes-no-apto";
import { getProgramacionDelDia } from "@/app/api/actions/programacion";
import { PreoperacionalHoyCard } from "@/components/regulacion/preoperacional-hoy";
import { getPreoperacionalHoy } from "@/app/api/actions/preoperacional-pendiente";
import { CierresTurnoHoyCard } from "@/components/regulacion/cierres-turno-hoy";
import { getCierresDeTurnoHoy } from "@/app/api/actions/cierre-turno";
import { HelpTrigger } from "@/components/ui/help-trigger";
import { veSoloSuCentro } from "@/lib/auth-utils";
import { FiltroCiudadUrl } from "@/components/servicios/filtro-ciudad";
import { prefijoCiudad } from "@/lib/servicios-lista";

export const metadata = { title: "Sala de control" };

const ROLES_PERMITIDOS = ["ADMIN", "REGULACION", "ANALISTA"];

export default async function RegulacionPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const pedida = Array.isArray(searchParams.ciudad) ? searchParams.ciudad[0] : searchParams.ciudad;
  const prefijoDeCiudad = prefijoCiudad(pedida);
  const profile = await getProfile();
  if (!profile || !ROLES_PERMITIDOS.includes(profile.role_codigo)) {
    redirect("/");
  }

  const diaPedido = Array.isArray(searchParams.dia) ? searchParams.dia[0] : searchParams.dia;
  const [tablero, fleet, ovemUsers, medicoUsers, auxiliarUsers, preoperacional, programacion, solicitudesNoApto, cierresTurno] = await Promise.all([
    getTableroRegulacion(),
    getFleetWithAssignments(),
    getUsuariosPorRol("OVEM"),
    getUsuariosPorRol("MEDICO"),
    getUsuariosPorRol("AUXILIAR_ENFERMERIA"),
    getPreoperacionalHoy(),
    getProgramacionDelDia(diaPedido ?? ""),
    getSolicitudesNoAptoPendientes(),
    getCierresDeTurnoHoy(),
  ]);

  const vehiculosOperativos = (fleet as { id: string; placa: string; estado_actual: string }[])
    .filter((v) => v.estado_actual === "OPERATIVO")
    .map((v) => ({ id: v.id, placa: v.placa }));

  // Etapa de cada servicio visible: AvisosServicios avisa cuando uno pasa a CURSO o FINALIZADO entre refrescos.
  const etapasVisibles = Object.fromEntries(
    (tablero.servicios as { id: number; etapa: string }[]).map((s) => [s.id, s.etapa])
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl">Sala de control</h1>
            <HelpTrigger text="Vista del día para despacho: servicios con su estado en vivo, alertas de la flota y armado de tripulaciones. El estado de cada servicio lo mueve la tripulación desde Mis servicios." />
          </div>
          <p className="mt-2 text-muted-foreground">
            {profile.centro_nombre ? `Centro ${profile.centro_nombre}` : "Todos los centros"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FiltroCiudadUrl />
          {/* Alertas sonoras 60/30/15 min y avisos de servicio: antes solo estaban en /servicios. */}
          <AvisosServicios etapasVisibles={etapasVisibles} />
          <BarraTablero
            vehiculos={vehiculosOperativos}
            reportadoPor={profile.nombre_completo ?? profile.email ?? ""}
          />
        </div>
      </div>

      {veSoloSuCentro(profile.role_codigo) && !profile.operational_center_id && (
        <div className="rounded-md border border-warning/50 bg-warning-soft p-3 text-sm text-foreground">
          Tu usuario no tiene centro operativo asignado, así que ves la operación de todos los
          centros. Pide al administrador que te lo asigne en Administración → Usuarios.
        </div>
      )}

      <SolicitudesNoApto solicitudes={solicitudesNoApto} puedeResolver={profile.role_codigo === "ADMIN"} />

      <ServiciosDelDia
        servicios={(tablero.servicios as ServicioDelDia[]).filter(
          (s) => !prefijoDeCiudad || (s.ciudad_registro ?? "").toLowerCase().startsWith(prefijoDeCiudad)
        )}
      />

      <PreoperacionalHoyCard datos={preoperacional} />

      <CierresTurnoHoyCard datos={cierresTurno} />

      <div className="grid gap-4 md:grid-cols-2">
        <VencimientosCard vencimientos={tablero.vencimientos} />
        <MantenimientoCard mantenimiento={tablero.mantenimiento} />
      </div>

      <ProgramacionDiaria datos={programacion} />

      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="text-xl">Tripulaciones de hoy</h2>
          <HelpTrigger text="Asigna cada mañana el OVEM, el médico y el auxiliar de cada vehículo. Al asignar un servicio a un vehículo, su tripulación queda como responsable y lo ve en Mis servicios." />
        </div>
        <RegulacionFleet
          fleet={fleet}
          ovemUsers={ovemUsers}
          medicoUsers={medicoUsers}
          auxiliarUsers={auxiliarUsers}
          mostrarResumen={false}
        />
      </div>
    </div>
  );
}
