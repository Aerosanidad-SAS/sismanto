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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Solo un tanqueo de hoy se compara con el último km; uno atrasado lo valida el servidor contra las lecturas de su época.
  const avisoKm = evaluarKilometraje(parseKilometraje(km), fecha === hoy ? ultimoKm : null).mensaje;

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Mismo orden que el servidor: el km solo se queda igual o aumenta (solo para tanqueos de hoy; uno con fecha pasada
    // lo valida el servidor contra las lecturas de esa época).
    const evalKm = evaluarKilometraje(parseKilometraje(km), fecha === hoy ? ultimoKm : null);
    if (evalKm.nivel === "menor" && evalKm.mensaje) {
      setError(`Kilometraje: ${evalKm.mensaje}`);
      return;
    }
    setLoading(true);
    try {
      const result = await submitOvemFuelLog({
        vehicleId,
        fecha,
        kilometraje: parseKilometraje(km) ?? 0,
        galones: parseNumeroDecimal(galones) ?? 0,
        costo: parseNumeroDecimal(costo),
      });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      onDone();
    } catch {
      // Sin señal: lo escrito sigue en pantalla y el botón vuelve a habilitarse.
      setError("No se pudo guardar el tanqueo: revisa tu señal. Lo que escribiste sigue aquí; inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5" />
          Tanqueo — {placa}
        </CardTitle>
        <CardDescription>Fecha, kilometraje, galones y valor pagado.</CardDescription>
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
