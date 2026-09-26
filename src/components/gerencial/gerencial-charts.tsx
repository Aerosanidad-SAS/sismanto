"use client";

import { hoyBogota, sumarMeses } from "@/lib/fechas";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateField } from "@/components/forms/date-field";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getEstadisticasServiciosPorCiudad, type EstadisticasPorCiudad } from "@/app/api/actions/estadisticas-servicios";
import { CIUDADES_SERVICIO } from "@/lib/servicios-lista";

const COLORES = { Bogotá: "#2563eb", Medellín: "#16a34a" };

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
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filas}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Legend />
            {visibles.map((d) => (
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
