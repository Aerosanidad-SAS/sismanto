"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DotacionForm } from "./dotacion-form";
import type { ChecklistItem } from "@/components/ovem/checklist-item-row";

export function DotacionPanel({
  vehicles,
  vehiculoAsignadoId,
  items,
}: {
  vehicles: { id: string; placa: string; marca: string | null }[];
  vehiculoAsignadoId: string | null;
  items: ChecklistItem[];
}) {
  const [vehicleId, setVehicleId] = useState(vehiculoAsignadoId ?? "");
  const selected = vehicles.find((v) => v.id === vehicleId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ambulancia</CardTitle>
          <CardDescription>
            {vehiculoAsignadoId
              ? "Es la que Regulación te asignó hoy. Cámbiala si recibes otra."
              : "Regulación no te tiene asignada una hoy: elige la que recibes."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={vehicleId} onValueChange={setVehicleId}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Selecciona la ambulancia" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.placa}
                  {v.marca ? ` — ${v.marca}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selected && <DotacionForm vehicleId={selected.id} placa={selected.placa} items={items} />}
    </div>
  );
}
