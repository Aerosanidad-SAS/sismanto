"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getProfile } from "@/app/api/actions/auth";
import { getDefaultRoute } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (result?.error) {
        setError(result.error);
      } else {
        const profile = await getProfile();
        if (!profile) {
          router.push("/pending");
        } else {
          router.push(getDefaultRoute(profile.role_codigo));
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
              src="/brand/alianza.png"
              alt="Aerosanidad e Inter Assist"
              fill
              className="object-contain"
              sizes="256px"
              priority
            />
          </div>
          <div>
            <CardTitle className="text-2xl">Aeromanto</CardTitle>
            <CardDescription>Inicie sesión con su cuenta corporativa</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full min-h-11 touch-manipulation" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
