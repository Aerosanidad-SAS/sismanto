"use client";

import { useState, useTransition } from "react";
import { solicitarAsignacionVehiculo, type MiSolicitudAsignacion } from "@/app/api/actions/solicitudes-asignacion";
import { Button } from "@/components/ui/button";

const CAJA = "space-y-2 rounded-md border p-3 text-sm text-foreground";

/**
 * Aviso del preoperacional cuando el vehículo elegido no es el que Regulación le programó hoy: ofrece pedir la
 * asignación (Regulación la confirma o rechaza) y cuenta cómo va la solicitud.
 */
export function PedirAsignacionVehiculo({
  vehicleId,
  placa,
  solicitud,
}: {
  vehicleId: string;
  placa: string;
  solicitud: MiSolicitudAsignacion | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [enviada, setEnviada] = useState<string | null>(null);

  const deEste = solicitud?.vehicleId === vehicleId ? solicitud : null;

  if (deEste?.estado === "CONFIRMADA") {
    return <p className={`${CAJA} border-success/50 bg-success-soft`}>Regulación confirmó que {placa} es tu vehículo de hoy.</p>;
  }
  if (enviada === vehicleId || deEste?.estado === "PENDIENTE") {
    return <p className={`${CAJA} border-warning/50 bg-warning-soft`}>Pediste {placa}. Esperando que Regulación lo confirme.</p>;
  }

  return (
    <div className={`${CAJA} border-warning/50 bg-warning-soft`}>
      {deEste?.estado === "RECHAZADA" && (
        <p className="font-medium">
          Regulación no confirmó {placa}
          {deEste.nota ? `: ${deEste.nota}` : "."}
        </p>
      )}
      <p>No tienes {placa} asignado hoy. Si Regulación te lo dijo, pide la asignación y ellos la confirman.</p>
      <Button
        type="button"
        className="min-h-11 w-full"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const r = await solicitarAsignacionVehiculo(vehicleId);
            if ("error" in r && r.error) setError(r.error);
            else setEnviada(vehicleId);
          })
        }
      >
        {pending ? "Enviando..." : `Pedir asignación de ${placa}`}
      </Button>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
