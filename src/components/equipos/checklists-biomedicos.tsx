"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { eliminarChecklistBiomedico, guardarChecklistBiomedico } from "@/app/api/actions/inventario-biomedico";
import {
  CHECKLIST_GENERAL,
  MAX_ITEMS_CHECKLIST,
  limpiarItems,
  normalizarEquipo,
  type CatalogoChecklists,
} from "@/lib/biomedico-checklist";
import { cn } from "@/lib/utils";

const NUEVA = "__nueva__";

export function ChecklistsBiomedicos({ inicial, puedeEditar }: { inicial: CatalogoChecklists; puedeEditar: boolean }) {
  const [catalogo, setCatalogo] = useState(inicial);
  const [buscar, setBuscar] = useState("");
  const [seleccion, setSeleccion] = useState<string | null>(Object.keys(inicial)[0] ?? null);
  const [nombreNueva, setNombreNueva] = useState("");
  const [texto, setTexto] = useState((inicial[Object.keys(inicial)[0]] ?? []).join("\n"));
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  // GENERAL al final, igual que la lista de SISRES.
  const claves = useMemo(() => {
    const q = normalizarEquipo(buscar);
    return Object.keys(catalogo)
      .filter((k) => !q || k.includes(q))
      .sort((a, b) => Number(a === CHECKLIST_GENERAL) - Number(b === CHECKLIST_GENERAL) || a.localeCompare(b));
  }, [catalogo, buscar]);

  const items = limpiarItems(texto.split("\n"));
  const esNueva = seleccion === NUEVA;
  const claveNueva = normalizarEquipo(nombreNueva);
  const cambios = esNueva ? items.length > 0 : seleccion !== null && items.join("\n") !== (catalogo[seleccion] ?? []).join("\n");

  function elegir(clave: string) {
    setSeleccion(clave);
    setTexto(clave === NUEVA ? "" : (catalogo[clave] ?? []).join("\n"));
    setNombreNueva("");
    setMensaje(null);
  }

  async function guardar() {
    const equipo = esNueva ? nombreNueva : seleccion;
    if (!equipo) return;
    if (esNueva && catalogo[claveNueva]) {
      setMensaje({ tipo: "error", texto: `Ya existe la lista ${claveNueva}: búscala y edítala` });
      return;
    }
    setGuardando(true);
    setMensaje(null);
    const r = await guardarChecklistBiomedico(equipo, items);
    setGuardando(false);
    if ("error" in r && r.error) return setMensaje({ tipo: "error", texto: r.error });
    if ("equipo" in r && r.equipo && r.items) {
      setCatalogo((c) => ({ ...c, [r.equipo]: r.items }));
      setSeleccion(r.equipo);
      setTexto(r.items.join("\n"));
      setMensaje({ tipo: "ok", texto: `Lista ${r.equipo} guardada (${r.items.length} ítems)` });
    }
  }

  async function eliminar() {
    if (!seleccion || esNueva || seleccion === CHECKLIST_GENERAL) return;
    if (!confirm(`¿Eliminar la lista ${seleccion}? Los equipos de ese tipo pasarán a usar la lista GENERAL.`)) return;
    setGuardando(true);
    setMensaje(null);
    const r = await eliminarChecklistBiomedico(seleccion);
    setGuardando(false);
    if ("error" in r && r.error) return setMensaje({ tipo: "error", texto: r.error });
    const { [seleccion]: _borrada, ...resto } = catalogo;
    setCatalogo(resto);
    elegir(Object.keys(resto)[0] ?? NUEVA);
    setMensaje({ tipo: "ok", texto: "Lista eliminada" });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Tipos de equipo</CardTitle>
          <CardDescription>{Object.keys(catalogo).length} listas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Buscar tipo…" value={buscar} onChange={(e) => setBuscar(e.target.value)} aria-label="Buscar tipo de equipo" />
          {puedeEditar && (
            <Button variant="outline" className="w-full" onClick={() => elegir(NUEVA)}>
              <Plus className="mr-1 h-4 w-4" />
              Nueva lista
            </Button>
          )}
          <ul className="max-h-[60vh] space-y-0.5 overflow-y-auto">
            {claves.map((k) => (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => elegir(k)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                    seleccion === k && "bg-muted font-medium"
                  )}
                >
                  <span className="truncate">{k}</span>
                  <span className="text-xs text-muted-foreground">{catalogo[k].length}</span>
                </button>
              </li>
            ))}
            {claves.length === 0 && <li className="px-2 text-sm text-muted-foreground">Sin resultados</li>}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{esNueva ? "Nueva lista" : seleccion ?? "Elige una lista"}</CardTitle>
          <CardDescription>
            {seleccion === CHECKLIST_GENERAL
              ? "La usan los equipos que no tienen una lista propia."
              : "Un ítem por línea, en el orden en que se revisan."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {esNueva && (
            <div className="space-y-1">
              <Label htmlFor="chk-nueva">Tipo de equipo (como está escrito en el inventario)</Label>
              <Input id="chk-nueva" placeholder="Ej.: Bomba de infusión" value={nombreNueva} onChange={(e) => setNombreNueva(e.target.value)} />
              {claveNueva && <p className="text-xs text-muted-foreground">Se guarda como {claveNueva}</p>}
            </div>
          )}
          {seleccion !== null && (
            <>
              <Textarea
                aria-label="Ítems de la lista"
                rows={14}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                readOnly={!puedeEditar}
              />
              <p className="text-xs text-muted-foreground">
                {items.length} ítems{items.length > MAX_ITEMS_CHECKLIST ? ` — máximo ${MAX_ITEMS_CHECKLIST}` : ""}
              </p>
            </>
          )}
          {mensaje && (
            <Alert variant={mensaje.tipo === "error" ? "destructive" : "default"}>
              <AlertDescription>{mensaje.texto}</AlertDescription>
            </Alert>
          )}
          {puedeEditar && seleccion !== null && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={guardar} disabled={!cambios || guardando || (esNueva && !claveNueva)}>
                {guardando ? "Guardando…" : "Guardar"}
              </Button>
              {!esNueva && seleccion !== CHECKLIST_GENERAL && (
                <Button variant="ghost" className="text-destructive" onClick={eliminar} disabled={guardando}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Eliminar lista
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
