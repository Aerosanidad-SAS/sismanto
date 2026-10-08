"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CampoForm } from "@/components/admin/integraciones-form";
import { enviarCorreoDePrueba, type EstadoCorreo } from "@/app/api/actions/config-general";
import { GRUPOS_CONFIG_GENERAL, type EstadoCampoIntegracion } from "@/lib/integraciones";

const PROVEEDOR: Record<EstadoCorreo["proveedor"], string> = {
  smtp: "SMTP",
  graph: "Microsoft Graph",
  ninguno: "Ninguno (no se envía correo)",
};

export function ConfigGeneralForm({ estado, correo }: { estado: EstadoCampoIntegracion[]; correo: EstadoCorreo }) {
  const porClave = Object.fromEntries(estado.map((e) => [e.clave, e]));
  const [prueba, setPrueba] = useState<{ ok: boolean; texto: string } | null>(null);
  const [probando, setProbando] = useState(false);

  async function probar() {
    setProbando(true);
    setPrueba(null);
    try {
      const r = await enviarCorreoDePrueba();
      setPrueba("error" in r && r.error ? { ok: false, texto: r.error } : { ok: true, texto: "mensaje" in r ? r.mensaje ?? "" : "" });
    } catch {
      setPrueba({ ok: false, texto: "No se pudo conectar. Revisa tu señal e inténtalo de nuevo." });
    } finally {
      setProbando(false);
    }
  }

  return (
    <div className="space-y-4">
      {GRUPOS_CONFIG_GENERAL.map((g) => (
        <Card key={g.grupo}>
          <CardHeader>
            <CardTitle className="text-lg">{g.titulo}</CardTitle>
            <CardDescription>{g.descripcion}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
              <p>
                Proveedor activo:{" "}
                <Badge variant={correo.proveedor === "ninguno" ? "destructive" : "success"}>{PROVEEDOR[correo.proveedor]}</Badge>
                {correo.remitente && (
                  <span className="ml-2 text-muted-foreground">
                    Salen desde <strong>{correo.nombreRemitente}</strong> &lt;{correo.remitente}&gt;
                  </span>
                )}
              </p>
              {correo.proveedor === "ninguno" && correo.faltanSmtp.length > 0 && (
                <p className="text-muted-foreground">
                  Para activarlo falta completar: <code>{correo.faltanSmtp.join(", ")}</code> (servidor, usuario, clave y correo remitente; si
                  solo escribe el usuario, ese mismo correo será el remitente).
                </p>
              )}
              <p>
                «¿Olvidaste tu contraseña?»:{" "}
                <Badge variant={correo.recuperacionDisponible ? "success" : "destructive"}>
                  {correo.recuperacionDisponible ? "disponible" : "no disponible"}
                </Badge>
              </p>
            </div>

            {g.campos.map((c) => (
              <CampoForm key={c.clave} campo={c} estado={porClave[c.clave]} />
            ))}

            <div className="space-y-1 border-t pt-3">
              <Button variant="outline" onClick={() => void probar()} disabled={probando || correo.proveedor === "ninguno"}>
                {probando ? "Enviando…" : "Enviar correo de prueba a mi correo"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Se envía solo al correo de tu propio usuario. Guarda los cambios antes de probar.
              </p>
              {prueba && <p className={prueba.ok ? "text-sm text-emerald-700" : "text-sm text-destructive"}>{prueba.texto}</p>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
