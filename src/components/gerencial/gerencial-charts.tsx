"use client";

import { hoyBogota, sumarMeses } from "@/lib/fechas";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateField } from "@/components/forms/date-field";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getEstadisticasServiciosPorCiudad, type EstadisticasPorCiudad } from "@/app/api/actions/estadisticas-servicios";
import { CIUDADES_SERVICIO } from "@/lib/servicios-lista";
import { ChartFigure } from "@/components/charts/chart-figure";
import { CircleDot, SquareDot, DASH_PATTERN } from "@/components/charts/chart-markers";

// One palette (tokens) plus a distinct marker and dash pattern per city, so they differ without color.
const ESTILOS = {
  Bogotá: { stroke: "hsl(var(--chart-1))", dot: CircleDot, dash: undefined },
  Medellín: { stroke: "hsl(var(--chart-3))", dot: SquareDot, dash: DASH_PATTERN },
} as const;
const ESTILO_DEFECTO = { stroke: "hsl(var(--chart-4))", dot: CircleDot, dash: undefined };

function hoyIso() {
  return hoyBogota();
}

function seisMesesAtrasIso() {
  return sumarMeses(hoyBogota(), -6);
}

export function ServiciosPorCiudadChart({ inicial, ciudad = "" }: { inicial: EstadisticasPorCiudad[]; ciudad?: string }) {
  const [desde, setDesde] = useState(seisMesesAtrasIso());
  const [hasta, setHasta] = useState(hoyIso());
  const [datos, setDatos] = useState(inicial);
  const [cargando, setCargando] = useState(false);

  const filtrar = async () => {
    setCargando(true);
    const r = await getEstadisticasServiciosPorCiudad({ desde, hasta });
    setDatos(r);
    setCargando(false);
  };

  const nombreCiudad = CIUDADES_SERVICIO.find((c) => c.clave === ciudad)?.nombre;
  const visibles = nombreCiudad ? datos.filter((d) => d.ciudad === nombreCiudad) : datos;
  const meses = Array.from(new Set(visibles.flatMap((d) => d.serieMensual.map((s) => s.mes)))).sort();
  const filas = meses.map((mes) => {
    const fila: Record<string, string | number> = { mes };
    for (const d of visibles) {
      fila[d.ciudad] = d.serieMensual.find((s) => s.mes === mes)?.cantidad ?? 0;
    }
    return fila;
  });

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{nombreCiudad ? `Servicios por mes — ${nombreCiudad}` : "Servicios por mes — Bogotá vs. Medellín"}</CardTitle>
            <CardDescription>Por ciudad de origen del servicio.</CardDescription>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Desde</label>
              <DateField value={desde} onChange={setDesde} inputClassName="h-9 w-32" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Hasta</label>
              <DateField value={hasta} onChange={setHasta} inputClassName="h-9 w-32" />
            </div>
            <Button size="sm" onClick={filtrar} disabled={cargando}>
              {cargando ? "Filtrando..." : "Filtrar"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartFigure
          label={`Servicios por mes. ${visibles
            .map((d) => {
              const total = d.serieMensual.reduce((acc, p) => acc + p.cantidad, 0);
              return `${d.ciudad}: ${total} en ${d.serieMensual.length} meses`;
            })
            .join("; ") || "Sin datos"}.`}
          columns={[
            { key: "mes", header: "Mes" },
            ...visibles.map((d) => ({ key: d.ciudad, header: d.ciudad })),
          ]}
          rows={filas}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filas} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                {visibles.length > 1 && <Legend />}
                {visibles.map((d) => {
                  const estilo = ESTILOS[d.ciudad as keyof typeof ESTILOS] ?? ESTILO_DEFECTO;
                  return (
                    <Line
                      key={d.ciudad}
                      type="monotone"
                      dataKey={d.ciudad}
                      stroke={estilo.stroke}
                      strokeWidth={2}
                      strokeDasharray={estilo.dash}
                      dot={estilo.dot}
                      activeDot={{ r: 6 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartFigure>
      </CardContent>
    </Card>
  );
}
