"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fuel } from "lucide-react";
import { submitOvemFuelLog } from "@/app/api/actions/ovem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { evaluarKilometraje, parseKilometraje, parseNumeroDecimal } from "@/lib/ovem-portal";
import { erroresTanqueo, type ErroresTanqueo } from "@/lib/tanqueo-errores";


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
  const [errores, setErrores] = useState<ErroresTanqueo>({});

  // Solo un tanqueo de hoy se compara con el último km; uno atrasado lo valida el servidor contra las lecturas de su época.
  const avisoKm = evaluarKilometraje(parseKilometraje(km), fecha === hoy ? ultimoKm : null).mensaje;

  /** Al corregir un campo se le quita su error; los demás siguen hasta el próximo envío. */
  const limpiarError = (campo: keyof ErroresTanqueo) => setErrores((previo) => ({ ...previo, [campo]: undefined }));

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Un mensaje junto a cada campo que falta (el aviso nativo del navegador depende del idioma del teléfono y se pierde).
    const faltas = erroresTanqueo({ fecha, km, galones, costo }, hoy);
    setErrores(faltas);
    const primero = (["fecha", "km", "galones", "costo"] as const).find((c) => faltas[c]);
    if (primero) {
      document.getElementById(`fuel-${primero}`)?.focus();
      return;
    }
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
        <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field id="fuel-fecha" label="Fecha" required error={errores.fecha}>
            <Input
              type="date"
              max={hoy}
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                limpiarError("fecha");
              }}
            />
          </Field>
          <div className="space-y-1">
            <Field
              id="fuel-km"
              label="Kilometraje del tablero"
              required
              error={errores.km}
              hint={ultimoKm ? `Último: ${ultimoKm.toLocaleString("es-CO")} km` : "Número que marca el tablero."}
            >
              <Input
                type="text"
                inputMode="numeric"
                enterKeyHint="next"
                value={km}
                onChange={(e) => {
                  setKm(e.target.value);
                  limpiarError("km");
                }}
                placeholder="Ej: 125000"
              />
            </Field>
            {avisoKm && (
              <p role="status" className="rounded border border-warning bg-warning-soft p-2 text-sm text-warning-foreground">
                {avisoKm}
              </p>
            )}
          </div>
          <Field id="fuel-galones" label="Galones" required error={errores.galones}>
            <Input
              type="text"
              inputMode="decimal"
              enterKeyHint="next"
              value={galones}
              onChange={(e) => {
                setGalones(e.target.value);
                limpiarError("galones");
              }}
              placeholder="Ej: 12,5"
            />
          </Field>
          <Field id="fuel-costo" label="Valor pagado (COP)" error={errores.costo}>
            <Input
              type="text"
              inputMode="numeric"
              value={costo}
              onChange={(e) => {
                setCosto(e.target.value);
                limpiarError("costo");
              }}
              placeholder="Opcional"
            />
          </Field>
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
