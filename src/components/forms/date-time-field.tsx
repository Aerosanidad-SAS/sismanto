"use client";

import * as React from "react";
import { format, parse, isValid, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FORMATO_VISIBLE = "dd/MM/yyyy HH:mm";
// Mismo formato que ya produce/consume el input nativo type="datetime-local".
const FORMATO_ISO = "yyyy-MM-dd'T'HH:mm";

function aFecha(valorIso: string): Date | undefined {
  if (!valorIso) return undefined;
  const d = parse(valorIso, FORMATO_ISO, new Date());
  return isValid(d) ? d : undefined;
}

export interface DateTimeFieldProps {
  /** Valor en formato "yyyy-MM-ddTHH:mm" (mismo formato que ya usa el input nativo type="datetime-local") — vacío si no hay fecha. */
  value: string;
  onChange: (isoValue: string) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Reemplazo del input nativo type="datetime-local" — se ve y se escribe en
 * dd/mm/aaaa hh:mm en vez de depender de la configuración regional del SO.
 * El calendario elige la fecha; la hora se escribe aparte (más rápido que
 * un selector de hora con picker propio, y es como ya se captura hoy en
 * la mayoría de los formularios de despacho). El valor que entra/sale sigue
 * siendo "yyyy-MM-ddTHH:mm" — no cambia nada del lado de Zod/BD.
 */
export function DateTimeField({ value, onChange, id, disabled, placeholder = "dd/mm/aaaa hh:mm" }: DateTimeFieldProps) {
  const fechaSeleccionada = aFecha(value);
  const [texto, setTexto] = React.useState(fechaSeleccionada ? format(fechaSeleccionada, FORMATO_VISIBLE) : "");
  const [open, setOpen] = React.useState(false);
  const [horaCalendario, setHoraCalendario] = React.useState(fechaSeleccionada ? format(fechaSeleccionada, "HH:mm") : "00:00");

  React.useEffect(() => {
    const f = aFecha(value);
    setTexto(f ? format(f, FORMATO_VISIBLE) : "");
    if (f) setHoraCalendario(format(f, "HH:mm"));
  }, [value]);

  const confirmarTexto = (crudo: string) => {
    const limpio = crudo.trim();
    if (!limpio) {
      onChange("");
      return;
    }
    const parseada = parse(limpio, FORMATO_VISIBLE, new Date());
    if (isValid(parseada)) onChange(format(parseada, FORMATO_ISO));
  };

  const elegirDia = (d: Date | undefined) => {
    if (!d) return;
    const [h, m] = horaCalendario.split(":").map((n) => parseInt(n, 10));
    const conHora = setMinutes(setHours(d, Number.isFinite(h) ? h : 0), Number.isFinite(m) ? m : 0);
    onChange(format(conHora, FORMATO_ISO));
    setTexto(format(conHora, FORMATO_VISIBLE));
  };

  return (
    <div className="flex gap-1">
      <Input
        id={id}
        value={texto}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={(e) => confirmarTexto(e.target.value)}
        className="flex-1"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="icon" disabled={disabled} className="shrink-0" aria-label="Elegir fecha y hora en calendario">
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar mode="single" selected={fechaSeleccionada} defaultMonth={fechaSeleccionada} locale={es} onSelect={elegirDia} />
          <div className="flex items-center gap-2 border-t p-3">
            <label htmlFor={`${id}-hora`} className="text-xs text-muted-foreground">
              Hora
            </label>
            <Input
              id={`${id}-hora`}
              type="time"
              value={horaCalendario}
              onChange={(e) => {
                setHoraCalendario(e.target.value);
                if (fechaSeleccionada) elegirDia(fechaSeleccionada);
              }}
              className="h-8 w-28"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
