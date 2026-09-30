"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { eliminarPlantillaBiomedica, guardarPlantillaBiomedica } from "@/app/api/actions/biomedico-plantillas";
import {
  CAMPOS_PLANTILLA,
  MAX_NOMBRE_PLANTILLA,
  MAX_TEXTO_PLANTILLA,
  plantillasDelCampo,
  type CampoPlantilla,
  type PlantillaTexto,
} from "@/lib/biomedico-plantillas";

type Edicion = { id?: number; campo: CampoPlantilla; nombre: string; texto: string };

export function PlantillasBiomedicas({ inicial, puedeEditar }: { inicial: PlantillaTexto[]; puedeEditar: boolean }) {
  const [plantillas, setPlantillas] = useState(inicial);
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  async function guardar() {
    if (!edicion) return;
    setGuardando(true);
    setMensaje(null);
    const r = await guardarPlantillaBiomedica(edicion);
    setGuardando(false);
    if ("error" in r && r.error) return setMensaje({ tipo: "error", texto: r.error });
    if ("plantilla" in r && r.plantilla) {
      const p = r.plantilla;
      setPlantillas((lista) => [...lista.filter((x) => x.id !== p.id), p]);
      setEdicion(null);
      setMensaje({ tipo: "ok", texto: `Plantilla «${p.nombre}» guardada` });
    }
  }

  async function eliminar(p: PlantillaTexto) {
    if (!confirm(`¿Eliminar la plantilla «${p.nombre}»?`)) return;
    setMensaje(null);
    const r = await eliminarPlantillaBiomedica(p.id);
    if ("error" in r && r.error) return setMensaje({ tipo: "error", texto: r.error });
    setPlantillas((lista) => lista.filter((x) => x.id !== p.id));
    setMensaje({ tipo: "ok", texto: "Plantilla eliminada" });
  }

  return (
    <div className="space-y-4">
      {mensaje && (
        <Alert variant={mensaje.tipo === "error" ? "destructive" : "default"}>
          <AlertDescription>{mensaje.texto}</AlertDescription>
        </Alert>
      )}
      {CAMPOS_PLANTILLA.map(({ campo, etiqueta }) => {
        const lista = plantillasDelCampo(plantillas, campo);
        const editandoAqui = edicion?.campo === campo;
        return (
          <Card key={campo}>
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
              <div>
                <CardTitle className="text-lg">{etiqueta}</CardTitle>
                <CardDescription>{lista.length} plantillas</CardDescription>
              </div>
              {puedeEditar && !editandoAqui && (
                <Button variant="outline" size="sm" onClick={() => setEdicion({ campo, nombre: "", texto: "" })}>
                  <Plus className="mr-1 h-4 w-4" />
                  Nueva
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {lista.length === 0 && !editandoAqui && <p className="text-sm text-muted-foreground">Sin plantillas.</p>}
              <ul className="divide-y divide-border">
                {lista.map((p) => (
                  <li key={p.id} className="flex items-start justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{p.nombre}</p>
                      <p className="whitespace-pre-line text-sm text-muted-foreground">{p.texto}</p>
                    </div>
                    {puedeEditar && (
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="icon" aria-label={`Editar ${p.nombre}`} onClick={() => setEdicion({ ...p })}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label={`Eliminar ${p.nombre}`} onClick={() => eliminar(p)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {editandoAqui && edicion && (
                <div className="space-y-2 rounded-md border border-border p-3">
                  <div className="space-y-1">
                    <Label htmlFor={`pl-nombre-${campo}`}>Nombre</Label>
                    <Input
                      id={`pl-nombre-${campo}`}
                      maxLength={MAX_NOMBRE_PLANTILLA}
                      value={edicion.nombre}
                      onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`pl-texto-${campo}`}>Texto</Label>
                    <Textarea
                      id={`pl-texto-${campo}`}
                      rows={4}
                      maxLength={MAX_TEXTO_PLANTILLA}
                      value={edicion.texto}
                      onChange={(e) => setEdicion({ ...edicion, texto: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={guardar} disabled={guardando || !edicion.nombre.trim() || !edicion.texto.trim()}>
                      {guardando ? "Guardando…" : "Guardar"}
                    </Button>
                    <Button variant="ghost" onClick={() => setEdicion(null)} disabled={guardando}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
