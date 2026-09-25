"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CAMPOS_CONFIGURABLES } from "@/lib/captacion";
import { guardarCamposObligatorios } from "@/app/api/actions/captacion";

export function ConfiguracionCaptacion({ obligatorios }: { obligatorios: string[] }) {
  const router = useRouter();
  const [marcados, setMarcados] = useState<string[]>(obligatorios);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  async function guardar() {
    setGuardando(true);
    setMensaje(null);
    const r = await guardarCamposObligatorios(marcados);
    setGuardando(false);
    if ("error" in r && r.error) {
      setMensaje({ ok: false, texto: r.error });
      return;
    }
    setMensaje({ ok: true, texto: "Configuración guardada. Se aplica desde el próximo registro." });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {mensaje && (
        <Alert>
          <AlertDescription className={mensaje.ok ? "" : "text-destructive"}>{mensaje.texto}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Campos obligatorios</CardTitle>
          <CardDescription>
            Marca los campos que deben llenarse siempre. Los que exige el reporte SISPRO (identificación, nombres, países, tipo de usuario, momento,
            motivo, egreso, CIE-10 y médico) son obligatorios siempre y no aparecen aquí.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CAMPOS_CONFIGURABLES.map((c) => (
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
          <div className="flex items-center gap-3">
            <Button disabled={guardando} onClick={() => void guardar()}>
              {guardando ? "Guardando…" : "Guardar"}
            </Button>
            <span className="text-sm text-muted-foreground">{marcados.length} campo(s) obligatorio(s)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
