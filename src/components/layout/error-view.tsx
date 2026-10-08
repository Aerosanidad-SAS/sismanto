import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** Shared body for error and not-found screens: one heading, one sentence, the way out. */
export function StatusView({
  title,
  description,
  children,
  fullPage = false,
  alert = false,
}: {
  title: string;
  description: string;
  children?: ReactNode;
  /** True when rendered outside the dashboard shell (root error / not-found). */
  fullPage?: boolean;
  /** Announce immediately to assistive tech (errors only). */
  alert?: boolean;
}) {
  return (
    <div className={fullPage ? "flex min-h-screen items-center justify-center bg-background px-4" : "flex justify-center px-4 py-16"}>
      <div role={alert ? "alert" : undefined} className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        <div className="flex flex-wrap justify-center gap-2">{children}</div>
      </div>
    </div>
  );
}

export function ErrorView({
  reset,
  digest,
  fullPage = false,
}: {
  reset: () => void;
  digest?: string;
  fullPage?: boolean;
}) {
  return (
    <StatusView
      alert
      fullPage={fullPage}
      title="No pudimos cargar esta pantalla"
      description="Ocurrió un problema inesperado. Reintenta; si sigue pasando, avisa a soporte con el código que aparece abajo."
    >
      <Button type="button" onClick={reset}>
        Reintentar
      </Button>
      <Button asChild variant="outline">
        <Link href="/">Ir al inicio</Link>
      </Button>
      {digest ? <p className="w-full text-xs text-muted-foreground">Código: {digest}</p> : null}
    </StatusView>
  );
}

export function NotFoundView({ fullPage = false }: { fullPage?: boolean }) {
  return (
    <StatusView
      fullPage={fullPage}
      title="No encontramos esta página"
      description="La dirección no existe o ya no está disponible. Revisa que esté bien escrita o vuelve al inicio."
    >
      <Button asChild>
        <Link href="/">Ir al inicio</Link>
      </Button>
    </StatusView>
  );
}
