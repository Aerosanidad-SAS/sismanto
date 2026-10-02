"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { restablecerContrasena, solicitarCodigoRecuperacion } from "@/app/api/actions/recuperar-contrasena";

// Recuperar la contraseña (pública, sin sesión), como recuperarPassword.php de SISRES: 1) cédula → código al correo;
// 2) código + contraseña nueva.
export default function RecuperarPage() {
  const [paso, setPaso] = useState<"cedula" | "codigo" | "listo">("cedula");
  const [cedula, setCedula] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function pedirCodigo(e: React.FormEvent) {
    e.preventDefault();
    setOcupado(true);
    setError(null);
    const r = await solicitarCodigoRecuperacion(cedula);
    setOcupado(false);
    if ("error" in r && r.error) return setError(r.error);
    setAviso("mensaje" in r ? r.mensaje ?? null : null);
    setPaso("codigo");
  }

  async function cambiar(e: React.FormEvent) {
    e.preventDefault();
    if (nueva !== confirmacion) return setError("Las contraseñas no coinciden");
    setOcupado(true);
    setError(null);
    const r = await restablecerContrasena({ cedula, codigo, nueva });
    setOcupado(false);
    if ("error" in r && r.error) return setError(r.error);
    setPaso("listo");
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-muted/40 px-4 py-6">
      <Card className="w-full max-w-md border-border shadow-md">
        <CardHeader>
          <CardTitle as="h1" className="text-2xl">Recuperar contraseña</CardTitle>
          <CardDescription>
            {paso === "cedula" && "Escriba su cédula. Le enviaremos un código a su correo registrado."}
            {paso === "codigo" && "Escriba el código que le llegó al correo y su contraseña nueva."}
            {paso === "listo" && "Su contraseña quedó cambiada."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paso === "cedula" && (
            <form onSubmit={pedirCodigo} className="space-y-4">
              <div>
                <Label htmlFor="rc-cedula">Cédula</Label>
                <Input
                  id="rc-cedula"
                  inputMode="numeric"
                  autoComplete="username"
                  className="mt-1"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="min-h-11 w-full" disabled={ocupado}>
                {ocupado ? "Enviando…" : "Enviar código"}
              </Button>
            </form>
          )}

          {paso === "codigo" && (
            <form onSubmit={cambiar} className="space-y-4">
              {aviso && <p className="rounded border border-border bg-muted p-3 text-sm">{aviso}</p>}
              <div>
                <Label htmlFor="rc-codigo">Código de 6 dígitos</Label>
                <Input
                  id="rc-codigo"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="mt-1 tracking-[0.4em]"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rc-nueva">Contraseña nueva (mínimo 8 caracteres)</Label>
                <Input
                  id="rc-nueva"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  className="mt-1"
                  value={nueva}
                  onChange={(e) => setNueva(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rc-confirmacion">Repita la contraseña</Label>
                <Input
                  id="rc-confirmacion"
                  type="password"
                  autoComplete="new-password"
                  className="mt-1"
                  value={confirmacion}
                  onChange={(e) => setConfirmacion(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="min-h-11 w-full" disabled={ocupado}>
                {ocupado ? "Cambiando…" : "Cambiar contraseña"}
              </Button>
              <button type="button" className="w-full text-sm text-muted-foreground underline" onClick={() => setPaso("cedula")}>
                Pedir otro código
              </button>
            </form>
          )}

          {paso === "listo" && (
            <Button asChild className="min-h-11 w-full">
              <Link href="/login">Ir a iniciar sesión</Link>
            </Button>
          )}

          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {paso !== "listo" && (
            <p className="text-center text-sm">
              <Link href="/login" className="text-muted-foreground underline">
                Volver al inicio de sesión
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
