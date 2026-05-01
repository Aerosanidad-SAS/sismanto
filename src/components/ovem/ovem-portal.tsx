"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  submitDailyCheck,
  updateKilometrajeOdometer,
  getDailyCheckForToday,
} from "@/app/api/actions/ovem";
import { createIncident } from "@/app/api/actions/incidents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { IncidentForm } from "@/components/dashboard/incident-form";
import { CheckCircle2, Gauge, AlertCircle } from "lucide-react";

const CHECKLIST_ITEMS = [
  "Nivel de aceite",
  "Nivel de refrigerante",
  "Estado de neumáticos",
  "Luces y señalización",
  "Frenos",
  "Documentación (SOAT, RTM)",
  "Equipo de emergencia",
];

interface OvemPortalProps {
  userId: string;
  userName: string;
  vehicles: any[];
  isAdmin: boolean;
}

export function OvemPortal({ userId, userName, vehicles, isAdmin }: OvemPortalProps) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState<string>("");
  const [km, setKm] = useState("");
  const [checklistOk, setChecklistOk] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [showNovedad, setShowNovedad] = useState(false);
  const [dailyCheckDone, setDailyCheckDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hoy = new Date().toISOString().split("T")[0];
  const selectedVehicle = vehicles.find((v: any) => v.id === vehicleId);

  useEffect(() => {
    if (vehicleId) {
      getDailyCheckForToday(userId, vehicleId).then((dc) => {
        if (dc) {
          setDailyCheckDone(true);
          setChecklistOk(dc.checklist_ok);
          setObservaciones(dc.observaciones || "");
          if (dc.kilometraje_inicial) setKm(String(dc.kilometraje_inicial));
        } else {
          setDailyCheckDone(false);
        }
      });
    } else {
      setDailyCheckDone(false);
    }
  }, [vehicleId, userId]);

  const handleSubmitChecklist = async () => {
    if (!vehicleId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    const kmNum = parseInt(km);
    if (isNaN(kmNum) || kmNum < 0) {
      setError("Ingrese un kilometraje válido");
      setLoading(false);
      return;
    }
    const result = await submitDailyCheck({
      userId,
      vehicleId,
      fecha: hoy,
      kilometrajeInicial: kmNum,
      kilometrajeFinal: kmNum,
      checklistOk,
      observaciones: observaciones || undefined,
    });
    if (result?.error) setError(result.error);
    else {
      setSuccess("Checklist completado correctamente");
      setDailyCheckDone(true);
      router.refresh();
    }
    setLoading(false);
  };

  const handleUpdateKm = async () => {
    if (!vehicleId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    const kmNum = parseInt(km);
    if (isNaN(kmNum) || kmNum < 0) {
      setError("Ingrese un kilometraje válido");
      setLoading(false);
      return;
    }
    const result = await updateKilometrajeOdometer(userId, vehicleId, hoy, kmNum);
    if (result?.error) setError(result.error);
    else {
      setSuccess("Kilometraje actualizado");
      router.refresh();
    }
    setLoading(false);
  };

  if (vehicles.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">
            No tiene vehículos asignados para este turno. Contacte a Regulación.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar vehículo</CardTitle>
          <CardDescription>Vehículo asignado para su turno actual</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={vehicleId} onValueChange={setVehicleId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un vehículo" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v: any) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.placa} {v.marca ? `- ${v.marca}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {vehicleId && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Checklist pre-operacional diario
              </CardTitle>
              <CardDescription>
                Revise los puntos antes de iniciar su turno
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {CHECKLIST_ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div>
                <Label>¿Todos los puntos están OK?</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="checklist"
                      checked={checklistOk}
                      onChange={() => setChecklistOk(true)}
                    />
                    Sí
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="checklist"
                      checked={!checklistOk}
                      onChange={() => setChecklistOk(false)}
                    />
                    No
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="km-inicial">Kilometraje actual</Label>
                <Input
                  id="km-inicial"
                  type="number"
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                  placeholder="Ej: 125000"
                  className="mt-1 max-w-xs"
                />
              </div>
              <div>
                <Label htmlFor="obs">Observaciones</Label>
                <Textarea
                  id="obs"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones del checklist..."
                  className="mt-1"
                  rows={2}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <Button onClick={handleSubmitChecklist} disabled={loading}>
                {loading ? "Guardando..." : dailyCheckDone ? "Actualizar checklist" : "Enviar checklist"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Actualizar kilometraje
              </CardTitle>
              <CardDescription>
                Registre el kilometraje actual. No puede ser menor al último registrado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 items-end">
                <div>
                  <Label htmlFor="km-odometer">Kilometraje</Label>
                  <Input
                    id="km-odometer"
                    type="number"
                    value={km}
                    onChange={(e) => setKm(e.target.value)}
                    placeholder="Ej: 125000"
                    className="mt-1 w-40"
                  />
                </div>
                <Button onClick={handleUpdateKm} disabled={loading} variant="outline">
                  Actualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Reportar novedad
              </CardTitle>
              <CardDescription>
                Reporte fallas técnicas: Leve, Moderada o Severa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowNovedad(true)} variant="outline">
                Crear novedad
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={showNovedad} onOpenChange={setShowNovedad}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar Novedad - {selectedVehicle?.placa}</DialogTitle>
          </DialogHeader>
          <IncidentForm
            vehicleId={vehicleId}
            afectaOperatividad={false}
            onSuccess={() => setShowNovedad(false)}
            reportadoPorDefault={userName}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
