"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleVehicleStatus } from "@/app/api/actions/regulacion";
import type { VehicleStatus } from "@/types";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VehicleEstadoBadgeProps {
  vehicleId: string;
  estado: VehicleStatus;
  /** Si es false, se muestra el mismo aspecto pero sin interacción. */
  puedeEditar: boolean;
  /** Texto mostrado (por defecto el código de estado en BD). */
  etiqueta?: string;
  className?: string;
}

export function VehicleEstadoBadge({
  vehicleId,
  estado,
  puedeEditar,
  etiqueta,
  className,
}: VehicleEstadoBadgeProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const variant = estado === "OPERATIVO" ? "success" : "destructive";
  const textoEstado = estado === "OPERATIVO" ? "OPERATIVO" : "FDS";
  const texto = etiqueta ?? textoEstado;

  const ejecutarToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!puedeEditar || pending) return;
    setErr(null);
    const nuevo: VehicleStatus = estado === "OPERATIVO" ? "FUERA_DE_SERVICIO" : "OPERATIVO";
    void (async () => {
      const res = await toggleVehicleStatus(vehicleId, nuevo);
      if ("error" in res && res.error) {
        setErr(res.error);
        return;
      }
      startTransition(() => router.refresh());
    })();
  };

  if (!puedeEditar) {
    return (
      <span className={cn(badgeVariants({ variant }), className)} title={texto}>
        {texto}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <button
        type="button"
        disabled={pending}
        onClick={ejecutarToggle}
        title={
          estado === "OPERATIVO"
            ? "Clic para marcar FDS"
            : "Clic para marcar OPERATIVO"
        }
        className={cn(
          badgeVariants({ variant }),
          "cursor-pointer border-0 ring-offset-background transition-opacity hover:opacity-90 disabled:opacity-60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
      >
        {pending ? "…" : texto}
      </button>
      {err ? (
        <span className="max-w-[12rem] text-[10px] leading-tight text-destructive" role="alert">
          {err}
        </span>
      ) : null}
    </span>
  );
}
