"use client";

import { hoyBogota } from "@/lib/fechas";
import { useEffect, useId, useState } from "react";
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
import { CIUDADES_SERVICIO } from "@/lib/servicios-lista";

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

/** Tipo de servicio: asignados / atendidos. Va plegado: es detalle, no lo primero que se necesita. */
function FilaPorTipo({ titulo, porTipo }: { titulo: string; porTipo: ResumenOperativoBucket["porTipo"] }) {
  return (
    <p className="text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{titulo}:</span>{" "}
      {porTipo.map((t) => `${t.tipo} ${t.asignados}/${t.atendidos}`).join(" · ")}
    </p>
  );
}

/** Una línea por ciudad (o el consolidado): siete contadores con su estado; en celular se parte en dos líneas. */
function LineaResumen({ titulo, bucket }: { titulo: string; bucket: ResumenOperativoBucket }) {
  return (
    <div role="group" aria-label={titulo} className="grid grid-cols-4 items-center gap-1.5 lg:grid-cols-[7rem_repeat(7,minmax(0,1fr))]">
      <p className="col-span-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:col-span-1">{titulo}</p>
      {TARJETAS.map(({ key, label, icon: Icon, bg, fg }) => (
        <div key={key} className={cn("flex items-center gap-1.5 rounded-md px-2 py-1", bg)}>
          <Icon className={cn("hidden h-3.5 w-3.5 shrink-0 sm:block", fg)} aria-hidden="true" />
          <div className="min-w-0 leading-none">
            <p className={cn("text-base font-bold", fg)}>{bucket[key]}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

type ModoFecha = "hoy" | "rango";

export function ResumenOperativo({
  inicial,
  modoInicial = "hoy",
  ciudad = "",
}: {
  inicial: ResumenOperativoConsolidado;
  modoInicial?: ModoFecha;
  /** "bogota" | "medellin": muestra solo esa ciudad. Vacío = las dos, con el consolidado. */
  ciudad?: string;
}) {
  const idBase = useId();
  const [modo, setModo] = useState<ModoFecha>(modoInicial);
  const [desde, setDesde] = useState(hoyIso());
  const [hasta, setHasta] = useState(hoyIso());
  const [datos, setDatos] = useState(inicial);
  const [cargando, setCargando] = useState(false);
  // `useState(inicial)` solo toma el valor la primera vez: cuando la página se refresca (o llega un servicio nuevo) el
  // servidor manda un `inicial` nuevo y el resumen de «Hoy» se quedaba con el viejo hasta recargar. En «Rango» manda el
  // rango que eligió la persona, no se pisa.
  useEffect(() => {
    if (modo === "hoy") setDatos(inicial);
  }, [inicial, modo]);
  const nombreCiudad = CIUDADES_SERVICIO.find((c) => c.clave === ciudad)?.nombre;
  const deLaCiudad = nombreCiudad ? datos.porCiudad.find((c) => c.ciudad === nombreCiudad) : undefined;

  const cargar = async (d: string, h: string) => {
    setCargando(true);
    try {
      setDatos(await getResumenOperativoDiario({ desde: d, hasta: h }));
    } finally {
      setCargando(false);
    }
  };

  const elegirHoy = () => {
    setModo("hoy");
    const hoy = hoyIso();
    setDesde(hoy);
    setHasta(hoy);
    cargar(hoy, hoy);
  };

  const filtrar = () => cargar(desde, hasta);

  const lineas = deLaCiudad
    ? [{ titulo: deLaCiudad.ciudad, bucket: deLaCiudad }]
    : [
        { titulo: "Consolidado", bucket: datos.consolidado },
        ...datos.porCiudad.map((c) => ({ titulo: c.ciudad, bucket: c })),
      ];

  return (
    <section aria-label="Resumen operativo" className="space-y-2 rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Resumen operativo</h2>
          <span className="text-xs text-muted-foreground">{modo === "hoy" ? "Hoy" : `${desde} a ${hasta}`}</span>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex gap-0.5 rounded-md border p-0.5">
            <Button type="button" size="sm" variant={modo === "hoy" ? "default" : "ghost"} className="min-h-touch" onClick={elegirHoy} disabled={cargando}>
              Hoy
            </Button>
            <Button type="button" size="sm" variant={modo === "rango" ? "default" : "ghost"} className="min-h-touch" onClick={() => setModo("rango")} disabled={cargando}>
              Rango
            </Button>
          </div>
          {modo === "rango" && (
            <>
              <div className="space-y-1">
                <label htmlFor={`${idBase}-desde`} className="text-xs text-muted-foreground">Desde</label>
                <DateField id={`${idBase}-desde`} value={desde} onChange={setDesde} inputClassName="h-touch w-28" />
              </div>
              <div className="space-y-1">
                <label htmlFor={`${idBase}-hasta`} className="text-xs text-muted-foreground">Hasta</label>
                <DateField id={`${idBase}-hasta`} value={hasta} onChange={setHasta} inputClassName="h-touch w-28" />
              </div>
              <Button size="sm" className="min-h-touch" onClick={filtrar} disabled={cargando}>
                {cargando ? "Filtrando..." : "Filtrar"}
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="space-y-1.5" aria-busy={cargando} aria-live="polite">
        {lineas.map((l) => (
          <LineaResumen key={l.titulo} titulo={l.titulo} bucket={l.bucket} />
        ))}
      </div>
      <details className="text-xs">
        <summary className="inline-flex min-h-touch cursor-pointer items-center text-muted-foreground hover:text-foreground">
          Por tipo de servicio (asignados / atendidos)
        </summary>
        <div className="space-y-1 pb-1">
          {lineas.map((l) => (
            <FilaPorTipo key={l.titulo} titulo={l.titulo} porTipo={l.bucket.porTipo} />
          ))}
        </div>
      </details>
    </section>
  );
}
