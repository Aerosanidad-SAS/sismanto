import { getFleetWithAssignments, getOvemUsers } from "@/app/api/actions/regulacion";
import { RegulacionFleet } from "@/components/regulacion/regulacion-fleet";

export default async function RegulacionPage() {
  const [fleet, ovemUsers] = await Promise.all([
    getFleetWithAssignments(),
    getOvemUsers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Regulación - Estado de Flota</h1>
        <p className="mt-2 text-muted-foreground">
          Disponibilidad en tiempo real y asignación de conductores (OVEM)
        </p>
      </div>

      <RegulacionFleet fleet={fleet} ovemUsers={ovemUsers} />
    </div>
  );
}
