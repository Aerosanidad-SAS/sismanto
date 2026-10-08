"use client";

import { useState } from "react";
import { Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { guardarOpcionesServicio, restaurarOpcionesServicio } from "@/app/api/actions/servicios-opciones";
import {
  CAMPOS_OPCIONES_SERVICIO,
  MAX_LARGO_OPCION,
  MAX_OPCIONES,
  limpiarOpciones,
  type CampoOpcionesServicio,
  type OpcionesServicio,
} from "@/lib/servicios-opciones";

export function ConfiguracionOpcionesServicio({ inicial }: { inicial: OpcionesServicio }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {CAMPOS_OPCIONES_SERVICIO.map((c) => (
        <EditorCampo key={c.campo} campo={c.campo} etiqueta={c.etiqueta} fabrica={c.fabrica} inicial={inicial[c.campo]} />
      ))}
    </div>
  );
}

function EditorCampo({
  campo,
  etiqueta,
  fabrica,
  inicial,
}: {
  campo: CampoOpcionesServicio;
  etiqueta: string;
  fabrica: readonly string[];
  inicial: string[];
}) {
  const [guardadas, setGuardadas] = useState(inicial);
  const [lista, setLista] = useState(inicial);
  const [nueva, setNueva] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const cambios = JSON.stringify(lista) !== JSON.stringify(guardadas);
  const esFabrica = JSON.stringify(guardadas) === JSON.stringify(fabrica);

  function agregar() {
    const siguiente = limpiarOpciones([...lista, nueva]);
    if (siguiente.length === lista.length) {
      setMensaje({ tipo: "error", texto: nueva.trim() ? "Esa opción ya está en la lista" : "Escribe la opción" });
      return;
    }
    setLista(siguiente);
    setNueva("");
    setMensaje(null);
  }

  async function guardar() {
    setGuardando(true);
    setMensaje(null);
    const r = await guardarOpcionesServicio(campo, lista);
    setGuardando(false);
    if ("error" in r && r.error) return setMensaje({ tipo: "error", texto: r.error });
    if ("opciones" in r && r.opciones) {
      setGuardadas(r.opciones);
      setLista(r.opciones);
    }
    setMensaje({ tipo: "ok", texto: "Guardado" });
  }

  async function restaurar() {
    setGuardando(true);
    setMensaje(null);
    const r = await restaurarOpcionesServicio(campo);
    setGuardando(false);
    if ("error" in r && r.error) return setMensaje({ tipo: "error", texto: r.error });
    if ("opciones" in r && r.opciones) {
      setGuardadas(r.opciones);
      setLista(r.opciones);
    }
    setMensaje({ tipo: "ok", texto: "Restauradas las opciones de fábrica" });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{etiqueta}</CardTitle>
        <CardDescription>{esFabrica ? "Opciones de fábrica" : "Lista personalizada"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="flex flex-wrap gap-2">
          {lista.map((o) => (
            <li key={o} className="flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-sm">
              {o}
              <button
                type="button"
                aria-label={`Quitar ${o}`}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-40"
                disabled={lista.length === 1}
                onClick={() => setLista(lista.filter((x) => x !== o))}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            agregar();
          }}
        >
          <Input
            aria-label={`Nueva opción para ${etiqueta}`}
            placeholder="Nueva opción"
            maxLength={MAX_LARGO_OPCION}
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
          />
          <Button type="submit" variant="outline" disabled={lista.length >= MAX_OPCIONES}>
            <Plus className="mr-1 h-4 w-4" />
            Agregar
          </Button>
        </form>

        {mensaje && (
          <Alert variant={mensaje.tipo === "error" ? "destructive" : "default"}>
            <AlertDescription>{mensaje.texto}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={guardar} disabled={!cambios || guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </Button>
          {cambios && (
            <Button variant="ghost" onClick={() => setLista(guardadas)} disabled={guardando}>
              Descartar cambios
            </Button>
          )}
          {!esFabrica && (
            <Button variant="ghost" onClick={restaurar} disabled={guardando}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Restaurar de fábrica
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
