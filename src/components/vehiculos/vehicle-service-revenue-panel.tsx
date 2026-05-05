"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { formatCurrency } from "@/lib/utils";
import {
  upsertVehicleServiceRevenue,
  deleteVehicleServiceRevenue,
} from "@/app/api/actions/service-revenue";

interface ServiceTypeOpt {
  id: number;
  codigo: string;
  nombre: string;
}

interface RevenueRow {
  id: number;
  periodo: string;
  monto: number;
  notas: string | null;
  service_types: { codigo: string; nombre: string } | null;
}

export function VehicleServiceRevenuePanel({
  vehicleId,
  serviceTypes,
  initialRows,
  canEdit,
}: {
  vehicleId: string;
  serviceTypes: ServiceTypeOpt[];
  initialRows: RevenueRow[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [serviceTypeId, setServiceTypeId] = useState(String(serviceTypes[0]?.id ?? ""));
  const [periodo, setPeriodo] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [monto, setMonto] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !serviceTypeId) return;
    const m = parseFloat(monto);
    if (Number.isNaN(m) || m < 0) {
      setError("Monto inválido");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await upsertVehicleServiceRevenue({
      vehicleId,
      serviceTypeId: parseInt(serviceTypeId, 10),
      periodo,
      monto: m,
    });
    setBusy(false);
    if (res && "error" in res && res.error) setError(res.error);
    else {
      setMonto("");
      router.refresh();
    }
  };

  const remove = async (rowId: number) => {
    if (!confirm("¿Eliminar este registro de ingreso?")) return;
    setBusy(true);
    const res = await deleteVehicleServiceRevenue(rowId, vehicleId);
    setBusy(false);
    if ("error" in res && res.error) alert(res.error);
    else router.refresh();
  };

  if (serviceTypes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay tipos de servicio. Créelos en Configuración → Servicios prestados (o ejecute la migración 006).
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-4 items-end border rounded-lg p-4 bg-muted/30">
          <div>
            <Label>Tipo</Label>
            <Select value={serviceTypeId} onValueChange={setServiceTypeId}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.codigo} — {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="periodo-rev">Periodo (mes)</Label>
            <Input
              id="periodo-rev"
              type="month"
              className="mt-1"
              value={periodo.slice(0, 7)}
              onChange={(e) => {
                const v = e.target.value;
                if (v.length >= 7) setPeriodo(`${v}-01`);
              }}
            />
          </div>
          <div>
            <Label htmlFor="monto-rev">Monto ($)</Label>
            <Input
              id="monto-rev"
              type="number"
              step="0.01"
              min={0}
              className="mt-1"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "…" : "Guardar"}
          </Button>
          {error && <p className="text-sm text-red-600 md:col-span-4">{error}</p>}
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Periodo</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            {canEdit && <TableHead className="w-[100px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialRows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.periodo}</TableCell>
              <TableCell>
                {r.service_types?.codigo} — {r.service_types?.nombre}
              </TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(r.monto)}</TableCell>
              {canEdit && (
                <TableCell>
                  <Button variant="ghost" size="sm" type="button" onClick={() => remove(r.id)} disabled={busy}>
                    Eliminar
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {initialRows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Sin ingresos registrados por servicio para este vehículo.
        </p>
      )}
    </div>
  );
}
