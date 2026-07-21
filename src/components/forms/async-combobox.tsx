"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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

export interface AsyncComboboxOption {
  value: string;
  label: string;
}

export interface AsyncComboboxProps {
  value: string;
  /** Etiqueta a mostrar para el value actual (por si no viene de una búsqueda reciente) */
  valueLabel?: string;
  onChange: (v: string, label: string) => void;
  /** Busca contra el servidor — se llama con debounce, mínimo 2 caracteres */
  search: (query: string) => Promise<AsyncComboboxOption[]>;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

/** Combobox con búsqueda contra el servidor (debounce 300ms) — para catálogos
 * grandes (ej. CIE-10) que no tiene sentido cargar completos en el cliente. */
export function AsyncCombobox({
  value,
  valueLabel,
  onChange,
  search,
  placeholder = "Escribe para buscar…",
  id,
  disabled,
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState<AsyncComboboxOption[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      search(q)
        .then(setOptions)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setOptions([]);
  };

  return (
    <Popover open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value ? (valueLabel ?? value) : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <span className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Buscando…
                </span>
              ) : query.trim().length < 2 ? (
                "Escribe al menos 2 caracteres"
              ) : (
                "Sin coincidencias"
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={() => {
                    onChange(opt.value, opt.label);
                    close();
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === opt.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{opt.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
