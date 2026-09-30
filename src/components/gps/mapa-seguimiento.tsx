"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EstadoSeguimiento } from "@/app/api/actions/seguimiento-gps";
import { urlGoogleMaps, urlMapaOsm } from "@/lib/gps/mapas";
import { formatoInstante } from "@/lib/fechas";

const REFRESCO_MS = 30_000;

/** Mapa con la última posición de la ambulancia; se actualiza solo cada 30 s (SISRES refrescaba la página). */
export function MapaSeguimiento({ cargar }: { cargar: () => Promise<EstadoSeguimiento | { error: string }> }) {
  const [estado, setEstado] = useState<EstadoSeguimiento | { error: string } | null>(null);
  const [actualizando, setActualizando] = useState(false);

  const refrescar = useCallback(async () => {
    setActualizando(true);
    setEstado(await cargar());
    setActualizando(false);
  }, [cargar]);

  useEffect(() => {
    void refrescar();
    const t = setInterval(() => void refrescar(), REFRESCO_MS);
    return () => clearInterval(t);
  }, [refrescar]);

  if (!estado) return <p className="text-sm text-muted-foreground">Buscando la ambulancia…</p>;
  if ("error" in estado) return <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{estado.error}</p>;

  const p = estado.posicion;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span>
          Ambulancia <strong>{estado.placa ?? "—"}</strong>
        </span>
        {p?.velocidadKmh !== null && p?.velocidadKmh !== undefined && <span>{Math.round(p.velocidadKmh)} km/h</span>}
        {p?.reportadaEn && <span className="text-muted-foreground">Última señal: {formatoInstante(p.reportadaEn, { timeStyle: "short", dateStyle: "short" })}</span>}
        <Button variant="ghost" size="sm" className="ml-auto" onClick={() => void refrescar()} disabled={actualizando}>
          <RefreshCw className={`mr-1 h-4 w-4 ${actualizando ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>
      {p ? (
        <>
          <iframe
            title={`Ubicación de la ambulancia ${estado.placa ?? ""}`}
            src={urlMapaOsm(p.latitud, p.longitud)}
            className="h-[60vh] min-h-[320px] w-full rounded-md border border-border"
            loading="lazy"
          />
          <a href={urlGoogleMaps(p.latitud, p.longitud)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm underline">
            <ExternalLink className="h-4 w-4" />
            Abrir en Google Maps
          </a>
        </>
      ) : (
        <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{estado.aviso ?? "Sin posición disponible"}</p>
      )}
    </div>
  );
}
