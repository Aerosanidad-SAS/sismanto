"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type {
  UptimeKPI,
  TCOKPI,
  RatioPCKPI,
  ResolutionTimeKPI,
} from "@/types";

const SELECT_ALL = "__all__";

interface KPIDashboardProps {
  uptimeData: UptimeKPI[];
  tcoData: TCOKPI[];
  ratioPC: RatioPCKPI;
  resolucionData: ResolutionTimeKPI[];
  fechaInicio: string;
  fechaFin: string;
  centrosOperativos: { id: number; nombre: string }[];
  placasDisponibles: string[];
  tcoCentroIdInicial?: number;
  tcoTipoInicial: "AMBOS" | "PREVENTIVO" | "CORRECTIVO";
  tcoPlacaInicial: string;
  dispCentroIdInicial?: number;
  fuelResumen: {
    kmTotales: number;
    galonesTotales: number;
    consumoPromedioFlota: number | null;
    vehiculosConDatos: number;
    vehiculosAnalizados: number;
  };
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function KPIDashboard({
  uptimeData,
  tcoData,
  ratioPC,
  resolucionData,
  fechaInicio,
  fechaFin,
  centrosOperativos,
  placasDisponibles,
  tcoCentroIdInicial,
  tcoTipoInicial,
  tcoPlacaInicial,
  dispCentroIdInicial,
  fuelResumen,
}: KPIDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  // Filtros CTO
  const [kCen, setKCen] = useState(tcoCentroIdInicial ? String(tcoCentroIdInicial) : "");
  const [kTipo, setKTipo] = useState(tcoTipoInicial);
  const [kPlaca, setKPlaca] = useState(tcoPlacaInicial);

  // Filtro Disponibilidad por centro
  const [kDispCen, setKDispCen] = useState(dispCentroIdInicial ? String(dispCentroIdInicial) : "");

  useEffect(() => { setKCen(tcoCentroIdInicial ? String(tcoCentroIdInicial) : ""); }, [tcoCentroIdInicial]);
  useEffect(() => { setKTipo(tcoTipoInicial); }, [tcoTipoInicial]);
  useEffect(() => { setKPlaca(tcoPlacaInicial); }, [tcoPlacaInicial]);
  useEffect(() => { setKDispCen(dispCentroIdInicial ? String(dispCentroIdInicial) : ""); }, [dispCentroIdInicial]);

  const aplicarFiltrosTco = () => {
    const p = new URLSearchParams(searchParams.toString());
    if (kCen) p.set("kCentro", kCen); else p.delete("kCentro");
    if (kTipo !== "AMBOS") p.set("kTipo", kTipo); else p.delete("kTipo");
    if (kPlaca.trim()) p.set("kPlaca", kPlaca.trim()); else p.delete("kPlaca");
    startTransition(() => router.push(`${pathname}?${p.toString()}`));
  };

  const aplicarFiltroDisp = () => {
    const p = new URLSearchParams(searchParams.toString());
    if (kDispCen) p.set("kDispCentro", kDispCen); else p.delete("kDispCentro");
    startTransition(() => router.push(`${pathname}?${p.toString()}`));
  };

  // Promedio flota (ya filtrado server-side si kDispCentro activo)
  const avgFlota = uptimeData.length > 0
    ? uptimeData.reduce((s, d) => s + d.porcentajeDisponibilidad, 0) / uptimeData.length
    : 0;

  // Agrupación por centro (solo útil cuando no hay filtro de centro)
  const porCentro = Object.values(
    uptimeData.reduce<Record<string, { nombre: string; total: number; count: number }>>((acc, d) => {
      const k = d.centroOperativo || "Sin centro";
      if (!acc[k]) acc[k] = { nombre: k, total: 0, count: 0 };
      acc[k].total += d.porcentajeDisponibilidad;
      acc[k].count += 1;
      return acc;
    }, {})
  ).map((c) => ({ nombre: c.nombre, avg: c.total / c.count }))
   .sort((a, b) => b.avg - a.avg);

  const tcoFiltrosActivos = !!(tcoCentroIdInicial || tcoPlacaInicial || tcoTipoInicial !== "AMBOS");
  const dispFiltroActivo = !!dispCentroIdInicial;
  // Preparar datos para gráficos
  const uptimeChartData = uptimeData.map((item) => ({
    placa: item.placa,
    centro: item.centroOperativo,
    disponibilidad: Number(item.porcentajeDisponibilidad.toFixed(2)),
  }));

  const tcoChartData = tcoData.map((item) => ({
    nombre: item.placa || item.centroOperativo || "Total",
    preventivo: item.costoPreventivo,
    correctivo: item.costoCorrectivo,
    combustible: item.costoCombustible || 0,
    fijos: item.costoFijoAnual || 0,
    total: item.costoTotal,
  }));

  const ratioPieData = [
    { name: "Preventivo", value: ratioPC.costoPreventivo },
    { name: "Correctivo", value: ratioPC.costoCorrectivo },
  ];

  const resolucionAreaData = resolucionData.map((item) => ({
    severidad: item.severidad,
    promedioHoras: Number(item.promedioHoras.toFixed(2)),
    cerradas: item.cantidadCerradas,
    abiertas: item.cantidadAbiertas,
  }));

  return (
    <div className="space-y-6">
      {/* Resumen de KPIs */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Card Disponibilidad */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium">Disponibilidad</CardTitle>
              {dispFiltroActivo && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800">
                  {centrosOperativos.find((c) => c.id === dispCentroIdInicial)?.nombre ?? "Filtro activo"}
                </span>
              )}
            </div>
            {/* Filtro por centro */}
            <div className="flex gap-1.5">
              <Select value={kDispCen || SELECT_ALL} onValueChange={(v) => setKDispCen(v === SELECT_ALL ? "" : v)}>
                <SelectTrigger className="h-7 flex-1 text-[11px]">
                  <SelectValue placeholder="Todos los centros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_ALL}>Todos</SelectItem>
                  {centrosOperativos.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" size="sm" className="h-7 px-2 text-[11px]" disabled={pending} onClick={aplicarFiltroDisp}>
                {pending ? "…" : "↵"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-2xl font-bold tabular-nums">{avgFlota.toFixed(2)}%</div>
              <p className="text-[11px] text-muted-foreground">
                Flota · {uptimeData.length} vehículo{uptimeData.length !== 1 ? "s" : ""}
              </p>
            </div>
            {!dispFiltroActivo && porCentro.length > 1 && (
              <div className="space-y-0.5 border-t pt-2">
                {porCentro.map((c) => (
                  <div key={c.nombre} className="flex items-center justify-between text-[11px]">
                    <span className="truncate text-muted-foreground">{c.nombre}</span>
                    <span className={`ml-2 shrink-0 font-semibold tabular-nums ${c.avg >= 95 ? "text-green-700" : "text-red-600"}`}>
                      {c.avg.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card CTO Total */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium">CTO Total</CardTitle>
              {tcoFiltrosActivos && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                  Filtro activo
                </span>
              )}
            </div>
            {tcoFiltrosActivos && (
              <p className="text-[10px] text-muted-foreground leading-tight">
                {[
                  tcoCentroIdInicial && centrosOperativos.find((c) => c.id === tcoCentroIdInicial)?.nombre,
                  tcoPlacaInicial && `Placa: ${tcoPlacaInicial}`,
                  tcoTipoInicial !== "AMBOS" && tcoTipoInicial,
                ].filter(Boolean).join(" · ")}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">
              {formatCurrency(tcoData.reduce((sum, item) => sum + item.costoTotal, 0))}
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              <span>Prev. {formatCurrency(tcoData.reduce((s, i) => s + i.costoPreventivo, 0))}</span>
              <span>Corr. {formatCurrency(tcoData.reduce((s, i) => s + i.costoCorrectivo, 0))}</span>
              <span>Comb. {formatCurrency(tcoData.reduce((s, i) => s + (i.costoCombustible || 0), 0))}</span>
              <span>Fijos {formatCurrency(tcoData.reduce((s, i) => s + (i.costoFijoAnual || 0), 0))}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Use filtros abajo para cambiar vista</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Ratio P/C
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">
              {ratioPC.ratio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {ratioPC.cantidadPreventivo} preventivos /{" "}
              {ratioPC.cantidadCorrectivo} correctivos
            </p>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratioPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={22}
                    outerRadius={36}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {ratioPieData.map((_, index) => (
                      <Cell key={`ratio-mini-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Resolución Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resolucionData.length > 0
                ? (
                    resolucionData.reduce(
                      (sum, item) => sum + item.promedioHoras,
                      0
                    ) / resolucionData.length
                  ).toFixed(1)
                : "0"}{" "}
              hrs
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico 1: Disponibilidad por Vehículo */}
      <Card>
        <CardHeader>
          <CardTitle>Tasa de Disponibilidad por Vehículo</CardTitle>
          <CardDescription>
            Porcentaje de tiempo operativo en el período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={uptimeChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="placa"
                angle={-38}
                textAnchor="end"
                height={78}
                interval={0}
                tick={{ fontSize: 10 }}
                tickFormatter={(p: string) => (p.length > 9 ? `${p.slice(0, 8)}…` : p)}
              />
              <YAxis tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Disponibilidad"]}
                labelFormatter={(label) => `Placa: ${label}`}
              />
              <Legend />
              <Bar dataKey="disponibilidad" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico 2: CTO por Centro Operativo */}
      <Card>
        <CardHeader>
          <CardTitle>CTO por Vehículo/Centro</CardTitle>
          <CardDescription>
            Costo total de operación desglosado por componente. Los filtros siguientes aplican a esta gráfica y al
            ratio preventivo/correctivo del mismo subconjunto de órdenes.
          </CardDescription>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">Centro de operación</Label>
              <Select value={kCen || SELECT_ALL} onValueChange={(v) => setKCen(v === SELECT_ALL ? "" : v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_ALL}>Todos</SelectItem>
                  {centrosOperativos.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo de mantenimiento</Label>
              <Select
                value={kTipo}
                onValueChange={(v) => setKTipo(v as "AMBOS" | "PREVENTIVO" | "CORRECTIVO")}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AMBOS">Preventivo y correctivo</SelectItem>
                  <SelectItem value="PREVENTIVO">Solo preventivo</SelectItem>
                  <SelectItem value="CORRECTIVO">Solo correctivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label className="text-xs">Placa (contiene)</Label>
              <Input
                className="h-9"
                value={kPlaca}
                onChange={(e) => setKPlaca(e.target.value)}
                placeholder="Ej. JQS, TRG542"
                list="kpi-placas-datalist"
              />
              <datalist id="kpi-placas-datalist">
                {placasDisponibles.slice(0, 80).map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
            <div>
              <Button type="button" size="sm" className="h-9 w-full sm:w-auto" disabled={pending} onClick={aplicarFiltrosTco}>
                {pending ? "…" : "Aplicar filtros"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tcoChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="preventivo" stackId="a" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
              <Bar dataKey="correctivo" stackId="a" fill={COLORS[2]} radius={[6, 6, 0, 0]} />
              <Bar dataKey="combustible" stackId="a" fill={COLORS[3]} radius={[6, 6, 0, 0]} />
              <Bar dataKey="fijos" stackId="a" fill={COLORS[4]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico 3: KPIs de combustible + tiempo de resolución */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>KPIs de combustible</CardTitle>
            <CardDescription>
              Mismo criterio de la sección de combustible en el rango seleccionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Km totales</p>
                <p className="text-2xl font-bold tabular-nums">{fuelResumen.kmTotales.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">km recorridos</p>
              </div>
              <div className="rounded-md border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Consumo promedio</p>
                <p className="text-2xl font-bold tabular-nums">
                  {fuelResumen.consumoPromedioFlota !== null
                    ? `${fuelResumen.consumoPromedioFlota.toFixed(2)}`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">km/gal · {fuelResumen.galonesTotales.toFixed(1)} gal</p>
              </div>
              <div className="rounded-md border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Vehículos con datos</p>
                <p className="text-2xl font-bold tabular-nums">{fuelResumen.vehiculosConDatos}</p>
                <p className="text-xs text-muted-foreground">de {fuelResumen.vehiculosAnalizados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 4: Tiempo de Resolución */}
        <Card>
          <CardHeader>
            <CardTitle>Tiempo de Resolución por Severidad</CardTitle>
            <CardDescription>
              Promedio de horas para cerrar novedades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={resolucionAreaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="severidad" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="promedioHoras"
                  stroke={COLORS[3]}
                  fill={COLORS[3]}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
