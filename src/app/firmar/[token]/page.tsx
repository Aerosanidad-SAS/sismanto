import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { contextoFirmaRemota } from "@/app/api/actions/firma-remota";
import { FirmarForm } from "@/components/formatos-ti/firmar-form";

// Página pública del enlace del correo: nunca debe indexarse ni guardarse en cachés compartidas.
export const metadata: Metadata = { title: "Firmar acta de entrega", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const MENSAJES: Record<string, { titulo: string; detalle: string }> = {
  invalido: { titulo: "Enlace no válido", detalle: "Este enlace no existe o está incompleto. Revisa que copiaste el enlace completo del correo." },
  usado: { titulo: "Enlace ya utilizado", detalle: "Este enlace ya se usó. Si necesitas firmar de nuevo, pide al área de Sistemas que te envíe uno nuevo." },
  vencido: { titulo: "Enlace vencido", detalle: "Este enlace ya venció. Pide al área de Sistemas que te envíe uno nuevo." },
  firmada: { titulo: "Acta ya firmada", detalle: "Esta acta ya tiene tu firma. No tienes que hacer nada más." },
};

export default async function FirmarPage({ params }: { params: { token: string } }) {
  const ctx = await contextoFirmaRemota(params.token);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-muted/40 px-4 py-8">
      <Card className="w-full max-w-lg">
        {ctx.estado === "ok" ? (
          <>
            <CardHeader>
              <CardTitle>Firma de recibido</CardTitle>
              <CardDescription>
                Acta de entrega {ctx.numeroOrden} · {ctx.nombre}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Confirmas que recibiste el equipo <strong>{ctx.equipo || "asignado"}</strong> (placa <strong>{ctx.placa}</strong>). Firma con el dedo o el mouse
                en el recuadro.
              </p>
              <FirmarForm token={params.token} />
              <p className="text-xs text-muted-foreground">
                Enlace personal de un solo uso, vigente hasta el{" "}
                {new Date(ctx.vence).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Bogota" })}.
              </p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>{MENSAJES[ctx.estado].titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{MENSAJES[ctx.estado].detalle}</p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
