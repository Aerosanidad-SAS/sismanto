import { getProfile } from "@/app/api/actions/auth";
import {
  listTrainings,
  getPendingGrading,
  getMyAssignments,
} from "@/app/api/actions/capacitaciones";
import { redirect } from "next/navigation";
import { CapacitacionesAdmin } from "@/components/capacitaciones/capacitaciones-admin";
import { CapacitacionesOvem } from "@/components/capacitaciones/capacitaciones-ovem";

export default async function CapacitacionesPage() {
  const profile = await getProfile();
  if (!profile || !["ADMIN", "OVEM", "COORDINACION"].includes(profile.role_codigo)) {
    redirect("/");
  }

  if (profile.role_codigo === "OVEM") {
    const { data: assignments } = await getMyAssignments();
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl">Mis Capacitaciones</h1>
          <p className="mt-1 text-muted-foreground">
            Capacitaciones asignadas y evaluaciones pendientes
          </p>
        </div>
        <CapacitacionesOvem
          assignments={assignments}
          ovemName={profile.nombre_completo ?? profile.email ?? "OVEM"}
          userId={profile.user_id}
        />
      </div>
    );
  }

  const [{ data: trainings }, { data: pending }] = await Promise.all([
    listTrainings(),
    getPendingGrading(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Capacitaciones</h1>
        <p className="mt-1 text-muted-foreground">
          Gestión de cursos, evaluaciones y calificaciones
        </p>
      </div>
      <CapacitacionesAdmin
        trainings={trainings}
        pendingGrading={pending}
        isAdmin={profile.role_codigo === "ADMIN"}
      />
    </div>
  );
}
