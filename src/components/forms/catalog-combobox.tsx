"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

export interface CatalogComboboxProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Si true, permite confirmar el texto de búsqueda como valor aunque no esté en la lista */
  allowCustom?: boolean;
  id?: string;
  disabled?: boolean;
}

export function CatalogCombobox({
  options,
  value,
  onChange,
  placeholder = "Seleccionar o buscar…",
  allowCustom = true,
  id,
  disabled,
}: CatalogComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, search]);

  const close = () => {
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSearch("");
      }}
    >
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
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar…" value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>
              {allowCustom && search.trim() ? (
                <CommandItem
                  value={`__custom__${search.trim()}`}
                  onSelect={() => {
                    onChange(search.trim());
                    close();
                  }}
                >
                  Usar &quot;{search.trim()}&quot;
                </CommandItem>
              ) : (
                "Sin coincidencias"
              )}
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => {
                    onChange(opt);
                    close();
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === opt ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{opt}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
