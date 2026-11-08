"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Ban, CheckCircle2, ChevronDown, Circle, ClipboardX, ShieldAlert, Truck, type LucideIcon } from "lucide-react";
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
import { contarFlota, filtrarFlota, FILTROS_FLOTA, iniciales, tonoTarjeta, type FiltroFlota, type TonoTarjeta } from "@/lib/tablero-tarjetas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTrigger } from "@/components/ui/help-trigger";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

const APTITUD_UI: Record<Aptitud, { tone: StatusTone; icon: LucideIcon }> = {
  NO_APTO: { tone: "danger", icon: Ban },
  NO_APTO_PENDIENTE_AVAL: { tone: "danger", icon: ShieldAlert },
  SIN_PREOPERACIONAL: { tone: "warning", icon: ClipboardX },
  APTO_CON_NOVEDADES: { tone: "warning", icon: AlertTriangle },
  APTO: { tone: "success", icon: CheckCircle2 },
};

const FONDO: Record<TonoTarjeta, string> = {
  alerta: "bg-destructive/5",
  aviso: "bg-warning-soft",
  servicio: "bg-info-soft",
  libre: "bg-success-soft",
};
const BORDE: Record<TonoTarjeta, string> = {
  alerta: "border-destructive/40",
  aviso: "border-warning/50",
  servicio: "border-border",
  libre: "border-border",
};

function textoNovedades(f: FilaTablero): string | null {
  const { cantidad, severidadMaxima } = f.novedades;
  if (cantidad === 0) return null;
  const base = `${cantidad} ${cantidad === 1 ? "novedad abierta" : "novedades abiertas"}`;
  return severidadMaxima ? `${base} · severidad ${ETIQUETA_SEVERIDAD[severidadMaxima]}` : base;
}

/** Líneas de explicación bajo el estado de aptitud (el estado ya dice qué es; esto dice por qué). */
function detalleAptitud(f: FilaTablero): string[] {
  const lineas: string[] = [];
  if (f.aptitud === "NO_APTO") lineas.push("Fuera de servicio");
  if (f.aptitud === "NO_APTO_PENDIENTE_AVAL") lineas.push(f.motivoSolicitud ? `Solicitud: ${f.motivoSolicitud}` : "Espera el aval de Coordinación o Mantenimiento");
  if (f.aptitud === "SIN_PREOPERACIONAL") lineas.push("Hoy no registra preoperacional");
  const novedades = textoNovedades(f);
  if (novedades) lineas.push(novedades);
  return lineas;
}

/** Tripulación en una fila que se despliega al hacer clic (o al pasar el cursor, por el `title`): deja el espacio al servicio. */
function Tripulacion({ conductores }: { conductores: string[] }) {
  if (conductores.length === 0) {
    return <p className="border-b px-4 py-2.5 text-sm text-muted-foreground">Sin conductor asignado hoy</p>;
  }
  return (
    <details className="group border-b" title={conductores.join(" · ")}>
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2.5 px-4 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="flex">
          {conductores.slice(0, 3).map((c, i) => (
            <span
              key={c}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[11px] font-semibold",
                i > 0 && "-ml-2"
              )}
            >
              {iniciales(c)}
            </span>
          ))}
        </span>
        <span className="flex-1 text-sm text-muted-foreground">
          {conductores.length} {conductores.length === 1 ? "persona" : "personas"}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <ul className="space-y-1 px-4 pb-3 text-sm">
        {conductores.map((c) => (
          <li key={c} className="font-medium">
            {c}
          </li>
        ))}
      </ul>
    </details>
  );
}

function ServicioActual({ fila }: { fila: FilaTablero }) {
  const { servicioActual, serviciosEnCurso } = fila.ocupacion;
  if (!servicioActual) return null;
  return (
    <div className="space-y-0.5 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Servicio actual</p>
      <p className="font-medium">{servicioActual.tipoServicio}</p>
      <p className="tabular-nums">{servicioActual.hito ? `${servicioActual.hito} · ${horaCorta(servicioActual.hitoAt)}` : servicioActual.estado}</p>
      {servicioActual.minutosEnServicio !== null && (
        <p className="text-xs text-muted-foreground">Lleva {formatearDuracion(servicioActual.minutosEnServicio)}</p>
      )}
      {serviciosEnCurso > 1 && <p className="text-xs text-muted-foreground">+{serviciosEnCurso - 1} más en curso</p>}
    </div>
  );
}

function Proximo({ fila }: { fila: FilaTablero }) {
  const { proximo } = fila.ocupacion;
  return (
    <div className="space-y-0.5 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Próximo servicio</p>
      {proximo ? (
        <>
          <p className="tabular-nums">
            <span className="font-semibold">{horaCorta(proximo.programadoPara)}</span> · {proximo.tipoServicio}
          </p>
          {proximo.minutosDeRetraso !== null && (
            <p className="text-xs font-semibold text-destructive">Retrasado {formatearDuracion(proximo.minutosDeRetraso)}</p>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">Sin servicios programados</p>
      )}
    </div>
  );
}

function Tarjeta({ f }: { f: FilaTablero }) {
  const tono = tonoTarjeta(f);
  const aptitud = APTITUD_UI[f.aptitud];
  const detalle = detalleAptitud(f);
  const retraso = f.ocupacion.proximo?.minutosDeRetraso ?? null;
  const enServicio = f.ocupacion.estado === "EN_SERVICIO";
  return (
    <li className={cn("flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm", BORDE[tono])}>
      <div className={cn("space-y-2 border-b px-4 py-3", FONDO[tono])}>
        <Link
          href={`/vehiculos/${f.vehicleId}`}
          className="inline-flex min-h-9 items-center text-2xl font-semibold tabular-nums tracking-wide underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {f.placa}
        </Link>
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge tone={enServicio ? "info" : "neutral"} icon={enServicio ? Truck : Circle}>
            {enServicio ? "En servicio" : "Libre"}
          </StatusBadge>
          {f.aptitud !== "APTO" && (
            <StatusBadge tone={aptitud.tone} icon={aptitud.icon}>
              {ETIQUETA_APTITUD[f.aptitud]}
            </StatusBadge>
          )}
          {retraso !== null && <StatusBadge tone="danger">Retrasado {formatearDuracion(retraso)}</StatusBadge>}
        </div>
      </div>

      <Tripulacion conductores={f.conductores} />

      <div className="flex-1 space-y-3 px-4 py-3">
        <ServicioActual fila={f} />
        {detalle.length > 0 && (
          <ul className="space-y-1.5">
            {detalle.map((l) => (
              <li key={l} className="rounded-md bg-warning-soft px-2.5 py-1.5 text-xs font-medium text-warning-foreground">
                {l}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3 border-t bg-background px-4 py-3">
        <Proximo fila={f} />
        <Button asChild variant="outline" className="w-full">
          <Link href={`/vehiculos/${f.vehicleId}`}>{requiereAtencion(f.aptitud) || f.novedades.cantidad > 0 ? "Ver novedades" : "Ver vehículo"}</Link>
        </Button>
      </div>
    </li>
  );
}

/**
 * Flota de hoy en tarjetas: qué vehículos operan hoy, si están aptos y si están libres o en servicio, con su tripulación
 * plegable y el servicio que llevan. Solo lectura y sin temporizador propio: `BarraTablero` refresca la página cada 30 s y
 * las tarjetas se vuelven a pintar con datos nuevos. El filtro (Todos, En servicio, Libres, Con alertas) vive en el cliente.
 */
export function TableroVehiculosCard({ tablero }: { tablero: TableroVehiculos }) {
  const [filtro, setFiltro] = useState<FiltroFlota>("todos");
  const { filas } = tablero;
  const conteo = contarFlota(filas);
  const visibles = filtrarFlota(filas, filtro);
  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="flex items-center gap-2">
          Flota en operación hoy
          <HelpTrigger text="Los vehículos programados hoy en tu centro. Aptitud: si puede operar según su estado, el preoperacional de hoy, las novedades abiertas y las solicitudes de NO APTO pendientes de aval. Ocupación: en servicio desde que la tripulación marca el inicio de desplazamiento, con su último hito y cuánto lleva. Todavía no se estima a qué hora queda libre: se muestra el tiempo transcurrido. «Libres» cuenta solo los libres y aptos. Los que necesitan atención van primero." />
        </CardTitle>
        <p className="pt-1 text-sm text-muted-foreground">
          {conteo.todos === 0 ? "Ningún vehículo con conductor asignado." : `${conteo.todos} ${conteo.todos === 1 ? "vehículo" : "vehículos"} con tripulación asignada. Primero los que necesitan tu atención.`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* El tablero se refresca solo: el resumen anuncia los cambios a lectores de pantalla. */}
        <p role="status" aria-live="polite" className="sr-only">
          {conteo.servicio} en servicio, {conteo.libres} libres, {conteo.alertas} con alertas.
        </p>
        <div role="group" aria-label="Filtrar vehículos" className="flex flex-wrap gap-2">
          {FILTROS_FLOTA.map(({ clave, etiqueta }) => (
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

        {filas.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No hay vehículos programados hoy en tu centro. Asigna los conductores en la programación diaria de esta página.
          </p>
        ) : visibles.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Ningún vehículo coincide con este filtro.</p>
        ) : (
          <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(16.5rem,1fr))]">
            {visibles.map((f) => (
              <Tarjeta key={f.vehicleId} f={f} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
