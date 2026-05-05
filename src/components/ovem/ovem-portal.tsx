"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  submitDailyCheck,
  updateKilometrajeOdometer,
  getDailyCheckForToday,
} from "@/app/api/actions/ovem";
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
import { CheckCircle2, Gauge, AlertCircle, ClipboardCheck, ArrowLeft, ArrowRight } from "lucide-react";
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
  vehicles: Array<{
    id: string;
    placa: string;
    marca?: string | null;
    modelo?: string | null;
    estado_actual?: string;
  }>;
  isAdmin: boolean;
}

type Flow = null | "preoperacional" | "novedad";

export function OvemPortal({ userId, userName, vehicles, isAdmin }: OvemPortalProps) {
  const router = useRouter();
  const [flow, setFlow] = useState<Flow>(null);
  const [vehicleId, setVehicleId] = useState("");
  const [km, setKm] = useState("");
  const [checklistOk, setChecklistOk] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [showNovedadDialog, setShowNovedadDialog] = useState(false);
  const [dailyCheckDone, setDailyCheckDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [novedadesOpen, setNovedadesOpen] = useState(false);

  const hoy = new Date().toISOString().split("T")[0];
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  useEffect(() => {
    if (vehicleId && flow === "preoperacional") {
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
    } else if (!vehicleId || flow !== "preoperacional") {
      setDailyCheckDone(false);
    }
  }, [vehicleId, userId, flow]);

  useEffect(() => {
    setVehicleId("");
    setKm("");
    setError(null);
    setSuccess(null);
    setShowNovedadDialog(false);
    setNovedadesOpen(false);
  }, [flow]);

  const handleSubmitChecklist = async () => {
    if (!vehicleId || flow !== "preoperacional") return;
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

  const goHub = () => {
    setFlow(null);
    setVehicleId("");
  };

  /* Flujo inicial: opciones sin exigir asignaciones */
  if (flow === null) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Elija una acción</CardTitle>
            <CardDescription>
              Puede trabajar con cualquier vehículo de la flota. No necesita tener una asignación previa
              en regulación para iniciar preoperacional o reportar una novedad.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button
              className="h-auto py-6 flex flex-col gap-2 flex-1"
              variant="outline"
              onClick={() => setFlow("preoperacional")}
            >
              <ClipboardCheck className="h-8 w-8" />
              <span className="text-base font-semibold">Iniciar preoperacional</span>
              <span className="text-xs font-normal text-muted-foreground text-center">
                Checklist diario y kilometraje
              </span>
            </Button>
            <Button
              className="h-auto py-6 flex flex-col gap-2 flex-1"
              variant="outline"
              onClick={() => setFlow("novedad")}
            >
              <AlertCircle className="h-8 w-8" />
              <span className="text-base font-semibold">Reportar novedad</span>
              <span className="text-xs font-normal text-muted-foreground text-center">
                Formulario de incidente por vehículo
              </span>
            </Button>
          </CardContent>
        </Card>

        {!isAdmin && vehicles.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No hay vehículos en el sistema todavía. Si cree que es un error, contacte al administrador.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={goHub} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <p className="text-sm text-muted-foreground">
          {flow === "preoperacional" ? "Preoperacional" : "Reporte de novedad"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar vehículo</CardTitle>
          <CardDescription>El mismo vehículo aplica para esta sesión.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={vehicleId} onValueChange={setVehicleId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un vehículo" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.placa}
                  {v.marca ? ` — ${v.marca}` : ""}{" "}
                  {v.estado_actual === "FUERA_DE_SERVICIO" ? "(Fuera de servicio)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {vehicleId && flow === "novedad" && (
        <Card>
          <CardHeader>
            <CardTitle>Reportar novedad</CardTitle>
            <CardDescription>
              Vehículo {selectedVehicle?.placa}. La prioridad operativa la asigna administración en el
              módulo de novedades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentForm
              vehicleId={vehicleId}
              afectaOperatividad={false}
              onSuccess={() => {
                router.refresh();
                setFlow(null);
              }}
              reportadoPorDefault={userName}
              hideSeveridad
            />
          </CardContent>
        </Card>
      )}

      {vehicleId && flow === "preoperacional" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Checklist pre-operacional diario
              </CardTitle>
              <CardDescription>Revise los puntos antes de iniciar su turno.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
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
                Registre el kilometraje actual. No puede ser menor al último registrado en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 items-end flex-wrap">
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
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertCircle className="h-5 w-5" />
                    Reportar novedad desde preoperacional
                  </CardTitle>
                  <CardDescription>
                    Si detectó una falla durante la inspección, regístrela aquí (mismo vehículo).
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 shrink-0"
                  onClick={() => setNovedadesOpen((o) => !o)}
                >
                  {novedadesOpen ? "Ocultar" : "Mostrar"}
                  <ArrowRight className={`h-4 w-4 transition ${novedadesOpen ? "rotate-90" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            {novedadesOpen && (
              <CardContent className="space-y-3 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  También puede abrir el mismo formulario en una ventana aparte si prefiere.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setShowNovedadDialog(true)}>
                    Abrir formulario de novedad
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </>
      )}

      <Dialog open={showNovedadDialog} onOpenChange={setShowNovedadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar Novedad — {selectedVehicle?.placa}</DialogTitle>
          </DialogHeader>
          <IncidentForm
            vehicleId={vehicleId}
            afectaOperatividad={false}
            onSuccess={() => {
              setShowNovedadDialog(false);
              router.refresh();
            }}
            reportadoPorDefault={userName}
            hideSeveridad
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
