"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getAlertasDocumentosVehiculos } from "@/app/api/actions/alertas-vehiculos";
import { contarQuePidenAtencion, type AlertaVehiculo, type NivelAlerta } from "@/lib/alertas-vehiculos";

const REFRESCO_MS = 10 * 60_000;

const VARIANTE: Record<NivelAlerta, "destructive" | "warning" | "success"> = {
  ROJO: "destructive",
  AMARILLO: "warning",
  VERDE: "success",
};

function textoPlazo(documento: string, dias: number): string {
  if (dias < 0) return `${documento} vencido hace ${Math.abs(dias)} d`;
  if (dias === 0) return `${documento} vence hoy`;
  return `${documento} ${dias} d`;
}

/**
 * «🔔 Alertas» de SISRES: vehículos con documentos vencidos o por vencer, con semáforo. El número es el de vehículos que
 * piden atención (amarillo o rojo); los verdes se ven al abrirla. Para los roles sin acceso a la flota no se pinta.
 */
export function CampanaAlertas({ colapsado, onNavegar }: { colapsado: boolean; onNavegar?: () => void }) {
  const [visible, setVisible] = useState(false);
  const [verVehiculos, setVerVehiculos] = useState(false);
  const [alertas, setAlertas] = useState<AlertaVehiculo[]>([]);

  useEffect(() => {
    let vivo = true;
    const cargar = () =>
      getAlertasDocumentosVehiculos()
        .then((r) => {
          if (!vivo || r.error) return;
          setVisible(r.visible);
          setVerVehiculos(r.verVehiculos);
          setAlertas(r.alertas);
        })
        .catch(() => {
          /* sin red o sesión vencida: se deja lo último que se vio */
        });
    cargar();
    const t = setInterval(cargar, REFRESCO_MS);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, []);

  if (!visible) return null;

  const pendientes = contarQuePidenAtencion(alertas);
  const hayRojo = alertas.some((a) => a.nivel === "ROJO");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={colapsado ? `Alertas de documentos de vehículos: ${pendientes}` : "Documentos de los vehículos por vencer"}
          className={cn(
            "flex w-full items-center rounded-lg text-sm font-medium text-foreground transition-colors hover:bg-muted active:bg-muted min-h-[44px] lg:min-h-auto touch-manipulation",
            colapsado ? "lg:justify-center lg:px-2 lg:py-3" : "px-4 py-3.5 lg:py-2"
          )}
        >
          <span className="relative">
            <Bell className={cn("h-5 w-5 shrink-0", !colapsado && "mr-3")} aria-hidden />
            {colapsado && pendientes > 0 && (
              <span
                aria-hidden
                className={cn("absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full", hayRojo ? "bg-destructive" : "bg-warning")}
              />
            )}
          </span>
          <span className={cn(colapsado && "lg:sr-only")}>Alertas</span>
          {pendientes > 0 && (
            <Badge variant={hayRojo ? "destructive" : "warning"} className={cn("ml-auto", colapsado && "lg:sr-only")}>
              {pendientes}
              <span className="sr-only"> vehículos con documentos por vencer</span>
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="max-h-[70vh] w-80 overflow-y-auto p-0">
        <div className="space-y-1 border-b p-3">
          <p className="text-sm font-semibold">Documentos de los vehículos</p>
          <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Badge variant="success">Verde</Badge> más de 30 d <Badge variant="warning">Amarillo</Badge> 16–30 d
            <Badge variant="destructive">Rojo</Badge> 15 d o vencido
          </p>
        </div>
        {alertas.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">Sin alertas activas.</p>
        ) : (
          <ul className="divide-y">
            {alertas.map((a) => (
              <li key={a.placa} className="space-y-1 px-3 py-2">
                <p className="text-sm font-semibold uppercase">{a.placa}</p>
                <div className="flex flex-wrap gap-1">
                  {a.docs.map((d) => (
                    <Badge key={d.documento} variant={VARIANTE[d.nivel]}>
                      {textoPlazo(d.documento, d.dias)}
                    </Badge>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
        {verVehiculos && (
          <div className="border-t p-2 text-center">
            <Link href="/vehiculos" className="text-sm underline" onClick={onNavegar}>
              Ver todos los vehículos
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
