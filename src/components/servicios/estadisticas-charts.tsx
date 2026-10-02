"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { EstadisticasServicios } from "@/app/api/actions/estadisticas-servicios";
import { ChartFigure } from "@/components/charts/chart-figure";
import { CircleDot, SquareDot, DASH_PATTERN } from "@/components/charts/chart-markers";
import { describeSeries } from "@/lib/chart-summary";

const units = (v: number) => String(Math.round(v));

interface EstadisticasChartsProps {
  stats: EstadisticasServicios;
}

export function EstadisticasCharts({ stats }: EstadisticasChartsProps) {
  if (stats.total === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        Aún no hay servicios registrados — los gráficos aparecen con los primeros datos.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Servicios por mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartFigure
            label={`Servicios registrados y finalizados por mes. ${describeSeries({
              title: "Registrados",
              rows: stats.porMes,
              labelKey: "mes",
              valueKey: "cantidad",
              format: units,
              noun: ["mes", "meses"],
            })} ${describeSeries({
              title: "Finalizados",
              rows: stats.porMes,
              labelKey: "mes",
              valueKey: "finalizados",
              format: units,
              noun: ["mes", "meses"],
            })}`}
            columns={[
              { key: "mes", header: "Mes" },
              { key: "cantidad", header: "Registrados" },
              { key: "finalizados", header: "Finalizados" },
            ]}
            rows={stats.porMes}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.porMes} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cantidad" name="Registrados" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={CircleDot} activeDot={{ r: 6 }} />
                  <Line
                    type="monotone"
                    dataKey="finalizados"
                    name="Finalizados"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    strokeDasharray={DASH_PATTERN}
                    dot={SquareDot}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartFigure>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Servicios por tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartFigure
            label={describeSeries({
              title: "Servicios por tipo",
              rows: stats.porTipo,
              labelKey: "tipo",
              valueKey: "cantidad",
              format: units,
              noun: ["tipo", "tipos"],
            })}
            columns={[
              { key: "tipo", header: "Tipo" },
              { key: "cantidad", header: "Servicios" },
            ]}
            rows={stats.porTipo}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.porTipo} layout="vertical" margin={{ left: 40 }} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} fontSize={12} />
                  <YAxis type="category" dataKey="tipo" width={180} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="cantidad" name="Servicios" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartFigure>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top ciudades de origen</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartFigure
            label={describeSeries({
              title: "Top ciudades de origen",
              rows: stats.topCiudadesOrigen,
              labelKey: "ciudad",
              valueKey: "cantidad",
              format: units,
              noun: ["ciudad", "ciudades"],
            })}
            columns={[
              { key: "ciudad", header: "Ciudad" },
              { key: "cantidad", header: "Servicios" },
            ]}
            rows={stats.topCiudadesOrigen}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topCiudadesOrigen} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ciudad" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="cantidad" name="Servicios" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartFigure>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Tiempos promedio (minutos)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartFigure
            label={describeSeries({
              title: "Tiempos promedio en minutos",
              rows: stats.tiemposPromedio,
              labelKey: "concepto",
              valueKey: "minutos",
              format: (v) => `${Math.round(v)} min`,
              noun: ["concepto", "conceptos"],
            })}
            columns={[
              { key: "concepto", header: "Concepto" },
              { key: "minutos", header: "Minutos" },
            ]}
            rows={stats.tiemposPromedio}
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.tiemposPromedio} layout="vertical" margin={{ left: 60 }} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="concepto" width={200} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="minutos" name="Minutos" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartFigure>
        </CardContent>
      </Card>
    </div>
  );
}
