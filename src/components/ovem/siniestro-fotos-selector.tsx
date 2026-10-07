"use client";

import { useRef } from "react";
import { Camera, CheckCircle2, Loader2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Label } from "@/components/ui/label";

export type EstadoFoto = "PENDIENTE" | "SUBIENDO" | "SUBIDA" | "ERROR";

export interface FotoLocal {
  id: string;
  file: File;
  preview: string;
  estado: EstadoFoto;
  error?: string;
}

interface Props {
  inputId: string;
  titulo: string;
  ayuda: string;
  fotos: FotoLocal[];
  minimo: number;
  error?: string;
  /** Mientras se sube no se agregan ni quitan fotos. */
  bloqueado?: boolean;
  /** Mensajes de archivos rechazados (formato o peso), mostrados junto al control. */
  avisos?: string[];
  onAgregar: (archivos: File[]) => void;
  onQuitar: (id: string) => void;
}

/** Selector de fotos con cámara trasera, miniaturas y botón para quitar. Los archivos ya vienen comprimidos desde el padre. */
export function SiniestroFotosSelector({ inputId, titulo, ayuda, fotos, minimo, error, bloqueado, avisos, onAgregar, onQuitar }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const errorId = `${inputId}-error`;
  const ayudaId = `${inputId}-ayuda`;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-sm font-medium">
        {titulo} <span aria-hidden="true">*</span>
        <span className="sr-only"> (obligatorio, mínimo {minimo})</span>
      </Label>
      <p id={ayudaId} className="text-xs text-muted-foreground">
        {ayuda} Llevas {fotos.length} de {minimo} como mínimo.
      </p>

      <input
        ref={ref}
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        disabled={bloqueado}
        aria-invalid={error ? true : undefined}
        aria-describedby={[ayudaId, error ? errorId : null].filter(Boolean).join(" ")}
        className="sr-only"
        onChange={(e) => {
          const archivos = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (archivos.length) onAgregar(archivos);
        }}
      />
      <Button type="button" variant="outline" className="h-11 w-full sm:w-auto" disabled={bloqueado} onClick={() => ref.current?.click()}>
        <Camera className="mr-2 h-4 w-4" aria-hidden="true" />
        Tomar o elegir fotos
      </Button>

      {fotos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label={`Fotos adjuntas: ${titulo}`}>
          {fotos.map((f, i) => (
            <li key={f.id} className="relative overflow-hidden rounded-md border bg-muted/30">
              {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (object URL) */}
              <img src={f.preview} alt={`${titulo}, foto ${i + 1}`} className="aspect-square w-full object-cover" />
              <span className="absolute bottom-1 left-1 rounded bg-background/90 p-0.5" aria-hidden="true">
                {f.estado === "SUBIENDO" && <Loader2 className="h-4 w-4 animate-spin" />}
                {f.estado === "SUBIDA" && <CheckCircle2 className="h-4 w-4 text-success" />}
                {f.estado === "ERROR" && <AlertTriangle className="h-4 w-4 text-destructive" />}
              </span>
              {f.estado !== "SUBIDA" && !bloqueado && (
                <button
                  type="button"
                  onClick={() => onQuitar(f.id)}
                  aria-label={`Quitar foto ${i + 1} de ${titulo}`}
                  className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              {f.estado === "ERROR" && f.error && <p className="p-1 text-xs text-destructive">{f.error}</p>}
            </li>
          ))}
        </ul>
      )}

      {(avisos ?? []).map((a) => (
        <p key={a} className="text-xs text-destructive">
          {a}
        </p>
      ))}
      <FormError id={errorId}>{error}</FormError>
    </div>
  );
}
