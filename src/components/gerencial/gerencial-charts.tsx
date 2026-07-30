"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { EstadisticasPorCiudad } from "@/app/api/actions/estadisticas-servicios";

const COLORES = { Bogotá: "#2563eb", Medellín: "#16a34a" };

export function ServiciosPorCiudadChart({ datos }: { datos: EstadisticasPorCiudad[] }) {
  const meses = Array.from(new Set(datos.flatMap((d) => d.serieMensual.map((s) => s.mes)))).sort();
  const filas = meses.map((mes) => {
    const fila: Record<string, string | number> = { mes };
    for (const d of datos) {
      fila[d.ciudad] = d.serieMensual.find((s) => s.mes === mes)?.cantidad ?? 0;
    }
    return fila;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Servicios por mes — Bogotá vs. Medellín</CardTitle>
        <CardDescription>Últimos 6 meses, por ciudad de origen del servicio.</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filas}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Legend />
            {datos.map((d) => (
              <Line
                key={d.ciudad}
                type="monotone"
                dataKey={d.ciudad}
                stroke={COLORES[d.ciudad as keyof typeof COLORES] ?? "#888"}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
