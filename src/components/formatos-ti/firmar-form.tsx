"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignaturePad } from "@/components/formatos-ti/signature-pad";
import { firmarRemoto } from "@/app/api/actions/firma-remota";

/** Formulario de la página pública de firma: un recuadro y un botón. Tras firmar no se puede volver a enviar. */
export function FirmarForm({ token }: { token: string }) {
  const [firma, setFirma] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const enviar = async () => {
    if (!firma) {
      setError("Dibuja tu firma en el recuadro antes de enviar.");
      return;
    }
    setEnviando(true);
    setError(null);
    const res = await firmarRemoto(token, firma);
    setEnviando(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setListo(true);
  };

  if (listo) {
    return (
      <div role="status" className="rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-800">
        ¡Listo! Tu firma quedó registrada. Ya puedes cerrar esta página.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SignaturePad etiqueta="Tu firma" onChange={setFirma} />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button type="button" className="w-full" onClick={enviar} disabled={enviando}>
        {enviando ? "Enviando…" : "Firmar y enviar"}
      </Button>
    </div>
  );
}
