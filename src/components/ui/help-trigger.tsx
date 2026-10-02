"use client";

import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Ayuda accesible. Es un Popover (no un Tooltip): abre con toque, clic y teclado, que es lo que usa el OVEM en celular.
 * El área táctil es de 44 px (-m-3.5 + p-3.5) sin mover el ícono de 16 px en la línea de texto.
 */
export function HelpTrigger({ text, className }: { text: string; className?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "-m-3.5 inline-flex shrink-0 items-center justify-center rounded-full p-3.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
          aria-label="Ayuda"
        >
          <HelpCircle className="h-4 w-4" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-auto max-w-sm p-3 text-left text-sm leading-snug">
        {text}
      </PopoverContent>
    </Popover>
  );
}
