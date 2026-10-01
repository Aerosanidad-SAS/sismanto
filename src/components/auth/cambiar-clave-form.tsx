"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { cambiarClaveInicial } from "@/app/api/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LARGO_MINIMO_CLAVE } from "@/lib/usuarios-carga";

/** Primer ingreso: la persona cambia la clave inicial por una que recuerde. No se puede saltar. */
export function CambiarClaveForm({ nombre, destino }: { nombre: string; destino: string }) {
  const router = useRouter();
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const r = await cambiarClaveInicial(nueva, confirmacion);
    setCargando(false);
    if ("error" in r && r.error) {
      setError(r.error);
      return;
    }
    router.push(destino);
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Elige tu clave</CardTitle>
        <CardDescription>
          {nombre ? `${nombre}, ` : ""}por seguridad debes cambiar la clave inicial por una que recuerdes. Mínimo {LARGO_MINIMO_CLAVE} caracteres; no uses tu
          cédula ni tu código de acceso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="nueva">Clave nueva</Label>
            <Input id="nueva" type="password" autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmacion">Repite la clave</Label>
            <Input id="confirmacion" type="password" autoComplete="new-password" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} required />
          </div>
          {error && (
            <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={cargando}>
            {cargando ? "Guardando…" : "Guardar y entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
