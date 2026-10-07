"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { comprimirFoto } from "@/lib/comprimir-imagen";
import { LADOS_VEHICULO, MAX_BYTES_FOTO_VEHICULO, MAX_MB_FOTO_VEHICULO, type LadoVehiculo } from "@/lib/vehiculo-fotos";

/**
 * Las 4 fotos del vehículo ANTES de que exista la fila a la que se van a asociar (un preoperacional que aún no se
 * envió, un vehículo que aún no se crea) — mismo lugar que SISRES (dentro del formulario, antes de "Registrar"),
 * no un paso aparte después de enviar. Solo guarda el archivo elegido en memoria; quien llama (`OvemPortal`,
 * `VehicleForm`) lo sube de verdad una vez esa fila ya existe (necesita su id).
 */
export function SelectorFotosNuevas({
  valores,
  onChange,
}: {
  valores: Partial<Record<LadoVehiculo, File>>;
  onChange: (lado: LadoVehiculo, file: File | null) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {LADOS_VEHICULO.map((l) => (
        <SlotSeleccion key={l.lado} lado={l.lado} etiqueta={l.etiqueta} file={valores[l.lado] ?? null} onChange={onChange} />
      ))}
    </div>
  );
}

function SlotSeleccion({
  lado,
  etiqueta,
  file,
  onChange,
}: {
  lado: LadoVehiculo;
  etiqueta: string;
  file: File | null;
  onChange: (lado: LadoVehiculo, file: File | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function elegir(e: React.ChangeEvent<HTMLInputElement>) {
    const original = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!original) return;
    setError(null);
    // Una foto de celular pesa 3 a 10 MB y Vercel corta las peticiones de más de 4,5 MB: se reduce aquí (lado mayor
    // 1600 px, JPEG) antes de guardarla; así la subida pesa menos de 1 MB y no depende de la señal del conductor.
    let f: File;
    try {
      f = await comprimirFoto(original);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo preparar la foto");
      return;
    }
    if (f.size > MAX_BYTES_FOTO_VEHICULO) {
      setError(`No puede pesar más de ${MAX_MB_FOTO_VEHICULO} MB`);
      return;
    }
    onChange(lado, f);
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-2 p-3">
        <Label htmlFor={`sel-foto-${lado}`} className="text-sm font-medium">
          {etiqueta}
        </Label>
        <div className="flex h-24 items-center justify-center overflow-hidden rounded-md border bg-muted/30">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- vista previa local (object URL), no un archivo del servidor
            <img src={preview} alt={`Foto elegida — ${etiqueta}`} className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-6 w-6 text-muted-foreground" aria-hidden />
          )}
        </div>
        <input
          id={`sel-foto-${lado}`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          capture="environment"
          onChange={elegir}
          className="block w-full text-xs"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
