"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { submitDailyCheck, getDailyCheckForToday, getDailyCheckItemsForToday } from "@/app/api/actions/ovem";
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
import { CheckCircle2, AlertCircle, ClipboardCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface OvemPortalProps {
  userId: string;
  userName: string;
  vehicles: Array<{
    id: string;
    placa: string;
    marca?: string | null;
    modelo?: string | null;
    estado_actual?: string;
    centro_operativo?: string;
  }>;
  checklistItems: Array<{
    id: number;
    categoria: string;
    descripcion: string;
    cantidad_esperada: string | null;
    orden: number;
    activo: boolean;
  }>;
  isAdmin: boolean;
  viewerRole?: "OVEM" | "ADMIN";
}

type Flow = null | "preoperacional" | "novedad";

export function OvemPortal({
  userId,
  userName,
  vehicles,
  checklistItems,
  isAdmin,
  viewerRole = "ADMIN",
}: OvemPortalProps) {
  const router = useRouter();
  const [flow, setFlow] = useState<Flow>(null);
  const [vehicleId, setVehicleId] = useState("");
  const [km, setKm] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [showNovedadDialog, setShowNovedadDialog] = useState(false);
  const [dailyCheckDone, setDailyCheckDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [novedadesOpen, setNovedadesOpen] = useState(false);
  const [checkItemsState, setCheckItemsState] = useState<
    Record<
      number,
      { estado: "OK" | "FALLA" | "NO_APLICA"; cantidadOk?: number; observacion?: string }
    >
  >({});
  const [incidentFromItem, setIncidentFromItem] = useState<null | { title: string; desc: string }>(
    null
  );

  const hoy = new Date().toISOString().split("T")[0];
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  useEffect(() => {
    if (vehicleId && flow === "preoperacional") {
      getDailyCheckForToday(userId, vehicleId).then((dc) => {
        if (dc) {
          setDailyCheckDone(true);
          setObservaciones(dc.observaciones || "");
          if (dc.kilometraje_inicial) setKm(String(dc.kilometraje_inicial));
        } else {
          setDailyCheckDone(false);
        }
      });

      getDailyCheckItemsForToday(userId, vehicleId).then((items) => {
        const map: typeof checkItemsState = {};
        for (const it of items as any[]) {
          map[it.checklist_item_id] = {
            estado: it.estado,
            cantidadOk: it.cantidad_ok ?? undefined,
            observacion: it.observacion ?? undefined,
          };
        }
        setCheckItemsState(map);
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
    setCheckItemsState({});
  }, [flow]);

  const checklistFiltrado = useMemo(() => {
    return checklistItems.filter((it) => {
      if (viewerRole === "OVEM" && it.descripcion === "Sticker Visible") return false;
      if (it.descripcion === "Radio Base") {
        const co = selectedVehicle?.centro_operativo;
        if (!co || String(co).toUpperCase() !== "AIRPLAN") return false;
      }
      return true;
    });
  }, [checklistItems, viewerRole, selectedVehicle?.centro_operativo]);

  const checklistItemsByCategoria = useMemo(() => {
    const m = new Map<string, OvemPortalProps["checklistItems"]>();
    for (const it of checklistFiltrado) {
      const arr = m.get(it.categoria) || [];
      arr.push(it);
      m.set(it.categoria, arr);
    }
    return Array.from(m.entries());
  }, [checklistFiltrado]);

  const handleSubmitChecklist = async () => {
    if (!vehicleId || flow !== "preoperacional") return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    const kmNum = parseInt(km, 10);
    if (isNaN(kmNum) || kmNum <= 0) {
      setError("El kilometraje actual es obligatorio y debe ser mayor a cero.");
      setLoading(false);
      return;
    }
    const idsVisibles = new Set(checklistFiltrado.map((it) => it.id));
    const desdeEstado = Object.entries(checkItemsState)
      .filter(([id]) => idsVisibles.has(parseInt(id, 10)))
      .map(([id, v]) => ({
        checklistItemId: parseInt(id, 10),
        estado: v.estado,
        cantidadOk: v.cantidadOk,
        observacion: v.observacion,
      }));
    const noAplicaOcultos = checklistItems
      .filter((it) => !idsVisibles.has(it.id))
      .map((it) => ({
        checklistItemId: it.id,
        estado: "NO_APLICA" as const,
        observacion: undefined as string | undefined,
      }));

    const result = await submitDailyCheck({
      userId,
      vehicleId,
      fecha: hoy,
      kilometrajeInicial: kmNum,
      kilometrajeFinal: kmNum,
      observaciones: observaciones || undefined,
      items: [...desdeEstado, ...noAplicaOcultos],
    });
    if (result?.error) setError(result.error);
    else {
      setSuccess("Checklist completado correctamente");
      setDailyCheckDone(true);
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
                  {v.estado_actual === "FUERA_DE_SERVICIO" ? "(FDS)" : ""}
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
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Responda cada ítem de forma independiente. Si un ítem falla, descríbalo y desde ahí puede
                reportar una novedad (ej: &quot;farola delantera sin luz media&quot;).
              </p>

              {checklistFiltrado.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay ítems activos del checklist en este momento. Comuníquese con coordinación o administración
                  para que configuren el preoperacional de su centro.
                </p>
              )}

              {checklistItemsByCategoria.map(([categoria, items]) => (
                <div key={categoria} className="space-y-3">
                  <h3 className="text-sm font-semibold tracking-wide text-foreground">
                    {categoria.replaceAll("_", " ")}
                  </h3>
                  <div className="space-y-2">
                    {items.map((it) => {
                      const expectedNum = it.cantidad_esperada ? Number(it.cantidad_esperada) : NaN;
                      const isNumericQty = Number.isFinite(expectedNum) && expectedNum > 0;
                      const st = checkItemsState[it.id] || { estado: "OK" as const };

                      const showAlert = st.estado === "FALLA";

                      return (
                        <div
                          key={it.id}
                          className={cn(
                            "rounded-lg border p-3",
                            showAlert ? "border-red-300 bg-red-50/50" : "border-border bg-card"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">{it.descripcion}</p>
                              <p className="text-xs text-muted-foreground">
                                Esperado: {it.cantidad_esperada || "OK"}
                              </p>
                            </div>
                            {showAlert ? (
                              <span className="text-xs font-semibold text-red-700">ALERTA</span>
                            ) : (
                              <span className="text-xs font-semibold text-muted-foreground">—</span>
                            )}
                          </div>

                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            {isNumericQty ? (
                              <div className="space-y-2">
                                <Label className="text-xs">¿Cuántos están OK?</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={expectedNum}
                                    value={st.cantidadOk ?? expectedNum}
                                    onChange={(e) => {
                                      const v = parseInt(e.target.value || "0", 10);
                                      const clamped = Math.max(0, Math.min(expectedNum, Number.isNaN(v) ? 0 : v));
                                      const estado = clamped < expectedNum ? "FALLA" : "OK";
                                      setCheckItemsState((prev) => ({
                                        ...prev,
                                        [it.id]: { ...prev[it.id], cantidadOk: clamped, estado },
                                      }));
                                    }}
                                    className="w-28"
                                  />
                                  <span className="text-xs text-muted-foreground">de {expectedNum}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Label className="text-xs">Estado</Label>
                                <RadioGroup
                                  value={st.estado}
                                  onValueChange={(v) =>
                                    setCheckItemsState((prev) => ({
                                      ...prev,
                                      [it.id]: { ...prev[it.id], estado: v as any },
                                    }))
                                  }
                                  className="grid grid-cols-3 gap-3"
                                >
                                  {[
                                    { v: "OK", label: "OK" },
                                    { v: "FALLA", label: "Falla" },
                                    { v: "NO_APLICA", label: "N/A" },
                                  ].map((opt) => (
                                    <label key={opt.v} className="flex items-center gap-2 text-sm">
                                      <RadioGroupItem value={opt.v} />
                                      <span className="text-xs">{opt.label}</span>
                                    </label>
                                  ))}
                                </RadioGroup>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label className="text-xs">Observación</Label>
                              <Input
                                value={st.observacion ?? ""}
                                placeholder={
                                  st.estado === "FALLA"
                                    ? "Describa la falla (ej: farola sin luz media)"
                                    : "Opcional"
                                }
                                onChange={(e) =>
                                  setCheckItemsState((prev) => ({
                                    ...prev,
                                    [it.id]: { ...prev[it.id], observacion: e.target.value },
                                  }))
                                }
                              />
                            </div>
                          </div>

                          {st.estado === "FALLA" && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setIncidentFromItem({
                                    title: `Reportar novedad — ${selectedVehicle?.placa}`,
                                    desc:
                                      `${categoria.replaceAll("_", " ")}: ${it.descripcion}. ` +
                                      (st.observacion ? `Detalle: ${st.observacion}` : "Detalle: "),
                                  })
                                }
                              >
                                Reportar novedad de este ítem
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div>
                <Label htmlFor="km-inicial">Kilometraje actual</Label>
                <span className="text-destructive"> *</span>
                <Input
                  id="km-inicial"
                  type="number"
                  required
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

      <Dialog open={!!incidentFromItem} onOpenChange={() => setIncidentFromItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{incidentFromItem?.title || "Reportar novedad"}</DialogTitle>
          </DialogHeader>
          <IncidentForm
            vehicleId={vehicleId}
            afectaOperatividad={false}
            onSuccess={() => {
              setIncidentFromItem(null);
              router.refresh();
            }}
            reportadoPorDefault={userName}
            hideSeveridad
            initialDescripcion={incidentFromItem?.desc}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
