import { CheckCircle2, ClipboardX, AlertTriangle } from "lucide-react";

import type { PreoperacionalHoy } from "@/app/api/actions/preoperacional-pendiente";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTrigger } from "@/components/ui/help-trigger";

/**
 * Preoperacional de hoy: cuántos vehículos que deben operar ya lo hicieron, cuáles faltan (en rojo si ya pasó la hora
 * límite) y cuáles lo hicieron con alguna falla. Es el aviso de que un preoperacional no se realizó.
 */
export function PreoperacionalHoyCard({ datos }: { datos: PreoperacionalHoy }) {
  const { esperados, realizados, pendientes, conFalla, vencido, horaLimite } = datos;
  const alerta = pendientes.length > 0 && vencido;
  const hora = `${String(horaLimite).padStart(2, "0")}:00`;

  return (
    <Card className={alerta ? "border-destructive/40" : undefined}>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            Preoperacional de hoy
            <HelpTrigger text={`Vehículos operativos con tripulación asignada hoy y si ya tienen su preoperacional. Pasadas las ${hora} los pendientes se marcan como incumplidos.`} />
          </span>
          <Badge variant={alerta ? "destructive" : pendientes.length > 0 ? "warning" : "success"}>
            {realizados} de {esperados}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {esperados === 0 && (
          <p className="rounded-md border border-warning/50 bg-warning-soft p-3 text-sm text-foreground">
            Regulación aún no asigna tripulaciones hoy: sin eso no se sabe qué vehículos deben operar ni quién debe hacer el
            preoperacional. Los vehículos operativos se cuentan como esperados en cuanto tengan tripulación asignada.
          </p>
        )}

        {esperados > 0 && pendientes.length === 0 && conFalla.length === 0 && (
          <p className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden /> Todos los preoperacionales de hoy están hechos y sin fallas.
          </p>
        )}

        {pendientes.length > 0 && (
          <div>
            <p className={`mb-2 flex items-center gap-2 text-sm font-medium ${alerta ? "text-destructive" : "text-foreground"}`}>
              <ClipboardX className={`h-4 w-4 ${alerta ? "" : "text-warning"}`} aria-hidden />
              {alerta ? `Sin preoperacional pasadas las ${hora}` : `Pendientes (límite ${hora})`} ({pendientes.length})
            </p>
            <ul className="space-y-1">
              {pendientes.map((v) => (
                <li key={v.placa} className="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-sm">
                  <span className="font-medium">{v.placa}</span>
                  <span className="truncate text-muted-foreground">{v.ovem ?? "Sin OVEM asignado"}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {conFalla.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <AlertTriangle className="h-4 w-4 text-warning" aria-hidden /> Hecho con fallas ({conFalla.length})
            </p>
            <ul className="space-y-1">
              {conFalla.map((v) => (
                <li key={v.placa} className="flex items-center justify-between gap-2 rounded-md border border-warning/50 px-3 py-1.5 text-sm">
                  <span className="font-medium">{v.placa}</span>
                  <span className="truncate text-muted-foreground">{v.ovem ?? "—"}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
