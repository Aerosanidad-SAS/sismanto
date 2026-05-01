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

export function RegulacionFleet({ fleet, ovemUsers }: RegulacionFleetProps) {
  const router = useRouter();
  const [assigningVehicle, setAssigningVehicle] = useState<string | null>(null);
  const [selectedOvem, setSelectedOvem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hoy = new Date().toISOString().split("T")[0];

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

  const operativos = fleet.filter((v) => v.estado_actual === "OPERATIVO").length;
  const fueraServicio = fleet.filter((v) => v.estado_actual === "FUERA_DE_SERVICIO").length;

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
            <div className="text-2xl font-bold text-green-600">{operativos}</div>
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
            <div className="text-2xl font-bold text-red-600">{fueraServicio}</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Flota - Toggle Disponibilidad</CardTitle>
          <CardDescription>
            Cambie el estado de cada vehículo (Disponible / Fuera de servicio)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Placa</th>
                  <th className="text-left py-3 px-4 font-medium">Modelo</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-left py-3 px-4 font-medium">Conductor asignado</th>
                  <th className="text-left py-3 px-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fleet.map((v) => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="py-3 px-4 font-bold">{v.placa}</td>
                    <td className="py-3 px-4">{v.marca || v.modelo || "—"}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={v.estado_actual === "OPERATIVO" ? "success" : "destructive"}
                      >
                        {v.estado_actual === "OPERATIVO" ? "Disponible" : "Fuera de servicio"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {v.assignments?.length > 0 ? (
                        <div className="space-y-1">
                          {v.assignments.map((a: any) => (
                            <div key={a.id} className="flex items-center gap-2">
                              <span>{a.driver?.nombre_completo || a.driver?.email || "—"}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-600"
                                onClick={() => handleUnassign(a.id)}
                                disabled={loading}
                              >
                                <UserMinus className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin asignar</span>
                      )}
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(v.id, v.estado_actual)}
                        disabled={loading}
                        className={
                          v.estado_actual === "OPERATIVO"
                            ? "text-orange-600 border-orange-300 hover:bg-orange-50"
                            : "text-green-600 border-green-300 hover:bg-green-50"
                        }
                      >
                        {v.estado_actual === "OPERATIVO"
                          ? "Marcar fuera de servicio"
                          : "Marcar disponible"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAssigningVehicle(v.id)}
                        disabled={loading}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Asignar OVEM
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
