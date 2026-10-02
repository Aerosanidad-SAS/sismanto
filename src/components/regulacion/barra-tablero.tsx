"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IncidentForm } from "@/components/dashboard/incident-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { AlertTriangle, RefreshCw } from "lucide-react";

const INTERVALO_REFRESCO_MS = 30_000;

interface BarraTableroProps {
  vehiculos: { id: string; placa: string }[];
  reportadoPor: string;
}

/**
 * Barra del tablero de Regulación: refresco automático cada 30 s (el estado
 * de los servicios lo mueve la tripulación desde sus teléfonos) y reporte de
 * novedades de cualquier vehículo del centro.
 */
export function BarraTablero({ vehiculos, reportadoPor }: BarraTableroProps) {
  const router = useRouter();
  const [ultima, setUltima] = useState<Date | null>(null);
  const [novedadAbierta, setNovedadAbierta] = useState(false);
  const [vehiculoId, setVehiculoId] = useState("");

  useEffect(() => {
    // Al montar, los datos ya vienen frescos del servidor: se muestra esa hora desde el primer momento
    // (en el cliente, para no desajustar la hidratación).
    setUltima(new Date());
    // Sin dependencias: se monta una vez y refresca los datos del servidor.
    const refrescarSiVisible = () => {
      // Una pestaña oculta no necesita refrescar: se pone al día al volver a verla.
      if (document.hidden) return;
      router.refresh();
      setUltima(new Date());
    };
    const id = setInterval(refrescarSiVisible, INTERVALO_REFRESCO_MS);
    const alVolver = () => {
      if (!document.hidden) refrescarSiVisible();
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [router]);

  const refrescarAhora = () => {
    router.refresh();
    setUltima(new Date());
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-xs text-muted-foreground" title="Se actualiza cada 30 segundos">
        {ultima
          ? `Actualizado ${ultima.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "America/Bogota" })}`
          : "Actualizando…"}
      </p>
      <Button variant="outline" size="sm" onClick={refrescarAhora}>
        <RefreshCw className="mr-1 h-4 w-4" />
        Actualizar
      </Button>
      <Button variant="secondary" size="sm" onClick={() => setNovedadAbierta(true)}>
        <AlertTriangle className="mr-1 h-4 w-4" />
        Reportar novedad
      </Button>

      <Dialog open={novedadAbierta} onOpenChange={setNovedadAbierta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar novedad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Vehículo *</Label>
              <Select value={vehiculoId} onValueChange={setVehiculoId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona la placa" />
                </SelectTrigger>
                <SelectContent>
                  {vehiculos.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.placa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {vehiculoId && (
              <IncidentForm
                vehicleId={vehiculoId}
                afectaOperatividad={false}
                reportadoPorDefault={reportadoPor}
                onSuccess={() => {
                  setNovedadAbierta(false);
                  setVehiculoId("");
                  router.refresh();
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
