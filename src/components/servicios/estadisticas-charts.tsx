"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { EstadisticasServicios } from "@/app/api/actions/estadisticas-servicios";

const COLORES = ["#22a7bf", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6", "#64748b", "#ec4899"];

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
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.porMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cantidad" name="Registrados" stroke="#22a7bf" strokeWidth={2} />
              <Line type="monotone" dataKey="finalizados" name="Finalizados" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribución por etapa</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.porEtapa}
                dataKey="cantidad"
                nameKey="etapa"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(entry) => `${entry.etapa} (${entry.cantidad})`}
              >
                {stats.porEtapa.map((_, i) => (
                  <Cell key={i} fill={COLORES[i % COLORES.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Servicios por tipo</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.porTipo} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis type="category" dataKey="tipo" width={180} fontSize={11} />
              <Tooltip />
              <Bar dataKey="cantidad" name="Servicios" fill="#22a7bf" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top ciudades de origen</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.topCiudadesOrigen}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ciudad" fontSize={11} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="cantidad" name="Servicios" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Tiempos promedio (minutos)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.tiemposPromedio} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="concepto" width={200} fontSize={12} />
              <Tooltip />
              <Bar dataKey="minutos" name="Minutos" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
