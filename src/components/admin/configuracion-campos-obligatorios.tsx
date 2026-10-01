"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { guardarCamposObligatoriosModulo } from "@/app/api/actions/campos-obligatorios";
import { MODULOS_CAMPOS, type ModuloCampos } from "@/lib/campos-obligatorios";

/** Casillas de los campos opcionales de un módulo (mismo patrón que ConfiguracionCaptacion). */
export function ConfiguracionCamposObligatorios({ modulo, obligatorios }: { modulo: ModuloCampos; obligatorios: string[] }) {
  const router = useRouter();
  const config = MODULOS_CAMPOS[modulo];
  const [marcados, setMarcados] = useState<string[]>(obligatorios);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const cambios = [...marcados].sort().join() !== [...obligatorios].sort().join();

  async function guardar() {
    setGuardando(true);
    setMensaje(null);
    const r = await guardarCamposObligatoriosModulo(modulo, marcados);
    setGuardando(false);
    if ("error" in r && r.error) return setMensaje({ ok: false, texto: r.error });
    setMensaje({ ok: true, texto: "Configuración guardada. Se aplica desde el próximo registro." });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.etiqueta}</CardTitle>
        <CardDescription>Siempre obligatorios (no se configuran): {config.siempre}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {config.campos.map((c) => (
            <label key={c.campo} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={marcados.includes(c.campo)}
                onChange={(e) => setMarcados(e.target.checked ? [...marcados, c.campo] : marcados.filter((x) => x !== c.campo))}
              />
              {c.etiqueta}
            </label>
          ))}
        </div>
        {mensaje && (
          <Alert variant={mensaje.ok ? "default" : "destructive"}>
            <AlertDescription>{mensaje.texto}</AlertDescription>
          </Alert>
        )}
        <div className="flex items-center gap-3">
          <Button disabled={guardando || !cambios} onClick={() => void guardar()}>
            {guardando ? "Guardando…" : "Guardar"}
          </Button>
          <span className="text-sm text-muted-foreground">{marcados.length} campo(s) obligatorio(s)</span>
        </div>
      </CardContent>
    </Card>
  );
}
