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
    <Card className={alerta ? "border-red-300" : undefined}>
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
          <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            Regulación aún no asigna tripulaciones hoy: sin eso no se sabe qué vehículos deben operar ni quién debe hacer el
            preoperacional. Los vehículos operativos se cuentan como esperados en cuanto tengan tripulación asignada.
          </p>
        )}

        {esperados > 0 && pendientes.length === 0 && conFalla.length === 0 && (
          <p className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Todos los preoperacionales de hoy están hechos y sin fallas.
          </p>
        )}

        {pendientes.length > 0 && (
          <div>
            <p className={`mb-2 flex items-center gap-2 text-sm font-medium ${alerta ? "text-red-700" : "text-amber-700"}`}>
              <ClipboardX className="h-4 w-4" aria-hidden />
              {alerta ? `Sin preoperacional pasadas las ${hora}` : `Pendientes (límite ${hora})`}
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
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-orange-700">
              <AlertTriangle className="h-4 w-4" aria-hidden /> Hecho con fallas
            </p>
            <ul className="space-y-1">
              {conFalla.map((v) => (
                <li key={v.placa} className="flex items-center justify-between gap-2 rounded-md border border-orange-200 px-3 py-1.5 text-sm">
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
