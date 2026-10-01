"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getConfigEstancadoEditable,
  guardarConfigEstancado,
  type ConfigEstancado,
} from "@/app/api/actions/servicios-estancados";

/** «Alertas de servicios estancados» (configuracionSistema.php de SISRES): activar y horas por etapa. */
export function AlertaEstancadoCard() {
  const [config, setConfig] = useState<ConfigEstancado | null>(null);
  const [puedeEditar, setPuedeEditar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  useEffect(() => {
    getConfigEstancadoEditable().then(({ puedeEditar: p, ...c }) => {
      setConfig(c);
      setPuedeEditar(p);
    });
  }, []);

  async function guardar() {
    if (!config) return;
    setGuardando(true);
    setMensaje(null);
    const r = await guardarConfigEstancado(config);
    setGuardando(false);
    setMensaje("error" in r && r.error ? { ok: false, texto: r.error } : { ok: true, texto: "Guardado. Se aplica en la próxima revisión (máximo 1 minuto)." });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>⏰ Alertas de servicios estancados</CardTitle>
        <CardDescription>
          Un servicio que sigue en PROGRAMADO o en CURSO pasadas estas horas desde su hora programada se marca con ⏰ en
          la lista y avisa a quienes lo ven.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!config ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.activo}
                disabled={!puedeEditar}
                onChange={(e) => setConfig({ ...config, activo: e.target.checked })}
              />
              Avisar de servicios estancados
            </label>
            <div className="flex flex-wrap gap-4">
              {(
                [
                  ["horasProgramado", "Horas en PROGRAMADO"],
                  ["horasCurso", "Horas en CURSO"],
                ] as const
              ).map(([campo, etiqueta]) => (
                <div key={campo} className="space-y-1">
                  <Label htmlFor={`est-${campo}`}>{etiqueta}</Label>
                  <Input
                    id={`est-${campo}`}
                    type="number"
                    min={1}
                    max={720}
                    className="w-32"
                    disabled={!puedeEditar || !config.activo}
                    value={config[campo]}
                    onChange={(e) => setConfig({ ...config, [campo]: Number(e.target.value) })}
                  />
                </div>
              ))}
            </div>
            {mensaje && <p className={mensaje.ok ? "text-sm text-emerald-700" : "text-sm text-destructive"}>{mensaje.texto}</p>}
            {puedeEditar ? (
              <Button onClick={() => void guardar()} disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar"}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Solo un Administrador puede cambiar esta configuración.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
