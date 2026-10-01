"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guardarIntegracion, probarProtrack } from "@/app/api/actions/integraciones";
import { GRUPOS_INTEGRACION, type CampoIntegracion, type EstadoCampoIntegracion } from "@/lib/integraciones";

const ORIGEN: Record<EstadoCampoIntegracion["origen"], string> = {
  aplicacion: "configurado aquí",
  entorno: "tomado de la variable de entorno",
  por_defecto: "valor por defecto",
  sin_configurar: "sin configurar",
};

export function IntegracionesForm({ estado }: { estado: EstadoCampoIntegracion[] }) {
  const porClave = Object.fromEntries(estado.map((e) => [e.clave, e]));
  const [prueba, setPrueba] = useState<{ ok: boolean; texto: string } | null>(null);
  const [probando, setProbando] = useState(false);

  async function probar() {
    setProbando(true);
    setPrueba(null);
    const r = await probarProtrack();
    setProbando(false);
    setPrueba("error" in r && r.error ? { ok: false, texto: r.error } : { ok: true, texto: "mensaje" in r ? r.mensaje ?? "" : "" });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {GRUPOS_INTEGRACION.map((g) => (
        <Card key={g.grupo}>
          <CardHeader>
            <CardTitle className="text-lg">{g.titulo}</CardTitle>
            <CardDescription>{g.descripcion}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {g.campos.map((c) => (
              <CampoForm key={c.clave} campo={c} estado={porClave[c.clave]} />
            ))}
            {g.grupo === "protrack" && (
              <div className="space-y-1 border-t pt-3">
                <Button variant="outline" onClick={() => void probar()} disabled={probando}>
                  {probando ? "Probando…" : "Probar conexión"}
                </Button>
                {prueba && <p className={prueba.ok ? "text-sm text-emerald-700" : "text-sm text-destructive"}>{prueba.texto}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CampoForm({ campo, estado }: { campo: CampoIntegracion; estado?: EstadoCampoIntegracion }) {
  const router = useRouter();
  // Un secreto nunca llega al navegador: el campo arranca vacío y solo se escribe uno nuevo.
  const [valor, setValor] = useState(campo.secreto ? "" : estado?.visible ?? "");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  async function guardar(nuevo: string) {
    setGuardando(true);
    setMensaje(null);
    const r = await guardarIntegracion(campo.clave, nuevo);
    setGuardando(false);
    if ("error" in r && r.error) return setMensaje({ ok: false, texto: r.error });
    setMensaje({ ok: true, texto: nuevo ? "Guardado" : "Borrado: se usa la variable de entorno o el valor por defecto" });
    if (campo.secreto) setValor("");
    router.refresh();
  }

  const id = `int-${campo.clave}`;
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{campo.etiqueta}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type={campo.secreto ? "password" : "text"}
          autoComplete="off"
          placeholder={campo.secreto ? (estado?.visible ? `Actual: ${estado.visible} — escriba una nueva para cambiarla` : "Escriba la llave") : ""}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
        <Button onClick={() => void guardar(valor)} disabled={guardando || (campo.secreto && !valor.trim())}>
          Guardar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {campo.ayuda} · <span className="font-medium">{ORIGEN[estado?.origen ?? "sin_configurar"]}</span>
        {estado?.origen === "aplicacion" && (
          <>
            {" · "}
            <button type="button" className="underline" onClick={() => void guardar("")} disabled={guardando}>
              borrar
            </button>
          </>
        )}
      </p>
      {mensaje && <p className={mensaje.ok ? "text-xs text-emerald-700" : "text-xs text-destructive"}>{mensaje.texto}</p>}
    </div>
  );
}
