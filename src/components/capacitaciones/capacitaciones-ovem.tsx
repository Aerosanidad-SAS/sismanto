"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateShort } from "@/lib/utils";

interface Props {
  assignments: any[];
}

export function CapacitacionesOvem({ assignments }: Props) {
  if (!assignments?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No tienes capacitaciones asignadas.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((a: any) => {
        const training = a.trainings;
        const sessions: any[] = a.training_sessions ?? [];
        const latest = sessions[0] ?? null;
        const isCompleted =
          a.completado ||
          latest?.estado === "CALIFICADA" ||
          latest?.estado === "COMPLETADA";

        const href = isCompleted
          ? `/capacitaciones/evidencia/${a.id}`
          : `/capacitaciones/${a.id}`;

        const statusLabel =
          latest?.estado === "CALIFICADA"
            ? "Calificada"
            : latest?.estado === "COMPLETADA"
            ? "Enviada"
            : latest?.estado === "EN_CURSO"
            ? "En curso"
            : "Sin iniciar";

        const statusVariant =
          latest?.estado === "CALIFICADA"
            ? "success"
            : latest?.estado === "COMPLETADA"
            ? "warning"
            : latest?.estado === "EN_CURSO"
            ? "default"
            : ("outline" as any);

        const btnLabel = isCompleted
          ? "Ver evidencia"
          : latest?.estado === "EN_CURSO"
          ? "Continuar evaluación"
          : "Ver capacitación";

        return (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">
                    {training?.titulo ?? `Capacitación #${a.id}`}
                  </CardTitle>
                  {a.fecha_limite && (
                    <CardDescription>
                      Fecha límite: {formatDateShort(a.fecha_limite)}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={statusVariant}>{statusLabel}</Badge>
                  {latest?.puntaje_final != null && (
                    <span className="text-sm font-semibold text-green-700">
                      {latest.puntaje_final}%
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                {training?.mes_ciclo && <span>Ciclo mes {training.mes_ciclo}</span>}
                {training?.tiempo_limite_minutos && (
                  <span>{training.tiempo_limite_minutos} min</span>
                )}
              </div>
              <Button asChild size="sm" variant={isCompleted ? "outline" : "default"}>
                <Link href={href}>{btnLabel}</Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
