"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  operationalCenterSchema,
  type OperationalCenterFormData,
} from "@/lib/validations";
import {
  crearCentroOperaciones,
  eliminarCentroOperaciones,
} from "@/app/api/actions/centros";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Trash2 } from "lucide-react";
import type { OperationalCenter } from "@/types";

interface CentrosTabProps {
  centros: OperationalCenter[];
}

export function CentrosTab({ centros: initialCentros }: CentrosTabProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OperationalCenterFormData>({
    resolver: zodResolver(operationalCenterSchema),
  });

  const onSubmit = async (data: OperationalCenterFormData) => {
    setError(null);
    const result = await crearCentroOperaciones(data);
    if (result.error) {
      setError(result.error);
    } else {
      reset();
      setShowForm(false);
      router.refresh();
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Desea desactivar este centro de operaciones?")) return;
    startTransition(async () => {
      const result = await eliminarCentroOperaciones(id);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Centros de Operaciones</CardTitle>
            <CardDescription>
              Administre los centros a los que pueden pertenecer los vehículos
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Centro
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showForm && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-4 border rounded-lg bg-gray-50 space-y-4"
            >
              <h3 className="font-medium">Nuevo Centro de Operaciones</h3>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    {...register("codigo")}
                    className="mt-1 uppercase"
                    placeholder="Ej: BARRANQUILLA"
                  />
                  {errors.codigo && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.codigo.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    {...register("nombre")}
                    className="mt-1"
                    placeholder="Ej: CRA Barranquilla"
                  />
                  {errors.nombre && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.nombre.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Crear Centro"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowForm(false); reset(); setError(null); }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialCentros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-6">
                    No hay centros registrados
                  </TableCell>
                </TableRow>
              ) : (
                initialCentros.map((centro) => (
                  <TableRow key={centro.id}>
                    <TableCell className="font-mono text-sm">
                      {centro.codigo}
                    </TableCell>
                    <TableCell className="font-medium">{centro.nombre}</TableCell>
                    <TableCell>
                      <Badge variant={centro.activo ? "success" : "secondary"}>
                        {centro.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {centro.activo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminar(centro.id)}
                          disabled={isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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
