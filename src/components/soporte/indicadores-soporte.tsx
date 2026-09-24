"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatoDuracion, type Indicadores } from "@/lib/tickets-indicadores";
import type { ConfigTickets } from "@/app/api/actions/tickets-config";

interface Props {
  datos: Indicadores & { config: ConfigTickets };
  desde?: string;
  hasta?: string;
}

const pct = (n: number | null) => (n === null ? "—" : `${n.toFixed(1)} %`);

function Tarjeta({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{titulo}</CardDescription>
        <CardTitle className="text-2xl">{valor}</CardTitle>
      </CardHeader>
      {detalle && <CardContent className="text-xs text-muted-foreground">{detalle}</CardContent>}
    </Card>
  );
}

export function IndicadoresSoporte({ datos, desde, hasta }: Props) {
  const router = useRouter();
  const [d, setD] = useState(desde ?? "");
  const [h, setH] = useState(hasta ?? "");

  function aplicar() {
    const p = new URLSearchParams();
    if (d) p.set("desde", d);
    if (h) p.set("hasta", h);
    router.push(p.toString() ? `/soporte/indicadores?${p}` : "/soporte/indicadores");
  }

  return (
    <div className="space-y-6">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          aplicar();
        }}
      >
        <div className="space-y-1">
          <Label htmlFor="i-desde">Creados desde</Label>
          <Input id="i-desde" type="date" value={d} onChange={(e) => setD(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="i-hasta">Hasta</Label>
          <Input id="i-hasta" type="date" value={h} onChange={(e) => setH(e.target.value)} />
        </div>
        <Button type="submit">Aplicar</Button>
        <span className="text-xs text-muted-foreground">Sin fechas: últimos 90 días.</span>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta titulo="Tickets en el periodo" valor={String(datos.totalTickets)} detalle={`${datos.cerrados} cerrados`} />
        <Tarjeta titulo="Tiempo de respuesta promedio" valor={formatoDuracion(datos.respuestaPromedioMin)} detalle="Creación → primer contacto" />
        <Tarjeta titulo="Cumplimiento del SLA" valor={pct(datos.slaPorcentaje)} detalle={`${datos.slaEvaluados} ticket(s) con primer contacto`} />
        <Tarjeta titulo="Resolución a la primera (FCR)" valor={pct(datos.fcrPorcentaje)} detalle="Cerrados que no se reabrieron" />
        <Tarjeta titulo="Tiempo medio de resolución (MTTR)" valor={formatoDuracion(datos.mttrPromedioMin)} detalle="Creación → cierre" />
        <Tarjeta
          titulo="Disponibilidad promedio"
          valor={pct(datos.disponibilidadPromedio)}
          detalle={datos.disponibilidadMeses ? `Últimos ${datos.disponibilidadMeses} mes(es) registrados` : "Sin meses registrados"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cerrados por técnico</CardTitle>
        </CardHeader>
        <CardContent>
          {datos.cerradosPorTecnico.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay tickets cerrados en el periodo.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datos.cerradosPorTecnico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tecnico" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="cerrados" fill="#2BB6C7" name="Cerrados" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frecuencia de fallas (MTBF aproximado)</CardTitle>
          <CardDescription>Días promedio entre tickets consecutivos de la misma categoría y área. Menos días = falla más seguido.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Días entre fallas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.mtbf.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                      Se necesitan al menos 2 tickets de la misma categoría y área.
                    </TableCell>
                  </TableRow>
                ) : (
                  datos.mtbf.map((m) => (
                    <TableRow key={`${m.categoria}-${m.area}`}>
                      <TableCell>{m.categoria}</TableCell>
                      <TableCell>{m.area}</TableCell>
                      <TableCell>{m.tickets}</TableCell>
                      <TableCell>{m.diasPromedio.toFixed(1)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        SLA de primer contacto (horas laborales): urgente {datos.config.sla.urgente} · alta {datos.config.sla.alta} · media {datos.config.sla.media} · baja{" "}
        {datos.config.sla.baja}. Horario: {datos.config.horario.inicio}–{datos.config.horario.fin}.
      </p>
    </div>
  );
}
