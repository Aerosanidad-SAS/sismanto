"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { registrarKilometrajeVehiculo } from "@/app/api/actions/vehiculos";
import { Gauge } from "lucide-react";

interface VehicleKilometrajeFormProps {
  vehicleId: string;
  placa: string;
}

export function VehicleKilometrajeForm({ vehicleId, placa }: VehicleKilometrajeFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [km, setKm] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const guardar = () => {
    setError(null);
    const n = parseInt(km, 10);
    if (Number.isNaN(n) || n <= 0) {
      setError("Ingrese un kilometraje válido (mayor a 0).");
      return;
    }
    if (!fecha) {
      setError("La fecha es obligatoria.");
      return;
    }
    startTransition(async () => {
      const res = await registrarKilometrajeVehiculo({ vehicleId, fecha, lecturaKilometraje: n });
      if ("error" in res && res.error) setError(res.error);
      else {
        setOpen(false);
        setKm("");
        router.refresh();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2 shrink-0">
          <Gauge className="h-4 w-4" />
          Actualizar KM
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Actualizar kilometraje — {placa}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="km-veh">Kilometraje actual</Label>
            <Input
              id="km-veh"
              type="number"
              min={1}
              className="mt-1"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="Ej: 125432"
              required
            />
          </div>
          <div>
            <Label htmlFor="fecha-km">Fecha de lectura</Label>
            <Input
              id="fecha-km"
              type="date"
              className="mt-1"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="button" className="w-full" disabled={pending} onClick={guardar}>
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
