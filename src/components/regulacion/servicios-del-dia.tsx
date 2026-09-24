"use client";

import { useState } from "react";
import Link from "next/link";
import {
  estadoOperativo,
  minutosDeRetraso,
  modalidadTraslado,
  type ServicioParaEstado,
  type TonoEstado,
} from "@/lib/estado-servicio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpTrigger } from "@/components/ui/help-trigger";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ServicioDelDia extends ServicioParaEstado {
  id: number;
  nombre_completo: string | null;
  fecha_hora_registro: string | null;
  ciudad_origen: string | null;
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

const VARIANTE_POR_TONO: Record<TonoEstado, BadgeProps["variant"]> = {
  pendiente: "warning",
  asignado: "outline",
  en_curso: "default",
  finalizado: "success",
  cerrado: "secondary",
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

type Filtro = "abiertos" | "todos";

export function ServiciosDelDia({ servicios }: { servicios: ServicioDelDia[] }) {
  const [filtro, setFiltro] = useState<Filtro>("abiertos");
  const ahora = Date.now();

  // Se recalcula en cada render: el tablero se refresca cada 30 s y el
  // retraso depende de la hora actual.
  const filas = servicios.map((s) => ({
    s,
    estado: estadoOperativo(s),
    retraso: minutosDeRetraso(s, ahora),
  }));

  const conteo = {
    sinAsignar: filas.filter((f) => f.estado.tono === "pendiente").length,
    asignados: filas.filter((f) => f.estado.tono === "asignado").length,
    enCurso: filas.filter((f) => f.estado.tono === "en_curso").length,
    retrasados: filas.filter((f) => f.retraso !== null).length,
    finalizados: filas.filter((f) => f.estado.tono === "finalizado").length,
    cerrados: filas.filter((f) => f.estado.tono === "cerrado").length,
  };

  const visibles = filtro === "abiertos" ? filas.filter((f) => f.estado.activo) : filas;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2">
          Servicios del día
          <HelpTrigger text="Servicios abiertos de cualquier fecha y los programados o registrados hoy. El estado lo actualiza la tripulación desde Mis servicios; en rojo, los que ya pasaron su hora de recogida sin llegar al sitio." />
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border p-0.5 text-sm">
            {(["abiertos", "todos"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                className={cn(
                  "rounded px-3 py-1",
                  filtro === f ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {f === "abiertos" ? "Abiertos" : "Todos hoy"}
              </button>
            ))}
          </div>
          <Button asChild size="sm">
            <Link href="/servicios">
              <Plus className="mr-1 h-4 w-4" />
              Nuevo servicio
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Contador etiqueta="Sin asignar" valor={conteo.sinAsignar} resaltar={conteo.sinAsignar > 0} tono="warning" />
          <Contador etiqueta="Asignados" valor={conteo.asignados} />
          <Contador etiqueta="En curso" valor={conteo.enCurso} />
          <Contador etiqueta="Retrasados" valor={conteo.retrasados} resaltar={conteo.retrasados > 0} tono="destructive" />
          <Contador etiqueta="Finalizados" valor={conteo.finalizados} />
          <Contador etiqueta="Cancelados / fallidos" valor={conteo.cerrados} />
        </div>

        {visibles.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {filtro === "abiertos" ? "No hay servicios abiertos." : "No hay servicios hoy."}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recogida</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibles.map(({ s, estado, retraso }) => {
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

                return (
                  <TableRow key={s.id} className={cn(retraso !== null && "bg-destructive/5")}>
                    <TableCell className="whitespace-nowrap align-top">
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
                    <TableCell className="max-w-[18rem] align-top text-sm">
                      {origen || destino ? (
                        <div className="space-y-0.5">
                          {origen && (
                            <p className="truncate" title={origen}>
                              Recoge: {origen}
                            </p>
                          )}
                          {intermedio && (
                            <p className="truncate" title={intermedio}>
                              Intermedio: {intermedio}
                            </p>
                          )}
                          {destino && (
                            <p className="truncate" title={destino}>
                              {esTraslado ? "Entrega" : "Atención"}: {destino}
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
                        <Badge variant="warning">Sin asignar</Badge>
                      )}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant={VARIANTE_POR_TONO[estado.tono]}>{estado.etiqueta}</Badge>
                        {retraso !== null && (
                          <Badge variant="destructive" title="Minutos desde la hora de recogida sin llegar al sitio">
                            +{retraso} min
                          </Badge>
                        )}
                      </div>
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

function Contador({
  etiqueta,
  valor,
  resaltar = false,
  tono,
}: {
  etiqueta: string;
  valor: number;
  resaltar?: boolean;
  tono?: "warning" | "destructive";
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-2",
        resaltar && tono === "warning" && "border-amber-300 bg-amber-50",
        resaltar && tono === "destructive" && "border-destructive/40 bg-destructive/5"
      )}
    >
      <p className="text-2xl font-semibold tabular-nums">{valor}</p>
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
    </div>
  );
}
