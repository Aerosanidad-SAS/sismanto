"use client";

import { hoyBogota } from "@/lib/fechas";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { asignarTripulacion, unassignVehicle } from "@/app/api/actions/regulacion";

interface Props {
  vehicleId: string;
  vehiclePlaca: string;
  ovemUsers: { user_id: string; nombre_completo: string | null; email: string | null }[];
  currentAssignment: { id: number; ovemName: string } | null;
}

export function AssignOvemButton({ vehicleId, vehiclePlaca, ovemUsers, currentAssignment }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAssign = () => {
    if (!selectedUserId) return;
    setError(null);
    const today = hoyBogota();
    startTransition(async () => {
      const result = await asignarTripulacion(vehicleId, selectedUserId, "OVEM", today);
      if (result?.error) { setError(result.error); return; }
      setOpen(false);
      setSelectedUserId("");
      router.refresh();
    });
  };

  const handleUnassign = () => {
    if (!currentAssignment) return;
    setError(null);
    startTransition(async () => {
      const result = await unassignVehicle(currentAssignment.id);
      if (result?.error) { setError(result.error); return; }
      setOpen(false);
      router.refresh();
    });
  };

  const label = currentAssignment
    ? (currentAssignment.ovemName.split(" ")[0] || "OVEM")
    : "Asignar OVEM";

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={currentAssignment ? "secondary" : "outline"}
        className="text-xs"
        onClick={() => setOpen(true)}
        title={currentAssignment ? `OVEM asignado: ${currentAssignment.ovemName}` : "Asignar conductor OVEM"}
      >
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Conductor — {vehiclePlaca}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentAssignment && (
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm">Asignado: <strong>{currentAssignment.ovemName}</strong></span>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isPending}
                  onClick={handleUnassign}
                >
                  {isPending ? "…" : "Desasignar"}
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {currentAssignment ? "Cambiar conductor" : "Asignar conductor"}
              </p>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar OVEM" />
                </SelectTrigger>
                <SelectContent>
                  {ovemUsers.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.nombre_completo || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                className="w-full"
                disabled={!selectedUserId || isPending}
                onClick={handleAssign}
              >
                {isPending ? "Asignando…" : "Asignar hoy"}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
