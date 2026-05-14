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
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { actualizarEspecificacionesVehiculo } from "@/app/api/actions/vehiculos";

interface VehicleSpecsEditorProps {
  vehicle: {
    id: string;
    tipo_llantas?: string | null;
    aceite_usado?: string | null;
    ref_filtro_aceite?: string | null;
    ref_filtro_aire_motor?: string | null;
    bombilleria_farolas?: string | null;
    bombilleria_stops?: string | null;
    bombilleria_direccionales?: string | null;
    tipo_refrigerante?: string | null;
    bateria_principal?: string | null;
    bateria_auxiliar?: string | null;
  };
  canEdit: boolean;
}

export function VehicleSpecsEditor({ vehicle, canEdit }: VehicleSpecsEditorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    tipo_llantas: vehicle.tipo_llantas || "",
    aceite_usado: vehicle.aceite_usado || "",
    ref_filtro_aceite: vehicle.ref_filtro_aceite || "",
    ref_filtro_aire_motor: vehicle.ref_filtro_aire_motor || "",
    bombilleria_farolas: vehicle.bombilleria_farolas || "",
    bombilleria_stops: vehicle.bombilleria_stops || "",
    bombilleria_direccionales: vehicle.bombilleria_direccionales || "",
    tipo_refrigerante: vehicle.tipo_refrigerante || "",
    bateria_principal: vehicle.bateria_principal || "",
    bateria_auxiliar: vehicle.bateria_auxiliar || "",
  });

  if (!canEdit) return null;

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await actualizarEspecificacionesVehiculo({
        vehicleId: vehicle.id,
        ...form,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="mr-2 h-4 w-4" />
        Editar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar especificaciones</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="tipo_llantas">Tipo de llantas</Label>
              <Input id="tipo_llantas" value={form.tipo_llantas} onChange={(e) => updateField("tipo_llantas", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="aceite_usado">Aceite de motor</Label>
              <Input id="aceite_usado" value={form.aceite_usado} onChange={(e) => updateField("aceite_usado", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ref_filtro_aceite">Filtro aceite</Label>
              <Input id="ref_filtro_aceite" value={form.ref_filtro_aceite} onChange={(e) => updateField("ref_filtro_aceite", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ref_filtro_aire_motor">Filtro aire</Label>
              <Input id="ref_filtro_aire_motor" value={form.ref_filtro_aire_motor} onChange={(e) => updateField("ref_filtro_aire_motor", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bombilleria_farolas">Bombillería farolas</Label>
              <Input id="bombilleria_farolas" value={form.bombilleria_farolas} onChange={(e) => updateField("bombilleria_farolas", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bombilleria_stops">Bombillería stops</Label>
              <Input id="bombilleria_stops" value={form.bombilleria_stops} onChange={(e) => updateField("bombilleria_stops", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bombilleria_direccionales">Bombillería direccionales</Label>
              <Input id="bombilleria_direccionales" value={form.bombilleria_direccionales} onChange={(e) => updateField("bombilleria_direccionales", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tipo_refrigerante">Refrigerante</Label>
              <Input id="tipo_refrigerante" value={form.tipo_refrigerante} onChange={(e) => updateField("tipo_refrigerante", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bateria_principal">Batería principal</Label>
              <Input id="bateria_principal" value={form.bateria_principal} onChange={(e) => updateField("bateria_principal", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bateria_auxiliar">Batería auxiliar</Label>
              <Input id="bateria_auxiliar" value={form.bateria_auxiliar} onChange={(e) => updateField("bateria_auxiliar", e.target.value)} />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
