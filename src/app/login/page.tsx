"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getProfile } from "@/app/api/actions/auth";
import { getCompanyBranding } from "@/app/api/actions/company-settings";
import { getDefaultRoute } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  /** La cédula es el caso común (teclado numérico); quien entra con correo lo cambia con un toque. */
  const [usaCorreo, setUsaCorreo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    getCompanyBranding().then((b) => setLogoUrl(b.logo_url));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn(identificador, password);
      if (result?.error) {
        setError(result.error);
      } else {
        const profile = await getProfile();
        if (!profile) {
          router.push("/pending");
        } else {
          router.push(profile.debe_cambiar_password ? "/cambiar-password" : getDefaultRoute(profile.role_codigo));
        }
        router.refresh();
      }
    } catch {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-muted/40 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]"
    >
      <Card className="w-full max-w-md shadow-md border-border">
        <CardHeader className="space-y-4">
          <div className="relative mx-auto h-14 w-full max-w-[16rem] overflow-hidden rounded-md bg-black px-3 py-2">
            <Image
              src={logoUrl ?? "/brand/alianza.png"}
              alt="Aerosanidad e Inter Assist"
              fill
              className="object-contain"
              sizes="256px"
              priority
              unoptimized={Boolean(logoUrl)}
            />
          </div>
          <div>
            <CardTitle className="text-2xl">SISMANTO</CardTitle>
            <CardDescription>Inicia sesión con tu cédula y contraseña</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="identificador">Cédula o correo</Label>
              <Input
                id="identificador"
                type="text"
                inputMode={usaCorreo ? "email" : "numeric"}
                enterKeyHint="next"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder={usaCorreo ? "correo@ejemplo.com" : "Número de cédula"}
                className="mt-1"
                required
              />
              <button
                type="button"
                className="mt-1 min-h-11 text-sm text-muted-foreground underline"
                onClick={() => setUsaCorreo((v) => !v)}
              >
                {usaCorreo ? "Entrar con mi cédula" : "Entrar con mi correo"}
              </button>
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={verPassword ? "text" : "password"}
                  autoComplete="current-password"
                  enterKeyHint="go"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-16"
                  required
                />
                <button
                  type="button"
                  aria-pressed={verPassword}
                  aria-controls="password"
                  className="absolute inset-y-0 right-0 min-w-14 px-3 text-sm font-medium text-primary underline"
                  onClick={() => setVerPassword((v) => !v)}
                >
                  {verPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>
            {error && (
              <div role="alert" className="p-3 bg-destructive/10 border border-destructive/40 rounded text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full min-h-11 touch-manipulation" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
            <p className="text-center text-sm">
              <Link href="/recuperar" className="text-muted-foreground underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
