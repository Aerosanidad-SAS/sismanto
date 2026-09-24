"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { buscarAeropuertosTypeahead } from "@/app/api/actions/aeropuertos";
import { AEROPUERTOS_MIN_CARACTERES, etiquetaAeropuerto, type AeropuertoLista } from "@/lib/aeropuertos";

/**
 * Buscador de aeropuertos (configurarBuscadorAeropuerto de SISRES): escribe nombre, ciudad o código y elige.
 * El valor que devuelve es el TEXTO "Nombre - Municipio (PAÍS/CÓDIGO)", no un id: las valoraciones guardan
 * origen/destino como texto. Si no hay coincidencias deja confirmar lo escrito (aeropuertos que no están en
 * el catálogo y valores históricos).
 */
export function AeropuertoCombobox({
  value,
  onChange,
  id,
  placeholder = "Escribe nombre, ciudad o código",
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [busqueda, setBusqueda] = React.useState("");
  const [resultados, setResultados] = React.useState<AeropuertoLista[]>([]);
  const [buscando, setBuscando] = React.useState(false);

  // Espera 250 ms tras la última tecla y descarta respuestas viejas (una búsqueda lenta no pisa a una nueva).
  React.useEffect(() => {
    if (busqueda.trim().length < AEROPUERTOS_MIN_CARACTERES) {
      setResultados([]);
      setBuscando(false);
      return;
    }
    let vigente = true;
    setBuscando(true);
    const t = setTimeout(async () => {
      const r = await buscarAeropuertosTypeahead(busqueda);
      if (vigente) {
        setResultados(r);
        setBuscando(false);
      }
    }, 250);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [busqueda]);

  const cerrar = () => {
    setOpen(false);
    setBusqueda("");
  };
  const escrito = busqueda.trim();

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setBusqueda("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar aeropuerto…" value={busqueda} onValueChange={setBusqueda} />
          <CommandList>
            <CommandEmpty>
              {escrito.length < AEROPUERTOS_MIN_CARACTERES ? (
                `Escribe al menos ${AEROPUERTOS_MIN_CARACTERES} letras`
              ) : buscando ? (
                "Buscando…"
              ) : (
                <CommandItem
                  value={`__custom__${escrito}`}
                  onSelect={() => {
                    onChange(escrito);
                    cerrar();
                  }}
                >
                  Sin coincidencias: usar &quot;{escrito}&quot;
                </CommandItem>
              )}
            </CommandEmpty>
            <CommandGroup>
              {resultados.map((a) => {
                const etiqueta = etiquetaAeropuerto(a);
                return (
                  <CommandItem
                    key={a.id}
                    value={`${a.id}-${etiqueta}`}
                    onSelect={() => {
                      onChange(etiqueta);
                      cerrar();
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4 shrink-0", value === etiqueta ? "opacity-100" : "opacity-0")} />
                    <span className="truncate">{etiqueta}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
