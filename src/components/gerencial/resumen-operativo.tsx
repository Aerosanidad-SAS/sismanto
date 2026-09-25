"use client";

import { hoyBogota } from "@/lib/fechas";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateField } from "@/components/forms/date-field";
import { Button } from "@/components/ui/button";
import {
  getResumenOperativoDiario,
  type ResumenOperativoConsolidado,
  type ResumenOperativoBucket,
} from "@/app/api/actions/estadisticas-servicios";
import {
  LayoutGrid,
  ClipboardList,
  CalendarClock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CircleSlash,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Asignados es el total: Asignados = Programados + En curso + Atendidos +
// Fallidos + Cancelados, exacto — cada estado real tiene su propia tarjeta
// (Daniel, 2026-08-03: "cada estado es importante").
const TARJETAS = [
  { key: "asignados", label: "Asignados", icon: ClipboardList, bg: "bg-slate-100", fg: "text-slate-700" },
  { key: "programados", label: "Programados", icon: CalendarClock, bg: "bg-blue-50", fg: "text-blue-700" },
  { key: "enCurso", label: "En curso", icon: Truck, bg: "bg-yellow-50", fg: "text-yellow-700" },
  { key: "atendidos", label: "Atendidos", icon: CheckCircle2, bg: "bg-green-50", fg: "text-green-700" },
  { key: "fallidos", label: "Fallidos", icon: AlertTriangle, bg: "bg-orange-50", fg: "text-orange-700" },
  { key: "cancelados", label: "Cancelados", icon: XCircle, bg: "bg-red-50", fg: "text-red-700" },
  { key: "noEfectivo", label: "No efectivo", icon: CircleSlash, bg: "bg-purple-50", fg: "text-purple-700" },
] as const;

function hoyIso() {
  return hoyBogota();
}

/** Fila compacta de tipo de servicio — mismo dato en los 3 niveles (consolidado y cada ciudad). */
function FilaPorTipo({ porTipo }: { porTipo: ResumenOperativoBucket["porTipo"] }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
      {porTipo.map((t) => (
        <div key={t.tipo} className="rounded-md border bg-muted/30 px-2 py-1.5 text-center">
          <p className="truncate text-[10px] text-muted-foreground">{t.tipo}</p>
          <p className="text-sm font-semibold">
            {t.asignados}
            <span className="font-normal text-muted-foreground"> / {t.atendidos}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

/** Bloque grande (consolidado) — números destacados, para la fila de arriba. */
function BloqueConsolidado({ titulo, bucket }: { titulo: string; bucket: ResumenOperativoBucket }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{titulo}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {TARJETAS.map(({ key, label, icon: Icon, bg, fg }) => (
          <div key={key} className={cn("rounded-lg p-3 text-center", bg)}>
            <Icon className={cn("mx-auto mb-1 h-4 w-4", fg)} />
            <p className={cn("text-2xl font-bold leading-tight", fg)}>{bucket[key]}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <FilaPorTipo porTipo={bucket.porTipo} />
      </div>
    </div>
  );
}

/** Bloque compacto por ciudad — icono + etiqueta + número en una sola línea, para ahorrar espacio vertical. */
function BloqueCiudad({ ciudad, bucket }: { ciudad: string; bucket: ResumenOperativoBucket }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">{ciudad}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TARJETAS.map(({ key, label, icon: Icon, bg, fg }) => (
            <div key={key} className={cn("flex items-center gap-2 rounded-lg px-2.5 py-2", bg)}>
              <Icon className={cn("h-4 w-4 shrink-0", fg)} />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[10px] text-muted-foreground">{label}</p>
                <p className={cn("text-lg font-bold", fg)}>{bucket[key]}</p>
              </div>
            </div>
          ))}
        </div>
        <FilaPorTipo porTipo={bucket.porTipo} />
      </CardContent>
    </Card>
  );
}

type ModoFecha = "hoy" | "rango";

export function ResumenOperativo({
  inicial,
  modoInicial = "hoy",
}: {
  inicial: ResumenOperativoConsolidado;
  modoInicial?: ModoFecha;
}) {
  const [modo, setModo] = useState<ModoFecha>(modoInicial);
  const [desde, setDesde] = useState(hoyIso());
  const [hasta, setHasta] = useState(hoyIso());
  const [datos, setDatos] = useState(inicial);
  const [cargando, setCargando] = useState(false);

  const cargar = async (d: string, h: string) => {
    setCargando(true);
    const r = await getResumenOperativoDiario({ desde: d, hasta: h });
    setDatos(r);
    setCargando(false);
  };

  const elegirHoy = () => {
    setModo("hoy");
    const hoy = hoyIso();
    setDesde(hoy);
    setHasta(hoy);
    cargar(hoy, hoy);
  };

  const filtrar = () => cargar(desde, hasta);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <CardTitle>Resumen operativo</CardTitle>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex gap-0.5 rounded-md border p-0.5">
              <Button
                type="button"
                size="sm"
                variant={modo === "hoy" ? "default" : "ghost"}
                className="h-8"
                onClick={elegirHoy}
                disabled={cargando}
              >
                Hoy
              </Button>
              <Button
                type="button"
                size="sm"
                variant={modo === "rango" ? "default" : "ghost"}
                className="h-8"
                onClick={() => setModo("rango")}
                disabled={cargando}
              >
                Rango
              </Button>
            </div>
            {modo === "rango" && (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Desde</label>
                  <DateField value={desde} onChange={setDesde} inputClassName="h-9 w-28" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Hasta</label>
                  <DateField value={hasta} onChange={setHasta} inputClassName="h-9 w-28" />
                </div>
                <Button size="sm" onClick={filtrar} disabled={cargando}>
                  {cargando ? "Filtrando..." : "Filtrar"}
                </Button>
              </>
            )}
          </div>
        </div>
        <CardDescription>
          {modo === "hoy" ? "Servicios de hoy" : `Servicios entre ${desde} y ${hasta}`} — Bogotá y
          Medellín por separado, con el consolidado de ambas arriba.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <BloqueConsolidado titulo="Consolidado — Bogotá + Medellín" bucket={datos.consolidado} />
        <div className="grid gap-3 md:grid-cols-2">
          {datos.porCiudad.map((c) => (
            <BloqueCiudad key={c.ciudad} ciudad={c.ciudad} bucket={c} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
