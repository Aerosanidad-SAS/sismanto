"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface KPIDashboardProps {
  uptimeData: UptimeKPI[];
  tcoData: TCOKPI[];
  ratioPC: RatioPCKPI;
  resolucionData: ResolutionTimeKPI[];
  fechaInicio: string;
  fechaFin: string;
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
}: KPIDashboardProps) {
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
            Costo total de mantenimiento desglosado por tipo
          </CardDescription>
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
