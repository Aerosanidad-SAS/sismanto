"use client";

import { Fragment, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { coincideVehiculo } from "@/lib/vehiculos-busqueda";
import { formatDateShort } from "@/lib/utils";
import { VehicleKilometrajeForm } from "@/components/vehiculos/vehicle-kilometraje-form";
import type { Vehicle } from "@/types";
import { VehicleEstadoBadge } from "@/components/vehiculos/vehicle-estado-badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function VehiculosTablaExpandible({
  vehicles: todos,
  puedeEditarEstado = false,
}: {
  vehicles: Vehicle[];
  /** ADMIN, REGULACION o MANTENIMIENTO: el badge de estado es clicable. */
  puedeEditarEstado?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const vehicles = useMemo(() => todos.filter((v) => coincideVehiculo(v, busqueda)), [todos, busqueda]);
  const toggle = (id: string) => setOpenId((x) => (x === id ? null : id));

  const renderDetail = (vehicle: Vehicle) => (
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
  );

  return (
    <>
      <div className="mb-4 space-y-1">
        <Input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por placa, tipo, marca, modelo o ciudad…"
          aria-label="Buscar vehículos"
          className="sm:max-w-sm"
        />
        <p className="text-sm text-muted-foreground" role="status">
          {vehicles.length} de {todos.length} vehículos
        </p>
      </div>

      {vehicles.length === 0 && (
        <p className="rounded-md border p-4 text-center text-sm text-muted-foreground">Ningún vehículo coincide con la búsqueda.</p>
      )}

      {/* Móvil: lista de tarjetas con los datos clave y las acciones a la vista */}
      <ul className="space-y-3 md:hidden">
        {vehicles.map((vehicle) => {
          const abierto = openId === vehicle.id;
          const detailId = `vehiculo-detalle-movil-${vehicle.id}`;
          return (
            <li key={vehicle.id} className="rounded-lg border bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{vehicle.placa}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {[vehicle.modelo, vehicle.linea].filter(Boolean).join(" · ") || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">{vehicle.centro_operativo}</p>
                </div>
                <VehicleEstadoBadge
                  vehicleId={vehicle.id}
                  estado={vehicle.estado_actual}
                  puedeEditar={puedeEditarEstado}
                />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">SOAT</dt>
                  <dd>{vehicle.vencimiento_soat ? formatDateShort(vehicle.vencimiento_soat) : "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Tecnomecánica</dt>
                  <dd>
                    {vehicle.vencimiento_tecnicomecanica
                      ? formatDateShort(vehicle.vencimiento_tecnicomecanica)
                      : "N/A"}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="min-h-11 flex-1">
                  <Link href={`/vehiculos/${vehicle.id}`}>Ver ficha</Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 flex-1"
                  aria-expanded={abierto}
                  aria-controls={detailId}
                  onClick={() => toggle(vehicle.id)}
                >
                  {abierto ? "Ocultar kilometraje" : "Registrar kilometraje"}
                </Button>
              </div>
              {abierto && (
                <div id={detailId} className="mt-3 rounded-md bg-muted/20 p-3">
                  {renderDetail(vehicle)}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <span className="sr-only">Detalle</span>
              </TableHead>
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
                    onClick={() => toggle(vehicle.id)}
                  >
                    <TableCell className="py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        aria-expanded={abierto}
                        aria-controls={`vehiculo-detalle-${vehicle.id}`}
                        aria-label={`${abierto ? "Ocultar" : "Ver"} detalle de ${vehicle.placa}`}
                        onClick={(e) => {
                          e.stopPropagation(); // la fila también alterna; evita doble toggle
                          toggle(vehicle.id);
                        }}
                      >
                        {abierto ? <ChevronDown className="h-4 w-4" aria-hidden="true" /> : <ChevronRight className="h-4 w-4" aria-hidden="true" />}
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
                    <TableRow id={`vehiculo-detalle-${vehicle.id}`} className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={9} className="p-4">
                        {renderDetail(vehicle)}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
