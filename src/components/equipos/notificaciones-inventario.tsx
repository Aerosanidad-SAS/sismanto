"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { guardarNotificacionesInventario } from "@/app/api/actions/inventario-notificaciones";
import { AREAS_INVENTARIO, leerCorreos, type AreaInventario } from "@/lib/inventario-notificaciones";

export function NotificacionesInventario({ inicial }: { inicial: Record<AreaInventario, string[]> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {AREAS_INVENTARIO.map((a) => (
        <EditorArea key={a.area} area={a.area} etiqueta={a.etiqueta} sinCorreos={a.sinCorreos} inicial={inicial[a.area]} />
      ))}
    </div>
  );
}

function EditorArea({ area, etiqueta, sinCorreos, inicial }: { area: AreaInventario; etiqueta: string; sinCorreos: string; inicial: string[] }) {
  const [guardados, setGuardados] = useState(inicial);
  const [texto, setTexto] = useState(inicial.join("\n"));
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const { validos, invalidos } = leerCorreos(texto);
  const cambios = validos.join("\n") !== guardados.join("\n");

  async function guardar() {
    setGuardando(true);
    setMensaje(null);
    const r = await guardarNotificacionesInventario(area, texto);
    setGuardando(false);
    if ("error" in r && r.error) return setMensaje({ tipo: "error", texto: r.error });
    if ("correos" in r && r.correos) {
      setGuardados(r.correos);
      setTexto(r.correos.join("\n"));
    }
    setMensaje({ tipo: "ok", texto: "Guardado" });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Área {etiqueta}</CardTitle>
        <CardDescription>
          {guardados.length > 0 ? `${guardados.length} destinatario${guardados.length === 1 ? "" : "s"}` : `Sin correos: ${sinCorreos}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          aria-label={`Correos del área ${etiqueta}`}
          rows={6}
          placeholder={"biomedica@aerosanidad.com\notro@aerosanidad.com"}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Un correo por línea. Déjalo vacío para volver al comportamiento por defecto.
          {invalidos.length > 0 && <span className="text-destructive"> No son correos: {invalidos.join(", ")}</span>}
        </p>
        {mensaje && (
          <Alert variant={mensaje.tipo === "error" ? "destructive" : "default"}>
            <AlertDescription>{mensaje.texto}</AlertDescription>
          </Alert>
        )}
        <Button onClick={guardar} disabled={!cambios || guardando || invalidos.length > 0}>
          {guardando ? "Guardando…" : "Guardar"}
        </Button>
      </CardContent>
    </Card>
  );
}
