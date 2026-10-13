"use client";

import { AlertTriangle, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vigenciaDocumento, UMBRAL_ALERTA_DIAS } from "@/lib/documentos-preop";
import { documentosVehiculo, type VehiculoConDocumentos } from "@/lib/vencimientos";
import { cn } from "@/lib/utils";

function fechaCorta(fecha: string) {
  const [y, m, d] = fecha.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Documentos del vehículo (SOAT, técnico-mecánica…): cuántos días faltan para cada vencimiento y una confirmación de
 * lectura. No se responde OK/Falla: el vencido o por vencer se reporta solo (novedad crítica al enviar) y aquí se avisa
 * en pantalla a 5 días o menos.
 */
export function DocumentosVehiculo({
  placa,
  vehiculo,
  hoy,
  esAeroportuario,
  confirmado,
  onConfirmar,
}: {
  placa: string;
  vehiculo: VehiculoConDocumentos;
  hoy: string;
  esAeroportuario: boolean;
  /** Si se pasa `onConfirmar`, muestra el botón «Leí los vencimientos». Sin él la tarjeta es solo de consulta. */
  confirmado?: boolean;
  onConfirmar?: (leido: boolean) => void;
}) {
  const documentos = documentosVehiculo(vehiculo)
    .filter(([doc]) => doc !== "Pase aeroportuario" || esAeroportuario)
    .map(([doc, fecha]) => ({ doc, fecha, v: vigenciaDocumento(fecha, hoy) }));
  const vencidos = documentos.filter((d) => d.v.nivel === "vencido");
  const porVencer = documentos.filter((d) => d.v.nivel === "alerta");

  return (
    <Card className={vencidos.length > 0 ? "border-red-300" : porVencer.length > 0 ? "border-warning" : undefined}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5" aria-hidden="true" />
          Documentos de {placa}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(vencidos.length > 0 || porVencer.length > 0) && (
          <div
            role="alert"
            className={cn(
              "flex items-start gap-2 rounded-lg border-2 p-3 text-base font-semibold",
              vencidos.length > 0 ? "border-red-700 bg-red-50 text-red-900" : "border-warning bg-warning-soft text-warning-foreground"
            )}
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>
              {vencidos.length > 0
                ? `${vencidos.map((d) => d.doc).join(" y ")}: ${vencidos.length > 1 ? "vencidos" : "vencido"}. No salgas con este vehículo: avisa a Regulación.`
                : `${porVencer.map((d) => `${d.doc} (${d.v.texto.toLowerCase()})`).join(" y ")} por vencer. Avisa a Regulación para renovarlo (alerta a ${UMBRAL_ALERTA_DIAS} días o menos).`}
            </p>
          </div>
        )}

        {documentos.map(({ doc, fecha, v }) => (
          <div key={doc} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-base font-medium text-foreground">{doc}</p>
              {fecha && <p className="text-sm text-muted-foreground">Vence el {fechaCorta(fecha)}</p>}
            </div>
            <p
              className={cn(
                "shrink-0 text-right text-base font-bold",
                v.nivel === "vencido" ? "text-red-700" : v.nivel === "alerta" ? "text-warning-foreground" : "text-foreground"
              )}
            >
              {v.texto}
            </p>
          </div>
        ))}

        {onConfirmar && (
          <Button
            type="button"
            variant={confirmado ? "default" : "outline"}
            aria-pressed={Boolean(confirmado)}
            className="min-h-12 w-full gap-2 text-base"
            onClick={() => onConfirmar(!confirmado)}
          >
            {confirmado && <Check className="h-5 w-5" aria-hidden="true" />}
            {confirmado ? "Leí los vencimientos" : "Marcar: leí los vencimientos"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
