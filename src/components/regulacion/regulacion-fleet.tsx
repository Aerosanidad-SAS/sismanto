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
import { HelpTrigger } from "@/components/ui/help-trigger";
import { VehicleEstadoBadge } from "@/components/vehiculos/vehicle-estado-badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface RegulacionFleetProps {
  fleet: any[];
  ovemUsers: { user_id: string; nombre_completo: string | null; email: string | null }[];
}

function VehicleTile({
  v,
  tone,
  onToggle,
  onAssignClick,
  requestUnassign,
  loading,
}: {
  v: any;
  tone: "available" | "fds";
  onToggle: (id: string, estado: string) => void;
  onAssignClick: (id: string) => void;
  requestUnassign: (assignmentId: number) => void;
  loading: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border p-2.5 text-xs shadow-sm min-h-[7.5rem]",
        tone === "available" ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
      )}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0">
          <div className="truncate font-bold tracking-tight">{v.placa}</div>
          <div className="truncate text-[11px] text-muted-foreground">{v.marca || v.modelo || "—"}</div>
        </div>
        <VehicleEstadoBadge
          vehicleId={v.id}
          estado={v.estado_actual}
          puedeEditar={false}
          etiqueta={v.estado_actual === "OPERATIVO" ? "OPERATIVO" : "FDS"}
          className="shrink-0 text-[10px] px-1.5 py-0 pointer-events-none"
        />
      </div>
      <div className="mt-1.5 min-h-[2.25rem] flex-1 text-[11px] text-muted-foreground">
        {v.assignments?.length > 0 ? (
          <div className="space-y-0.5">
            {v.assignments.map((a: any) => (
              <div key={a.id} className="flex items-center gap-1">
                <span className="min-w-0 truncate">{a.driver?.nombre_completo || a.driver?.email || "—"}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 shrink-0 p-0 text-red-600"
                  onClick={() => requestUnassign(a.id)}
                  disabled={loading}
                  aria-label="Desasignar OVEM"
                  title="Quitar asignación de conductor"
                >
                  <UserMinus className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <span className="italic">Sin OVEM asignado</span>
        )}
      </div>
      <div className="mt-auto flex flex-wrap gap-1 pt-1.5">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 flex-1 min-w-[6.5rem] text-[10px] px-1",
            v.estado_actual === "OPERATIVO"
              ? "border-orange-300 text-orange-800 hover:bg-orange-50"
              : "border-green-600 text-green-800 hover:bg-green-50"
          )}
          onClick={() => onToggle(v.id, v.estado_actual)}
          disabled={loading}
          title={v.estado_actual === "OPERATIVO" ? "Clic para marcar FDS" : "Clic para marcar OPERATIVO"}
        >
          {v.estado_actual === "OPERATIVO" ? "OPERATIVO" : "FDS"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 px-2 text-[10px]"
          onClick={() => onAssignClick(v.id)}
          disabled={loading}
          title="Asignar o cambiar conductor OVEM"
        >
          <UserPlus className="mr-0.5 h-3 w-3" />
          OVEM
        </Button>
      </div>
    </div>
  );
}

export function RegulacionFleet({ fleet, ovemUsers }: RegulacionFleetProps) {
  const router = useRouter();
  const [assigningVehicle, setAssigningVehicle] = useState<string | null>(null);
  const [selectedOvem, setSelectedOvem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unassignAssignmentId, setUnassignAssignmentId] = useState<number | null>(null);
  const hoy = new Date().toISOString().split("T")[0];

  const openUnassignDialog = (assignmentId: number) => {
    setUnassignAssignmentId(assignmentId);
  };

  const disponibles = fleet.filter((v) => v.estado_actual === "OPERATIVO");
  const fueraServicio = fleet.filter((v) => v.estado_actual === "FUERA_DE_SERVICIO");

  const conOvemHoy = disponibles.filter((v) => Array.isArray(v.assignments) && v.assignments.length > 0);
  const sinOvem = disponibles.filter((v) => !v.assignments || v.assignments.length === 0);

  const placasFds = fueraServicio
    .map((v) => String(v.placa || "").trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

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

  const confirmUnassign = async () => {
    const id = unassignAssignmentId;
    if (id == null) return;
    setLoading(true);
    setError(null);
    const result = await unassignVehicle(id);
    setUnassignAssignmentId(null);
    if (result?.error) setError(result.error);
    else router.refresh();
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4">
            <div className="space-y-0.5">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
                Disponibles
                <HelpTrigger text="Vehículos en estado operativo (listos para despacho). Se desglosan abajo entre los que tienen OVEM asignado hoy y los que no." />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 tabular-nums">{disponibles.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">Unidades operativas en inventario</p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4">
            <div className="min-w-0 space-y-0.5">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <XCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
                Fuera de servicio
                <HelpTrigger text="Vehículos marcados como no disponibles para despacho (mantenimiento, falla u otra causa). Las placas listadas corresponden al estado actual." />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-red-600 tabular-nums">{fueraServicio.length}</div>
            {placasFds.length > 0 ? (
              <div className="max-h-28 overflow-y-auto rounded-md border border-red-200/60 bg-red-50/40 px-2 py-1.5">
                <p className="mb-1 text-[10px] font-medium uppercase text-muted-foreground">Placas</p>
                <div className="flex flex-wrap gap-1">
                  {placasFds.map((p) => (
                    <Badge key={p} variant="destructive" className="font-mono text-[10px]">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Ninguna unidad en FDS.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg uppercase tracking-wide">
                Flota
                <HelpTrigger text="Vista operativa: a la izquierda, disponibles separados por si tienen conductor OVEM asignado hoy (en operación) o no (disponibles pero sin despacho). A la derecha, unidades fuera de servicio en tarjetas compactas." />
              </CardTitle>
              <CardDescription className="mt-1 max-w-3xl text-xs leading-relaxed">
                Izquierda: disponibles en dos bloques (con OVEM hoy / sin OVEM). Derecha: fuera de servicio. Use el botón de estado en cada tarjeta para
                operativo / FDS y el botón OVEM para asignación.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="space-y-5 min-w-0">
              <section>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Con OVEM (en operación hoy)</h3>
                  <HelpTrigger text="Vehículos disponibles con asignación activa cuya vigencia incluye la fecha de hoy: suelen estar en servicio o listos según regulación." />
                  <Badge variant="secondary" className="text-[10px]">
                    {conOvemHoy.length}
                  </Badge>
                </div>
                {conOvemHoy.length === 0 ? (
                  <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No hay disponibles con OVEM asignado en este momento.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {conOvemHoy.map((v: any) => (
                      <VehicleTile
                        key={v.id}
                        v={v}
                        tone="available"
                        onToggle={handleToggle}
                        onAssignClick={setAssigningVehicle}
                        requestUnassign={openUnassignDialog}
                        loading={loading}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Disponibles sin OVEM</h3>
                  <HelpTrigger text="Operativos en sistema pero sin conductor asignado para hoy: no salen a trabajar con OVEM hasta que se asigne uno desde esta pantalla." />
                  <Badge variant="outline" className="text-[10px]">
                    {sinOvem.length}
                  </Badge>
                </div>
                {sinOvem.length === 0 ? (
                  <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    Todos los disponibles tienen OVEM asignado, o no hay disponibles.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {sinOvem.map((v: any) => (
                      <VehicleTile
                        key={v.id}
                        v={v}
                        tone="available"
                        onToggle={handleToggle}
                        onAssignClick={setAssigningVehicle}
                        requestUnassign={openUnassignDialog}
                        loading={loading}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Fuera de servicio</h3>
                <HelpTrigger text="Unidades no disponibles para despacho. Puede devolverlas a disponible con el botón correspondiente si corresponde." />
                <Badge variant="destructive" className="text-[10px]">
                  {fueraServicio.length}
                </Badge>
              </div>
              {fueraServicio.length === 0 ? (
                <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No hay vehículos fuera de servicio.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {fueraServicio.map((v: any) => (
                    <VehicleTile
                      key={v.id}
                      v={v}
                      tone="fds"
                      onToggle={handleToggle}
                      onAssignClick={setAssigningVehicle}
                      requestUnassign={openUnassignDialog}
                      loading={loading}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={unassignAssignmentId != null} onOpenChange={(o) => !o && setUnassignAssignmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desasignar conductor?</AlertDialogTitle>
            <AlertDialogDescription>
              El conductor dejará de estar asignado a esta unidad para la vigencia actual. Puede asignar otro OVEM después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={loading}
              onClick={() => void confirmUnassign()}
            >
              {loading ? "Procesando…" : "Desasignar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!assigningVehicle} onOpenChange={() => setAssigningVehicle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar conductor (OVEM)</DialogTitle>
            <p className="text-sm text-muted-foreground">Seleccione el conductor para el vehículo</p>
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
