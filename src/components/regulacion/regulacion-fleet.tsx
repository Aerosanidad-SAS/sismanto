"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  toggleVehicleStatus,
  assignVehicleToOvem,
  unassignVehicle,
} from "@/app/api/actions/regulacion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { CheckCircle2, XCircle, UserPlus, UserMinus } from "lucide-react";

interface RegulacionFleetProps {
  fleet: any[];
  ovemUsers: { user_id: string; nombre_completo: string | null; email: string | null }[];
}

function VehicleLane({
  vehicles,
  title,
  subtitle,
  emptyText,
  tone,
  onToggle,
  onAssignClick,
  onUnassign,
  loading,
}: {
  vehicles: any[];
  title: string;
  subtitle: string;
  emptyText: string;
  tone: "available" | "fds";
  onToggle: (id: string, estado: string) => void;
  onAssignClick: (id: string) => void;
  onUnassign: (assignmentId: number) => void;
  loading: boolean;
}) {
  return (
    <Card className="flex flex-col min-h-[420px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {tone === "available" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          {title}
        </CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-[70vh] space-y-2 pr-1">
        {vehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">{emptyText}</p>
        ) : (
          vehicles.map((v: any) => (
            <div
              key={v.id}
              className={`rounded-lg border p-3 text-sm space-y-2 ${
                tone === "available" ? "border-green-200 bg-green-50/40" : "border-red-200 bg-red-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold">{v.placa}</div>
                  <div className="text-muted-foreground text-xs">
                    {v.marca || v.modelo || "—"}
                  </div>
                </div>
                <Badge variant={v.estado_actual === "OPERATIVO" ? "success" : "destructive"}>
                  {v.estado_actual === "OPERATIVO" ? "Disponible" : "FDS"}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {v.assignments?.length > 0 ? (
                  <div className="space-y-1">
                    {v.assignments.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-2">
                        <span className="truncate">
                          {a.driver?.nombre_completo || a.driver?.email || "—"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-600 shrink-0"
                          onClick={() => onUnassign(a.id)}
                          disabled={loading}
                          aria-label="Desasignar"
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>Sin conductor asignado</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className={
                    v.estado_actual === "OPERATIVO"
                      ? "text-orange-700 border-orange-300 hover:bg-orange-50"
                      : "text-green-700 border-green-600 hover:bg-green-50"
                  }
                  onClick={() => onToggle(v.id, v.estado_actual)}
                  disabled={loading}
                >
                  {v.estado_actual === "OPERATIVO" ? "Marcar fuera de servicio" : "Marcar disponible"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAssignClick(v.id)} disabled={loading}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Asignar OVEM
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function RegulacionFleet({ fleet, ovemUsers }: RegulacionFleetProps) {
  const router = useRouter();
  const [assigningVehicle, setAssigningVehicle] = useState<string | null>(null);
  const [selectedOvem, setSelectedOvem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hoy = new Date().toISOString().split("T")[0];

  const disponibles = fleet.filter((v) => v.estado_actual === "OPERATIVO");
  const fueraServicio = fleet.filter((v) => v.estado_actual === "FUERA_DE_SERVICIO");

  const handleToggle = async (vehicleId: string, currentStatus: string) => {
    setLoading(true);
    setError(null);
    const nuevo = currentStatus === "OPERATIVO" ? "FUERA_DE_SERVICIO" : "OPERATIVO";
    const result = await toggleVehicleStatus(vehicleId, nuevo);
    if (result?.error) setError(result.error);
    else router.refresh();
    setLoading(false);
  };

  const handleAssign = async () => {
    if (!assigningVehicle || !selectedOvem) return;
    setLoading(true);
    setError(null);
    const result = await assignVehicleToOvem(assigningVehicle, selectedOvem, hoy);
    if (result?.error) setError(result.error);
    else {
      setAssigningVehicle(null);
      setSelectedOvem("");
      router.refresh();
    }
    setLoading(false);
  };

  const handleUnassign = async (assignmentId: number) => {
    if (!confirm("¿Desasignar este conductor del vehículo?")) return;
    setLoading(true);
    setError(null);
    const result = await unassignVehicle(assignmentId);
    if (result?.error) setError(result.error);
    else router.refresh();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{disponibles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Fuera de servicio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{fueraServicio.length}</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl uppercase tracking-wide">FLOTA</CardTitle>
          <CardDescription>
            Columna izquierda: vehículos disponibles. Columna derecha: fuera de servicio (FDS). Al cambiar el
            estado, el vehículo pasa a la otra columna.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2 items-start">
            <VehicleLane
              vehicles={disponibles}
              title="Vehículos disponibles"
              subtitle="Operativos y listos para despacho."
              emptyText="No hay vehículos en estado disponible."
              tone="available"
              onToggle={handleToggle}
              onAssignClick={setAssigningVehicle}
              onUnassign={handleUnassign}
              loading={loading}
            />
            <VehicleLane
              vehicles={fueraServicio}
              title="Vehículos fuera de servicio"
              subtitle="Incluye unidades en mantenimiento o indisponibles."
              emptyText="No hay vehículos fuera de servicio."
              tone="fds"
              onToggle={handleToggle}
              onAssignClick={setAssigningVehicle}
              onUnassign={handleUnassign}
              loading={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!assigningVehicle} onOpenChange={() => setAssigningVehicle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar conductor (OVEM)</DialogTitle>
            <p className="text-sm text-gray-500">Seleccione el conductor para el vehículo</p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Conductor</label>
              <Select value={selectedOvem} onValueChange={setSelectedOvem}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione un OVEM" />
                </SelectTrigger>
                <SelectContent>
                  {ovemUsers.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.nombre_completo || u.email || u.user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssigningVehicle(null)}>
                Cancelar
              </Button>
              <Button onClick={handleAssign} disabled={!selectedOvem || loading}>
                {loading ? "Asignando..." : "Asignar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
