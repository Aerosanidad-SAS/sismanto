"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateCompanyLogo } from "@/app/api/actions/company-settings";

interface MarcaTabProps {
  logoUrl: string | null;
  puedeEditar: boolean;
}

export function MarcaTab({ logoUrl, puedeEditar }: MarcaTabProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const elegirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setArchivo(f);
    setError(null);
    setSuccess(null);
    setPreview(URL.createObjectURL(f));
  };

  const guardar = async () => {
    if (!archivo) return;
    setGuardando(true);
    setError(null);
    setSuccess(null);
    const res = await updateCompanyLogo(archivo);
    setGuardando(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setSuccess("Logo actualizado");
    setArchivo(null);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  };

  const logoAMostrar = preview ?? logoUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marca</CardTitle>
        <CardDescription>
          Logo que se muestra en el menú lateral, la pantalla de inicio de sesión y la pantalla de
          cuenta pendiente. Recomendado: PNG o SVG con fondo transparente, horizontal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-16 w-64 items-center rounded-md border bg-muted/30 px-3">
          {logoAMostrar ? (
            <div className="relative h-10 w-full">
              <Image src={logoAMostrar} alt="Logo actual" fill className="object-contain object-left" unoptimized />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin logo personalizado — se usa el predeterminado.</p>
          )}
        </div>

        {puedeEditar ? (
          <div className="space-y-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={elegirArchivo}
              className="text-sm"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <div>
              <Button onClick={guardar} disabled={!archivo || guardando} size="sm">
                {guardando ? "Guardando..." : "Guardar logo"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Solo un Administrador puede cambiar el logo.</p>
        )}
      </CardContent>
    </Card>
  );
}
