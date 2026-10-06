import { CheckCircle2, ClipboardX, AlertTriangle } from "lucide-react";

import type { CierresDeHoy } from "@/lib/cierre-turno";
import { horaCierreBogota } from "@/lib/cierre-turno";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTrigger } from "@/components/ui/help-trigger";

/**
 * Cierres de turno de hoy: los vehículos programados que ya cerraron (con la hora que puso el servidor, en hora de
 * Colombia) y los que faltan por cerrar. Un cierre con novedades se marca con texto, no solo con color.
 */
export function CierresTurnoHoyCard({ datos }: { datos: CierresDeHoy }) {
  const { esperados, cerrados, faltantes } = datos;
  const completos = esperados > 0 && faltantes.length === 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            Cierres de turno de hoy
            <HelpTrigger text="Cada OVEM cierra su turno desde el portal: km final, novedades, combustible, limpieza y a quién entrega el vehículo. Aquí ves quién ya cerró y qué vehículos programados faltan." />
          </span>
          <Badge variant={completos ? "success" : "secondary"}>
            {esperados - faltantes.length} de {esperados}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {esperados === 0 && cerrados.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay vehículos programados hoy.</p>
        )}

        {completos && (
          <p className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden /> Todos los vehículos programados cerraron su turno.
          </p>
        )}

        {cerrados.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" aria-hidden /> Cerrados ({cerrados.length})
            </p>
            <ul className="space-y-1">
              {cerrados.map((c, i) => (
                <li key={`${c.vehicleId}-${i}`} className="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-sm">
                  <span className="min-w-0">
                    <span className="font-medium">{c.placa}</span>
                    <span className="text-muted-foreground"> · {c.ovem ?? "—"}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {c.estadoEntrega === "CON_NOVEDADES" && (
                      <Badge variant="warning" className="gap-1">
                        <AlertTriangle className="h-3 w-3" aria-hidden /> Con novedades
                      </Badge>
                    )}
                    <span className="tabular-nums text-muted-foreground">{horaCierreBogota(c.cerradoAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {faltantes.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <ClipboardX className="h-4 w-4 text-warning" aria-hidden /> Faltan por cerrar ({faltantes.length})
            </p>
            <ul className="space-y-1">
              {faltantes.map((v) => (
                <li key={v.vehicleId} className="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-sm">
                  <span className="font-medium">{v.placa}</span>
                  <span className="truncate text-muted-foreground">{v.operadores.length > 0 ? v.operadores.join(", ") : "Sin OVEM asignado"}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
