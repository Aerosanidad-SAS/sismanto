"use client";

import { useState, useTransition } from "react";
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
import { formatCurrency } from "@/lib/utils";
import type { CostoPorVehiculoKPI } from "@/types";
import { DollarSign } from "lucide-react";

type TipoFiltro = "AMBOS" | "PREVENTIVO" | "CORRECTIVO";

interface CostoPorVehiculoCardProps {
  datos: CostoPorVehiculoKPI[];
  tipo: TipoFiltro;
  fechaInicio: string;
  fechaFin: string;
}

export function CostoPorVehiculoCard({
  datos,
  tipo: initialTipo,
  fechaInicio,
  fechaFin,
}: CostoPorVehiculoCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [tipo, setTipo] = useState<TipoFiltro>(initialTipo);
  const [isPending, startTransition] = useTransition();

  const cambiarTipo = (nuevoTipo: TipoFiltro) => {
    setTipo(nuevoTipo);
    const params = new URLSearchParams(window.location.search);
    params.set("tipoCosto", nuevoTipo);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const totalFlota = datos.reduce((s, d) => s + d.costoTotal, 0);
  const tiposBtn: { id: TipoFiltro; label: string }[] = [
    { id: "AMBOS", label: "Todos" },
    { id: "PREVENTIVO", label: "Preventivos" },
    { id: "CORRECTIVO", label: "Correctivos" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Costo por Vehículo</CardTitle>
              <CardDescription>Sumatoria de mantenimientos en el período</CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            {tiposBtn.map((btn) => (
              <button
                key={btn.id}
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
        <div className="pt-2">
          <p className="text-2xl font-bold">{formatCurrency(totalFlota)}</p>
          <p className="text-xs text-muted-foreground">Total flota — {datos.length} vehículos</p>
        </div>
      </CardHeader>
      <CardContent>
        {datos.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No hay registros en este período
          </p>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead className="text-right">Preventivo</TableHead>
                  <TableHead className="text-right">Correctivo</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Mantos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.map((d) => (
                  <TableRow key={d.vehicleId}>
                    <TableCell className="font-medium">{d.placa}</TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(d.costoPreventivo)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(d.costoCorrectivo)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(d.costoTotal)}
                    </TableCell>
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
