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
import { HelpTrigger } from "@/components/ui/help-trigger";
import { veSoloSuCentro } from "@/lib/auth-utils";
import { FiltroCiudadUrl } from "@/components/servicios/filtro-ciudad";
import { prefijoCiudad } from "@/lib/servicios-lista";

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

  const [tablero, fleet, ovemUsers, medicoUsers, auxiliarUsers] = await Promise.all([
    getTableroRegulacion(),
    getFleetWithAssignments(),
    getUsuariosPorRol("OVEM"),
    getUsuariosPorRol("MEDICO"),
    getUsuariosPorRol("AUXILIAR_ENFERMERIA"),
  ]);

  const vehiculosOperativos = (fleet as { id: string; placa: string; estado_actual: string }[])
    .filter((v) => v.estado_actual === "OPERATIVO")
    .map((v) => ({ id: v.id, placa: v.placa }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl">Regulación — sala de control</h1>
            <HelpTrigger text="Vista del día para despacho: servicios con su estado en vivo, alertas de la flota y armado de tripulaciones. El estado de cada servicio lo mueve la tripulación desde Mis servicios." />
          </div>
          <p className="mt-2 text-muted-foreground">
            {profile.centro_nombre ? `Centro ${profile.centro_nombre}` : "Todos los centros"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FiltroCiudadUrl />
          <BarraTablero
            vehiculos={vehiculosOperativos}
            reportadoPor={profile.nombre_completo ?? profile.email ?? ""}
          />
        </div>
      </div>

      {veSoloSuCentro(profile.role_codigo) && !profile.operational_center_id && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Tu usuario no tiene centro operativo asignado, así que ves la operación de todos los
          centros. Pide al administrador que te lo asigne en Administración → Usuarios.
        </div>
      )}

      <ServiciosDelDia
        servicios={(tablero.servicios as ServicioDelDia[]).filter(
          (s) => !prefijoDeCiudad || (s.ciudad_registro ?? "").toLowerCase().startsWith(prefijoDeCiudad)
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <VencimientosCard vencimientos={tablero.vencimientos} />
        <MantenimientoCard mantenimiento={tablero.mantenimiento} />
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="text-xl">Tripulaciones de hoy</h2>
          <HelpTrigger text="Asigne cada mañana el OVEM, el médico y el auxiliar de cada vehículo. Al asignar un servicio a un vehículo, su tripulación queda como responsable y lo ve en Mis servicios." />
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
