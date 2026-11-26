"use client";

import { useState, useTransition } from "react";
import { solicitarAsignacionVehiculo, type MiSolicitudAsignacion } from "@/app/api/actions/solicitudes-asignacion";
import { Button } from "@/components/ui/button";
import { avisoAsignacion } from "@/lib/solicitud-asignacion";

const CAJA = "space-y-2 rounded-md border p-3 text-sm text-foreground";

/**
 * Aviso del preoperacional sobre la asignación del vehículo elegido: si no es el que Regulación le programó hoy, ofrece
 * pedirlo (Regulación confirma o rechaza) y cuenta cómo va la solicitud.
 */
export function PedirAsignacionVehiculo({
  vehicleId,
  placa,
  asignadoHoy,
  solicitud,
}: {
  vehicleId: string;
  placa: string;
  asignadoHoy: boolean;
  solicitud: MiSolicitudAsignacion | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [enviada, setEnviada] = useState<string | null>(null);

  const aviso = avisoAsignacion({ vehicleId, asignadoHoy, solicitud, enviadaAhora: enviada === vehicleId });

  if (aviso === "OCULTO") return null;
  if (aviso === "CONFIRMADA") {
    return <p className={`${CAJA} border-success/50 bg-success-soft`}>Regulación confirmó que {placa} es tu vehículo de hoy.</p>;
  }
  if (aviso === "PENDIENTE") {
    return <p className={`${CAJA} border-warning/50 bg-warning-soft`}>Pediste {placa}. Esperando que Regulación lo confirme.</p>;
  }

  return (
    <div className={`${CAJA} border-warning/50 bg-warning-soft`}>
      {aviso === "RECHAZADA" && (
        <p className="font-medium">
          Regulación no confirmó {placa}
          {solicitud?.nota ? `: ${solicitud.nota}` : "."}
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
