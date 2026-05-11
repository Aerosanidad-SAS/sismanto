import { getFleetWithAssignments, getOvemUsers } from "@/app/api/actions/regulacion";
import { RegulacionFleet } from "@/components/regulacion/regulacion-fleet";
import { HelpTrigger } from "@/components/ui/help-trigger";

export default async function RegulacionPage() {
  const [fleet, ovemUsers] = await Promise.all([
    getFleetWithAssignments(),
    getOvemUsers(),
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
            Disponibilidad en tiempo real y asignación de conductores (OVEM)
          </p>
        </div>
      </div>

      <RegulacionFleet fleet={fleet} ovemUsers={ovemUsers} />
    </div>
  );
}
