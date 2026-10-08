"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fuel } from "lucide-react";
import { submitOvemFuelLog } from "@/app/api/actions/ovem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { evaluarKilometraje, parseKilometraje, parseNumeroDecimal } from "@/lib/ovem-portal";


export function CombustibleForm({
  vehicleId,
  placa,
  hoy,
  ultimoKm,
  onDone,
}: {
  vehicleId: string;
  placa: string;
  hoy: string;
  /** Último kilometraje registrado del vehículo (para la ayuda y el aviso), si se conoce. */
  ultimoKm?: number | null;
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

  const avisoKm = evaluarKilometraje(parseKilometraje(km), ultimoKm).mensaje;

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await submitOvemFuelLog({
      vehicleId,
      fecha,
      kilometraje: parseKilometraje(km) ?? 0,
      galones: parseNumeroDecimal(galones) ?? 0,
      costo: parseNumeroDecimal(costo),
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
              type="text"
              inputMode="numeric"
              pattern="[0-9.\s]+"
              enterKeyHint="next"
              aria-describedby="fuel-km-ayuda"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="Ej: 125000"
              required
            />
            <p id="fuel-km-ayuda" className="text-xs text-muted-foreground">
              {ultimoKm ? `Último: ${ultimoKm.toLocaleString("es-CO")} km` : "Número que marca el tablero."}
            </p>
            {avisoKm && (
              <p role="status" className="rounded border border-warning bg-warning-soft p-2 text-sm text-warning-foreground">
                {avisoKm}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="fuel-galones">
              Galones <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fuel-galones"
              type="text"
              inputMode="decimal"
              pattern="[0-9]+([.,][0-9]{1,3})?"
              enterKeyHint="next"
              value={galones}
              onChange={(e) => setGalones(e.target.value)}
              placeholder="Ej: 12,5"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fuel-costo">Valor pagado (COP)</Label>
            <Input
              id="fuel-costo"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
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
          {error && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="h-11 w-full sm:col-span-2 sm:w-auto sm:justify-self-start">
            {loading ? "Guardando…" : "Registrar tanqueo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
