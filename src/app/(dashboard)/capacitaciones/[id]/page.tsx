import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/app/api/actions/auth";
import {
  getTrainingWithQuestions,
  getTrainingAssignments,
  listAllOvems,
  getMyAssignments,
} from "@/app/api/actions/capacitaciones";
import { TrainingDetailAdmin } from "@/components/capacitaciones/training-detail-admin";
import { EvaluacionFlow } from "@/components/capacitaciones/evaluacion-flow";
import { Badge } from "@/components/ui/badge";

export default async function CapacitacionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const profile = await getProfile();
  if (!profile) redirect("/login");

  // ── OVEM: id is an assignment ID ─────────────────────────────────────────
  if (profile.role_codigo === "OVEM") {
    const { data: assignments } = await getMyAssignments();
    const assignment = (assignments ?? []).find((a: any) => a.id === id);
    if (!assignment) notFound();

    const training = (assignment as any).trainings;
    if (!training) notFound();

    const { data: trainingFull, error } = await getTrainingWithQuestions(training.id);
    if (error || !trainingFull) {
      return (
        <div className="space-y-4">
          <Link href="/capacitaciones" className="text-primary hover:underline">
            ← Volver
          </Link>
          <p className="text-muted-foreground">No se pudo cargar la capacitación.</p>
        </div>
      );
    }

    const sessions: any[] = (assignment as any).training_sessions ?? [];
    const latestSession = sessions[0] ?? null;

    return (
      <div className="space-y-6 max-w-3xl">
        <Link
          href="/capacitaciones"
          className="text-primary hover:underline text-sm"
        >
          ← Volver a Capacitaciones
        </Link>
        <div>
          <h1 className="text-3xl">{trainingFull.titulo}</h1>
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            {latestSession ? (
              <Badge
                variant={
                  latestSession.estado === "CALIFICADA"
                    ? "success"
                    : latestSession.estado === "COMPLETADA"
                    ? "warning"
                    : "default"
                }
              >
                {latestSession.estado === "CALIFICADA"
                  ? "Calificada"
                  : latestSession.estado === "COMPLETADA"
                  ? "Enviada — pendiente de calificación"
                  : "En curso"}
              </Badge>
            ) : (
              <Badge variant="outline">Sin iniciar</Badge>
            )}
            {latestSession?.puntaje_final != null && (
              <span className="text-sm font-semibold text-green-700">
                Nota final: {latestSession.puntaje_final}%
              </span>
            )}
          </div>
        </div>

        <EvaluacionFlow
          assignment={assignment as any}
          training={trainingFull as any}
          latestSession={latestSession}
          ovemName={profile.nombre_completo ?? profile.email ?? "OVEM"}
          userId={profile.user_id}
        />
      </div>
    );
  }

  // ── ADMIN / COORDINACION: id is a training ID ─────────────────────────────
  if (!["ADMIN", "COORDINACION"].includes(profile.role_codigo)) {
    redirect("/");
  }

  const [{ data: training, error }, assignments, ovems] = await Promise.all([
    getTrainingWithQuestions(id),
    getTrainingAssignments(id),
    listAllOvems(),
  ]);

  if (error || !training) {
    return (
      <div className="space-y-4">
        <Link href="/capacitaciones" className="text-primary hover:underline">
          ← Volver
        </Link>
        <p className="text-muted-foreground">No se encontró la capacitación.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/capacitaciones"
        className="text-primary hover:underline text-sm"
      >
        ← Volver a Capacitaciones
      </Link>
      <div>
        <h1 className="text-3xl">{(training as any).titulo}</h1>
        {(training as any).descripcion && (
          <p className="mt-1 text-muted-foreground">{(training as any).descripcion}</p>
        )}
      </div>
      <TrainingDetailAdmin
        training={training as any}
        assignments={assignments}
        ovems={ovems}
      />
    </div>
  );
}
