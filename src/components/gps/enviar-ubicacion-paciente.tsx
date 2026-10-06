"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enviarUbicacionAlPaciente } from "@/app/api/actions/seguimiento-gps";

/** «Enviar ubicación al paciente» (enviarNotificacion.php de SISRES): WhatsApp + correo con el enlace público. */
export function EnviarUbicacionPaciente({ servicioId }: { servicioId: number }) {
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string; enlace?: string } | null>(null);

  async function enviar() {
    if (!confirm("¿Enviar al paciente el enlace para ver la ambulancia en camino?")) return;
    setEnviando(true);
    setResultado(null);
    const r = await enviarUbicacionAlPaciente(servicioId);
    setEnviando(false);
    if ("error" in r && r.error) return setResultado({ ok: false, texto: r.error });
    if ("enlace" in r && r.enlace) {
      setResultado({
        ok: r.canales.length > 0,
        texto:
          r.canales.length > 0
            ? `Enviado por ${r.canales.join(" y ")}.`
            : "No se pudo enviar: el paciente no tiene celular ni correo válidos, o WhatsApp y el correo no están configurados. Puede copiar el enlace.",
        enlace: r.enlace,
      });
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={() => void enviar()} disabled={enviando}>
        <Send className="mr-2 h-4 w-4" />
        {enviando ? "Enviando…" : "Enviar ubicación al paciente"}
      </Button>
      {resultado && (
        <div className={resultado.ok ? "text-sm text-emerald-700" : "text-sm text-amber-800"}>
          <p>{resultado.texto}</p>
          {resultado.enlace && (
            <p className="mt-1 break-all text-xs text-muted-foreground">
              Enlace (vale 24 h mientras el servicio esté activo): <span className="select-all">{resultado.enlace}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
