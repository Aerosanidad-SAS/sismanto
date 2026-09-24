"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TICKET_PRIORIDADES } from "@/lib/validations";
import type { TicketHistorialRow } from "@/app/api/actions/tickets";
import {
  cambiarEstadoTicket,
  cambiarPrioridadTicket,
  registrarContactoTicket,
  tomarTicket,
  type TicketGestionRow,
} from "@/app/api/actions/tickets-gestion";
import { ETIQUETA_ESTADO, ETIQUETA_EVENTO, ETIQUETA_PRIORIDAD, fechaHora, variantePrioridad, varianteEstado } from "@/components/soporte/etiquetas";

interface Props {
  ticket: TicketGestionRow;
  historial: TicketHistorialRow[];
  urlAdjunto: string | null;
  miId: string;
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
      <p className="text-sm">{valor}</p>
    </div>
  );
}

export function DetalleTicketGestion({ ticket, historial, urlAdjunto, miId }: Props) {
  const router = useRouter();
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nota, setNota] = useState("");
  const [solucion, setSolucion] = useState("");

  const cerrado = ticket.estado === "CERRADO" || ticket.estado === "RESUELTO";
  const esMio = ticket.tecnico_id === miId;
  const sinTecnico = !ticket.tecnico_id;

  async function ejecutar(fn: () => Promise<{ error?: string; success?: true }>, alExito?: () => void) {
    setProcesando(true);
    setError(null);
    const r = await fn();
    setProcesando(false);
    if (r.error) {
      setError(r.error);
      return;
    }
    alExito?.();
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              <Badge variant={varianteEstado(ticket.estado)}>{ETIQUETA_ESTADO[ticket.estado] ?? ticket.estado}</Badge>
              <Badge variant={variantePrioridad(ticket.prioridad)}>{ETIQUETA_PRIORIDAD[ticket.prioridad] ?? ticket.prioridad}</Badge>
            </CardTitle>
            <CardDescription>
              {ticket.categoria} · {ticket.area} · {ticket.sede}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Dato etiqueta="Solicitante" valor={ticket.nombre_solicitante} />
              <Dato etiqueta="Celular de contacto" valor={ticket.celular_contacto} />
              <Dato etiqueta="Registrado por" valor={ticket.nombre_registrado_por ?? "El mismo solicitante"} />
              <Dato etiqueta="Creado" valor={fechaHora(ticket.created_at)} />
              <Dato etiqueta="Primer contacto" valor={fechaHora(ticket.fecha_primer_contacto)} />
              <Dato etiqueta="Cierre" valor={fechaHora(ticket.fecha_cierre)} />
              <Dato etiqueta="Técnico" valor={ticket.nombre_tecnico ?? "Sin asignar"} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Descripción</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{ticket.descripcion}</p>
            </div>
            {ticket.adjunto_path && (
              <div>
                <p className="text-xs text-muted-foreground">Adjunto</p>
                {urlAdjunto ? (
                  <a className="text-sm text-primary underline" href={urlAdjunto} target="_blank" rel="noopener noreferrer">
                    Abrir imagen
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">No se pudo generar el enlace.</span>
                )}
              </div>
            )}
            {ticket.solucion && (
              <div>
                <p className="text-xs text-muted-foreground">Solución</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{ticket.solucion}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial</CardTitle>
          </CardHeader>
          <CardContent>
            {historial.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin eventos.</p>
            ) : (
              <ul className="space-y-2">
                {historial.map((h) => (
                  <li key={h.id} className="rounded-md border p-2 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{ETIQUETA_EVENTO[h.tipo_evento] ?? h.tipo_evento}</span>
                      <span className="text-xs text-muted-foreground">{fechaHora(h.created_at)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {h.nombre_usuario}
                      {h.tipo_evento === "CAMBIO_PRIORIDAD"
                        ? ` · ${ETIQUETA_PRIORIDAD[h.estado_anterior ?? ""] ?? h.estado_anterior ?? "—"} → ${ETIQUETA_PRIORIDAD[h.estado_nuevo ?? ""] ?? h.estado_nuevo ?? "—"}`
                        : h.estado_anterior || h.estado_nuevo
                          ? ` · ${ETIQUETA_ESTADO[h.estado_anterior ?? ""] ?? h.estado_anterior ?? "—"} → ${ETIQUETA_ESTADO[h.estado_nuevo ?? ""] ?? h.estado_nuevo ?? "—"}`
                          : ""}
                    </p>
                    {h.nota && <p className="mt-1 whitespace-pre-wrap">{h.nota}</p>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
          <CardDescription>Los cambios de estado los hace el técnico que tomó el ticket.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!cerrado && sinTecnico && (
            <Button className="w-full" disabled={procesando} onClick={() => void ejecutar(() => tomarTicket(ticket.id))}>
              Tomar este ticket
            </Button>
          )}

          {!cerrado && (
            <div className="space-y-1">
              <Label>Prioridad</Label>
              <Select
                value={ticket.prioridad}
                onValueChange={(v) => void ejecutar(() => cambiarPrioridadTicket(ticket.id, v))}
                disabled={procesando}
              >
                <SelectTrigger>
                  <SelectValue />
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
          )}

          {!cerrado && esMio && (
            <>
              {!ticket.fecha_primer_contacto && (
                <div className="space-y-2">
                  <Label htmlFor="g-nota">Primer contacto con el solicitante</Label>
                  <Textarea id="g-nota" rows={3} maxLength={1000} placeholder="Nota (opcional)" value={nota} onChange={(e) => setNota(e.target.value)} />
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={procesando}
                    onClick={() => void ejecutar(() => registrarContactoTicket(ticket.id, nota), () => setNota(""))}
                  >
                    Registrar primer contacto
                  </Button>
                </div>
              )}

              {ticket.estado === "ABIERTO" && (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={procesando}
                  onClick={() => void ejecutar(() => cambiarEstadoTicket(ticket.id, "EN_PROCESO"))}
                >
                  Pasar a &quot;En proceso&quot;
                </Button>
              )}

              {ticket.estado === "EN_PROCESO" && (
                <div className="space-y-2">
                  <Label htmlFor="g-solucion">Solución aplicada *</Label>
                  <Textarea id="g-solucion" rows={4} maxLength={5000} value={solucion} onChange={(e) => setSolucion(e.target.value)} />
                  <Button
                    className="w-full"
                    disabled={procesando || solucion.trim() === ""}
                    onClick={() => void ejecutar(() => cambiarEstadoTicket(ticket.id, "RESUELTO", solucion))}
                  >
                    Resolver y cerrar
                  </Button>
                </div>
              )}
            </>
          )}

          {!cerrado && !sinTecnico && !esMio && (
            <p className="text-sm text-muted-foreground">Lo atiende {ticket.nombre_tecnico}. Solo esa persona puede cambiar su estado.</p>
          )}
          {cerrado && <p className="text-sm text-muted-foreground">Ticket cerrado. Solo el solicitante puede reabrirlo.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
