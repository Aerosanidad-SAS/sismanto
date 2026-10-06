import Link from "next/link";
import { AlertTriangle, Ban, CheckCircle2, Circle, ClipboardX, ShieldAlert, Truck, type LucideIcon } from "lucide-react";
import type { TableroVehiculos } from "@/app/api/actions/tablero-vehiculos";
import {
  ETIQUETA_APTITUD,
  ETIQUETA_SEVERIDAD,
  formatearDuracion,
  horaCorta,
  requiereAtencion,
  type Aptitud,
  type FilaTablero,
} from "@/lib/aptitud-vehiculo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTrigger } from "@/components/ui/help-trigger";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const APTITUD_UI: Record<Aptitud, { tone: StatusTone; icon: LucideIcon }> = {
  NO_APTO: { tone: "danger", icon: Ban },
  NO_APTO_PENDIENTE_AVAL: { tone: "danger", icon: ShieldAlert },
  SIN_PREOPERACIONAL: { tone: "warning", icon: ClipboardX },
  APTO_CON_NOVEDADES: { tone: "warning", icon: AlertTriangle },
  APTO: { tone: "success", icon: CheckCircle2 },
};

function textoNovedades(f: FilaTablero): string | null {
  const { cantidad, severidadMaxima } = f.novedades;
  if (cantidad === 0) return null;
  const base = `${cantidad} ${cantidad === 1 ? "novedad abierta" : "novedades abiertas"}`;
  return severidadMaxima ? `${base} · severidad ${ETIQUETA_SEVERIDAD[severidadMaxima]}` : base;
}

/** Línea de explicación bajo el estado de aptitud (el estado ya dice qué es; esto dice por qué). */
function detalleAptitud(f: FilaTablero): string[] {
  const lineas: string[] = [];
  if (f.aptitud === "NO_APTO") lineas.push("Fuera de servicio");
  if (f.aptitud === "NO_APTO_PENDIENTE_AVAL") lineas.push(f.motivoSolicitud ? `Solicitud: ${f.motivoSolicitud}` : "Espera el aval de Coordinación o Mantenimiento");
  if (f.aptitud === "SIN_PREOPERACIONAL") lineas.push("Hoy no registra preoperacional");
  const novedades = textoNovedades(f);
  if (novedades) lineas.push(novedades);
  return lineas;
}

function Aptitud({ fila }: { fila: FilaTablero }) {
  const ui = APTITUD_UI[fila.aptitud];
  const detalle = detalleAptitud(fila);
  return (
    <div className="space-y-1">
      <StatusBadge tone={ui.tone} icon={ui.icon}>
        {ETIQUETA_APTITUD[fila.aptitud]}
      </StatusBadge>
      {detalle.map((l) => (
        <p key={l} className="line-clamp-2 text-xs text-muted-foreground">
          {l}
        </p>
      ))}
    </div>
  );
}

function Ocupacion({ fila }: { fila: FilaTablero }) {
  const { ocupacion } = fila;
  return ocupacion.estado === "EN_SERVICIO" ? (
    <StatusBadge tone="info" icon={Truck}>
      En servicio
    </StatusBadge>
  ) : (
    <StatusBadge tone="neutral" icon={Circle}>
      Libre
    </StatusBadge>
  );
}

function ServicioActual({ fila }: { fila: FilaTablero }) {
  const { servicioActual, serviciosEnCurso } = fila.ocupacion;
  if (!servicioActual) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="space-y-0.5 text-sm">
      <p className="font-medium">{servicioActual.tipoServicio}</p>
      <p className="tabular-nums">
        {servicioActual.hito ? `${servicioActual.hito} · ${horaCorta(servicioActual.hitoAt)}` : servicioActual.estado}
      </p>
      {servicioActual.minutosEnServicio !== null && (
        <p className="text-xs text-muted-foreground">Lleva {formatearDuracion(servicioActual.minutosEnServicio)}</p>
      )}
      {serviciosEnCurso > 1 && <p className="text-xs text-muted-foreground">+{serviciosEnCurso - 1} más en curso</p>}
    </div>
  );
}

function Proximo({ fila }: { fila: FilaTablero }) {
  const { proximo } = fila.ocupacion;
  if (!proximo) return <span className="text-sm text-muted-foreground">Sin servicios programados</span>;
  return (
    <div className="space-y-0.5 text-sm">
      <p className="tabular-nums">
        <span className="font-semibold">{horaCorta(proximo.programadoPara)}</span> · {proximo.tipoServicio}
      </p>
      {proximo.minutosDeRetraso !== null && (
        <p className="text-xs font-semibold text-destructive">Retrasado {formatearDuracion(proximo.minutosDeRetraso)}</p>
      )}
    </div>
  );
}

function Conductores({ fila }: { fila: FilaTablero }) {
  if (fila.conductores.length === 0) return <span className="text-sm text-muted-foreground">Sin conductor</span>;
  return (
    <div className="space-y-0.5 text-sm">
      {fila.conductores.map((c) => (
        <p key={c}>{c}</p>
      ))}
    </div>
  );
}

function Placa({ fila }: { fila: FilaTablero }) {
  return (
    <Link
      href={`/vehiculos/${fila.vehicleId}`}
      className="inline-flex min-h-9 items-center text-base font-semibold tabular-nums underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {fila.placa}
    </Link>
  );
}

/** Fondo y borde de la fila según urgencia; el estado también va en texto e ícono. */
function claseFila(a: Aptitud): string {
  if (a === "NO_APTO" || a === "NO_APTO_PENDIENTE_AVAL") return "bg-destructive/5";
  if (a === "SIN_PREOPERACIONAL") return "bg-warning-soft";
  return "";
}

function claseBorde(a: Aptitud): string {
  if (!requiereAtencion(a)) return "border-l-4 border-l-transparent";
  return a === "SIN_PREOPERACIONAL" ? "border-l-4 border-l-warning" : "border-l-4 border-l-destructive";
}

function Contador({ etiqueta, valor, tono }: { etiqueta: string; valor: number; tono?: "warning" | "destructive" }) {
  const resaltar = valor > 0 && tono;
  return (
    <div
      className={cn(
        "rounded-md border p-2",
        resaltar && tono === "warning" && "border-warning/50 bg-warning-soft",
        resaltar && tono === "destructive" && "border-destructive/40 bg-destructive/5"
      )}
    >
      <p className="text-2xl font-semibold tabular-nums leading-none">{valor}</p>
      <p className="mt-1 text-xs text-muted-foreground">{etiqueta}</p>
    </div>
  );
}

/**
 * Tablero de vehículos de Regulación: qué vehículos operan hoy, si están aptos y si están libres o en servicio.
 * Es de solo lectura y no tiene temporizador propio: `BarraTablero` refresca la página cada 30 s y este componente
 * se vuelve a pintar con datos nuevos. Móvil: tarjetas; escritorio: tabla densa (pensada para 1366×768).
 */
export function TableroVehiculosCard({ tablero }: { tablero: TableroVehiculos }) {
  const { filas, contadores } = tablero;
  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="flex items-center gap-2">
          Tablero de vehículos
          <HelpTrigger text="Los vehículos programados hoy en tu centro. Aptitud: si puede operar según su estado, el preoperacional de hoy, las novedades abiertas y las solicitudes de NO APTO pendientes de aval. Ocupación: en servicio desde que la tripulación marca el inicio de desplazamiento, con su último hito y cuánto lleva. Todavía no se estima a qué hora queda libre: se muestra el tiempo transcurrido. «Libres» cuenta solo los libres y aptos." />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* El tablero se refresca solo: aria-live anuncia los cambios de los contadores. */}
        <div role="status" aria-live="polite" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <Contador etiqueta="Libres" valor={contadores.libres} />
          <Contador etiqueta="En servicio" valor={contadores.enServicio} />
          <Contador etiqueta="Con novedades" valor={contadores.conNovedades} />
          <Contador etiqueta="No aptos" valor={contadores.noAptos} tono="destructive" />
          <Contador etiqueta="Sin preoperacional" valor={contadores.sinPreoperacional} tono="warning" />
        </div>

        {filas.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No hay vehículos programados hoy en tu centro. Asigna los conductores en la programación diaria de esta página.
          </p>
        ) : (
          <>
            {/* Móvil: una tarjeta por vehículo. */}
            <ul className="space-y-2 md:hidden">
              {filas.map((f) => (
                <li key={f.vehicleId} className={cn("space-y-2 rounded-xl border p-3", claseFila(f.aptitud), claseBorde(f.aptitud))}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Placa fila={f} />
                    <Ocupacion fila={f} />
                  </div>
                  <Conductores fila={f} />
                  <Aptitud fila={f} />
                  {f.ocupacion.servicioActual && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Servicio actual</p>
                      <ServicioActual fila={f} />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Próximo servicio</p>
                    <Proximo fila={f} />
                  </div>
                </li>
              ))}
            </ul>

            {/* Escritorio: tabla densa. */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Conductores</TableHead>
                    <TableHead>Aptitud</TableHead>
                    <TableHead>Ocupación</TableHead>
                    <TableHead>Servicio actual</TableHead>
                    <TableHead>Próximo servicio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filas.map((f) => (
                    <TableRow key={f.vehicleId} className={claseFila(f.aptitud)}>
                      <TableCell className={cn("px-3 py-2 align-top", claseBorde(f.aptitud))}>
                        <Placa fila={f} />
                      </TableCell>
                      <TableCell className="px-3 py-2 align-top">
                        <Conductores fila={f} />
                      </TableCell>
                      <TableCell className="max-w-[16rem] px-3 py-2 align-top">
                        <Aptitud fila={f} />
                      </TableCell>
                      <TableCell className="px-3 py-2 align-top">
                        <Ocupacion fila={f} />
                      </TableCell>
                      <TableCell className="px-3 py-2 align-top">
                        <ServicioActual fila={f} />
                      </TableCell>
                      <TableCell className="px-3 py-2 align-top">
                        <Proximo fila={f} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
