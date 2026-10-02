"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { marcarPasoServicio, cambiarEtapaServicio } from "@/app/api/actions/servicios-medicos";
import { estadoOperativo, pasosPorTipo, type CampoPasoServicio } from "@/lib/estado-servicio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle2, Circle } from "lucide-react";
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

/** Paso pendiente de confirmar: los que abren o cierran una etapa piden un segundo toque. */
interface Confirmacion {
  servicioId: number;
  clave: string;
}

const MENSAJE_SIN_CONEXION =
  "No se pudo registrar: revisa tu señal e inténtalo de nuevo. Si el botón sigue disponible, el paso no quedó guardado.";

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
  /** El error vive pegado a la tarjeta que falló, no arriba de la lista (fuera de pantalla en el celular). */
  const [error, setError] = useState<{ servicioId: number; mensaje: string } | null>(null);
  const [confirmar, setConfirmar] = useState<Confirmacion | null>(null);

  const activos = servicios.filter((s) => s.etapa === "PROGRAMADO" || s.etapa === "CURSO");

  /** Ejecuta la acción de servidor; si la red falla (lanza) o el servidor responde error, deja el aviso en la tarjeta. */
  const ejecutar = async (s: ServicioAsignado, accion: () => Promise<{ error?: string } | undefined>) => {
    setLoadingId(s.id);
    setError(null);
    setConfirmar(null);
    try {
      const result = await accion();
      if (result?.error) setError({ servicioId: s.id, mensaje: result.error });
      else router.refresh();
    } catch {
      setError({ servicioId: s.id, mensaje: MENSAJE_SIN_CONEXION });
    } finally {
      setLoadingId(null);
    }
  };

  const avanzarPaso = (s: ServicioAsignado, campo: CampoPasoServicio, etapaNueva?: string) =>
    ejecutar(s, () => marcarPasoServicio(s.id, s.etapa, campo, etapaNueva));

  const avanzarEtapa = (s: ServicioAsignado, etapaNueva: string) =>
    ejecutar(s, () => cambiarEtapaServicio(s.id, s.etapa, etapaNueva));

  if (activos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No tienes servicios asignados en este momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  /**
   * Botón principal de la tarjeta. Los pasos que cambian la etapa del servicio (iniciar o finalizar) piden
   * confirmación en el mismo lugar: la acción de servidor no tiene «deshacer», así que se previene antes.
   */
  const boton = (s: ServicioAsignado, clave: string, texto: string, pideConfirmar: boolean, accion: () => void) => {
    const ocupado = loadingId === s.id;
    const enConfirmacion = confirmar?.servicioId === s.id && confirmar.clave === clave;
    if (pideConfirmar && enConfirmacion) {
      return (
        <div className="space-y-2" role="group" aria-label={`Confirmar: ${texto}`}>
          <p className="text-sm font-medium text-foreground">¿Confirmas «{texto}»? Queda registrada la hora actual.</p>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" className="h-auto py-4 text-base" disabled={ocupado} onClick={accion}>
              {ocupado ? "Guardando..." : "Sí, registrar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto py-4 text-base"
              disabled={ocupado}
              onClick={() => setConfirmar(null)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      );
    }
    return (
      <Button
        className="h-auto w-full py-4 text-lg font-semibold"
        disabled={ocupado}
        onClick={() => (pideConfirmar ? setConfirmar({ servicioId: s.id, clave }) : accion())}
      >
        {ocupado ? "Guardando..." : texto}
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      {activos.map((s) => {
        const pasos = pasosPorTipo(s.tipo_servicio);
        const estado = estadoOperativo(s);
        const completados = pasos.filter((p) => s[p.campo]).length;
        const siguientePaso = pasos.find((p) => !s[p.campo]);
        const errorDeEsta = error?.servicioId === s.id ? error.mensaje : null;

        return (
          <Card key={s.id}>
            <CardHeader className="space-y-3 pb-3">
              {/* Progreso del servicio: solo la etapa actual lleva nombre; las
                  demás son puntos, para que quepa en la pantalla del celular.
                  La lista de hitos de abajo es la que comunica el detalle. */}
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
                            aria-hidden="true"
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
                  <ul className="space-y-1 text-sm">
                    {pasos.map((p) => {
                      const valor = s[p.campo] as string | null;
                      return (
                        <li
                          key={p.campo}
                          className={cn("flex items-center gap-2", valor ? "text-success" : "text-muted-foreground")}
                        >
                          {valor ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0" aria-hidden="true" />
                          )}
                          <span>
                            {p.hito}
                            {valor && ` — ${horaCorta(valor)}`}
                            <span className="sr-only">{valor ? " (hecho)" : " (pendiente)"}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  {siguientePaso ? (
                    boton(
                      s,
                      siguientePaso.campo,
                      siguientePaso.accion,
                      Boolean(siguientePaso.etapaDestino),
                      () => avanzarPaso(s, siguientePaso.campo, siguientePaso.etapaDestino)
                    )
                  ) : (
                    <p className="text-sm text-success flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Todos los pasos registrados
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  {s.etapa === "PROGRAMADO" &&
                    boton(s, "iniciar", "Iniciar atención", true, () => avanzarEtapa(s, "CURSO"))}
                  {s.etapa === "CURSO" &&
                    boton(s, "finalizar", "Finalizar atención", true, () => avanzarEtapa(s, "FINALIZADO"))}
                </div>
              )}

              {errorDeEsta && (
                <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {errorDeEsta}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
