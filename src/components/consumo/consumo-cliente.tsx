"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ConsumoVehiculo } from "@/types";
import { Fuel, MapPin, TrendingUp } from "lucide-react";

/** Radix Select no permite SelectItem value=""; usar centinela para “Todos”. */
const SELECT_ALL = "__all__";

interface ConsumoClienteProps {
  metricas: ConsumoVehiculo[];
  vehicles: { id: string; placa: string; marca?: string | null }[];
  centros: { id: number; nombre: string }[];
  fechaInicio: string;
  fechaFin: string;
  vehicleIdFiltro?: string;
  centroIdFiltro?: number;
}

export function ConsumoCliente({
  metricas,
  vehicles,
  centros,
  fechaInicio: initialFechaInicio,
  fechaFin: initialFechaFin,
  vehicleIdFiltro,
  centroIdFiltro,
}: ConsumoClienteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [fechaInicio, setFechaInicio] = useState(initialFechaInicio);
  const [fechaFin, setFechaFin] = useState(initialFechaFin);
  const [vehiculoId, setVehiculoId] = useState(vehicleIdFiltro || "");
  const [centroId, setCentroId] = useState(centroIdFiltro ? String(centroIdFiltro) : "");

  const aplicarFiltros = () => {
    const params = new URLSearchParams();
    params.set("inicio", fechaInicio);
    params.set("fin", fechaFin);
    if (vehiculoId) params.set("vehiculo", vehiculoId);
    if (centroId) params.set("centro", centroId);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  // Métricas de resumen
  const conConsumo = metricas.filter((m) => m.consumoPromedioKmGal !== null);
  const promedioFlota =
    conConsumo.length > 0
      ? conConsumo.reduce((s, m) => s + (m.consumoPromedioKmGal || 0), 0) / conConsumo.length
      : null;
  const totalKm = metricas.reduce((s, m) => s + m.kmRecorridos, 0);
  const totalGalones = metricas.reduce((s, m) => s + m.totalGalones, 0);

  // Datos para gráficos
  const chartDataKm = metricas
    .filter((m) => m.kmRecorridos > 0)
    .sort((a, b) => b.kmRecorridos - a.kmRecorridos)
    .slice(0, 15)
    .map((m) => ({ placa: m.placa, km: m.kmRecorridos }));

  const chartDataConsumo = metricas
    .filter((m) => m.consumoPromedioKmGal !== null)
    .sort((a, b) => (b.consumoPromedioKmGal || 0) - (a.consumoPromedioKmGal || 0))
    .slice(0, 15)
    .map((m) => ({ placa: m.placa, "km/gal": Number((m.consumoPromedioKmGal || 0).toFixed(2)) }));

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label>Fecha Inicio</Label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Fecha Fin</Label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Vehículo</Label>
              <Select
                value={vehiculoId || SELECT_ALL}
                onValueChange={(v) => setVehiculoId(v === SELECT_ALL ? "" : v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_ALL}>Todos</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.placa} {v.marca ? `(${v.marca})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Centro Operaciones</Label>
              <Select
                value={centroId || SELECT_ALL}
                onValueChange={(v) => setCentroId(v === SELECT_ALL ? "" : v)}
              >
                <SelectTrigger className="mt-1">
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
            <div className="flex items-end">
              <Button onClick={aplicarFiltros} disabled={isPending} className="w-full">
                {isPending ? "Cargando..." : "Aplicar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs de resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Km Totales Flota</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKm.toLocaleString()} km</div>
            <p className="text-xs text-muted-foreground">{metricas.length} vehículos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Consumo Promedio Flota</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promedioFlota !== null ? `${promedioFlota.toFixed(2)} km/gal` : "Sin datos"}
            </div>
            <p className="text-xs text-muted-foreground">{totalGalones.toFixed(1)} galones totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Vehículos con Datos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conConsumo.length}</div>
            <p className="text-xs text-muted-foreground">con registros de combustible</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Vehículo</CardTitle>
          <CardDescription>
            Kilometraje recorrido y consumo en el período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metricas.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay datos en el período seleccionado. Verifique que existan registros de mantenimiento o combustible.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead className="text-right">Km Recorridos</TableHead>
                  <TableHead className="text-right">Consumo Prom. (km/gal)</TableHead>
                  <TableHead className="text-right">Total Galones</TableHead>
                  <TableHead className="text-right">Cargas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metricas.map((m) => (
                  <TableRow key={m.vehicleId}>
                    <TableCell className="font-bold">{m.placa}</TableCell>
                    <TableCell className="text-muted-foreground">{m.marca || "—"}</TableCell>
                    <TableCell className="text-right">
                      {m.kmRecorridos > 0 ? m.kmRecorridos.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {m.consumoPromedioKmGal !== null
                        ? m.consumoPromedioKmGal.toFixed(2)
                        : (
                          <span className="text-xs text-muted-foreground">Sin datos</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                      {m.totalGalones > 0 ? m.totalGalones.toFixed(1) : "—"}
                    </TableCell>
                    <TableCell className="text-right">{m.cantidadCargas}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Gráficos */}
      {chartDataKm.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Km Recorridos por Vehículo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartDataKm} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => v.toLocaleString()} />
                  <YAxis type="category" dataKey="placa" width={70} />
                  <Tooltip formatter={(v: any) => [`${v.toLocaleString()} km`, "Km"]} />
                  <Bar dataKey="km" fill="hsl(var(--chart-1))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {chartDataConsumo.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Consumo Promedio (km/gal)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartDataConsumo} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="placa" width={70} />
                    <Tooltip formatter={(v: any) => [`${v} km/gal`, "Consumo"]} />
                    <Bar dataKey="km/gal" fill="hsl(var(--chart-2))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
