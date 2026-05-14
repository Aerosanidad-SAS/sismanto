"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { actualizarInformacionGeneralVehiculo } from "@/app/api/actions/vehiculos";

const SELECT_EMPTY = "__empty__";

interface VehicleGeneralEditorProps {
  vehicle: {
    id: string;
    marca?: string | null;
    modelo?: string | null;
    linea?: string | null;
    tipo_combustible?: string | null;
    centro_operativo_id?: number | null;
    vencimiento_soat?: string | null;
    vencimiento_rtm?: string | null;
    vencimiento_tecnicomecanica?: string | null;
    costo_soat_anual?: number | null;
    costo_tecnomecanica_anual?: number | null;
    costo_poliza_anual?: number | null;
  };
  centros: { id: number; nombre: string }[];
  canEdit: boolean;
}

export function VehicleGeneralEditor({ vehicle, centros, canEdit }: VehicleGeneralEditorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    marca: vehicle.marca || "",
    modelo: vehicle.modelo || "",
    linea: vehicle.linea || "",
    tipo_combustible: vehicle.tipo_combustible || "",
    centro_operativo_id: vehicle.centro_operativo_id ? String(vehicle.centro_operativo_id) : "",
    vencimiento_soat: vehicle.vencimiento_soat || "",
    vencimiento_rtm: vehicle.vencimiento_rtm || "",
    vencimiento_tecnicomecanica: vehicle.vencimiento_tecnicomecanica || "",
    costo_soat_anual: vehicle.costo_soat_anual != null ? String(vehicle.costo_soat_anual) : "",
    costo_tecnomecanica_anual:
      vehicle.costo_tecnomecanica_anual != null ? String(vehicle.costo_tecnomecanica_anual) : "",
    costo_poliza_anual: vehicle.costo_poliza_anual != null ? String(vehicle.costo_poliza_anual) : "",
  });

  if (!canEdit) return null;

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const centroId = parseInt(form.centro_operativo_id, 10);
      if (Number.isNaN(centroId) || centroId <= 0) {
        setError("Debe seleccionar un centro operativo.");
        return;
      }

      const result = await actualizarInformacionGeneralVehiculo({
        vehicleId: vehicle.id,
        marca: form.marca,
        modelo: form.modelo,
        linea: form.linea,
        tipo_combustible: form.tipo_combustible,
        centro_operativo_id: centroId,
        vencimiento_soat: form.vencimiento_soat || null,
        vencimiento_rtm: form.vencimiento_rtm || null,
        vencimiento_tecnicomecanica: form.vencimiento_tecnicomecanica || null,
        costo_soat_anual: form.costo_soat_anual ? Number(form.costo_soat_anual) : null,
        costo_tecnomecanica_anual: form.costo_tecnomecanica_anual
          ? Number(form.costo_tecnomecanica_anual)
          : null,
        costo_poliza_anual: form.costo_poliza_anual ? Number(form.costo_poliza_anual) : null,
      });

      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  const setField = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Pencil className="mr-2 h-4 w-4" />
        Editar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar información general</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="marca">Marca</Label>
              <Input id="marca" value={form.marca} onChange={(e) => setField("marca", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="modelo">Modelo</Label>
              <Input id="modelo" value={form.modelo} onChange={(e) => setField("modelo", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="linea">Línea</Label>
              <Input id="linea" value={form.linea} onChange={(e) => setField("linea", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tipo_combustible">Combustible</Label>
              <Input
                id="tipo_combustible"
                value={form.tipo_combustible}
                onChange={(e) => setField("tipo_combustible", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="centro_operativo">Centro operativo</Label>
              <Select
                value={form.centro_operativo_id || SELECT_EMPTY}
                onValueChange={(v) => setField("centro_operativo_id", v === SELECT_EMPTY ? "" : v)}
              >
                <SelectTrigger id="centro_operativo" className="mt-1">
                  <SelectValue placeholder="Seleccione un centro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_EMPTY} disabled>
                    Seleccione un centro
                  </SelectItem>
                  {centros.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vencimiento_soat">Vencimiento SOAT</Label>
              <Input
                id="vencimiento_soat"
                type="date"
                value={form.vencimiento_soat}
                onChange={(e) => setField("vencimiento_soat", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="vencimiento_rtm">Vencimiento RTM</Label>
              <Input
                id="vencimiento_rtm"
                type="date"
                value={form.vencimiento_rtm}
                onChange={(e) => setField("vencimiento_rtm", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="vencimiento_tecnicomecanica">Vencimiento técnico-mecánica</Label>
              <Input
                id="vencimiento_tecnicomecanica"
                type="date"
                value={form.vencimiento_tecnicomecanica}
                onChange={(e) => setField("vencimiento_tecnicomecanica", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="costo_soat_anual">Costo SOAT anual</Label>
              <Input
                id="costo_soat_anual"
                type="number"
                min={0}
                value={form.costo_soat_anual}
                onChange={(e) => setField("costo_soat_anual", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="costo_tecnomecanica_anual">Costo RTM anual</Label>
              <Input
                id="costo_tecnomecanica_anual"
                type="number"
                min={0}
                value={form.costo_tecnomecanica_anual}
                onChange={(e) => setField("costo_tecnomecanica_anual", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="costo_poliza_anual">Costo póliza anual</Label>
              <Input
                id="costo_poliza_anual"
                type="number"
                min={0}
                value={form.costo_poliza_anual}
                onChange={(e) => setField("costo_poliza_anual", e.target.value)}
              />
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
