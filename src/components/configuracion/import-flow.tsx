"use client";

import { useId, useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Piezas locales compartidas por los importadores de archivos (FLU-01 / FLU-02).
 * Son el mínimo para que los tres importadores se vean y se comporten igual;
 * si la librería de componentes trae `FileDrop`, estas piezas se reemplazan por esa.
 */

export type ImportStep = "subir" | "revisar" | "confirmar";

const PASOS: { id: ImportStep; label: string }[] = [
  { id: "subir", label: "Sube" },
  { id: "revisar", label: "Revisa" },
  { id: "confirmar", label: "Confirma" },
];

/** Encabezado «Sube → Revisa → Confirma» con el paso actual resaltado. */
export function ImportSteps({ current }: { current: ImportStep }) {
  const actual = PASOS.findIndex((p) => p.id === current);
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm" aria-label="Pasos de la carga">
      {PASOS.map((p, i) => (
        <li key={p.id} className="flex items-center gap-2">
          <span
            aria-current={i === actual ? "step" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1",
              i === actual && "border-primary bg-primary text-primary-foreground font-medium",
              i < actual && "border-primary text-primary",
              i > actual && "text-muted-foreground"
            )}
          >
            <span aria-hidden="true">{i + 1}.</span>
            {p.label}
          </span>
          {i < PASOS.length - 1 && (
            <span aria-hidden="true" className="text-muted-foreground">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/**
 * Zona para elegir o arrastrar archivos. El control real es un `<input type="file">`
 * con etiqueta, así que funciona con teclado y lector de pantalla.
 */
export function ImportFileDrop({
  accept,
  hint,
  multiple = false,
  busy = false,
  busyLabel = "Leyendo el archivo…",
  compact = false,
  label = "Elige un archivo o arrástralo aquí",
  onFiles,
}: {
  /** Atributo `accept` del input (ej. ".xlsx,.xls,.csv"). */
  accept: string;
  /** Línea de ayuda con formatos y límites. */
  hint?: string;
  multiple?: boolean;
  /** Mientras es true muestra el indicador y no admite archivos nuevos. */
  busy?: boolean;
  busyLabel?: string;
  /** Versión de una línea, para cuando ya hay archivos en cola. */
  compact?: boolean;
  label?: string;
  onFiles: (files: File[]) => void;
}) {
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const entregar = (lista: FileList | null) => {
    if (busy || !lista || lista.length === 0) return;
    onFiles(Array.from(lista));
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!busy) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        entregar(e.dataTransfer.files);
      }}
      className={cn(
        "rounded-lg border-2 border-dashed text-center transition-colors focus-within:ring-2 focus-within:ring-ring",
        compact ? "px-4 py-3" : "px-4 py-8",
        dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30",
        busy && "opacity-70"
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={busy}
        aria-describedby={hint ? hintId : undefined}
        className="sr-only"
        onChange={(e) => {
          entregar(e.target.files);
          e.target.value = ""; // permite volver a elegir el mismo archivo
        }}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md px-3 text-sm font-medium",
          busy && "cursor-wait"
        )}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <FileUp className="h-4 w-4" aria-hidden="true" />
        )}
        <span role={busy ? "status" : undefined}>{busy ? busyLabel : label}</span>
      </label>
      {hint && !compact && (
        <p id={hintId} className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
