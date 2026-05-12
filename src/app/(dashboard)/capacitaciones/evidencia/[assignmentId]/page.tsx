import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/app/api/actions/auth";
import { getAssignmentEvidence } from "@/app/api/actions/capacitaciones";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import { PrintButton } from "@/components/ui/print-button";

export default async function EvidenciaCapacitacionPage({
  params,
}: {
  params: { assignmentId: string };
}) {
  const assignmentId = Number(params.assignmentId);
  if (!Number.isFinite(assignmentId) || assignmentId <= 0) notFound();

  const profile = await getProfile();
  if (!profile) redirect("/login");

  const { data, error } = await getAssignmentEvidence(assignmentId);
  if (error === "No autorizado") redirect("/capacitaciones");
  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/capacitaciones" className="text-primary hover:underline">← Volver</Link>
        <p className="text-muted-foreground">{error ?? "No encontrado"}</p>
      </div>
    );
  }

  const { assignment, session, responses } = data;
  const training = (assignment as any).trainings;
  const userProfile = (assignment as any).user_profiles;

  return (
    <div className="space-y-6 print:space-y-3 max-w-3xl">
      <div className="print:hidden flex items-center justify-between">
        <Link href="/capacitaciones" className="text-primary hover:underline text-sm">
          ← Volver a Capacitaciones
        </Link>
        <PrintButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evidencia de Capacitación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Curso:</strong>{" "}
            {training?.titulo ?? `Capacitación #${(assignment as any).training_id}`}
          </p>
          <p>
            <strong>OVEM:</strong>{" "}
            {userProfile?.nombre_completo ?? userProfile?.email ?? "—"}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            {session ? (
              <Badge
                variant={
                  session.estado === "CALIFICADA"
                    ? "success"
                    : session.estado === "COMPLETADA"
                    ? "warning"
                    : "default"
                }
                className="align-middle ml-1"
              >
                {session.estado === "CALIFICADA"
                  ? "Calificada"
                  : session.estado === "COMPLETADA"
                  ? "Enviada — pendiente de calificación"
                  : "En curso"}
              </Badge>
            ) : (
              <Badge variant="outline" className="align-middle ml-1">
                Sin iniciar
              </Badge>
            )}
          </p>
          {session?.fecha_inicio && (
            <p>
              <strong>Inicio evaluación:</strong> {formatDateShort(session.fecha_inicio)}
            </p>
          )}
          {session?.fecha_fin && (
            <p>
              <strong>Enviada:</strong> {formatDateShort(session.fecha_fin)}
            </p>
          )}
          {session?.puntaje_mc != null && (
            <p>
              <strong>Score selección múltiple:</strong> {session.puntaje_mc}%
            </p>
          )}
          {session?.puntaje_final != null && (
            <p>
              <strong>Nota final:</strong>{" "}
              <span className="text-green-700 font-semibold">{session.puntaje_final}%</span>
            </p>
          )}
          {session?.observaciones && (
            <p>
              <strong>Observaciones:</strong> {session.observaciones}
            </p>
          )}
          {(assignment as any).fecha_limite && (
            <p>
              <strong>Fecha límite asignación:</strong>{" "}
              {formatDateShort((assignment as any).fecha_limite)}
            </p>
          )}
        </CardContent>
      </Card>

      {responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Respuestas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {(responses as any[]).map((r) => (
              <div key={r.id} className="space-y-1">
                <p className="font-medium text-sm">
                  {r.training_questions?.orden}. {r.training_questions?.pregunta}
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    (
                    {r.training_questions?.tipo === "SELECCION_MULTIPLE"
                      ? "Selección múltiple"
                      : r.training_questions?.tipo === "JUSTIFICACION"
                      ? "Justificación"
                      : "Respuesta abierta"}
                    )
                  </span>
                </p>
                {r.training_questions?.tipo === "SELECCION_MULTIPLE" ? (
                  <p
                    className={`text-sm pl-4 font-medium ${
                      r.es_correcta ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {r.training_question_options?.texto ?? "—"}
                    {r.es_correcta != null && (r.es_correcta ? " ✓" : " ✗")}
                  </p>
                ) : (
                  <p className="text-sm pl-4 whitespace-pre-wrap text-muted-foreground">
                    {r.respuesta_texto || "Sin respuesta"}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
