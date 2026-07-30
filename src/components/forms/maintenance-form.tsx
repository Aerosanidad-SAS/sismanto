"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parse } from "date-fns";
import { DateField } from "@/components/forms/date-field";
import {
  maintenanceSchema,
  supplierSchema,
  type MaintenanceFormData,
  type SupplierFormData,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  crearMantenimiento,
  getUltimoKilometrajeVehiculo,
  getNovedadesAbiertasPorVehiculo,
} from "@/app/api/actions/mantenimientos";
import { crearProveedor } from "@/app/api/actions/proveedores";
import { formatCurrency } from "@/lib/utils";
import type { Vehicle, MaintenanceCategory, Supplier } from "@/types";
import { Plus } from "lucide-react";

interface MaintenanceFormProps {
  vehicles: Pick<Vehicle, "id" | "placa">[];
  categories: Record<string, MaintenanceCategory[]>;
  proveedores?: Supplier[];
}

export function MaintenanceForm({
  vehicles,
  categories,
  proveedores: initialProveedores = [],
}: MaintenanceFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillVehicleId = searchParams.get("vehicleId") || undefined;
  const prefillIncidentId = searchParams.get("incidentId");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimoKm, setUltimoKm] = useState<number | null>(null);
  const [novedadesAbiertas, setNovedadesAbiertas] = useState<
    Array<{ id: number; descripcion: string; severidad: string }>
  >([]);
  const [proveedores, setProveedores] = useState<Supplier[]>(initialProveedores);
  const [showNuevoProveedor, setShowNuevoProveedor] = useState(false);
  const [nuevoProveedorError, setNuevoProveedorError] = useState<string | null>(null);
  const [creandoProveedor, setCreandoProveedor] = useState(false);

  const {
    register: registerProv,
    handleSubmit: handleSubmitProv,
    reset: resetProv,
    formState: { errors: errorsProv },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      fecha: new Date(),
      tipo: "PREVENTIVO",
      tiempoFueraServicioHoras: 0,
      vehicleId: prefillVehicleId,
    },
  });

  const vehicleId = watch("vehicleId");
  const tipo = watch("tipo");
  const supplierId = watch("supplierId");

  const onCrearProveedor = async (data: SupplierFormData) => {
    setCreandoProveedor(true);
    setNuevoProveedorError(null);
    try {
      const result = await crearProveedor(data);
      if (result.error) {
        setNuevoProveedorError(result.error);
      } else if ((result as any).data) {
        const nuevo = (result as any).data as Supplier;
        setProveedores((prev) => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setValue("supplierId", nuevo.id);
        setValue("proveedor", nuevo.nombre);
        setShowNuevoProveedor(false);
        resetProv();
      }
    } finally {
      setCreandoProveedor(false);
    }
  };

  // Cargar último kilometraje y novedades cuando se selecciona un vehículo
  useEffect(() => {
    if (vehicleId) {
      getUltimoKilometrajeVehiculo(vehicleId).then(setUltimoKm);
      getNovedadesAbiertasPorVehiculo(vehicleId).then((novedades) => {
        setNovedadesAbiertas(novedades);
        // Viene desde "Cerrar novedad" en /novedades: preseleccionar esa novedad
        if (prefillIncidentId && novedades.some((n) => String(n.id) === prefillIncidentId)) {
          setValue("incidentId", Number(prefillIncidentId));
        }
      });
    } else {
      setUltimoKm(null);
      setNovedadesAbiertas([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const onSubmit = async (data: MaintenanceFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await crearMantenimiento(data);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/mantenimientos");
        router.refresh();
      }
    } catch (err) {
      setError("Error al crear el mantenimiento. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Aplanar categorías para el select
  const categoriasLista = Object.values(categories).flat();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Vehículo */}
        <div>
          <Label htmlFor="vehicleId">Vehículo *</Label>
          <Select
            value={vehicleId || ""}
            onValueChange={(value) => setValue("vehicleId", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleccione un vehículo" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.placa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vehicleId && (
            <p className="text-sm text-red-600 mt-1">
              {errors.vehicleId.message}
            </p>
          )}
          {ultimoKm !== null && (
            <p className="text-sm text-muted-foreground mt-1">
              Último kilometraje registrado: {ultimoKm.toLocaleString()} km
            </p>
          )}
        </div>

        {/* Fecha */}
        <div>
          <Label htmlFor="fecha">Fecha *</Label>
          <DateField
            id="fecha"
            value={watch("fecha") ? format(watch("fecha"), "yyyy-MM-dd") : ""}
            onChange={(v) => setValue("fecha", v ? parse(v, "yyyy-MM-dd", new Date()) : (undefined as unknown as Date))}
            max={format(new Date(), "yyyy-MM-dd")}
          />
          {errors.fecha && (
            <p className="text-sm text-red-600 mt-1">
              {errors.fecha.message}
            </p>
          )}
        </div>

        {/* Kilometraje */}
        <div>
          <Label htmlFor="kilometrajeActual">Kilometraje Actual *</Label>
          <Input
            id="kilometrajeActual"
            type="number"
            {...register("kilometrajeActual", {
              valueAsNumber: true,
            })}
            className="mt-1"
            placeholder="0"
          />
          {errors.kilometrajeActual && (
            <p className="text-sm text-red-600 mt-1">
              {errors.kilometrajeActual.message}
            </p>
          )}
        </div>

        {/* Tipo */}
        <div>
          <Label>Tipo de Mantenimiento *</Label>
          <RadioGroup
            value={tipo}
            onValueChange={(value) =>
              setValue("tipo", value as "PREVENTIVO" | "CORRECTIVO")
            }
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PREVENTIVO" id="preventivo" />
              <Label htmlFor="preventivo" className="font-normal cursor-pointer">
                Preventivo
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CORRECTIVO" id="correctivo" />
              <Label htmlFor="correctivo" className="font-normal cursor-pointer">
                Correctivo
              </Label>
            </div>
          </RadioGroup>
          {errors.tipo && (
            <p className="text-sm text-red-600 mt-1">
              {errors.tipo.message}
            </p>
          )}
        </div>

        {/* Categoría */}
        <div>
          <Label htmlFor="categoriaId">Categoría *</Label>
          <Select
            onValueChange={(value) =>
              setValue("categoriaId", parseInt(value))
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleccione una categoría" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categories).map(([grupo, cats]) => (
                <div key={grupo}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {grupo}
                  </div>
                  {cats.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
          {errors.categoriaId && (
            <p className="text-sm text-red-600 mt-1">
              {errors.categoriaId.message}
            </p>
          )}
        </div>

        {/* Proveedor */}
        <div>
          <Label htmlFor="supplierId">Proveedor *</Label>
          {proveedores.length > 0 ? (
            <div className="mt-1 space-y-2">
              <Select
                value={supplierId ? String(supplierId) : ""}
                onValueChange={(v) => {
                  const id = parseInt(v);
                  setValue("supplierId", id);
                  const p = proveedores.find((x) => x.id === id);
                  if (p) setValue("proveedor", p.nombre);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {proveedores.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => setShowNuevoProveedor(true)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Crear nuevo proveedor
              </button>
            </div>
          ) : (
            <div className="mt-1 space-y-2">
              <Input
                id="proveedor"
                {...register("proveedor")}
                className="mt-1"
                placeholder="Nombre del proveedor"
              />
              <button
                type="button"
                onClick={() => setShowNuevoProveedor(true)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Crear y agregar proveedor
              </button>
            </div>
          )}
          {errors.proveedor && (
            <p className="text-sm text-red-600 mt-1">
              {errors.proveedor.message}
            </p>
          )}

          {/* Dialog crear proveedor */}
          <Dialog open={showNuevoProveedor} onOpenChange={setShowNuevoProveedor}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nuevo Proveedor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitProv(onCrearProveedor)} className="space-y-4">
                {nuevoProveedorError && (
                  <p className="text-sm text-red-600">{nuevoProveedorError}</p>
                )}
                <div>
                  <Label htmlFor="np-nombre">Nombre *</Label>
                  <Input
                    id="np-nombre"
                    {...registerProv("nombre")}
                    className="mt-1"
                    placeholder="Nombre del proveedor"
                  />
                  {errorsProv.nombre && (
                    <p className="text-xs text-red-600 mt-1">{errorsProv.nombre.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="np-nit">NIT</Label>
                  <Input id="np-nit" {...registerProv("nit")} className="mt-1" placeholder="900.000.000-0" />
                </div>
                <div>
                  <Label htmlFor="np-contacto">Contacto</Label>
                  <Input id="np-contacto" {...registerProv("contacto")} className="mt-1" placeholder="Teléfono o email" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setShowNuevoProveedor(false); resetProv(); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creandoProveedor}>
                    {creandoProveedor ? "Creando..." : "Crear Proveedor"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Valor */}
        <div>
          <Label htmlFor="valor">Valor (COP) *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            {...register("valor", {
              valueAsNumber: true,
            })}
            className="mt-1"
            placeholder="0"
          />
          {errors.valor && (
            <p className="text-sm text-red-600 mt-1">
              {errors.valor.message}
            </p>
          )}
        </div>

        {/* Número de Factura */}
        <div>
          <Label htmlFor="numeroFactura">Número de Factura</Label>
          <Input
            id="numeroFactura"
            {...register("numeroFactura")}
            className="mt-1"
            placeholder="Opcional"
          />
        </div>

        {/* Tiempo fuera de servicio */}
        <div>
          <Label htmlFor="tiempoFueraServicioHoras">
            Tiempo Fuera de Servicio (horas)
          </Label>
          <Input
            id="tiempoFueraServicioHoras"
            type="number"
            step="0.01"
            {...register("tiempoFueraServicioHoras", {
              valueAsNumber: true,
            })}
            className="mt-1"
            placeholder="0"
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <Label htmlFor="descripcionTrabajo">Descripción del Trabajo *</Label>
        <Textarea
          id="descripcionTrabajo"
          {...register("descripcionTrabajo")}
          className="mt-1"
          placeholder="Describa el trabajo realizado..."
          rows={4}
        />
        {errors.descripcionTrabajo && (
          <p className="text-sm text-red-600 mt-1">
            {errors.descripcionTrabajo.message}
          </p>
        )}
      </div>

      {/* Notas adicionales */}
      <div>
        <Label htmlFor="notasAdicionales">Notas Adicionales</Label>
        <Textarea
          id="notasAdicionales"
          {...register("notasAdicionales")}
          className="mt-1"
          placeholder="Información adicional..."
          rows={3}
        />
      </div>

      {/* Novedad que cierra */}
      {novedadesAbiertas.length > 0 && (
        <div>
          <Label htmlFor="incidentId">
            Cerrar Novedad (Opcional)
          </Label>
          <Select
            value={watch("incidentId") ? String(watch("incidentId")) : ""}
            onValueChange={(value) =>
              setValue("incidentId", parseInt(value))
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleccione una novedad para cerrar" />
            </SelectTrigger>
            <SelectContent>
              {novedadesAbiertas.map((novedad) => (
                <SelectItem
                  key={novedad.id}
                  value={novedad.id.toString()}
                >
                  {novedad.descripcion.substring(0, 50)}... ({novedad.severidad})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Mantenimiento"}
        </Button>
      </div>
    </form>
  );
}
