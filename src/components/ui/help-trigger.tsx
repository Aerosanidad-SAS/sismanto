"use client";

import { useState, type PointerEvent } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Ayuda accesible. Es un Popover (no un Tooltip): abre con toque, clic y teclado, que es lo que usa el OVEM en celular.
 * El área táctil es de 44 px (-m-3.5 + p-3.5) sin mover el ícono de 16 px en la línea de texto.
 *
 * `hover`: además abre al pasar el mouse (como un tooltip) y cierra al salir. Solo con mouse: en pantalla táctil el toque
 * sigue abriendo y cerrando como siempre. Con hover no se roba el foco, para no interrumpir a quien está escribiendo.
 */
export function HelpTrigger({ text, className, hover = false }: { text: string; className?: string; hover?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const alPasar = (abrir: boolean) => (e: PointerEvent) => {
    if (hover && e.pointerType === "mouse") setAbierto(abrir);
  };

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onPointerEnter={alPasar(true)}
          onPointerLeave={alPasar(false)}
          className={cn(
            "-m-3.5 inline-flex shrink-0 items-center justify-center rounded-full p-3.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
          aria-label="Ayuda"
        >
          <HelpCircle className="h-4 w-4" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="w-auto max-w-sm p-3 text-left text-sm leading-snug"
        onOpenAutoFocus={hover ? (e) => e.preventDefault() : undefined}
      >
        {text}
      </PopoverContent>
    </Popover>
  );
}
