"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUrlFotoEquipoBiomedico, subirFotoEquipoBiomedico } from "@/app/api/actions/inventario-biomedico";

/** Foto representativa del equipo biomédico (migración 112): un solo recuadro, con vista previa y reemplazo. */
export function FotoEquipo({ equipmentId, ruta }: { equipmentId: number; ruta: string | null }) {
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
    getUrlFotoEquipoBiomedico(rutaActual).then((u) => {
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
    const r = await subirFotoEquipoBiomedico(equipmentId, file);
    setSubiendo(false);
    if ("error" in r && r.error) setError(r.error);
    else if ("ruta" in r) setRutaActual(r.ruta);
  }

  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- firma temporal (signed URL), no cabe en el allowlist estático de next/image
          <img src={url} alt="Foto del equipo" className="h-full w-full object-cover" />
        ) : (
          <Camera className="h-6 w-6 text-muted-foreground" aria-hidden />
        )}
      </div>
      <div className="space-y-1">
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={elegir} disabled={subiendo} />
        <Button type="button" variant="outline" size="sm" disabled={subiendo} onClick={() => inputRef.current?.click()}>
          {subiendo ? "Subiendo…" : rutaActual ? "Cambiar foto" : "Agregar foto"}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
