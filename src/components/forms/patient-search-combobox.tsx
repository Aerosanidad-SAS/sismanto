"use client";

import * as React from "react";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { buscarPacientesTypeahead, type PacienteTypeahead } from "@/app/api/actions/pacientes";

export const nombreCompletoDe = (p: PacienteTypeahead) =>
  [p.nombre1, p.nombre2, p.apellido1, p.apellido2].filter(Boolean).join(" ");

export interface PatientSearchComboboxProps {
  /** Texto a mostrar en el disparador cuando ya hay un paciente elegido (ej. "1090123456 — Juan Pérez"). */
  valueLabel?: string;
  onSelect: (paciente: PacienteTypeahead) => void;
  placeholder?: string;
  disabled?: boolean;
}

/** Combobox con búsqueda contra el servidor (debounce 300ms) por cédula o nombre
 * — al elegir un resultado, el caller precarga los datos del paciente existente. */
export function PatientSearchCombobox({
  valueLabel,
  onSelect,
  placeholder = "Buscar paciente por cédula o nombre…",
  disabled,
}: PatientSearchComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [resultados, setResultados] = React.useState<PacienteTypeahead[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResultados([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      buscarPacientesTypeahead(q)
        .then(setResultados)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setResultados([]);
  };

  return (
    <Popover open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-start gap-2 font-normal"
        >
          <Search className="h-4 w-4 shrink-0 opacity-50" />
          <span className={cn("truncate", !valueLabel && "text-muted-foreground")}>
            {valueLabel ?? placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Cédula o nombre…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <span className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Buscando…
                </span>
              ) : query.trim().length < 2 ? (
                "Escribe al menos 2 caracteres (cédula o nombre)"
              ) : (
                "Sin coincidencias — puedes escribir el nombre manualmente abajo si es un paciente nuevo"
              )}
            </CommandEmpty>
            <CommandGroup>
              {resultados.map((p) => (
                <CommandItem
                  key={p.id}
                  value={String(p.id)}
                  onSelect={() => {
                    onSelect(p);
                    close();
                  }}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{nombreCompletoDe(p)}</span>
                    <span className="text-xs text-muted-foreground">{p.cedula}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
