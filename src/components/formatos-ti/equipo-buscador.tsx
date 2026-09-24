"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buscarEquipoInventario, type EquipoInventario } from "@/app/api/actions/formatos-ti-equipos";

/**
 * "Buscar equipo en Inventario" (prellenado de los formatos TI). Escribe placa, serie o nombre y, al elegir
 * un resultado, el formulario recibe el equipo para autocompletar sus campos. No es obligatorio: los campos se pueden digitar.
 */
export function EquipoBuscador({ onElegir }: { onElegir: (e: EquipoInventario) => void }) {
  const [texto, setTexto] = React.useState("");
  const [resultados, setResultados] = React.useState<EquipoInventario[]>([]);
  const [buscando, setBuscando] = React.useState(false);

  // 250 ms tras la última tecla; una respuesta vieja no pisa a una nueva.
  React.useEffect(() => {
    if (texto.trim().length < 2) {
      setResultados([]);
      setBuscando(false);
      return;
    }
    let vigente = true;
    setBuscando(true);
    const t = setTimeout(async () => {
      const r = await buscarEquipoInventario(texto);
      if (vigente) {
        setResultados(r);
        setBuscando(false);
      }
    }, 250);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [texto]);

  return (
    <div className="relative space-y-1">
      <Label htmlFor="buscar-equipo">Buscar equipo en Inventario</Label>
      <Input
        id="buscar-equipo"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Placa, serie o nombre (opcional)"
        autoComplete="off"
      />
      {texto.trim().length >= 2 && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover text-sm shadow-md" role="listbox">
          {buscando && <li className="px-3 py-2 text-muted-foreground">Buscando…</li>}
          {!buscando && resultados.length === 0 && <li className="px-3 py-2 text-muted-foreground">Sin coincidencias en el inventario</li>}
          {resultados.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                role="option"
                aria-selected="false"
                className="w-full px-3 py-2 text-left hover:bg-muted"
                onClick={() => {
                  onElegir(e);
                  setTexto("");
                  setResultados([]);
                }}
              >
                <span className="font-medium">{e.placa_equipo}</span> · {e.equipo}
                {e.marca ? ` · ${e.marca}` : ""}
                {e.modelo ? ` ${e.modelo}` : ""}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
