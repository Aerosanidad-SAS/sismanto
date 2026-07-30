"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FORMATO_VISIBLE = "dd/MM/yyyy";
const FORMATO_ISO = "yyyy-MM-dd";

function aFecha(valorIso: string): Date | undefined {
  if (!valorIso) return undefined;
  const d = parse(valorIso, FORMATO_ISO, new Date());
  return isValid(d) ? d : undefined;
}

export interface DateFieldProps {
  /** Valor en formato ISO "yyyy-MM-dd" (mismo formato que ya usa el input nativo type="date") — vacío si no hay fecha. */
  value: string;
  onChange: (isoValue: string) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  /** Igual que el atributo `max`/`min` del input nativo — formato ISO "yyyy-MM-dd". */
  max?: string;
  min?: string;
  /** Clase del contenedor (input + botón calendario) — para encajar en barras de filtros angostas. */
  className?: string;
  /** Clase del input de texto en sí (ej. para achicarlo en una barra compacta). */
  inputClassName?: string;
}

/**
 * Reemplazo del input nativo type="date" — se ve y se escribe en dd/mm/aaaa
 * (el nativo depende de la configuración regional del SO, que en Windows
 * suele mostrar mm/dd/aaaa aunque el usuario sea colombiano). Acepta tanto
 * escribir la fecha como elegirla en el calendario. El valor que entra/sale
 * sigue siendo ISO "yyyy-MM-dd" — no cambia nada del lado de Zod/BD.
 */
export function DateField({ value, onChange, id, disabled, placeholder = "dd/mm/aaaa", max, min, className, inputClassName }: DateFieldProps) {
  const fechaSeleccionada = aFecha(value);
  const [texto, setTexto] = React.useState(fechaSeleccionada ? format(fechaSeleccionada, FORMATO_VISIBLE) : "");
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const f = aFecha(value);
    setTexto(f ? format(f, FORMATO_VISIBLE) : "");
  }, [value]);

  const confirmarTexto = (crudo: string) => {
    const limpio = crudo.trim();
    if (!limpio) {
      onChange("");
      return;
    }
    const parseada = parse(limpio, FORMATO_VISIBLE, new Date());
    if (isValid(parseada)) onChange(format(parseada, FORMATO_ISO));
    // Si no es una fecha válida todavía (el usuario sigue escribiendo),
    // no se propaga — se corrige solo cuando el texto vuelva a ser válido.
  };

  const maxFecha = max ? aFecha(max) : undefined;
  const minFecha = min ? aFecha(min) : undefined;

  return (
    <div className={cn("flex gap-1", className)}>
      <Input
        id={id}
        value={texto}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={(e) => confirmarTexto(e.target.value)}
        className={cn("flex-1", inputClassName)}
        inputMode="numeric"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="icon" disabled={disabled} className="shrink-0" aria-label="Elegir fecha en calendario">
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={fechaSeleccionada}
            defaultMonth={fechaSeleccionada}
            locale={es}
            disabled={[
              ...(maxFecha ? [{ after: maxFecha }] : []),
              ...(minFecha ? [{ before: minFecha }] : []),
            ]}
            onSelect={(d) => {
              if (d) {
                onChange(format(d, FORMATO_ISO));
                setTexto(format(d, FORMATO_VISIBLE));
              }
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
