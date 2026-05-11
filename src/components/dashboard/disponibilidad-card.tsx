"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DisponibilidadVehiculo } from "@/types";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { stripDashboardGlobalParams } from "@/lib/dashboard-search-params";
import { toggleVehicleStatus } from "@/app/api/actions/regulacion";
import { HelpTrigger } from "@/components/ui/help-trigger";

const SELECT_ALL = "__all__";

const HELP_SECCION =
  "Resumen de disponibilidad por vehículo en el período elegido: compara el tiempo en disponibilidad (TFD) frente a la meta, el tiempo fuera de servicio (TFDS) y el estado operativo actual (despacho).";

const HELP_TFD =
  "TFD (tiempo en disponibilidad): porcentaje del período analizado en que la unidad estuvo disponible según las reglas de métricas del dashboard (incluye incidentes y mantenimientos que afectan operatividad).";

const HELP_TFDS =
  "TFDS: horas fuera de servicio en el período, estimadas a partir de mantenimientos con tiempo declarado e incidencias que afectan la operatividad.";

interface DisponibilidadCardProps {
  datos: DisponibilidadVehiculo[];
  centros: { id: number; nombre: string }[];
  fechaInicio: string;
  fechaFin: string;
  centroIdFiltro?: number;
  /** ADMIN / REGULACION / MANTENIMIENTO: alternar operativo / FDS desde la cuadrícula. */
  puedeToggleEstado?: boolean;
}

function DisponibilidadBadge({ pct, cumple }: { pct: number; cumple: boolean }) {
  return (
    <span
      className={cn(
        "flex w-full min-w-0 max-w-full items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-tight sm:text-xs",
        cumple ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      )}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cumple ? "bg-green-600" : "bg-red-600"}`} />
      <span className="min-w-0 truncate tabular-nums">{pct.toFixed(2)}%</span>
    </span>
  );
}

const META = 95;

export function DisponibilidadCard({
  datos,
  centros,
  fechaInicio: initialInicio,
  fechaFin: initialFin,
  centroIdFiltro,
  puedeToggleEstado = false,
}: DisponibilidadCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [toggleErr, setToggleErr] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [fi, setFi] = useState(initialInicio);
  const [ff, setFf] = useState(initialFin);
  const [cen, setCen] = useState(centroIdFiltro ? String(centroIdFiltro) : "");

  useEffect(() => setFi(initialInicio), [initialInicio]);
  useEffect(() => setFf(initialFin), [initialFin]);
  useEffect(() => setCen(centroIdFiltro ? String(centroIdFiltro) : ""), [centroIdFiltro]);

  const cumpleMeta = datos.filter((d) => d.cumpleMeta).length;
  const noCumple = datos.length - cumpleMeta;
  const promedioFlota =
    datos.length > 0 ? datos.reduce((s, d) => s + d.disponibilidadPct, 0) / datos.length : 0;

  const aplicar = () => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    stripDashboardGlobalParams(params);
    params.set("dispInicio", fi);
    params.set("dispFin", ff);
    if (cen) params.set("dispCentro", cen);
    else params.delete("dispCentro");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const periodoMes = (dir: number | "now") => {
    const base =
      dir === "now"
        ? new Date()
        : (() => {
            const b = fi ? new Date(fi + "T12:00:00") : new Date();
            b.setMonth(b.getMonth() + dir);
            return b;
          })();
    const y = base.getFullYear();
    const m = base.getMonth();
    const f0 = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const ult = new Date(y, m + 1, 0).getDate();
    const f1 = `${y}-${String(m + 1).padStart(2, "0")}-${String(ult).padStart(2, "0")}`;
    setFi(f0);
    setFf(f1);
  };

  const periodoAnio = (year: number) => {
    setFi(`${year}-01-01`);
    setFf(`${year}-12-31`);
  };

  const yearNow = new Date().getFullYear();

  const alternarEstado = (vehicleId: string, actualmenteDisponible: boolean) => {
    if (!puedeToggleEstado) return;
    setToggleErr(null);
    const nuevo = actualmenteDisponible ? "FUERA_DE_SERVICIO" : "OPERATIVO";
    setTogglingId(vehicleId);
    void (async () => {
      const res = await toggleVehicleStatus(vehicleId, nuevo);
      setTogglingId(null);
      if ("error" in res && res.error) {
        setToggleErr(res.error);
        return;
      }
      startTransition(() => router.refresh());
    })();
  };

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span title="Indicador de disponibilidad de la flota en el período seleccionado" className="inline-flex shrink-0">
                <Activity className="h-5 w-5 text-muted-foreground" aria-hidden />
              </span>
              <CardTitle className="text-lg leading-tight">Disponibilidad de Flota</CardTitle>
              <HelpTrigger text={HELP_SECCION} />
            </div>
            <CardDescription className="text-xs leading-snug">
              Meta {META}% · Referencia de tiempo laborable 24/7
            </CardDescription>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-border/60 bg-muted/25 px-3 py-2 text-sm">
              <div>
                <p className="text-xl font-bold tabular-nums leading-none">{promedioFlota.toFixed(2)}%</p>
                <p className="text-[11px] text-muted-foreground">Promedio flota</p>
              </div>
              <div className="flex gap-4 border-l border-border/60 pl-4">
                <div className="text-center">
                  <p className="text-base font-bold text-green-600 tabular-nums">{cumpleMeta}</p>
                  <p className="text-[10px] text-muted-foreground">≥{META}%</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-red-600 tabular-nums">{noCumple}</p>
                  <p className="text-[10px] text-muted-foreground">&lt;{META}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full shrink-0 space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3 lg:max-w-[min(100%,20rem)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Filtros</p>
              <HelpTrigger text="Período y centro aplican solo a esta tarjeta salvo que use filtros globales del encabezado." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Desde</Label>
                <Input type="date" value={fi} onChange={(e) => setFi(e.target.value)} className="mt-0.5 h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px]">Hasta</Label>
                <Input type="date" value={ff} onChange={(e) => setFf(e.target.value)} className="mt-0.5 h-8 text-xs" />
              </div>
            </div>
            <div>
              <Label className="text-[10px]">Centro</Label>
              <Select value={cen || SELECT_ALL} onValueChange={(v) => setCen(v === SELECT_ALL ? "" : v)}>
                <SelectTrigger className="mt-0.5 h-8 text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_ALL}>Todos</SelectItem>
                  {centros.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={() => periodoMes(-1)}>
                −Mes
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={() => periodoMes("now")} title="Mes calendario según fecha inicial o hoy">
                Mes
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={() => periodoMes(1)}>
                +Mes
              </Button>
              {[yearNow, yearNow - 1].map((y) => (
                <Button key={y} type="button" variant="secondary" size="sm" className="h-7 px-2 text-[10px]" onClick={() => periodoAnio(y)}>
                  {y}
                </Button>
              ))}
            </div>
            <Button type="button" size="sm" className="h-8 w-full text-xs" disabled={pending} onClick={aplicar}>
              {pending ? "Aplicando…" : "Aplicar período"}
            </Button>
            {puedeToggleEstado ? (
              <p className="text-[10px] text-muted-foreground leading-tight">
                Puede alternar disponible / fuera de servicio en cada tarjeta inferior.
              </p>
            ) : null}
            {toggleErr ? (
              <p className="text-[11px] text-destructive leading-tight" role="alert">
                {toggleErr}
              </p>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {datos.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Sin datos para los filtros</p>
        ) : (
          <div className="max-h-[min(24rem,55vh)] overflow-y-auto rounded-lg border bg-muted/15 p-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {[...datos]
                .sort((a, b) => b.disponibilidadPct - a.disponibilidadPct)
                .map((d) => {
                  const disp = (d.estadoOperativo || "DISP") === "DISP";
                  return (
                    <div
                      key={d.vehicleId}
                      className={cn(
                        "rounded-lg border bg-card p-2 text-[11px] shadow-sm min-w-0 overflow-hidden",
                        d.cumpleMeta ? "border-green-200" : "border-red-200"
                      )}
                    >
                      <p className="font-bold tracking-tight truncate" title={d.placa}>
                        {d.placa}
                      </p>
                      <p className="mt-1">
                        {puedeToggleEstado ? (
                          <button
                            type="button"
                            disabled={togglingId === d.vehicleId}
                            onClick={() => alternarEstado(d.vehicleId, disp)}
                            title={
                              disp
                                ? "Clic para marcar fuera de servicio (despacho)"
                                : "Clic para marcar disponible (operativo)"
                            }
                            className={cn(
                              "inline-flex w-full min-w-0 max-w-full justify-center rounded-md border px-1 py-0.5 text-[10px] font-semibold leading-tight transition-colors",
                              disp
                                ? "border-green-300 bg-green-50 text-green-900 hover:bg-green-100"
                                : "border-red-300 bg-red-50 text-red-900 hover:bg-red-100",
                              togglingId === d.vehicleId && "pointer-events-none opacity-60"
                            )}
                          >
                            {togglingId === d.vehicleId ? "…" : disp ? "Disponible" : "Fuera de servicio"}
                          </button>
                        ) : (
                          <Badge variant={disp ? "success" : "destructive"} className="max-w-full px-1.5 py-0 text-[10px]">
                            {disp ? "Disponible" : "Fuera de servicio"}
                          </Badge>
                        )}
                      </p>
                      <div className="mt-1.5 flex items-center gap-0.5 text-muted-foreground">
                        <span className="text-[10px]">TFD</span>
                        <HelpTrigger text={HELP_TFD} className="scale-90" />
                      </div>
                      <DisponibilidadBadge pct={d.disponibilidadPct} cumple={d.cumpleMeta} />
                      <div className="mt-1.5 flex items-baseline justify-between gap-1">
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          TFDS
                          <HelpTrigger text={HELP_TFDS} className="scale-90" />
                        </span>
                        <span className="font-medium tabular-nums">{d.tfdsHoras.toFixed(1)} h</span>
                      </div>
                      <div className="mt-0.5 flex items-baseline justify-between gap-1">
                        <span className="text-[10px] text-muted-foreground">Meta</span>
                        <span className="tabular-nums font-semibold">{d.cumpleMeta ? `${META}% ✓` : `<${META}%`}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
