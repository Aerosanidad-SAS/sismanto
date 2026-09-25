"use client";

import { formatoDia, hoyBogota, normalizarDia, sumarDias } from "@/lib/fechas";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registrarCumplimiento } from "@/app/api/actions/plan-mantenimiento";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DateField } from "@/components/forms/date-field";
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { MaintenanceAlert, AlertLevel } from "@/types";

interface Props {
  vehicleId: string;
  placa: string;
  alerts: MaintenanceAlert[];
  canLog: boolean;
}

function nivelColor(nivel: AlertLevel) {
  if (nivel === "ROJA")    return "bg-red-50 border-red-200";
  if (nivel === "NARANJA") return "bg-amber-50 border-amber-200";
  return "bg-green-50 border-green-200";
}

function nivelBadgeVariant(nivel: AlertLevel): "destructive" | "warning" | "success" | "outline" {
  if (nivel === "ROJA")    return "destructive";
  if (nivel === "NARANJA") return "warning";
  return "success";
}

function AlertRow({
  alert,
  canLog,
  vehicleId,
}: {
  alert: MaintenanceAlert;
  canLog: boolean;
  vehicleId: string;
}) {
  const router = useRouter();
  const [open, setOpen]           = useState(false);
  const [isPending, startTransition] = useTransition();
  const [km, setKm]               = useState("");
  const [fecha, setFecha]         = useState(hoyBogota());
  const [notas, setNotas]         = useState("");
  const [err, setErr]             = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    startTransition(async () => {
      const res = await registrarCumplimiento({
        vehicle_id: vehicleId,
        plan_item_id: alert.plan_item_id,
        fecha_realizado: fecha,
        km_realizado: km ? parseInt(km, 10) : null,
        notas: notas || null,
      });
      if (res.error) {
        setErr(res.error);
      } else {
        setOpen(false);
        setKm("");
        setNotas("");
        router.refresh();
      }
    });
  };

  const proximo = alert.intervalo_km > 0
    ? `Próximo a ${alert.km_ultimo != null ? (alert.km_ultimo + alert.intervalo_km).toLocaleString() : "—"} km`
    : `Próximo el ${alert.ultimo_mantenimiento
        ? formatoDia(sumarDias(normalizarDia(alert.ultimo_mantenimiento), alert.intervalo_dias))
        : "—"}`;

  const restante = alert.intervalo_km > 0
    ? alert.km_restantes != null
      ? `${alert.km_restantes.toLocaleString()} km restantes`
      : "—"
    : alert.dias_restantes != null
      ? alert.dias_restantes >= 0
        ? `${alert.dias_restantes} días restantes`
        : `Vencido hace ${Math.abs(alert.dias_restantes)} días`
      : "—";

  return (
    <div className={`rounded-lg border p-3 ${nivelColor(alert.nivel_alerta)}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={nivelBadgeVariant(alert.nivel_alerta)} className="text-xs">
              {alert.nivel_alerta}
            </Badge>
            <Badge variant="outline" className="text-xs">{alert.categoria}</Badge>
            <span className="text-sm font-medium truncate">{alert.descripcion}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {proximo} &nbsp;·&nbsp; {restante}
          </p>
        </div>
        {canLog && (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={() => setOpen(!open)}
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="ml-1 text-xs">Registrar</span>
          </Button>
        )}
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 border-t pt-3 space-y-3">
          {err && <p className="text-xs text-red-600">{err}</p>}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs">Fecha realizado</Label>
              <DateField value={fecha} onChange={setFecha} />
            </div>
            {alert.intervalo_km > 0 && (
              <div>
                <Label className="text-xs">Kilometraje al realizar</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="ej. 45000"
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              </div>
            )}
            <div>
              <Label className="text-xs">Notas</Label>
              <Input
                placeholder="Opcional"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {isPending ? "Guardando…" : "Confirmar"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function VehicleMaintenanceAlertsPanel({ vehicleId, placa, alerts, canLog }: Props) {
  const [mostrarOk, setMostrarOk] = useState(false);

  const activas  = alerts.filter((a) => a.nivel_alerta !== "OK");
  const okAlerts = alerts.filter((a) => a.nivel_alerta === "OK");

  if (alerts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Plan de Mantenimiento Preventivo
        </CardTitle>
        <CardDescription>
          Alertas basadas en km recorridos o tiempo desde el último servicio registrado.
          {canLog && " Haz clic en «Registrar» para registrar la realización."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {activas.length === 0 ? (
          <p className="text-sm text-green-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Todo el plan está al día.
          </p>
        ) : (
          activas.map((a) => (
            <AlertRow
              key={a.plan_item_id}
              alert={a}
              canLog={canLog}
              vehicleId={vehicleId}
            />
          ))
        )}

        {okAlerts.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => setMostrarOk(!mostrarOk)}
            >
              {mostrarOk
                ? "Ocultar servicios al día"
                : `Ver ${okAlerts.length} servicios al día`}
            </button>
            {mostrarOk && (
              <div className="mt-2 space-y-2">
                {okAlerts.map((a) => (
                  <AlertRow
                    key={a.plan_item_id}
                    alert={a}
                    canLog={canLog}
                    vehicleId={vehicleId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
