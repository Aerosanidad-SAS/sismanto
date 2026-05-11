"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateShort } from "@/lib/utils";
import { VehicleKilometrajeForm } from "@/components/vehiculos/vehicle-kilometraje-form";
import type { Vehicle } from "@/types";
import { VehicleEstadoBadge } from "@/components/vehiculos/vehicle-estado-badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function VehiculosTablaExpandible({
  vehicles,
  puedeEditarEstado = false,
}: {
  vehicles: Vehicle[];
  /** ADMIN, REGULACION o MANTENIMIENTO: el badge de estado es clicable. */
  puedeEditarEstado?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>Placa</TableHead>
          <TableHead>Modelo</TableHead>
          <TableHead>Línea</TableHead>
          <TableHead>Centro Operativo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Vencimiento SOAT</TableHead>
          <TableHead>Vencimiento Tec.</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => {
          const abierto = openId === vehicle.id;
          return (
            <Fragment key={vehicle.id}>
              <TableRow
                className={cn("cursor-pointer hover:bg-muted/50", abierto && "bg-muted/30")}
                onClick={() => setOpenId((x) => (x === vehicle.id ? null : vehicle.id))}
              >
                <TableCell className="py-2">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 pointer-events-none">
                    {abierto ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{vehicle.placa}</TableCell>
                <TableCell>{vehicle.modelo || "N/A"}</TableCell>
                <TableCell>{vehicle.linea || "N/A"}</TableCell>
                <TableCell>{vehicle.centro_operativo}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <VehicleEstadoBadge
                    vehicleId={vehicle.id}
                    estado={vehicle.estado_actual}
                    puedeEditar={puedeEditarEstado}
                  />
                </TableCell>
                <TableCell>
                  {vehicle.vencimiento_soat ? formatDateShort(vehicle.vencimiento_soat) : "N/A"}
                </TableCell>
                <TableCell>
                  {vehicle.vencimiento_tecnicomecanica
                    ? formatDateShort(vehicle.vencimiento_tecnicomecanica)
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/vehiculos/${vehicle.id}`}
                    className="text-primary hover:underline text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver ficha
                  </Link>
                </TableCell>
              </TableRow>
              {abierto && (
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableCell colSpan={9} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium text-foreground">Placa:</span> {vehicle.placa}
                        </p>
                        {vehicle.marca ? (
                          <p>
                            <span className="font-medium text-foreground">Marca:</span> {vehicle.marca}
                          </p>
                        ) : null}
                        <p>Registro de KM y fecha requeridos en cada actualización.</p>
                      </div>
                      <VehicleKilometrajeForm vehicleId={vehicle.id} placa={vehicle.placa} />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
