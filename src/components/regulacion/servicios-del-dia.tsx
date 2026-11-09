"use client";

import { useState } from "react";
import Link from "next/link";
import { modalidadTraslado, type ServicioParaEstado } from "@/lib/estado-servicio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpTrigger } from "@/components/ui/help-trigger";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { textoRetraso, VENTANA_ABIERTOS_DIAS } from "@/lib/servicios-abiertos";
import {
  clasificarServicio,
  coincideFiltro,
  contarServicios,
  FILTROS_SERVICIOS,
  ordenarServicios,
  rotulosDeCola,
  type EstadoSala,
  type FiltroServicios,
} from "@/lib/servicios-sala";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ban, CheckCircle2, CircleDashed, ClipboardCheck, Clock, Info, Truck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ServicioDelDia extends ServicioParaEstado {
  id: number;
  nombre_completo: string | null;
  fecha_hora_registro: string | null;
  ciudad_origen: string | null;
  ciudad_registro?: string | null;
  direccion_origen: string | null;
  ciudad_intermedia: string | null;
  direccion_intermedia: string | null;
  ciudad_destino: string | null;
  direccion_destino: string | null;
  placa: string | null;
  ovem_nombre: string | null;
  medico_nombre: string | null;
  auxiliar_nombre: string | null;
}

const ESTADO_UI: Record<EstadoSala, { tone: StatusTone; icon: LucideIcon; etiqueta: string }> = {
  sinasignar: { tone: "warning", icon: CircleDashed, etiqueta: "Sin asignar" },
  asignado: { tone: "neutral", icon: ClipboardCheck, etiqueta: "Asignado" },
  encurso: { tone: "info", icon: Truck, etiqueta: "En curso" },
  retrasado: { tone: "danger", icon: Clock, etiqueta: "Retrasado" },
  finalizado: { tone: "success", icon: CheckCircle2, etiqueta: "Finalizado" },
  cancelado: { tone: "neutral", icon: Ban, etiqueta: "Cancelado" },
};

const MODALIDAD: Record<string, string> = { SENCILLO: "Sencillo", DOBLE: "Doble", AEREO: "Aéreo" };

function hora(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  // 24 h: en la sala de control se comparan horas de un vistazo.
  return d.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Bogota",
  });
}

function lugar(direccion: string | null, ciudad: string | null): string | null {
  return direccion || ciudad || null;
}

export function ServiciosDelDia({ servicios, antiguosSinCerrar = 0 }: { servicios: ServicioDelDia[]; antiguosSinCerrar?: number }) {
  const [filtro, setFiltro] = useState<FiltroServicios>("abiertos");
  const ahora = Date.now();

  // Se recalcula en cada render: el tablero se refresca cada 30 s y el retraso depende de la hora actual.
  const todas = servicios.map((s) => ({ s, ...clasificarServicio(s, ahora), programadoPara: s.fecha_hora_programacion ?? null }));
  const conteo = contarServicios(todas.map((f) => f.estado));
  const rotulos = rotulosDeCola(todas.map((f) => ({ id: f.s.id, placa: f.s.placa, estado: f.estado, programadoPara: f.programadoPara })));
  const visibles = ordenarServicios(todas.filter((f) => coincideFiltro(f.estado, filtro)));

  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="flex items-center gap-2">
          Servicios del día
          <HelpTrigger text="Servicios abiertos de hoy y de los últimos 3 días, y los programados o registrados hoy. Los abiertos más antiguos se cuentan aparte: casi siempre son servicios que se hicieron y nunca se finalizaron. El estado lo actualiza la tripulación desde Mis servicios. Retrasado: ya pasó la hora de recogida y la tripulación no llegó al sitio. Los sin asignar y los retrasados van arriba." />
        </CardTitle>
        <p className="pt-1 text-sm text-muted-foreground">
          {conteo.todos === 0 ? "No hay servicios hoy." : `${conteo.todos} ${conteo.todos === 1 ? "servicio" : "servicios"} hoy. Los que requieren acción van arriba.`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {antiguosSinCerrar > 0 && (
          <div role="status" className="flex items-start gap-3 rounded-lg border border-info bg-info-soft px-4 py-3 text-sm text-info">
            <Info className="mt-0.5 h-[18px] w-[18px] shrink-0" aria-hidden />
            <span>
              Hay <strong>{antiguosSinCerrar}</strong> {antiguosSinCerrar === 1 ? "servicio abierto" : "servicios abiertos"} de hace más de 3 días que no se muestran aquí. Revísalos y ciérralos en{" "}
              {/* Lleva a Servicios ya filtrado por «Sin gestionar hace más de 3 días» (misma ventana que usa esta tabla). */}
              <Link href={`/servicios?sinGestionar=${VENTANA_ABIERTOS_DIAS}&sinGestionarUnidad=dia`} className="font-semibold underline">
                Servicios
              </Link>
              .
            </span>
          </div>
        )}

        <div role="group" aria-label="Filtrar servicios" className="flex flex-wrap gap-2">
          {FILTROS_SERVICIOS.map(({ clave, etiqueta }) => (
            <button
              key={clave}
              type="button"
              aria-pressed={filtro === clave}
              onClick={() => setFiltro(clave)}
              className={cn(
                "inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium",
                filtro === clave ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card hover:bg-muted"
              )}
            >
              {etiqueta}
              <span
                className={cn(
                  "min-w-[1.375rem] rounded-full px-1.5 text-center text-xs font-semibold leading-5 tabular-nums",
                  filtro === clave ? "bg-white/20" : "bg-muted"
                )}
              >
                {conteo[clave]}
              </span>
            </button>
          ))}
        </div>
        {/* El tablero se refresca solo: el resumen anuncia los cambios a lectores de pantalla. */}
        <p role="status" aria-live="polite" className="sr-only">
          {conteo.sinasignar} sin asignar, {conteo.retrasado} retrasados.
        </p>

        {visibles.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {filtro === "abiertos" ? "No hay servicios abiertos." : "Ningún servicio coincide con este filtro."}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recogida</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Acción</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibles.map(({ s, estado, etiqueta, retraso }) => {
                const ui = ESTADO_UI[estado];
                const modalidad = modalidadTraslado(s.tipo_servicio);
                // En domiciliaria y telemedicina no hay recogida: solo el sitio de atención.
                const esTraslado = modalidad !== null;
                const origen = esTraslado ? lugar(s.direccion_origen, s.ciudad_origen) : null;
                const intermedio = lugar(s.direccion_intermedia, s.ciudad_intermedia);
                const destino = lugar(s.direccion_destino, s.ciudad_destino);
                const tripulacion = [
                  s.ovem_nombre && `OVEM: ${s.ovem_nombre}`,
                  s.medico_nombre && `Médico: ${s.medico_nombre}`,
                  s.auxiliar_nombre && `Aux.: ${s.auxiliar_nombre}`,
                ].filter(Boolean) as string[];
                const sinAsignar = estado === "sinasignar";
                const subtitulo = [
                  estado === "encurso" || estado === "retrasado" ? etiqueta : null,
                  retraso !== null ? `Retraso: ${textoRetraso(retraso).replace(/^\+/, "")}` : null,
                  rotulos.get(s.id) ?? null,
                ].filter(Boolean) as string[];

                return (
                  <TableRow key={s.id} className={cn(estado === "retrasado" && "bg-destructive/5", sinAsignar && "bg-warning-soft")}>
                    <TableCell
                      className={cn(
                        "whitespace-nowrap align-top",
                        // Borde de color además del texto: la fila retrasada se ve de lejos.
                        estado === "retrasado" && "border-l-4 border-l-destructive"
                      )}
                    >
                      <p className="text-base font-semibold tabular-nums">{hora(s.fecha_hora_programacion)}</p>
                      <p className="text-xs text-muted-foreground">Recibido {hora(s.fecha_hora_registro)}</p>
                    </TableCell>
                    <TableCell className="align-top">
                      <p className="font-medium">{s.nombre_completo || "Sin nombre"}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.tipo_servicio}
                        {modalidad && ` · ${MODALIDAD[modalidad]}`}
                      </p>
                    </TableCell>
                    <TableCell className="min-w-[16rem] max-w-[24rem] align-top text-sm">
                      {origen || destino ? (
                        // Una línea por tramo: las direcciones completas largas (vereda, sector, clínica y sede) desbordaban la fila.
                        // El texto completo queda en `title` (al pasar el cursor).
                        <div className="space-y-0.5">
                          {origen && (
                            <p className="truncate" title={`Recoge: ${origen}`}>
                              <span className="text-muted-foreground">Recoge:</span> {origen}
                            </p>
                          )}
                          {intermedio && (
                            <p className="truncate" title={`Parada: ${intermedio}`}>
                              <span className="text-muted-foreground">Parada:</span> {intermedio}
                            </p>
                          )}
                          {destino && (
                            <p className="truncate" title={`${esTraslado ? "Entrega" : "Atiende"}: ${destino}`}>
                              <span className="text-muted-foreground">{esTraslado ? "Entrega:" : "Atiende:"}</span> {destino}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="align-top text-sm">
                      {s.placa || tripulacion.length > 0 ? (
                        <div className="space-y-0.5">
                          {s.placa && <p className="font-semibold">{s.placa}</p>}
                          {tripulacion.map((t) => (
                            <p key={t} className="text-xs text-muted-foreground">
                              {t}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sin vehículo</span>
                      )}
                    </TableCell>
                    <TableCell className="align-top">
                      <StatusBadge tone={ui.tone} icon={ui.icon}>
                        {estado === "cancelado" ? etiqueta : ui.etiqueta}
                      </StatusBadge>
                      {subtitulo.length > 0 && (
                        <p className={cn("mt-1 text-xs", retraso !== null ? "font-medium text-destructive" : "text-muted-foreground")}>
                          {subtitulo.join(" · ")}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right align-top">
                      {/* Sin asignar lleva a Servicios en edición (ahí se asigna el vehículo); el resto, al detalle. */}
                      {sinAsignar ? (
                        <Button asChild size="sm">
                          <Link href={`/servicios?numero=${s.id}&editar=1`} aria-label={`Asignar vehículo al servicio ${s.id}`}>
                            Asignar vehículo
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/servicios?numero=${s.id}`} aria-label={`Ver detalle del servicio ${s.id}`}>
                            Ver detalle
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
