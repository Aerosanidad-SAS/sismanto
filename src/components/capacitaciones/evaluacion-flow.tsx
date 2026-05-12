"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  iniciarSesion,
  guardarRespuesta,
  finalizarSesion,
} from "@/app/api/actions/capacitaciones";

interface Props {
  assignment: any;
  training: any;
  latestSession: any | null;
  ovemName: string;
  userId: string;
}

type Phase = "content" | "evaluation" | "completed";

function formatMs(ms: number) {
  if (ms <= 0) return "0:00";
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return m?.[1] ?? null;
}

export function EvaluacionFlow({
  assignment,
  training,
  latestSession,
  ovemName,
}: Props) {
  const getInitialPhase = (): Phase => {
    if (!latestSession) return "content";
    if (latestSession.estado === "EN_CURSO") return "evaluation";
    return "completed";
  };

  const [phase, setPhase] = useState<Phase>(getInitialPhase);
  const [session, setSession] = useState<any>(latestSession);
  const [responses, setResponses] = useState<
    Record<number, { opcion_id?: number; respuesta_texto?: string }>
  >({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);
  const router = useRouter();

  const questions: any[] = training.questions ?? [];

  const resolveText = useCallback(
    (text: string) => {
      const today = new Date().toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return text
        .replace(/\{nombre\}/g, ovemName)
        .replace(/\{fecha_hoy\}/g, today)
        .replace(/\{placa_asignada\}/g, "(placa asignada)");
    },
    [ovemName]
  );

  const doSubmit = useCallback(() => {
    if (submittedRef.current || !session) return;
    submittedRef.current = true;
    startTransition(async () => {
      const saves = Object.entries(responses).map(([qid, r]) =>
        guardarRespuesta({
          session_id: session.id,
          question_id: Number(qid),
          opcion_id: r.opcion_id ?? null,
          respuesta_texto: r.respuesta_texto ?? null,
        })
      );
      await Promise.all(saves);
      const { error: fErr } = await finalizarSesion(session.id);
      if (fErr) {
        submittedRef.current = false;
        setError(fErr);
        return;
      }
      setPhase("completed");
      router.refresh();
    });
  }, [session, responses, router]);

  useEffect(() => {
    if (phase !== "evaluation" || !session?.fecha_inicio) return;
    const limitMs = (training.tiempo_limite_minutos ?? 60) * 60000;
    const endTime = new Date(session.fecha_inicio).getTime() + limitMs;

    const tick = () => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);
      if (remaining === 0 && !submittedRef.current) doSubmit();
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, session, training.tiempo_limite_minutos, doSubmit]);

  const handleStartEval = () => {
    setError(null);
    startTransition(async () => {
      const { data, error: e } = await iniciarSesion(assignment.id);
      if (e) { setError(e); return; }
      setSession(data);
      setPhase("evaluation");
    });
  };

  const setResponse = (
    questionId: number,
    value: { opcion_id?: number; respuesta_texto?: string }
  ) => {
    setResponses((prev) => ({ ...prev, [questionId]: { ...prev[questionId], ...value } }));
  };

  // ── Content phase ───────────────────────────────────────────────────────────
  if (phase === "content") {
    const ytId = training.video_url ? getYouTubeId(training.video_url) : null;

    return (
      <div className="space-y-6">
        {training.video_url && (
          <div className="space-y-2">
            <h2 className="font-semibold">Video</h2>
            {ytId ? (
              <div className="aspect-video max-w-2xl rounded-lg overflow-hidden border">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  className="w-full h-full"
                  allowFullScreen
                  title="Video de capacitación"
                />
              </div>
            ) : (
              <a
                href={training.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Ver video →
              </a>
            )}
          </div>
        )}

        {training.contenido_texto && (
          <div className="space-y-2">
            <h2 className="font-semibold">Material de estudio</h2>
            <div className="prose prose-sm max-w-none bg-muted/40 rounded-lg p-4 whitespace-pre-wrap text-sm">
              {training.contenido_texto}
            </div>
          </div>
        )}

        {!training.video_url && !training.contenido_texto && (
          <p className="text-muted-foreground">No hay material adjunto para esta capacitación.</p>
        )}

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-3">
            La evaluación tiene un tiempo límite de{" "}
            <strong>{training.tiempo_limite_minutos ?? 60} minutos</strong>. Una vez iniciada, no
            podrás volver al material de estudio.
          </p>
          {error && (
            <Alert variant="destructive" className="mb-3">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handleStartEval} disabled={isPending}>
            {isPending ? "Iniciando…" : "Comenzar Evaluación"}
          </Button>
        </div>
      </div>
    );
  }

  // ── Completed phase ─────────────────────────────────────────────────────────
  if (phase === "completed") {
    const s = session ?? latestSession;
    return (
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant={s?.estado === "CALIFICADA" ? "success" : "warning"}>
              {s?.estado === "CALIFICADA"
                ? "Calificada"
                : "Enviada — pendiente de calificación"}
            </Badge>
            {s?.puntaje_final != null && (
              <span className="font-semibold text-green-700">{s.puntaje_final}%</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {s?.estado === "CALIFICADA"
              ? "Tu evaluación ha sido calificada. Puedes ver la evidencia completa a continuación."
              : "Tu evaluación fue enviada correctamente. El administrador la revisará y publicará tu nota final."}
          </p>
          {s?.observaciones && (
            <p className="text-sm">
              <strong>Observaciones:</strong> {s.observaciones}
            </p>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/capacitaciones/evidencia/${assignment.id}`}>Ver evidencia</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Evaluation phase ────────────────────────────────────────────────────────
  const isUrgent = timeLeft !== null && timeLeft < 5 * 60 * 1000;

  return (
    <div className="space-y-6">
      {/* Timer */}
      <div
        className={`flex items-center justify-between p-3 rounded-lg border ${
          isUrgent ? "border-red-400 bg-red-50 dark:bg-red-950/30" : "bg-muted/40"
        }`}
      >
        <span className="text-sm font-medium">Tiempo restante</span>
        <span
          className={`text-lg font-mono font-bold tabular-nums ${
            isUrgent ? "text-red-600" : ""
          }`}
        >
          {timeLeft !== null ? formatMs(timeLeft) : "—"}
        </span>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q: any, idx: number) => {
          const resp = responses[q.id] ?? {};

          if (q.tipo === "SELECCION_MULTIPLE") {
            const options: any[] = q.training_question_options ?? [];
            return (
              <Card key={q.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {idx + 1}. {resolveText(q.pregunta)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={resp.opcion_id?.toString() ?? ""}
                    onValueChange={(v) =>
                      setResponse(q.id, { opcion_id: Number(v) })
                    }
                  >
                    {options
                      .sort((a: any, b: any) => a.orden - b.orden)
                      .map((opt: any) => (
                        <div key={opt.id} className="flex items-start gap-2 py-1">
                          <RadioGroupItem
                            value={opt.id.toString()}
                            id={`opt-${opt.id}`}
                            className="mt-0.5"
                          />
                          <Label htmlFor={`opt-${opt.id}`} className="font-normal cursor-pointer">
                            {opt.texto}
                          </Label>
                        </div>
                      ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {idx + 1}. {resolveText(q.pregunta)}
                  {q.tipo === "JUSTIFICACION" && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (Justificación personal)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  placeholder="Escribe tu respuesta aquí…"
                  value={resp.respuesta_texto ?? ""}
                  onChange={(e) =>
                    setResponse(q.id, { respuesta_texto: e.target.value })
                  }
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="border-t pt-4 flex items-center gap-4">
        <Button onClick={doSubmit} disabled={isPending || submittedRef.current}>
          {isPending ? "Enviando…" : "Enviar evaluación"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Una vez enviada no podrás modificar tus respuestas.
        </p>
      </div>
    </div>
  );
}
