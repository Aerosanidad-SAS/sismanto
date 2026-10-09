"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IncidentForm } from "@/components/dashboard/incident-form";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportarNovedadDialogProps {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  vehiculos: { id: string; placa: string }[];
  reportadoPor: string;
}

/**
 * Reportar una novedad de cualquier vehículo de la lista. Lo usan la barra de la sala de control y la pantalla de
 * Novedades (DEU-04 de PARIDAD_REGULACION.md: antes solo se podía desde la sala de control).
 */
export function ReportarNovedadDialog({ abierto, onAbiertoChange, vehiculos, reportadoPor }: ReportarNovedadDialogProps) {
  const router = useRouter();
  const [vehiculoId, setVehiculoId] = useState("");

  return (
    <Dialog
      open={abierto}
      onOpenChange={(v) => {
        onAbiertoChange(v);
        if (!v) setVehiculoId("");
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar novedad</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Vehículo *</Label>
            <Select value={vehiculoId} onValueChange={setVehiculoId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona la placa" />
              </SelectTrigger>
              <SelectContent>
                {vehiculos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.placa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {vehiculoId && (
            <IncidentForm
              vehicleId={vehiculoId}
              afectaOperatividad={false}
              reportadoPorDefault={reportadoPor}
              onSuccess={() => {
                onAbiertoChange(false);
                setVehiculoId("");
                router.refresh();
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
