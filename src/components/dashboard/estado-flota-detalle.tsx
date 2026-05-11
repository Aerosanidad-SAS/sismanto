"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";

export type NovedadAbiertaResumen = {
  id: number;
  descripcion: string;
  fecha_reporte: string;
  estado: string;
};

interface EstadoFlotaDetalleProps {
  placa: string;
  ultimoMantenimientoFecha: string | null;
  novedadesAbiertas: NovedadAbiertaResumen[];
}

export function EstadoFlotaDetalle({
  placa,
  ultimoMantenimientoFecha,
  novedadesAbiertas,
}: EstadoFlotaDetalleProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Ver
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vehículo {placa}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm pt-2">
            <div>
              <p className="font-semibold text-foreground mb-1">Último mantenimiento registrado</p>
              <p className="text-muted-foreground">
                {ultimoMantenimientoFecha ? formatDateShort(ultimoMantenimientoFecha) : "Sin registros"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Novedades activas</p>
              {novedadesAbiertas.length === 0 ? (
                <p className="text-muted-foreground">Sin novedades abiertas o en proceso.</p>
              ) : (
                <ul className="space-y-2">
                  {novedadesAbiertas.map((n) => (
                    <li key={n.id} className="rounded-md border bg-muted/40 p-3">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant={n.estado === "EN_PROCESO" ? "default" : "destructive"}>
                          {n.estado}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateShort(n.fecha_reporte)}
                        </span>
                      </div>
                      <p>{n.descripcion}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
