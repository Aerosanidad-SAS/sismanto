"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ticketSchema, TICKET_ESTADOS, TICKET_PRIORIDADES, type TicketFormData } from "@/lib/validations";
import {
  crearTicket,
  getHistorialTicket,
  getUrlAdjuntoTicket,
  reabrirTicket,
  type CatalogosTickets,
  type TicketHistorialRow,
  type TicketRow,
} from "@/app/api/actions/tickets";

const ETIQUETA_ESTADO: Record<string, string> = {
  ABIERTO: "Abierto",
  EN_PROCESO: "En proceso",
  RESUELTO: "Resuelto",
  CERRADO: "Cerrado",
};
const ETIQUETA_PRIORIDAD: Record<string, string> = { BAJA: "Baja", MEDIA: "Media", ALTA: "Alta", URGENTE: "Urgente" };
const ETIQUETA_EVENTO: Record<string, string> = {
  CREACION: "Ticket creado",
  ASIGNACION: "Tomado por un técnico",
  CONTACTO: "Primer contacto",
  CAMBIO_ESTADO: "Cambio de estado",
  CAMBIO_PRIORIDAD: "Cambio de prioridad",
  CIERRE_CONFIRMADO: "Cierre",
  REAPERTURA: "Ticket reabierto",
};

function varianteEstado(estado: string) {
  if (estado === "CERRADO") return "success" as const;
  if (estado === "EN_PROCESO") return "warning" as const;
  if (estado === "RESUELTO") return "secondary" as const;
  return "default" as const;
}
function variantePrioridad(prioridad: string) {
  if (prioridad === "URGENTE") return "destructive" as const;
  if (prioridad === "ALTA") return "warning" as const;
  if (prioridad === "MEDIA") return "secondary" as const;
  return "outline" as const;
}

// La operación es en Colombia y el navegador puede estar en otra zona: se muestra siempre hora de Bogotá.
function fechaHora(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short", timeZone: "America/Bogota" }).format(new Date(iso));
}

interface MisTicketsProps {
  tickets: TicketRow[];
  catalogos: CatalogosTickets;
}

export function MisTickets({ tickets, catalogos }: MisTicketsProps) {
  const router = useRouter();
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const [adjunto, setAdjunto] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [reabriendo, setReabriendo] = useState<TicketRow | null>(null);
  const [notaReapertura, setNotaReapertura] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [errorReapertura, setErrorReapertura] = useState<string | null>(null);

  const [detalle, setDetalle] = useState<TicketRow | null>(null);
  const [historial, setHistorial] = useState<TicketHistorialRow[] | null>(null);
  const [urlAdjunto, setUrlAdjunto] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { prioridad: "MEDIA" },
  });
  const sede = watch("sede");
  const area = watch("area");
  const categoria = watch("categoria");
  const prioridad = watch("prioridad");

  const catalogosCompletos = catalogos.sedes.length > 0 && catalogos.areas.length > 0 && catalogos.categorias.length > 0;
  const faltantes = [
    catalogos.areas.length === 0 ? "áreas" : null,
    catalogos.categorias.length === 0 ? "categorías" : null,
    catalogos.sedes.length === 0 ? "sedes" : null,
  ].filter(Boolean);

  const visibles = useMemo(
    () => (filtroEstado === "TODOS" ? tickets : tickets.filter((t) => t.estado === filtroEstado)),
    [tickets, filtroEstado]
  );

  function abrirNuevo() {
    reset({ prioridad: "MEDIA", sede: "", area: "", categoria: "", celular: "", asunto: "", descripcion: "" });
    setAdjunto(null);
    setError(null);
    setNuevoAbierto(true);
  }

  async function onSubmit(datos: TicketFormData) {
    setGuardando(true);
    setError(null);
    const formData = new FormData();
    Object.entries(datos).forEach(([clave, valor]) => formData.append(clave, String(valor ?? "")));
    if (adjunto) formData.append("adjunto", adjunto);

    const resultado = await crearTicket(formData);
    setGuardando(false);
    if ("error" in resultado && resultado.error) {
      setError(resultado.error);
      return;
    }
    setNuevoAbierto(false);
    setAviso(`Ticket #${"id" in resultado ? resultado.id : ""} registrado correctamente.`);
    router.refresh();
  }

  async function confirmarReapertura() {
    if (!reabriendo) return;
    setProcesando(true);
    setErrorReapertura(null);
    const resultado = await reabrirTicket(reabriendo.id, notaReapertura);
    setProcesando(false);
    if ("error" in resultado && resultado.error) {
      setErrorReapertura(resultado.error);
      return;
    }
    setReabriendo(null);
    setNotaReapertura("");
    setAviso("Ticket reabierto: el técnico lo verá de nuevo en proceso.");
    router.refresh();
  }

  async function abrirDetalle(ticket: TicketRow) {
    setDetalle(ticket);
    setHistorial(null);
    setUrlAdjunto(null);
    const [filas, url] = await Promise.all([
      getHistorialTicket(ticket.id),
      ticket.adjunto_path ? getUrlAdjuntoTicket(ticket.adjunto_path) : Promise.resolve(null),
    ]);
    setHistorial(filas);
    setUrlAdjunto(url);
  }

  return (
    <div className="space-y-4">
      {aviso && (
        <Alert>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{aviso}</span>
            <button type="button" className="text-xs underline" onClick={() => setAviso(null)}>
              Cerrar
            </button>
          </AlertDescription>
        </Alert>
      )}

      {!catalogosCompletos && (
        <Alert>
          <AlertDescription>
            Falta configurar {faltantes.join(", ")} antes de poder registrar tickets. Avísale a un administrador.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos los estados</SelectItem>
            {TICKET_ESTADOS.map((e) => (
              <SelectItem key={e} value={e}>
                {ETIQUETA_ESTADO[e]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{visibles.length} ticket(s)</span>
        <Button className="ml-auto" onClick={abrirNuevo} disabled={!catalogosCompletos}>
          Nuevo ticket
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Sede</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                  {tickets.length === 0 ? "Todavía no has registrado tickets." : "No hay tickets con ese estado."}
                </TableCell>
              </TableRow>
            ) : (
              visibles.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.id}</TableCell>
                  <TableCell>
                    <Badge variant={varianteEstado(t.estado)}>{ETIQUETA_ESTADO[t.estado] ?? t.estado}</Badge>
                  </TableCell>
                  <TableCell>{t.categoria}</TableCell>
                  <TableCell>
                    <Badge variant={variantePrioridad(t.prioridad)}>{ETIQUETA_PRIORIDAD[t.prioridad] ?? t.prioridad}</Badge>
                  </TableCell>
                  <TableCell>{t.area}</TableCell>
                  <TableCell>{t.sede}</TableCell>
                  <TableCell className="max-w-xs truncate" title={t.asunto}>
                    {t.asunto}
                  </TableCell>
                  <TableCell>{t.nombre_tecnico ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{fechaHora(t.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => void abrirDetalle(t)}>
                        Ver
                      </Button>
                      {t.estado === "CERRADO" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReabriendo(t);
                            setNotaReapertura("");
                            setErrorReapertura(null);
                          }}
                        >
                          Reabrir
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Nuevo ticket */}
      <Dialog open={nuevoAbierto} onOpenChange={setNuevoAbierto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo ticket de soporte técnico</DialogTitle>
            <DialogDescription>Cuéntanos qué necesitas; te avisaremos cuando alguien lo tome.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Sede *</Label>
                <Select value={sede ?? ""} onValueChange={(v) => setValue("sede", v, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogos.sedes.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formState.errors.sede && <p className="text-xs text-destructive">{formState.errors.sede.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Área que solicita el soporte *</Label>
                <Select value={area ?? ""} onValueChange={(v) => setValue("area", v, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogos.areas.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formState.errors.area && <p className="text-xs text-destructive">{formState.errors.area.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Categoría *</Label>
                <Select value={categoria ?? ""} onValueChange={(v) => setValue("categoria", v, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogos.categorias.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formState.errors.categoria && <p className="text-xs text-destructive">{formState.errors.categoria.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Prioridad *</Label>
                <Select
                  value={prioridad ?? ""}
                  onValueChange={(v) => setValue("prioridad", v as (typeof TICKET_PRIORIDADES)[number], { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_PRIORIDADES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {ETIQUETA_PRIORIDAD[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="ticket-celular">Celular de contacto *</Label>
                <Input id="ticket-celular" inputMode="tel" maxLength={20} placeholder="Número donde te podemos contactar" {...register("celular")} />
                {formState.errors.celular && <p className="text-xs text-destructive">{formState.errors.celular.message}</p>}
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="ticket-asunto">Asunto *</Label>
                <Input id="ticket-asunto" maxLength={150} {...register("asunto")} />
                {formState.errors.asunto && <p className="text-xs text-destructive">{formState.errors.asunto.message}</p>}
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="ticket-descripcion">Descripción *</Label>
                <Textarea id="ticket-descripcion" rows={5} {...register("descripcion")} />
                {formState.errors.descripcion && <p className="text-xs text-destructive">{formState.errors.descripcion.message}</p>}
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="ticket-adjunto">Adjuntar imagen (opcional, JPG o PNG, máx. 5 MB)</Label>
                <Input
                  id="ticket-adjunto"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setAdjunto(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNuevoAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? "Registrando…" : "Registrar ticket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reabrir */}
      <Dialog open={!!reabriendo} onOpenChange={(abierto) => !abierto && setReabriendo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reabrir ticket #{reabriendo?.id}</DialogTitle>
            <DialogDescription>
              Si no estás de acuerdo con la solución, cuéntanos por qué. El ticket vuelve a &quot;En proceso&quot; con el mismo técnico.
            </DialogDescription>
          </DialogHeader>
          {reabriendo?.solucion && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium">Solución registrada</p>
              <p className="mt-1 whitespace-pre-wrap">{reabriendo.solucion}</p>
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="ticket-nota">Motivo de la reapertura *</Label>
            <Textarea id="ticket-nota" rows={4} maxLength={1000} value={notaReapertura} onChange={(e) => setNotaReapertura(e.target.value)} />
          </div>
          {errorReapertura && <p className="text-sm text-destructive">{errorReapertura}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReabriendo(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void confirmarReapertura()} disabled={procesando || notaReapertura.trim() === ""}>
              {procesando ? "Reabriendo…" : "Reabrir ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detalle e historial */}
      <Dialog open={!!detalle} onOpenChange={(abierto) => !abierto && setDetalle(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Ticket #{detalle?.id} — {detalle?.asunto}
            </DialogTitle>
            <DialogDescription>
              {detalle?.categoria} · {detalle?.area} · {detalle?.sede}
            </DialogDescription>
          </DialogHeader>
          {detalle && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Descripción</p>
                <p className="mt-1 whitespace-pre-wrap">{detalle.descripcion}</p>
              </div>
              {detalle.adjunto_path && (
                <div>
                  <p className="font-medium">Adjunto</p>
                  {urlAdjunto ? (
                    <a className="text-primary underline" href={urlAdjunto} target="_blank" rel="noopener noreferrer">
                      Abrir imagen
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Cargando…</span>
                  )}
                </div>
              )}
              {detalle.solucion && (
                <div>
                  <p className="font-medium">Solución</p>
                  <p className="mt-1 whitespace-pre-wrap">{detalle.solucion}</p>
                </div>
              )}
              <div>
                <p className="font-medium">Historial</p>
                {historial === null ? (
                  <p className="text-muted-foreground">Cargando…</p>
                ) : historial.length === 0 ? (
                  <p className="text-muted-foreground">Sin eventos.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {historial.map((h) => (
                      <li key={h.id} className="rounded-md border p-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium">{ETIQUETA_EVENTO[h.tipo_evento] ?? h.tipo_evento}</span>
                          <span className="text-xs text-muted-foreground">{fechaHora(h.created_at)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {h.nombre_usuario}
                          {h.estado_anterior || h.estado_nuevo
                            ? ` · ${ETIQUETA_ESTADO[h.estado_anterior ?? ""] ?? h.estado_anterior ?? "—"} → ${ETIQUETA_ESTADO[h.estado_nuevo ?? ""] ?? h.estado_nuevo ?? "—"}`
                            : ""}
                        </p>
                        {h.nota && <p className="mt-1 whitespace-pre-wrap">{h.nota}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
