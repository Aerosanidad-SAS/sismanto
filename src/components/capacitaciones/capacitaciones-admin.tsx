"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDateShort } from "@/lib/utils";
import {
  crearTraining,
  calificarSesion,
  getSessionDetail,
} from "@/app/api/actions/capacitaciones";

interface Props {
  trainings: any[];
  pendingGrading: any[];
  isAdmin: boolean;
}

// ── New Training Dialog ───────────────────────────────────────────────────────
function NuevoTrainingDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const mesRaw = fd.get("mes_ciclo") as string;
    const limiteRaw = fd.get("tiempo_limite_minutos") as string;
    const input = {
      titulo: fd.get("titulo") as string,
      descripcion: (fd.get("descripcion") as string) || null,
      video_url: (fd.get("video_url") as string) || null,
      contenido_texto: (fd.get("contenido_texto") as string) || null,
      mes_ciclo: mesRaw ? Number(mesRaw) : null,
      tiempo_limite_minutos: limiteRaw ? Number(limiteRaw) : 60,
    };
    startTransition(async () => {
      const res = await crearTraining(input);
      if (res.error) { setError(res.error); return; }
      setOpen(false);
      router.push(`/capacitaciones/${res.data?.id}`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Nueva capacitación</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva capacitación</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" name="titulo" required minLength={3} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" rows={2} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="video_url">URL de video (YouTube u otro)</Label>
            <Input id="video_url" name="video_url" type="url" placeholder="https://…" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="contenido_texto">Texto / Material de estudio</Label>
            <Textarea id="contenido_texto" name="contenido_texto" rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="mes_ciclo">Mes ciclo (1–12)</Label>
              <Input
                id="mes_ciclo"
                name="mes_ciclo"
                type="number"
                min={1}
                max={12}
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tiempo_limite_minutos">Tiempo límite (min)</Label>
              <Input
                id="tiempo_limite_minutos"
                name="tiempo_limite_minutos"
                type="number"
                min={5}
                max={300}
                defaultValue={60}
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando…" : "Crear y agregar preguntas →"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Grading Dialog ────────────────────────────────────────────────────────────
function GradingDialog({ pending }: { pending: any }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const assignment = pending.training_assignments;
  const ovemName =
    assignment?.user_profiles?.nombre_completo ??
    assignment?.user_profiles?.email ??
    "OVEM";
  const trainingTitle = assignment?.trainings?.titulo ?? "Capacitación";

  const handleOpen = async (val: boolean) => {
    setOpen(val);
    if (val && !detail) {
      setLoadingDetail(true);
      const res = await getSessionDetail(pending.id);
      setDetail(res.data);
      setLoadingDetail(false);
    }
  };

  const handleGrade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const input = {
      session_id: pending.id,
      puntaje_final: Number(fd.get("puntaje_final")),
      observaciones: (fd.get("observaciones") as string) || null,
    };
    startTransition(async () => {
      const res = await calificarSesion(input);
      if (res.error) { setError(res.error); return; }
      setOpen(false);
      router.refresh();
    });
  };

  const openResponses: any[] =
    detail?.responses?.filter(
      (r: any) =>
        r.training_questions?.tipo === "RESPUESTA_ABIERTA" ||
        r.training_questions?.tipo === "JUSTIFICACION"
    ) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Calificar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Calificar — {ovemName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="text-sm space-y-1">
            <p>
              <strong>Capacitación:</strong> {trainingTitle}
            </p>
            <p>
              <strong>MC (auto):</strong> {pending.puntaje_mc ?? "—"}%
            </p>
            {pending.fecha_fin && (
              <p>
                <strong>Enviada:</strong> {formatDateShort(pending.fecha_fin)}
              </p>
            )}
          </div>

          {loadingDetail && (
            <p className="text-sm text-muted-foreground">Cargando respuestas…</p>
          )}

          {openResponses.length > 0 && (
            <div className="space-y-3">
              <p className="font-medium text-sm">Respuestas abiertas / justificación</p>
              {openResponses.map((r: any) => (
                <div key={r.id} className="border rounded p-3 space-y-1">
                  <p className="text-sm font-medium">
                    {r.training_questions?.orden}. {r.training_questions?.pregunta}
                  </p>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {r.respuesta_texto || "Sin respuesta"}
                  </p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleGrade} className="space-y-3 border-t pt-4">
            <div className="space-y-1">
              <Label htmlFor="puntaje_final">Nota final (0–100) *</Label>
              <Input
                id="puntaje_final"
                name="puntaje_final"
                type="number"
                min={0}
                max={100}
                step={0.5}
                required
                defaultValue={pending.puntaje_mc ?? ""}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea id="observaciones" name="observaciones" rows={3} />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando…" : "Publicar nota"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function CapacitacionesAdmin({ trainings, pendingGrading, isAdmin }: Props) {
  return (
    <Tabs defaultValue="cursos">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="cursos">Cursos</TabsTrigger>
          <TabsTrigger value="calificar">
            Por calificar
            {pendingGrading.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingGrading.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        {isAdmin && <NuevoTrainingDialog />}
      </div>

      <TabsContent value="cursos">
        {!trainings?.length ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">No hay capacitaciones creadas.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {trainings.map((t: any) => (
              <Card key={t.id} className="hover:bg-muted/30 transition-colors">
                <Link href={`/capacitaciones/${t.id}`} className="block">
                  <CardContent className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{t.titulo}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        {t.mes_ciclo && <span>Mes ciclo {t.mes_ciclo}</span>}
                        {t.tiempo_limite_minutos && (
                          <span>{t.tiempo_limite_minutos} min</span>
                        )}
                        {t.created_at && (
                          <span>Creada {formatDateShort(t.created_at)}</span>
                        )}
                      </div>
                    </div>
                    <Badge variant={t.activo ? "success" : "secondary"}>
                      {t.activo ? "Activa" : "Inactiva"}
                    </Badge>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="calificar">
        {!pendingGrading?.length ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                No hay evaluaciones pendientes de calificación.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {pendingGrading.map((p: any) => {
              const assignment = p.training_assignments;
              const ovemName =
                assignment?.user_profiles?.nombre_completo ??
                assignment?.user_profiles?.email ??
                "OVEM";
              return (
                <Card key={p.id}>
                  <CardContent className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {assignment?.trainings?.titulo ?? `Sesión #${p.id}`}
                      </p>
                      <div className="text-sm text-muted-foreground mt-0.5 space-x-3">
                        <span>{ovemName}</span>
                        {p.puntaje_mc != null && (
                          <span>MC: {p.puntaje_mc}%</span>
                        )}
                        {p.fecha_fin && (
                          <span>Enviada {formatDateShort(p.fecha_fin)}</span>
                        )}
                      </div>
                    </div>
                    <GradingDialog pending={p} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
