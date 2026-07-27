import { redirect } from "next/navigation";
import { getFleetWithAssignments, getUsuariosPorRol } from "@/app/api/actions/regulacion";
import { getProfile } from "@/app/api/actions/auth";
import { getServiciosMedicos } from "@/app/api/actions/servicios-medicos";
import { RegulacionFleet } from "@/components/regulacion/regulacion-fleet";
import { TableroServicios } from "@/components/regulacion/tablero-servicios";
import { HelpTrigger } from "@/components/ui/help-trigger";

const ROLES_PERMITIDOS = ["ADMIN", "REGULACION", "ANALISTA"];

export default async function RegulacionPage() {
  const profile = await getProfile();
  if (!profile || !ROLES_PERMITIDOS.includes(profile.role_codigo)) {
    redirect("/");
  }

  const [fleet, ovemUsers, medicoUsers, auxiliarUsers, servicios] = await Promise.all([
    getFleetWithAssignments(),
    getUsuariosPorRol("OVEM"),
    getUsuariosPorRol("MEDICO"),
    getUsuariosPorRol("AUXILIAR_ENFERMERIA"),
    getServiciosMedicos(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl">Regulación — estado de flota</h1>
            <HelpTrigger text="Vista para despacho: revise conteos, placas en FDS y use la sección Flota para asignar OVEM, desasignar o cambiar estado operativo de cada unidad." />
          </div>
          <p className="mt-2 text-muted-foreground">
            Disponibilidad en tiempo real y armado de tripulación (OVEM, médico, auxiliar)
          </p>
        </div>
      </div>

      <RegulacionFleet
        fleet={fleet}
        ovemUsers={ovemUsers}
        medicoUsers={medicoUsers}
        auxiliarUsers={auxiliarUsers}
      />

      <TableroServicios servicios={servicios as any} />
    </div>
  );
}
