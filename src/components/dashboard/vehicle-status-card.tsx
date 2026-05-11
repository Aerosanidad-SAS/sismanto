"use client";

import { useState } from "react";
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

/** Acceso rápido al formulario de novedad (no cambia el estado operativo; use la etiqueta de estado para eso). */
export function VehicleStatusCard({ vehicle, readOnly }: VehicleStatusCardProps) {
  const [showIncidentDialog, setShowIncidentDialog] = useState(false);

  if (readOnly) return <span className="text-gray-400 text-sm">—</span>;

  return (
    <>
      <Button
        type="button"
        onClick={() => setShowIncidentDialog(true)}
        size="sm"
        variant="outline"
        title="Registrar una novedad o incidente sobre este vehículo"
      >
        Reportar novedad
      </Button>

      <Dialog open={showIncidentDialog} onOpenChange={setShowIncidentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar novedad — {vehicle.placa}</DialogTitle>
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
