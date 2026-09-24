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
import { DateField } from "@/components/forms/date-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  guardarPregunta,
  eliminarPregunta,
  asignarCapacitacion,
  actualizarTraining,
} from "@/app/api/actions/capacitaciones";

interface Props {
  training: any;
  assignments: any[];
  ovems: any[];
}

// ── Add Question Dialog ───────────────────────────────────────────────────────
function AgregarPreguntaDialog({ trainingId, orden }: { trainingId: number; orden: number }) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<"SELECCION_MULTIPLE" | "RESPUESTA_ABIERTA" | "JUSTIFICACION">(
    "SELECCION_MULTIPLE"
  );
  const [opciones, setOpciones] = useState([
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const setOpcionTexto = (i: number, texto: string) =>
    setOpciones((prev) => prev.map((o, idx) => (idx === i ? { ...o, texto } : o)));

  const setOpcionCorrecta = (i: number) =>
    setOpciones((prev) => prev.map((o, idx) => ({ ...o, es_correcta: idx === i })));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const input: any = {
      training_id: trainingId,
      orden,
      tipo,
      pregunta: fd.get("pregunta") as string,
      puntaje: Number(fd.get("puntaje") ?? 1),
    };
    if (tipo === "SELECCION_MULTIPLE") {
      input.opciones = opciones.map((o, i) => ({
        orden: i + 1,
        texto: o.texto,
        es_correcta: o.es_correcta,
      }));
    }
    startTransition(async () => {
      const res = await guardarPregunta(input);
      if (res.error) { setError(res.error); return; }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          + Agregar pregunta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva pregunta #{orden}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(v) => setTipo(v as typeof tipo)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELECCION_MULTIPLE">Selección múltiple</SelectItem>
                  <SelectItem value="RESPUESTA_ABIERTA">Respuesta abierta</SelectItem>
                  <SelectItem value="JUSTIFICACION">Justificación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="puntaje">Puntaje</Label>
              <Input id="puntaje" name="puntaje" type="number" min={1} max={10} defaultValue={1} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="pregunta">Pregunta *</Label>
            <Textarea
              id="pregunta"
              name="pregunta"
              required
              rows={3}
              placeholder={
                tipo === "JUSTIFICACION"
                  ? "Escribe la pregunta. Usa {nombre}, {placa_asignada}, {fecha_hoy} como marcadores personales."
                  : "Texto de la pregunta…"
              }
            />
            {tipo === "JUSTIFICACION" && (
              <p className="text-xs text-muted-foreground">
                Marcadores disponibles: <code>{"{nombre}"}</code>,{" "}
                <code>{"{placa_asignada}"}</code>, <code>{"{fecha_hoy}"}</code>
              </p>
            )}
          </div>

          {tipo === "SELECCION_MULTIPLE" && (
            <div className="space-y-2">
              <Label>Opciones (marca la correcta)</Label>
              {opciones.map((o, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Checkbox
                    checked={o.es_correcta}
                    onCheckedChange={() => setOpcionCorrecta(i)}
                    title="Marcar como correcta"
                  />
                  <Input
                    value={o.texto}
                    onChange={(e) => setOpcionTexto(i, e.target.value)}
                    placeholder={`Opción ${i + 1}`}
                    required
                  />
                </div>
              ))}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar pregunta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Assign Dialog ─────────────────────────────────────────────────────────────
function AsignarDialog({
  trainingId,
  ovems,
  alreadyAssigned,
}: {
  trainingId: number;
  ovems: any[];
  alreadyAssigned: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [fechaLimite, setFechaLimite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const available = ovems.filter((o) => !alreadyAssigned.includes(o.user_id));

  const toggle = (uid: string) =>
    setSelected((prev) =>
      prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]
    );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected.length) { setError("Selecciona al menos un OVEM"); return; }
    setError(null);
    startTransition(async () => {
      const res = await asignarCapacitacion({
        training_id: trainingId,
        user_ids: selected,
        fecha_limite: fechaLimite || null,
      });
      if (res.error) { setError(res.error); return; }
      setOpen(false);
      setSelected([]);
      setFechaLimite("");
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Asignar OVEM</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar capacitación</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="fecha_limite">Fecha límite (opcional)</Label>
            <DateField id="fecha_limite" value={fechaLimite} onChange={setFechaLimite} />
          </div>
          <div className="space-y-2">
            <Label>Seleccionar OVEM</Label>
            {available.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todos los OVEM ya están asignados.</p>
            ) : (
              <div className="max-h-52 overflow-y-auto space-y-1 border rounded p-2">
                {available.map((o) => (
                  <div key={o.user_id} className="flex items-center gap-2 py-0.5">
                    <Checkbox
                      id={`ovem-${o.user_id}`}
                      checked={selected.includes(o.user_id)}
                      onCheckedChange={() => toggle(o.user_id)}
                    />
                    <Label htmlFor={`ovem-${o.user_id}`} className="font-normal cursor-pointer">
                      {o.nombre_completo ?? o.email}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || available.length === 0}>
              {isPending ? "Asignando…" : `Asignar (${selected.length})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function TrainingDetailAdmin({ training, assignments, ovems }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const router = useRouter();
  const questions: any[] = training.questions ?? [];

  const alreadyAssigned = assignments.map((a: any) => a.user_id as string);

  const handleEliminarPregunta = (id: number) => {
    startTransition(async () => {
      await eliminarPregunta(id);
      router.refresh();
    });
  };

  const handleSaveTraining = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveMsg(null);
    const fd = new FormData(e.currentTarget);
    const mesRaw = fd.get("mes_ciclo") as string;
    const input = {
      titulo: fd.get("titulo") as string,
      descripcion: (fd.get("descripcion") as string) || null,
      video_url: (fd.get("video_url") as string) || null,
      contenido_texto: (fd.get("contenido_texto") as string) || null,
      mes_ciclo: mesRaw ? Number(mesRaw) : null,
      tiempo_limite_minutos: Number(fd.get("tiempo_limite_minutos") ?? 60),
    };
    startTransition(async () => {
      const res = await actualizarTraining(training.id, input);
      if (res.error) { setSaveMsg(`Error: ${res.error}`); return; }
      setSaveMsg("Guardado");
      router.refresh();
    });
  };

  return (
    <Tabs defaultValue="info">
      <TabsList className="mb-4">
        <TabsTrigger value="info">Información</TabsTrigger>
        <TabsTrigger value="preguntas">
          Preguntas{" "}
          <Badge variant="secondary" className="ml-2">
            {questions.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="asignaciones">
          Asignaciones{" "}
          <Badge variant="secondary" className="ml-2">
            {assignments.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      {/* ── Info tab ── */}
      <TabsContent value="info">
        <Card>
          <CardHeader>
            <CardTitle>Editar capacitación</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveTraining} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  required
                  defaultValue={training.titulo}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  rows={2}
                  defaultValue={training.descripcion ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="video_url">URL de video</Label>
                <Input
                  id="video_url"
                  name="video_url"
                  type="url"
                  defaultValue={training.video_url ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contenido_texto">Texto / Material de estudio</Label>
                <Textarea
                  id="contenido_texto"
                  name="contenido_texto"
                  rows={5}
                  defaultValue={training.contenido_texto ?? ""}
                />
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
                    defaultValue={training.mes_ciclo ?? ""}
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
                    defaultValue={training.tiempo_limite_minutos ?? 60}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? "Guardando…" : "Guardar cambios"}
                </Button>
                {saveMsg && (
                  <span className="text-sm text-muted-foreground">{saveMsg}</span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Questions tab ── */}
      <TabsContent value="preguntas">
        <div className="space-y-3">
          <div className="flex justify-end">
            <AgregarPreguntaDialog
              trainingId={training.id}
              orden={questions.length + 1}
            />
          </div>
          {!questions.length && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  No hay preguntas. Agrega al menos una para poder asignar esta
                  capacitación.
                </p>
              </CardContent>
            </Card>
          )}
          {questions.map((q: any, idx: number) => {
            const opts: any[] = q.training_question_options ?? [];
            return (
              <Card key={q.id}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {idx + 1}. {q.pregunta}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {q.tipo === "SELECCION_MULTIPLE"
                            ? "MC"
                            : q.tipo === "JUSTIFICACION"
                            ? "Justificación"
                            : "Abierta"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {q.puntaje} pt{q.puntaje !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {opts.length > 0 && (
                        <ul className="mt-2 space-y-0.5">
                          {opts
                            .sort((a: any, b: any) => a.orden - b.orden)
                            .map((o: any) => (
                              <li
                                key={o.id}
                                className={`text-xs pl-3 ${
                                  o.es_correcta
                                    ? "text-green-700 font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {o.orden}. {o.texto}
                                {o.es_correcta && " ✓"}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive flex-shrink-0"
                      onClick={() => handleEliminarPregunta(q.id)}
                      disabled={isPending}
                    >
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      {/* ── Assignments tab ── */}
      <TabsContent value="asignaciones">
        <div className="space-y-3">
          <div className="flex justify-end">
            <AsignarDialog
              trainingId={training.id}
              ovems={ovems}
              alreadyAssigned={alreadyAssigned}
            />
          </div>
          {!assignments.length && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  No hay asignaciones aún.
                </p>
              </CardContent>
            </Card>
          )}
          {assignments.map((a: any) => {
            const sessions: any[] = a.training_sessions ?? [];
            const latest = sessions[0] ?? null;
            const ovemName =
              a.user_profiles?.nombre_completo ?? a.user_profiles?.email ?? "—";
            const estado = latest?.estado ?? (a.completado ? "CALIFICADA" : null);

            return (
              <Card key={a.id}>
                <CardContent className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{ovemName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      {a.fecha_limite && (
                        <span>Límite: {formatDateShort(a.fecha_limite)}</span>
                      )}
                      {latest?.fecha_fin && (
                        <span>Enviada: {formatDateShort(latest.fecha_fin)}</span>
                      )}
                      {latest?.puntaje_final != null && (
                        <span className="text-green-700 font-medium">
                          {latest.puntaje_final}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {estado ? (
                      <Badge
                        variant={
                          estado === "CALIFICADA"
                            ? "success"
                            : estado === "COMPLETADA"
                            ? "warning"
                            : "default"
                        }
                      >
                        {estado === "CALIFICADA"
                          ? "Calificada"
                          : estado === "COMPLETADA"
                          ? "Enviada"
                          : "En curso"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Sin iniciar</Badge>
                    )}
                    {(latest?.estado === "COMPLETADA" || latest?.estado === "CALIFICADA") && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/capacitaciones/evidencia/${a.id}`}>Ver</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>
    </Tabs>
  );
}
