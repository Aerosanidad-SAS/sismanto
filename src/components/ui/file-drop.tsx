"use client";

import * as React from "react";
import { FileText, UploadCloud, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatFileSize, joinIds, validateFile } from "@/lib/ui-forms";
import { FormError } from "@/components/ui/form-error";

export interface FileDropProps {
  /** Selected file (controlled). */
  file: File | null;
  /** Called with the valid file, or null when removed. Invalid files are never passed here. */
  onFileChange: (file: File | null) => void;
  /** Same format as the HTML `accept` attribute: ".xlsx,.xls" or "image/*". */
  accept?: string;
  /** Maximum size in bytes. */
  maxBytes?: number;
  /** External error (e.g. server-side). Shown instead of the local validation error. */
  error?: React.ReactNode;
  /** Called with the validation message when a file is rejected. */
  onReject?: (message: string) => void;
  disabled?: boolean;
  /** Instruction text. Default: "Arrastra el archivo aquí o haz clic para elegirlo". */
  prompt?: string;
  /** Format hint under the prompt, e.g. "Excel (.xlsx), máximo 5 MB". */
  helper?: string;
  className?: string;
  // Injected by <Field>
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
}

/**
 * Drag-and-drop zone around a real, keyboard-focusable `<input type="file">`.
 * Use inside <Field label="Plantilla">{(p) => <FileDrop {...p} .../>}</Field>.
 */
export function FileDrop({
  file,
  onFileChange,
  accept,
  maxBytes,
  error,
  onReject,
  disabled,
  prompt = "Arrastra el archivo aquí o haz clic para elegirlo",
  helper,
  className,
  id,
  ...aria
}: FileDropProps) {
  const generated = React.useId();
  const inputId = id ?? generated;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const shownError = error || localError;

  const accepted = React.useCallback(
    (candidate: File | undefined) => {
      if (!candidate) return;
      const result = validateFile(candidate, { accept, maxBytes });
      if (!result.ok) {
        setLocalError(result.message);
        onReject?.(result.message);
        return;
      }
      setLocalError(null);
      onFileChange(candidate);
    },
    [accept, maxBytes, onFileChange, onReject]
  );

  const clear = () => {
    setLocalError(null);
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.focus();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          accepted(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex min-h-[7rem] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-input bg-background px-4 py-6 text-center transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:bg-accent/50",
          dragging && "border-primary bg-accent",
          shownError && "border-destructive",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium">{prompt}</span>
        {helper ? <span className="text-sm text-muted-foreground">{helper}</span> : null}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={accept}
          disabled={disabled}
          onChange={(e) => {
            accepted(e.target.files?.[0]);
            // Allows picking the same file again after removing it.
            e.target.value = "";
          }}
          {...aria}
          aria-describedby={joinIds(aria["aria-describedby"], localError && !error && `${inputId}-local-error`)}
          aria-invalid={shownError ? true : aria["aria-invalid"]}
        />
      </label>

      {file ? (
        <div className="flex items-center gap-3 rounded-md border border-border bg-card p-2 pl-3">
          <FileText className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            aria-label={`Quitar archivo ${file.name}`}
            className="inline-flex h-touch w-touch shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {/* Local validation errors need their own live region; Field renders the external `error` itself. */}
      {localError && !error ? <FormError id={`${inputId}-local-error`}>{localError}</FormError> : null}
      <span className="sr-only" role="status" aria-live="polite">
        {file ? `Archivo seleccionado: ${file.name}, ${formatFileSize(file.size)}` : ""}
      </span>
    </div>
  );
}
