"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateShort } from "@/lib/utils";
import { VehicleEstadoBadge } from "@/components/vehiculos/vehicle-estado-badge";
import { EstadoFlotaDetalle, type NovedadAbiertaResumen } from "@/components/dashboard/estado-flota-detalle";
import { AssignOvemButton } from "@/components/dashboard/assign-ovem-button";
import { VehicleStatusCard } from "@/components/dashboard/vehicle-status-card";
import type { Vehicle } from "@/types";

const PAGE_SIZE = 15;

interface EstadoFlotaTablaPaginadaProps {
  vehicles: Vehicle[];
  ultimoMantenimientoPorVehicleId: Record<string, string>;
  novedadesAbiertasPorVehicleId: Record<string, NovedadAbiertaResumen[]>;
  canAssignOvem: boolean;
  ovemUsers: { user_id: string; nombre_completo: string | null; email: string | null }[];
  vehicleAssignmentMap: Record<string, { id: number; ovemName: string }>;
  puedeToggleEstadoEnTabla: boolean;
  isReadOnly: boolean;
}

export function EstadoFlotaTablaPaginada({
  vehicles,
  ultimoMantenimientoPorVehicleId,
  novedadesAbiertasPorVehicleId,
  canAssignOvem,
  ovemUsers,
  vehicleAssignmentMap,
  puedeToggleEstadoEnTabla,
  isReadOnly,
}: EstadoFlotaTablaPaginadaProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(vehicles.length / PAGE_SIZE));
  const pagedVehicles = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return vehicles.slice(start, start + PAGE_SIZE);
  }, [page, vehicles]);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border border-border/60">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Centro Operativo</TableHead>
              <TableHead>Último Mantenimiento</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedVehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.placa}</TableCell>
                <TableCell>
                  <VehicleEstadoBadge
                    vehicleId={vehicle.id}
                    estado={vehicle.estado_actual}
                    puedeEditar={puedeToggleEstadoEnTabla}
                  />
                </TableCell>
                <TableCell>{vehicle.centro_operativo}</TableCell>
                <TableCell>
                  {ultimoMantenimientoPorVehicleId[vehicle.id]
                    ? formatDateShort(ultimoMantenimientoPorVehicleId[vehicle.id])
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex flex-wrap justify-end gap-2">
                    <EstadoFlotaDetalle
                      placa={vehicle.placa}
                      ultimoMantenimientoFecha={ultimoMantenimientoPorVehicleId[vehicle.id] ?? null}
                      novedadesAbiertas={novedadesAbiertasPorVehicleId[vehicle.id] ?? []}
                    />
                    {canAssignOvem && (
                      <AssignOvemButton
                        vehicleId={vehicle.id}
                        vehiclePlaca={vehicle.placa}
                        ovemUsers={ovemUsers}
                        currentAssignment={vehicleAssignmentMap[vehicle.id] ?? null}
                      />
                    )}
                    <VehicleStatusCard vehicle={vehicle} readOnly={isReadOnly} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Página {page} de {totalPages} ({vehicles.length} vehículos)
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
