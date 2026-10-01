"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { aplicarPlantilla, type PlantillaTexto } from "@/lib/biomedico-plantillas";

/**
 * «Usar plantilla…» encima de un campo de texto del mantenimiento (plantillasMttoSelector de SISRES). Campo vacío →
 * pega el texto; con texto → pregunta Reemplazar / Agregar al final / Cancelar.
 */
export function SelectorPlantilla({
  plantillas,
  puedeEditar,
  valorActual,
  onAplicar,
}: {
  plantillas: PlantillaTexto[];
  puedeEditar: boolean;
  valorActual: string | null | undefined;
  onAplicar: (texto: string) => void;
}) {
  const [pendiente, setPendiente] = useState<PlantillaTexto | null>(null);
  if (plantillas.length === 0 && !puedeEditar) return null;

  function elegir(id: string) {
    const p = plantillas.find((x) => String(x.id) === id);
    if (!p) return;
    if ((valorActual ?? "").trim()) setPendiente(p);
    else onAplicar(p.texto);
  }

  function confirmar(modo: "reemplazar" | "agregar") {
    if (pendiente) onAplicar(aplicarPlantilla(valorActual, pendiente.texto, modo));
    setPendiente(null);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {plantillas.length > 0 ? (
          <select
            aria-label="Usar plantilla"
            className="h-8 max-w-xs rounded-md border border-input bg-background px-2 text-xs"
            value=""
            onChange={(e) => elegir(e.target.value)}
          >
            <option value="">Usar plantilla…</option>
            {plantillas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-muted-foreground">Sin plantillas para este campo.</span>
        )}
        {puedeEditar && (
          <Link href="/equipos/plantillas" target="_blank" className="text-xs underline">
            Administrar plantillas
          </Link>
        )}
      </div>
      {pendiente && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted p-2 text-xs">
          <span>El campo ya tiene texto. ¿Qué hago con «{pendiente.nombre}»?</span>
          <Button type="button" size="sm" className="h-7" onClick={() => confirmar("reemplazar")}>
            Reemplazar
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-7" onClick={() => confirmar("agregar")}>
            Agregar al final
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7" onClick={() => setPendiente(null)}>
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
