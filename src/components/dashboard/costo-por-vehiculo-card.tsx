"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import type { CostoPorVehiculoKPI } from "@/types";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpTrigger } from "@/components/ui/help-trigger";
import { stripDashboardGlobalParams } from "@/lib/dashboard-search-params";

type TipoFiltro = "AMBOS" | "PREVENTIVO" | "CORRECTIVO";

const SELECT_ALL = "__all__";

interface CostoPorVehiculoCardProps {
  datos: CostoPorVehiculoKPI[];
  tipo: TipoFiltro;
  fechaInicio: string;
  fechaFin: string;
  centros: { id: number; nombre: string }[];
  centroIdFiltro?: number;
  placasFiltro?: string;
  textoTrabajo?: string;
}

export function CostoPorVehiculoCard({
  datos,
  tipo: initialTipo,
  fechaInicio,
  fechaFin,
  centros,
  centroIdFiltro,
  placasFiltro = "",
  textoTrabajo = "",
}: CostoPorVehiculoCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [tipo, setTipo] = useState<TipoFiltro>(initialTipo);
  const [centro, setCentro] = useState(centroIdFiltro ? String(centroIdFiltro) : "");
  const [placas, setPlacas] = useState(placasFiltro);
  const [txt, setTxt] = useState(textoTrabajo);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setTipo(initialTipo), [initialTipo]);
  useEffect(() => setCentro(centroIdFiltro ? String(centroIdFiltro) : ""), [centroIdFiltro]);
  useEffect(() => setPlacas(placasFiltro), [placasFiltro]);
  useEffect(() => setTxt(textoTrabajo), [textoTrabajo]);

  const pushParams = (
    nextTipo: TipoFiltro,
    nextCentro: string,
    nextPlacas: string,
    nextTxt: string
  ) => {
    const params = new URLSearchParams(window.location.search);
    stripDashboardGlobalParams(params);
    params.set("tipoCosto", nextTipo);
    params.set("inicio", fechaInicio);
    params.set("fin", fechaFin);
    if (nextCentro) params.set("costoCentro", nextCentro);
    else params.delete("costoCentro");
    if (nextPlacas.trim()) params.set("costoPlacas", nextPlacas.trim());
    else params.delete("costoPlacas");
    if (nextTxt.trim()) params.set("costoBusqueda", nextTxt.trim());
    else params.delete("costoBusqueda");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const cambiarTipo = (nuevoTipo: TipoFiltro) => {
    setTipo(nuevoTipo);
    pushParams(nuevoTipo, centro, placas, txt);
  };

  const aplicarGrupo2 = () => pushParams(tipo, centro, placas, txt);

  const totalFlota = datos.reduce((s, d) => s + d.costoTotal, 0);
  const totalMantenimiento = datos.reduce((s, d) => s + d.costoMantenimientoTotal, 0);
  const totalCombustible = datos.reduce((s, d) => s + d.costoCombustible, 0);
  const totalFijo = datos.reduce((s, d) => s + d.costoFijoAnual, 0);
  const tiposBtn: { id: TipoFiltro; label: string }[] = [
    { id: "AMBOS", label: "Todos" },
    { id: "PREVENTIVO", label: "Preventivo" },
    { id: "CORRECTIVO", label: "Correctivo" },
  ];

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-2">
            <DollarSign className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>CTO por vehículo</CardTitle>
                <HelpTrigger text="CTO = mantenimiento + combustible + costos anuales (SOAT, RTM/TM y póliza). El filtro por tipo aplica al componente de mantenimiento." />
              </div>
              <CardDescription>Costo total de operación en el período (orden: mayor a menor)</CardDescription>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Grupo 1 · Tipo</p>
            <div className="flex flex-wrap gap-1">
              {tiposBtn.map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => cambiarTipo(btn.id)}
                  disabled={isPending}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    tipo === btn.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Grupo 2 · Cruce y búsqueda</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs">Centro de operaciones</Label>
              <Select
                value={centro || SELECT_ALL}
                onValueChange={(v) => setCentro(v === SELECT_ALL ? "" : v)}
              >
                <SelectTrigger className="h-9 mt-1">
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
            <div className="sm:col-span-2">
              <Label className="text-xs">Placa(s)</Label>
              <Input
                className="h-9 mt-1"
                placeholder="Una o varias: ABC123, XYZ890"
                value={placas}
                onChange={(e) => setPlacas(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Label className="text-xs">Buscar en trabajo / categoría / ítems (ej. aceite)</Label>
              <Input
                className="h-9 mt-1"
                placeholder="Filtra facturas cuyo detalle coincida"
                value={txt}
                onChange={(e) => setTxt(e.target.value)}
              />
            </div>
          </div>
          <Button type="button" size="sm" onClick={aplicarGrupo2} disabled={isPending}>
            {isPending ? "Aplicando…" : "Aplicar filtros"}
          </Button>
        </div>

        <div className="space-y-1">
          <p className="text-2xl font-bold">{formatCurrency(totalFlota)}</p>
          <p className="text-xs text-muted-foreground">CTO total — {datos.length} vehículos</p>
          <p className="text-[11px] text-muted-foreground">
            Mantto {formatCurrency(totalMantenimiento)} · Combustible {formatCurrency(totalCombustible)} · Fijos {formatCurrency(totalFijo)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {datos.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No hay registros con estos filtros en el período
          </p>
        ) : (
          <div className="max-h-72 overflow-y-auto overflow-x-auto rounded-md border">
            <Table className="min-w-[840px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead className="text-right">Mantto</TableHead>
                  <TableHead className="text-right">Preventivo</TableHead>
                  <TableHead className="text-right">Correctivo</TableHead>
                  <TableHead className="text-right">Combustible</TableHead>
                  <TableHead className="text-right">SOAT+RTM+Póliza</TableHead>
                  <TableHead className="text-right">CTO</TableHead>
                  <TableHead className="text-right">Mantos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.map((d) => (
                  <TableRow key={d.vehicleId}>
                    <TableCell className="font-medium">{d.placa}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(d.costoMantenimientoTotal)}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(d.costoPreventivo)}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(d.costoCorrectivo)}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(d.costoCombustible)}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(d.costoFijoAnual)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(d.costoTotal)}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {d.cantidadMantenimientos}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
