"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleVehicleStatus } from "@/app/api/actions/regulacion";
import type { VehicleStatus } from "@/types";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface VehicleEstadoBadgeProps {
  vehicleId: string;
  estado: VehicleStatus;
  /** Si es false, se muestra solo la píldora de estado, sin acción. */
  puedeEditar: boolean;
  /** Texto mostrado en la píldora (por defecto el código de estado en BD). */
  etiqueta?: string;
  className?: string;
}

/**
 * Píldora de estado del vehículo. Cuando se puede editar, el estado (píldora) y la acción
 * (botón «Marcar fuera de servicio» / «Marcar operativo») van separados: antes la píldora
 * mostraba el estado actual pero al pulsarla ejecutaba la acción contraria.
 * Pasar a fuera de servicio pide confirmación; el resultado se avisa con «Deshacer».
 */
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
  const [confirmar, setConfirmar] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; previo: VehicleStatus } | null>(null);

  const operativo = estado === "OPERATIVO";
  const variant = operativo ? "success" : "destructive";
  const textoEstado = operativo ? "OPERATIVO" : "FDS";
  const texto = etiqueta ?? textoEstado;

  // El aviso con «Deshacer» se retira solo.
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 10_000);
    return () => clearTimeout(t);
  }, [aviso]);

  const cambiarA = async (nuevo: VehicleStatus, conDeshacer: boolean) => {
    if (!puedeEditar || pending) return;
    setErr(null);
    setAviso(null);
    const res = await toggleVehicleStatus(vehicleId, nuevo);
    if ("error" in res && res.error) {
      setErr(res.error);
      return;
    }
    if (conDeshacer) {
      setAviso({
        texto: nuevo === "OPERATIVO" ? "Vehículo marcado operativo." : "Vehículo marcado fuera de servicio.",
        previo: estado,
      });
    }
    startTransition(() => router.refresh());
  };

  const pill = (
    <span className={cn(badgeVariants({ variant }), className)} title={texto}>
      {texto}
    </span>
  );

  if (!puedeEditar) return pill;

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <span className="inline-flex flex-wrap items-center gap-2">
        {pill}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (operativo) setConfirmar(true);
            else void cambiarA("OPERATIVO", true);
          }}
        >
          {pending ? "Guardando…" : operativo ? "Marcar fuera de servicio" : "Marcar operativo"}
        </Button>
      </span>
      {aviso ? (
        <span role="status" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {aviso.texto}
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-9 px-1"
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void cambiarA(aviso.previo, false);
            }}
          >
            Deshacer
          </Button>
        </span>
      ) : null}
      {err ? (
        <span className="max-w-[16rem] text-xs leading-tight text-destructive" role="alert">
          {err}
        </span>
      ) : null}

      <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Marcar el vehículo fuera de servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Deja de estar disponible para despacho. Podrás devolverlo a operativo con «Marcar operativo» o con «Deshacer» en el aviso que aparece después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setConfirmar(false);
                void cambiarA("FUERA_DE_SERVICIO", true);
              }}
            >
              Marcar fuera de servicio
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </span>
  );
}
