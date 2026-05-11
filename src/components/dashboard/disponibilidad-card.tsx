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

const SELECT_ALL = "__all__";

interface DisponibilidadCardProps {
  datos: DisponibilidadVehiculo[];
  centros: { id: number; nombre: string }[];
  fechaInicio: string;
  fechaFin: string;
  centroIdFiltro?: number;
}

function DisponibilidadBadge({ pct, cumple }: { pct: number; cumple: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        cumple ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cumple ? "bg-green-600" : "bg-red-600"}`} />
      {pct.toFixed(2)}%
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
}: DisponibilidadCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

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

  /** dir: número = mes respecto al rango actual; "now" = calendario del mes actual en Colombia */
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

  return (
    <Card className="min-w-0">
      <CardHeader className="pb-2">
        <div className="flex flex-col xl:flex-row xl:gap-6 xl:justify-between xl:items-start">
          <div className="flex items-start gap-2 min-w-0">
            <Activity className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <CardTitle>Disponibilidad de Flota</CardTitle>
              <CardDescription>Meta: {META}% — Tiempo laborable 24/7</CardDescription>
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-4">
                <div>
                  <p className="text-2xl font-bold">{promedioFlota.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">Promedio flota</p>
                </div>
                <div className="flex gap-5 items-center">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{cumpleMeta}</p>
                    <p className="text-xs text-gray-500">≥{META}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-600">{noCumple}</p>
                    <p className="text-xs text-gray-500">&lt;{META}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 xl:mt-0 xl:border-l xl:pl-6 w-full xl:max-w-sm shrink-0 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filtros</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Desde</Label>
                <Input type="date" value={fi} onChange={(e) => setFi(e.target.value)} className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-xs">Hasta</Label>
                <Input type="date" value={ff} onChange={(e) => setFf(e.target.value)} className="h-9 mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Centro de operaciones</Label>
              <Select value={cen || SELECT_ALL} onValueChange={(v) => setCen(v === SELECT_ALL ? "" : v)}>
                <SelectTrigger className="h-9 mt-1">
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
            <div className="flex flex-wrap gap-1 items-center">
              <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => periodoMes(-1)}>
                Mes anterior
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => periodoMes("now")}>
                Este mes *
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => periodoMes(1)}>
                Mes siguiente
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-xs text-muted-foreground mr-1">Año:</span>
              {[yearNow, yearNow - 1].map((y) => (
                <Button key={y} type="button" variant="secondary" size="sm" className="h-8 text-xs px-2" onClick={() => periodoAnio(y)}>
                  {y}
                </Button>
              ))}
            </div>
            <Button type="button" size="sm" className="w-full" disabled={pending} onClick={aplicar}>
              {pending ? "Aplicando…" : "Aplicar período"}
            </Button>
            <p className="text-[10px] text-muted-foreground leading-tight">
              * &quot;Este mes&quot;: toma como base la fecha inicial actual o today.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {datos.length === 0 ? (
          <p className="text-center text-gray-500 py-4 text-sm">Sin datos para los filtros</p>
        ) : (
          <div className="max-h-[22rem] overflow-y-auto border rounded-lg p-2 bg-muted/20">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {[...datos]
                .sort((a, b) => b.disponibilidadPct - a.disponibilidadPct)
                .map((d) => {
                  const disp = (d.estadoOperativo || "DISP") === "DISP";
                  return (
                    <div
                      key={d.vehicleId}
                      className={cn(
                        "rounded-lg border bg-card p-2.5 text-xs shadow-sm",
                        d.cumpleMeta ? "border-green-200" : "border-red-200"
                      )}
                    >
                      <p className="font-bold tracking-tight truncate" title={d.placa}>
                        {d.placa}
                      </p>
                      <p className="mt-1">
                        <Badge variant={disp ? "success" : "destructive"} className="text-[10px] px-1.5 py-0">
                          {disp ? "DISP" : "FDS"}
                        </Badge>
                      </p>
                      <p className="mt-2 text-muted-foreground text-[11px]">TFD (dispon.)</p>
                      <DisponibilidadBadge pct={d.disponibilidadPct} cumple={d.cumpleMeta} />
                      <div className="mt-2 flex items-baseline justify-between gap-1">
                        <span className="text-[11px] text-muted-foreground">TFDS</span>
                        <span className="font-medium tabular-nums">{d.tfdsHoras.toFixed(1)} h</span>
                      </div>
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="text-[11px] text-muted-foreground">Meta</span>
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
