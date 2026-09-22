"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { marcarPasoServicio, cambiarEtapaServicio } from "@/app/api/actions/servicios-medicos";
import { estadoOperativo, pasosPorTipo, type CampoPasoServicio } from "@/lib/estado-servicio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServicioAsignado {
  id: number;
  tipo_servicio: string;
  nombre_completo: string;
  etapa: string;
  ciudad_origen: string | null;
  direccion_origen: string | null;
  ciudad_intermedia?: string | null;
  direccion_intermedia?: string | null;
  ciudad_destino: string | null;
  direccion_destino: string | null;
  fecha_hora_inicio_desplazamiento: string | null;
  fecha_hora_llegada_origen: string | null;
  fecha_hora_salida_origen: string | null;
  fecha_hora_llegada_destino: string | null;
  fecha_hora_salida_destino: string | null;
  [key: string]: unknown;
}

interface MisServiciosProps {
  servicios: ServicioAsignado[];
}

function horaCorta(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Bogota",
  });
}

export function MisServicios({ servicios }: MisServiciosProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activos = servicios.filter((s) => s.etapa === "PROGRAMADO" || s.etapa === "CURSO");

  const avanzarPaso = async (s: ServicioAsignado, campo: CampoPasoServicio, etapaNueva?: string) => {
    setLoadingId(s.id);
    setError(null);
    const result = await marcarPasoServicio(s.id, s.etapa, campo, etapaNueva);
    if (result?.error) setError(result.error);
    else router.refresh();
    setLoadingId(null);
  };

  const avanzarEtapa = async (s: ServicioAsignado, etapaNueva: string) => {
    setLoadingId(s.id);
    setError(null);
    const result = await cambiarEtapaServicio(s.id, s.etapa, etapaNueva);
    if (result?.error) setError(result.error);
    else router.refresh();
    setLoadingId(null);
  };

  if (activos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No tiene servicios asignados en este momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
      )}
      {activos.map((s) => {
        const pasos = pasosPorTipo(s.tipo_servicio);
        const estado = estadoOperativo(s);
        const completados = pasos.filter((p) => s[p.campo]).length;
        const siguientePaso = pasos.find((p) => !s[p.campo]);
        const ocupado = loadingId === s.id;

        return (
          <Card key={s.id}>
            <CardHeader className="space-y-3 pb-3">
              {/* Progreso del servicio: solo la etapa actual lleva nombre; las
                  demás son puntos, para que quepa en la pantalla del celular. */}
              {pasos.length > 0 && (
                <div
                  className="flex items-center gap-1"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={pasos.length}
                  aria-valuenow={completados}
                  aria-label={`Paso ${completados} de ${pasos.length}: ${estado.etiqueta}`}
                >
                  {completados === 0 && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {estado.etiqueta}
                    </span>
                  )}
                  {pasos.map((p, i) => {
                    const hecho = i < completados;
                    const actual = i === completados - 1;
                    return (
                      <Fragment key={p.campo}>
                        {i > 0 && (
                          <span className={cn("h-0.5 flex-1", hecho ? "bg-primary" : "bg-muted")} />
                        )}
                        {actual ? (
                          <span className="shrink-0 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                            {p.estado}
                          </span>
                        ) : (
                          <span
                            title={p.estado}
                            className={cn(
                              "h-2.5 w-2.5 shrink-0 rounded-full",
                              hecho ? "bg-primary" : "bg-muted"
                            )}
                          />
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base">{s.tipo_servicio}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate">{s.nombre_completo}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(s.ciudad_origen || s.direccion_origen || s.ciudad_destino || s.direccion_destino) && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="space-y-0.5">
                    {(s.ciudad_origen || s.direccion_origen) && (
                      <p>
                        <span className="text-muted-foreground">Origen: </span>
                        {s.direccion_origen || s.ciudad_origen}
                      </p>
                    )}
                    {(s.ciudad_intermedia || s.direccion_intermedia) && (
                      <p>
                        <span className="text-muted-foreground">Punto intermedio: </span>
                        {s.direccion_intermedia || s.ciudad_intermedia}
                      </p>
                    )}
                    {(s.ciudad_destino || s.direccion_destino) && (
                      <p>
                        <span className="text-muted-foreground">Destino: </span>
                        {s.direccion_destino || s.ciudad_destino}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {pasos.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {pasos.map((p) => {
                      const valor = s[p.campo] as string | null;
                      return (
                        <span
                          key={p.campo}
                          className={cn(
                            "flex items-center gap-1",
                            valor ? "text-green-700" : "text-muted-foreground"
                          )}
                        >
                          {valor && <CheckCircle2 className="h-3 w-3" />}
                          {p.hito}
                          {valor && ` — ${horaCorta(valor)}`}
                        </span>
                      );
                    })}
                  </div>
                  {siguientePaso ? (
                    <Button
                      className="w-full h-auto py-4 text-base"
                      disabled={ocupado}
                      onClick={() => avanzarPaso(s, siguientePaso.campo, siguientePaso.etapaDestino)}
                    >
                      {ocupado ? "Guardando..." : siguientePaso.accion}
                    </Button>
                  ) : (
                    <p className="text-sm text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Todos los pasos registrados
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  {s.etapa === "PROGRAMADO" && (
                    <Button
                      className="w-full h-auto py-4 text-base"
                      disabled={ocupado}
                      onClick={() => avanzarEtapa(s, "CURSO")}
                    >
                      {ocupado ? "Guardando..." : "Iniciar atención"}
                    </Button>
                  )}
                  {s.etapa === "CURSO" && (
                    <Button
                      className="w-full h-auto py-4 text-base"
                      disabled={ocupado}
                      onClick={() => avanzarEtapa(s, "FINALIZADO")}
                    >
                      {ocupado ? "Guardando..." : "Finalizar atención"}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
