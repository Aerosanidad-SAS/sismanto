"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUrlFotoVehiculo } from "@/app/api/actions/vehiculo-fotos";
import { LADOS_VEHICULO, type FotosVehiculo, type LadoVehiculo } from "@/lib/vehiculo-fotos";

type ResultadoSubida = { error: string } | { success: true; ruta: string };

/**
 * 4 fotos opcionales del vehículo por costado. Mismo componente para el registro del vehículo (`vehicles`) y para
 * un preoperacional puntual (`daily_checks`) — solo cambia qué acción de servidor recibe en `onUpload`.
 */
export function FotosVehiculo({
  fotos,
  onUpload,
  deshabilitado,
}: {
  fotos: FotosVehiculo;
  onUpload: (lado: LadoVehiculo, file: File) => Promise<ResultadoSubida>;
  deshabilitado?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {LADOS_VEHICULO.map((l) => (
        <SlotFoto
          key={l.lado}
          lado={l.lado}
          etiqueta={l.etiqueta}
          ruta={fotos[l.columna] ?? null}
          onUpload={onUpload}
          deshabilitado={deshabilitado}
        />
      ))}
    </div>
  );
}

function SlotFoto({
  lado,
  etiqueta,
  ruta,
  onUpload,
  deshabilitado,
}: {
  lado: LadoVehiculo;
  etiqueta: string;
  ruta: string | null;
  onUpload: (lado: LadoVehiculo, file: File) => Promise<ResultadoSubida>;
  deshabilitado?: boolean;
}) {
  const [rutaActual, setRutaActual] = useState(ruta);
  const [url, setUrl] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let vivo = true;
    if (!rutaActual) {
      setUrl(null);
      return;
    }
    getUrlFotoVehiculo(rutaActual).then((u) => {
      if (vivo) setUrl(u);
    });
    return () => {
      vivo = false;
    };
  }, [rutaActual]);

  async function elegir(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setSubiendo(true);
    setError(null);
    const r = await onUpload(lado, file);
    setSubiendo(false);
    if ("error" in r) setError(r.error);
    else setRutaActual(r.ruta); // vista previa al instante, sin esperar a que el padre refresque sus datos
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-2 p-3">
        <p className="text-sm font-medium">{etiqueta}</p>
        <div className="flex h-28 items-center justify-center overflow-hidden rounded-md border bg-muted/30">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- firma temporal (signed URL), no cabe en el allowlist estático de next/image
            <img src={url} alt={`Vehículo — ${etiqueta}`} className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-6 w-6 text-muted-foreground" aria-hidden />
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={elegir}
          disabled={deshabilitado || subiendo}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          disabled={deshabilitado || subiendo}
          onClick={() => inputRef.current?.click()}
        >
          {subiendo ? "Subiendo…" : rutaActual ? "Cambiar foto" : "Agregar foto"}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
