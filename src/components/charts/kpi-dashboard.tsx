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
}: KPIDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [kCen, setKCen] = useState(tcoCentroIdInicial ? String(tcoCentroIdInicial) : "");
  const [kTipo, setKTipo] = useState(tcoTipoInicial);
  const [kPlaca, setKPlaca] = useState(tcoPlacaInicial);

  useEffect(() => {
    setKCen(tcoCentroIdInicial ? String(tcoCentroIdInicial) : "");
  }, [tcoCentroIdInicial]);
  useEffect(() => {
    setKTipo(tcoTipoInicial);
  }, [tcoTipoInicial]);
  useEffect(() => {
    setKPlaca(tcoPlacaInicial);
  }, [tcoPlacaInicial]);

  const aplicarFiltrosTco = () => {
    const p = new URLSearchParams(searchParams.toString());
    if (kCen) p.set("kCentro", kCen);
    else p.delete("kCentro");
    if (kTipo !== "AMBOS") p.set("kTipo", kTipo);
    else p.delete("kTipo");
    if (kPlaca.trim()) p.set("kPlaca", kPlaca.trim());
    else p.delete("kPlaca");
    startTransition(() => router.push(`${pathname}?${p.toString()}`));
  };
  // Preparar datos para gráficos
  const uptimeChartData = uptimeData.map((item) => ({
    placa: item.placa,
    disponibilidad: Number(item.porcentajeDisponibilidad.toFixed(2)),
  }));

  const tcoChartData = tcoData.map((item) => ({
    nombre: item.placa || item.centroOperativo || "Total",
    preventivo: item.costoPreventivo,
    correctivo: item.costoCorrectivo,
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Disponibilidad Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uptimeData.length > 0
                ? (
                    uptimeData.reduce(
                      (sum, item) => sum + item.porcentajeDisponibilidad,
                      0
                    ) / uptimeData.length
                  ).toFixed(2)
                : "0"}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">TCO Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                tcoData.reduce((sum, item) => sum + item.costoTotal, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Ratio P/C
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ratioPC.ratio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {ratioPC.cantidadPreventivo} preventivos /{" "}
              {ratioPC.cantidadCorrectivo} correctivos
            </p>
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
              <XAxis dataKey="placa" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="disponibilidad" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico 2: TCO por Centro Operativo */}
      <Card>
        <CardHeader>
          <CardTitle>TCO por Vehículo/Centro</CardTitle>
          <CardDescription>
            Costo total de mantenimiento desglosado por tipo. Los filtros siguientes aplican a esta gráfica y al
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
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico 3: Ratio Preventivo vs Correctivo */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ratio Preventivo vs Correctivo</CardTitle>
            <CardDescription>
              Distribución de costos por tipo de mantenimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratioPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill={COLORS[0]}
                  dataKey="value"
                >
                  {ratioPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
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
