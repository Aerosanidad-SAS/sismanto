"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IncidentForm } from "./incident-form";
import type { Vehicle } from "@/types";

interface VehicleStatusCardProps {
  vehicle: Vehicle;
  readOnly?: boolean;
}

export function VehicleStatusCard({ vehicle, readOnly }: VehicleStatusCardProps) {
  const [showIncidentDialog, setShowIncidentDialog] = useState(false);

  const handleStatusChange = () => {
    if (vehicle.estado_actual === "OPERATIVO") {
      // Forzar creación de incidente
      setShowIncidentDialog(true);
    } else {
      // Evaluar si hay novedades abiertas antes de cambiar a operativo
      // Esta lógica debería estar en un Server Action
      // Por ahora, solo cerramos el dialog si existe
      setShowIncidentDialog(false);
    }
  };

  if (readOnly) return <span className="text-gray-400 text-sm">—</span>;

  return (
    <>
      <Button onClick={handleStatusChange} size="sm" variant="outline">
        Cambiar Estado
      </Button>

      <Dialog open={showIncidentDialog} onOpenChange={setShowIncidentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar Novedad - {vehicle.placa}</DialogTitle>
          </DialogHeader>
          <IncidentForm
            vehicleId={vehicle.id}
            afectaOperatividad={true}
            onSuccess={() => setShowIncidentDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
