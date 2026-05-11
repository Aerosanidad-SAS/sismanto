"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { VehicleForm } from "@/components/forms/vehicle-form";
import { eliminarVehiculo } from "@/app/api/actions/vehiculos";
import { Button } from "@/components/ui/button";
import { VehicleEstadoBadge } from "@/components/vehiculos/vehicle-estado-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import type { OperationalCenter, Vehicle } from "@/types";

interface VehiculosTabProps {
  vehicles: any[];
  centros: OperationalCenter[];
}

export function VehiculosTab({ vehicles, centros }: VehiculosTabProps) {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState<"new" | string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEliminar = (id: string) => {
    if (!confirm("¿Está seguro de eliminar este vehículo?")) return;
    startTransition(async () => {
      const result = await eliminarVehiculo(id);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  const handleSuccess = () => {
    setOpenDialog(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vehículos</CardTitle>
            <CardDescription>
              Gestione el registro y perfil técnico de cada ambulancia
            </CardDescription>
          </div>
          <Dialog open={openDialog === "new"} onOpenChange={(o) => setOpenDialog(o ? "new" : null)}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Vehículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Vehículo</DialogTitle>
              </DialogHeader>
              <VehicleForm
                centros={centros}
                onSuccess={handleSuccess}
                onCancel={() => setOpenDialog(null)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Marca / Modelo</TableHead>
                <TableHead>Línea</TableHead>
                <TableHead>Centro</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Venc. SOAT</TableHead>
                <TableHead>Venc. Técnico-Mec.</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-6">
                    No hay vehículos registrados. Cree el primero.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-bold">{v.placa}</TableCell>
                    <TableCell>
                      {[v.marca, v.modelo].filter(Boolean).join(" ") || "—"}
                    </TableCell>
                    <TableCell>{v.linea || "—"}</TableCell>
                    <TableCell>
                      {v.operational_centers?.nombre || v.centro_operativo || "—"}
                    </TableCell>
                    <TableCell>
                      <VehicleEstadoBadge
                        vehicleId={v.id}
                        estado={v.estado_actual}
                        puedeEditar
                        etiqueta={v.estado_actual === "OPERATIVO" ? "Operativo" : "Fuera de Serv."}
                      />
                    </TableCell>
                    <TableCell className="text-sm">
                      {v.vencimiento_soat ? formatDateShort(v.vencimiento_soat) : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {v.vencimiento_tecnicomecanica
                        ? formatDateShort(v.vencimiento_tecnicomecanica)
                        : v.vencimiento_rtm
                        ? formatDateShort(v.vencimiento_rtm)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {/* Editar */}
                      <Dialog
                        open={openDialog === v.id}
                        onOpenChange={(o) => setOpenDialog(o ? v.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Editar Vehículo {v.placa}</DialogTitle>
                          </DialogHeader>
                          <VehicleForm
                            centros={centros}
                            vehicle={v}
                            onSuccess={handleSuccess}
                            onCancel={() => setOpenDialog(null)}
                          />
                        </DialogContent>
                      </Dialog>
                      {/* Eliminar */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEliminar(v.id)}
                        disabled={isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
