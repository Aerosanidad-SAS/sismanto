"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fuel } from "lucide-react";
import { submitOvemFuelLog } from "@/app/api/actions/ovem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function numero(v: string): number | undefined {
  const n = Number(v.replace(",", "."));
  return v.trim() && Number.isFinite(n) ? n : undefined;
}

export function CombustibleForm({
  vehicleId,
  placa,
  hoy,
  onDone,
}: {
  vehicleId: string;
  placa: string;
  hoy: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [fecha, setFecha] = useState(hoy);
  const [km, setKm] = useState("");
  const [galones, setGalones] = useState("");
  const [costo, setCosto] = useState("");
  const [numeroVenta, setNumeroVenta] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await submitOvemFuelLog({
      vehicleId,
      fecha,
      kilometraje: Math.trunc(numero(km) ?? 0),
      galones: numero(galones) ?? 0,
      costo: numero(costo),
      numeroVenta: numeroVenta || undefined,
    });
    setLoading(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onDone();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5" />
          Tanqueo — {placa}
        </CardTitle>
        <CardDescription>Con los datos del recibo de la estación.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="fuel-fecha">Fecha</Label>
            <Input id="fuel-fecha" type="date" max={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fuel-km">
              Kilometraje del tablero <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fuel-km"
              type="number"
              inputMode="numeric"
              min={1}
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="Ej: 125000"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fuel-galones">
              Galones <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fuel-galones"
              type="number"
              inputMode="decimal"
              step="0.001"
              min={0.001}
              value={galones}
              onChange={(e) => setGalones(e.target.value)}
              placeholder="Ej: 12.5"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fuel-costo">Valor pagado (COP)</Label>
            <Input
              id="fuel-costo"
              type="number"
              inputMode="numeric"
              min={0}
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="fuel-venta">Número de venta del recibo</Label>
            <Input
              id="fuel-venta"
              value={numeroVenta}
              onChange={(e) => setNumeroVenta(e.target.value)}
              placeholder="Opcional"
              maxLength={40}
            />
          </div>
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <Button type="submit" disabled={loading} className="h-11 w-full sm:col-span-2 sm:w-auto sm:justify-self-start">
            {loading ? "Guardando…" : "Registrar tanqueo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
