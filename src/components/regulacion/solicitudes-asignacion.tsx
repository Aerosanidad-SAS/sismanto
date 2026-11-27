"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserCheck } from "lucide-react";
import { resolverSolicitudAsignacion, type SolicitudAsignacion } from "@/app/api/actions/solicitudes-asignacion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const cuando = (iso: string) =>
  new Intl.DateTimeFormat("es-CO", { timeStyle: "short", hour12: false, timeZone: "America/Bogota" }).format(new Date(iso));

/** OVEM que pidieron asignarse un vehículo hoy: Regulación confirma (entra a la programación) o rechaza con una nota. */
export function SolicitudesAsignacion({ solicitudes, puedeResolver }: { solicitudes: SolicitudAsignacion[]; puedeResolver: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rechazando, setRechazando] = useState<{ id: number; nota: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avisos, setAvisos] = useState<string[]>([]);

  // Con avisos pendientes de leer la tarjeta se queda aunque ya no haya solicitudes.
  if (solicitudes.length === 0 && avisos.length === 0) return null;

  const resolver = (id: number, decision: "CONFIRMAR" | "RECHAZAR", nota?: string) =>
    startTransition(async () => {
      setError(null);
      setAvisos([]);
      const r = await resolverSolicitudAsignacion(id, decision, nota);
      if ("error" in r && r.error) {
        setError(r.error);
        return;
      }
      setAvisos(("advertencias" in r && r.advertencias) || []);
      setRechazando(null);
      router.refresh();
    });

  return (
    <Card className="border-warning">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" aria-hidden /> Piden asignarse un vehículo ({solicitudes.length})
        </CardTitle>
        <CardDescription>Si confirmas, el conductor entra a la programación de hoy de ese vehículo.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {solicitudes.map((s) => (
            <li key={s.id} className="space-y-2 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">
                  <span className="font-medium">{s.conductor}</span> quiere <span className="font-semibold">{s.placa}</span>
                  <span className="text-muted-foreground"> · {cuando(s.solicitadoAt)}</span>
                </p>
                {puedeResolver && (
                  <div className="flex gap-2">
                    <Button size="sm" disabled={pending} onClick={() => resolver(s.id, "CONFIRMAR")}>
                      Confirmar
                    </Button>
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => setRechazando({ id: s.id, nota: "" })}>
                      Rechazar
                    </Button>
                  </div>
                )}
              </div>
              {rechazando?.id === s.id && (
                <div className="space-y-2">
                  <Textarea
                    rows={2}
                    value={rechazando.nota}
                    onChange={(e) => setRechazando({ id: s.id, nota: e.target.value })}
                    placeholder="Por qué lo rechazas (el conductor lo verá)"
                    aria-label="Motivo del rechazo"
                  />
                  <Button size="sm" disabled={pending || rechazando.nota.trim().length < 5} onClick={() => resolver(s.id, "RECHAZAR", rechazando.nota)}>
                    Rechazar solicitud
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
        {avisos.length > 0 && (
          <ul role="status" className="mt-2 space-y-1 rounded-md border border-warning/50 bg-warning-soft p-3 text-sm text-foreground">
            {avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
