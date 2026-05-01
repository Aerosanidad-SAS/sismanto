"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierSchema, type SupplierFormData } from "@/lib/validations";
import {
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} from "@/app/api/actions/proveedores";
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
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import type { Supplier } from "@/types";

interface ProveedoresTabProps {
  proveedores: Supplier[];
}

export function ProveedoresTab({ proveedores: initialProveedores }: ProveedoresTabProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  });

  const onSubmit = async (data: SupplierFormData) => {
    setError(null);
    let result;
    if (editingId !== null) {
      result = await actualizarProveedor(editingId, data);
    } else {
      result = await crearProveedor(data);
    }
    if (result.error) {
      setError(result.error);
    } else {
      reset();
      setShowForm(false);
      setEditingId(null);
      router.refresh();
    }
  };

  const startEdit = (proveedor: Supplier) => {
    setEditingId(proveedor.id);
    setValue("nombre", proveedor.nombre);
    setValue("nit", proveedor.nit || "");
    setValue("contacto", proveedor.contacto || "");
    setShowForm(true);
    setError(null);
  };

  const handleEliminar = (id: number) => {
    if (!confirm("¿Desea desactivar este proveedor?")) return;
    startTransition(async () => {
      const result = await eliminarProveedor(id);
      if (result.error) alert(result.error);
      else router.refresh();
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Proveedores</CardTitle>
            <CardDescription>
              Empresas y talleres que prestan servicios de mantenimiento
            </CardDescription>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); reset(); }} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showForm && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-4 border rounded-lg bg-gray-50 space-y-4"
            >
              <h3 className="font-medium">
                {editingId !== null ? "Editar Proveedor" : "Nuevo Proveedor"}
              </h3>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="prov-nombre">Nombre *</Label>
                  <Input
                    id="prov-nombre"
                    {...register("nombre")}
                    className="mt-1"
                    placeholder="Nombre del proveedor"
                  />
                  {errors.nombre && (
                    <p className="text-xs text-red-600 mt-1">{errors.nombre.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="prov-nit">NIT</Label>
                  <Input
                    id="prov-nit"
                    {...register("nit")}
                    className="mt-1"
                    placeholder="900.000.000-0"
                  />
                </div>
                <div>
                  <Label htmlFor="prov-contacto">Contacto</Label>
                  <Input
                    id="prov-contacto"
                    {...register("contacto")}
                    className="mt-1"
                    placeholder="Teléfono o email"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : editingId !== null ? "Actualizar" : "Crear Proveedor"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={cancelForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>NIT</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialProveedores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                    No hay proveedores registrados
                  </TableCell>
                </TableRow>
              ) : (
                initialProveedores.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell className="text-sm text-gray-600">{p.nit || "—"}</TableCell>
                    <TableCell className="text-sm text-gray-600">{p.contacto || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={p.activo ? "success" : "secondary"}>
                        {p.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(p)}
                        disabled={isPending}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {p.activo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminar(p.id)}
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
