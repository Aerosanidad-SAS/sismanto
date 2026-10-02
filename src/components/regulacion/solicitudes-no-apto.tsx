"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { resolverSolicitudNoApto, type SolicitudNoApto } from "@/app/api/actions/solicitudes-no-apto";
import { textoBloqueoProvisional } from "@/lib/solicitud-no-apto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const cuando = (iso: string) =>
  new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short", hour12: false, timeZone: "America/Bogota" }).format(new Date(iso));

/**
 * Solicitudes de NO APTO que esperan aval. Quien puede resolver (Coordinación del CRA o el administrador) ve los botones;
 * Regulación y los demás solo ven el bloqueo provisional para no asignarle servicios a esos vehículos.
 */
export function SolicitudesNoApto({ solicitudes, puedeResolver }: { solicitudes: SolicitudNoApto[]; puedeResolver: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [revisando, setRevisando] = useState<{ s: SolicitudNoApto; decision: "AVALAR" | "RECHAZAR" } | null>(null);
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bloqueo = textoBloqueoProvisional();

  if (solicitudes.length === 0) return null;

  const abrir = (s: SolicitudNoApto, decision: "AVALAR" | "RECHAZAR") => {
    setNota("");
    setError(null);
    setRevisando({ s, decision });
  };

  const confirmar = () => {
    if (!revisando) return;
    startTransition(async () => {
      setError(null);
      const r = await resolverSolicitudNoApto(revisando.s.id, revisando.decision, nota);
      if ("error" in r && r.error) {
        setError(r.error);
        return;
      }
      setRevisando(null);
      router.refresh();
    });
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden />
          Solicitudes de NO APTO por avalar ({solicitudes.length})
        </CardTitle>
        <CardDescription>{bloqueo.detalle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {solicitudes.map((s) => (
            <li key={s.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {s.placa} <Badge variant="destructive">{bloqueo.titulo}</Badge>
                </p>
                <p className="mt-1 text-sm">{s.motivo}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.origen === "SINIESTRO" ? "Siniestro vial" : "Reporte del OVEM"} · {s.solicitadoPor} · {cuando(s.solicitadoAt)}
                </p>
              </div>
              {puedeResolver ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => abrir(s, "AVALAR")}>
                    Avalar NO APTO
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => abrir(s, "RECHAZAR")}>
                    Rechazar
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>

      <Dialog open={revisando !== null} onOpenChange={(abierto) => !abierto && setRevisando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {revisando?.decision === "AVALAR" ? "Avalar NO APTO" : "Rechazar solicitud"} — {revisando?.s.placa}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {revisando?.decision === "AVALAR"
                ? "El vehículo pasará a Fuera de servicio y se registrará quién lo avaló."
                : "El vehículo seguirá como estaba. Quien lo reportó verá tu explicación."}
            </p>
            <div>
              <Label htmlFor="nota-no-apto">{revisando?.decision === "AVALAR" ? "Nota (opcional)" : "Por qué rechazas (obligatorio)"}</Label>
              <Textarea id="nota-no-apto" className="mt-1" value={nota} onChange={(e) => setNota(e.target.value)} rows={3} />
            </div>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button variant="outline" disabled={pending} onClick={() => setRevisando(null)}>
                Cancelar
              </Button>
              <Button variant={revisando?.decision === "AVALAR" ? "destructive" : "default"} disabled={pending} onClick={confirmar}>
                {revisando?.decision === "AVALAR" ? "Avalar NO APTO" : "Rechazar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
