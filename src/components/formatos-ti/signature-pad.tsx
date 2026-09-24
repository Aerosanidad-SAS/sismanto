"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

/**
 * Firma a mano con mouse, lápiz o dedo (assets/js/firmaCanvasSisres.js de SISRES). Entrega la firma como
 * data URI PNG cuando termina un trazo y `null` al limpiar; el servidor vuelve a validar que sea un PNG real.
 * `existente` es la URL de una firma ya guardada: se muestra hasta que se dibuje una nueva (reemplaza la anterior).
 */
export function SignaturePad({
  etiqueta,
  onChange,
  existente,
  disabled,
}: {
  etiqueta: string;
  onChange: (dataUri: string | null) => void;
  existente?: string | null;
  disabled?: boolean;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const dibujando = React.useRef(false);
  const [conTrazo, setConTrazo] = React.useState(false);

  const contexto = () => {
    const ctx = canvasRef.current?.getContext("2d") ?? null;
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#111827";
    }
    return ctx;
  };

  const punto = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    // El canvas tiene un tamaño interno fijo y se escala por CSS: se convierte al espacio interno.
    return { x: ((e.clientX - r.left) * c.width) / r.width, y: ((e.clientY - r.top) * c.height) / r.height };
  };

  const empezar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    const ctx = contexto();
    if (!ctx) return;
    const p = punto(e);
    dibujando.current = true;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.01, p.y + 0.01); // un toque sin arrastrar deja un punto
    ctx.stroke();
  };

  const mover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dibujando.current) return;
    e.preventDefault();
    const ctx = contexto();
    if (!ctx) return;
    const p = punto(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const terminar = () => {
    if (!dibujando.current) return;
    dibujando.current = false;
    setConTrazo(true);
    onChange(canvasRef.current?.toDataURL("image/png") ?? null);
  };

  const limpiar = () => {
    const c = canvasRef.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    setConTrazo(false);
    onChange(null);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{etiqueta}</span>
        <Button type="button" variant="ghost" size="sm" onClick={limpiar} disabled={disabled || !conTrazo}>
          Limpiar
        </Button>
      </div>
      {existente && !conTrazo && (
        // eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal de Storage, no un asset estático
        <img src={existente} alt={`Firma guardada: ${etiqueta}`} className="h-16 rounded border bg-white object-contain p-1" />
      )}
      <canvas
        ref={canvasRef}
        width={480}
        height={160}
        aria-label={`Espacio para firmar: ${etiqueta}`}
        className="w-full touch-none rounded border border-dashed bg-white"
        onPointerDown={empezar}
        onPointerMove={mover}
        onPointerUp={terminar}
        onPointerCancel={terminar}
      />
      {existente && !conTrazo && <p className="text-xs text-muted-foreground">Dibuja de nuevo solo si quieres reemplazar la firma guardada.</p>}
    </div>
  );
}
