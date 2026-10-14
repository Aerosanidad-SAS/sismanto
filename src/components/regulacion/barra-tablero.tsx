"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReportarNovedadDialog } from "@/components/novedades/reportar-novedad-dialog";
import { Button } from "@/components/ui/button";
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

      <ReportarNovedadDialog
        abierto={novedadAbierta}
        onAbiertoChange={setNovedadAbierta}
        vehiculos={vehiculos}
        reportadoPor={reportadoPor}
      />
    </div>
  );
}
