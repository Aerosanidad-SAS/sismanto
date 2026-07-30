"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CatalogCombobox } from "@/components/forms/catalog-combobox";
import { DateField } from "@/components/forms/date-field";
import {
  opcionesTipoCombustible,
  opcionesTipoRefrigerante,
  opcionesAceite,
} from "@/lib/vehicle-fluid-options";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crearVehiculo, actualizarVehiculo } from "@/app/api/actions/vehiculos";
import type { OperationalCenter, Vehicle } from "@/types";

interface VehicleFormProps {
  centros: OperationalCenter[];
  vehicle?: Vehicle & { operational_centers?: { id: number; nombre: string; codigo: string } | null };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VehicleForm({ centros, vehicle, onSuccess, onCancel }: VehicleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!vehicle;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle
      ? {
          placa: vehicle.placa,
          marca: vehicle.marca || "",
          modelo: vehicle.modelo || "",
          linea: vehicle.linea || "",
          tipo_combustible: vehicle.tipo_combustible || vehicle.combustible || "",
          tipo_llantas: vehicle.tipo_llantas || "",
          tipo_bombillos: vehicle.tipo_bombillos || "",
          bombilleria_farolas: vehicle.bombilleria_farolas || "",
          bombilleria_stops: vehicle.bombilleria_stops || "",
          bombilleria_direccionales: vehicle.bombilleria_direccionales || "",
          tipo_refrigerante: vehicle.tipo_refrigerante || "",
          aceite_usado: vehicle.aceite_usado || "",
          ref_filtro_aire_motor: vehicle.ref_filtro_aire_motor || "",
          ref_filtro_aceite: vehicle.ref_filtro_aceite || "",
          ref_filtro_combustible: vehicle.ref_filtro_combustible || "",
          bateria_principal: vehicle.bateria_principal || "",
          bateria_auxiliar: vehicle.bateria_auxiliar || "",
          notas: vehicle.notas || "",
          vencimiento_soat: vehicle.vencimiento_soat || "",
          vencimiento_tecnicomecanica: vehicle.vencimiento_tecnicomecanica || vehicle.vencimiento_rtm || "",
          costo_soat_anual: vehicle.costo_soat_anual ?? undefined,
          costo_tecnomecanica_anual: vehicle.costo_tecnomecanica_anual ?? undefined,
          costo_poliza_anual: vehicle.costo_poliza_anual ?? undefined,
          centro_operativo_id: vehicle.centro_operativo_id || centros[0]?.id || 0,
        }
      : {
          placa: "",
          marca: "",
          modelo: "",
          linea: "",
          tipo_combustible: "",
          tipo_llantas: "",
          tipo_bombillos: "",
          bombilleria_farolas: "",
          bombilleria_stops: "",
          bombilleria_direccionales: "",
          tipo_refrigerante: "",
          aceite_usado: "",
          ref_filtro_aire_motor: "",
          ref_filtro_aceite: "",
          ref_filtro_combustible: "",
          bateria_principal: "",
          bateria_auxiliar: "",
          notas: "",
          vencimiento_soat: "",
          vencimiento_tecnicomecanica: "",
          costo_soat_anual: undefined,
          costo_tecnomecanica_anual: undefined,
          costo_poliza_anual: undefined,
          centro_operativo_id: centros[0]?.id || 0,
        },
  });

  const centroId = watch("centro_operativo_id");
  const tipoCombustible = watch("tipo_combustible");
  const tipoRefrigerante = watch("tipo_refrigerante");
  const aceiteUsado = watch("aceite_usado");

  const onSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = isEditing
        ? await actualizarVehiculo(vehicle!.id, data)
        : await crearVehiculo(data);
      if (result.error) {
        setError(result.error);
      } else {
        onSuccess?.();
      }
    } catch {
      setError("Error al guardar el vehículo. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Sección: Identificación */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Identificación
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="placa">Placa *</Label>
            <Input
              id="placa"
              {...register("placa")}
              className="mt-1 uppercase"
              placeholder="ABC123"
              disabled={isEditing}
            />
            {errors.placa && (
              <p className="text-xs text-red-600 mt-1">{errors.placa.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="marca">Marca</Label>
            <Input id="marca" {...register("marca")} className="mt-1" placeholder="Chevrolet" />
          </div>
          <div>
            <Label htmlFor="modelo">Modelo</Label>
            <Input id="modelo" {...register("modelo")} className="mt-1" placeholder="2020" />
          </div>
          <div>
            <Label htmlFor="linea">Línea</Label>
            <Input id="linea" {...register("linea")} className="mt-1" placeholder="NPR" />
          </div>
          <div>
            <Label htmlFor="centro">Centro de Operaciones *</Label>
            <Select
              value={centroId ? String(centroId) : ""}
              onValueChange={(v) => setValue("centro_operativo_id", parseInt(v))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccione un centro" />
              </SelectTrigger>
              <SelectContent>
                {centros.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.centro_operativo_id && (
              <p className="text-xs text-red-600 mt-1">
                {errors.centro_operativo_id.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sección: Fluidos y Filtros */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Fluidos y Filtros
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="tipo_combustible">Tipo de Combustible</Label>
            <div className="mt-1">
              <CatalogCombobox
                id="tipo_combustible"
                options={opcionesTipoCombustible}
                value={tipoCombustible ?? ""}
                onChange={(v) => setValue("tipo_combustible", v, { shouldValidate: true })}
                placeholder="Buscar o escribir combustible…"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tipo_refrigerante">Refrigerante *</Label>
            <div className="mt-1">
              <CatalogCombobox
                id="tipo_refrigerante"
                options={opcionesTipoRefrigerante}
                value={tipoRefrigerante ?? ""}
                onChange={(v) => setValue("tipo_refrigerante", v, { shouldValidate: true })}
                placeholder="Buscar o escribir refrigerante…"
              />
            </div>
            {errors.tipo_refrigerante && (
              <p className="text-xs text-red-600 mt-1">{errors.tipo_refrigerante.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="aceite_usado">Aceite de motor *</Label>
            <div className="mt-1">
              <CatalogCombobox
                id="aceite_usado"
                options={opcionesAceite}
                value={aceiteUsado ?? ""}
                onChange={(v) => setValue("aceite_usado", v, { shouldValidate: true })}
                placeholder="Buscar o escribir aceite…"
              />
            </div>
            {errors.aceite_usado && (
              <p className="text-xs text-red-600 mt-1">{errors.aceite_usado.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="ref_filtro_aire_motor">Filtro Aire *</Label>
            <Input
              id="ref_filtro_aire_motor"
              {...register("ref_filtro_aire_motor")}
              className="mt-1"
              placeholder="Ej: SA-6709"
            />
            {errors.ref_filtro_aire_motor && (
              <p className="text-xs text-red-600 mt-1">{errors.ref_filtro_aire_motor.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="ref_filtro_aceite">Filtro Aceite *</Label>
            <Input
              id="ref_filtro_aceite"
              {...register("ref_filtro_aceite")}
              className="mt-1"
              placeholder="Ej: PH3614"
            />
            {errors.ref_filtro_aceite && (
              <p className="text-xs text-red-600 mt-1">{errors.ref_filtro_aceite.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="ref_filtro_combustible">Ref. Filtro de Combustible</Label>
            <Input
              id="ref_filtro_combustible"
              {...register("ref_filtro_combustible")}
              className="mt-1"
              placeholder="Ej: FF5052"
            />
          </div>
        </div>
      </div>

      {/* Sección: Neumáticos y Eléctrico */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Neumáticos y Sistema Eléctrico
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="tipo_llantas">Tipo de Llantas *</Label>
            <Input
              id="tipo_llantas"
              {...register("tipo_llantas")}
              className="mt-1"
              placeholder="Ej: 215/75 R17.5"
            />
            {errors.tipo_llantas && (
              <p className="text-xs text-red-600 mt-1">{errors.tipo_llantas.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="tipo_bombillos">Tipo de Bombillos</Label>
            <Input
              id="tipo_bombillos"
              {...register("tipo_bombillos")}
              className="mt-1"
              placeholder="Ej: LED / H4 55W"
            />
          </div>
          <div>
            <Label htmlFor="bombilleria_farolas">Bombillería: Farolas *</Label>
            <Input
              id="bombilleria_farolas"
              {...register("bombilleria_farolas")}
              className="mt-1"
              placeholder="Ej: H7 / LED"
            />
            {errors.bombilleria_farolas && (
              <p className="text-xs text-red-600 mt-1">{errors.bombilleria_farolas.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="bombilleria_stops">Bombillería: Stops *</Label>
            <Input
              id="bombilleria_stops"
              {...register("bombilleria_stops")}
              className="mt-1"
              placeholder="Ej: P21/5W"
            />
            {errors.bombilleria_stops && (
              <p className="text-xs text-red-600 mt-1">{errors.bombilleria_stops.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="bombilleria_direccionales">Bombillería: Direccionales *</Label>
            <Input
              id="bombilleria_direccionales"
              {...register("bombilleria_direccionales")}
              className="mt-1"
              placeholder="Ej: PY21W"
            />
            {errors.bombilleria_direccionales && (
              <p className="text-xs text-red-600 mt-1">{errors.bombilleria_direccionales.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="bateria_principal">Batería ppal *</Label>
            <Input
              id="bateria_principal"
              {...register("bateria_principal")}
              className="mt-1"
              placeholder="Ej: 12V 100Ah"
            />
            {errors.bateria_principal && (
              <p className="text-xs text-red-600 mt-1">{errors.bateria_principal.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="bateria_auxiliar">Batería aux *</Label>
            <Input
              id="bateria_auxiliar"
              {...register("bateria_auxiliar")}
              className="mt-1"
              placeholder="Ej: 12V 75Ah"
            />
            {errors.bateria_auxiliar && (
              <p className="text-xs text-red-600 mt-1">{errors.bateria_auxiliar.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sección: Vencimientos */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Vencimientos
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="vencimiento_soat">Fecha Vencimiento SOAT</Label>
            <DateField
              id="vencimiento_soat"
              value={watch("vencimiento_soat") ?? ""}
              onChange={(v) => setValue("vencimiento_soat", v)}
            />
          </div>
          <div>
            <Label htmlFor="vencimiento_tecnicomecanica">
              Fecha Vencimiento Técnico-Mecánica
            </Label>
            <DateField
              id="vencimiento_tecnicomecanica"
              value={watch("vencimiento_tecnicomecanica") ?? ""}
              onChange={(v) => setValue("vencimiento_tecnicomecanica", v)}
            />
          </div>
          <div>
            <Label htmlFor="costo_soat_anual">Costo anual SOAT ($)</Label>
            <Input
              id="costo_soat_anual"
              type="number"
              step="0.01"
              min={0}
              {...register("costo_soat_anual")}
              className="mt-1"
              placeholder="Opcional"
            />
          </div>
          <div>
            <Label htmlFor="costo_tecnomecanica_anual">Costo anual técnico-mecánica ($)</Label>
            <Input
              id="costo_tecnomecanica_anual"
              type="number"
              step="0.01"
              min={0}
              {...register("costo_tecnomecanica_anual")}
              className="mt-1"
              placeholder="Opcional"
            />
          </div>
          <div>
            <Label htmlFor="costo_poliza_anual">Costo anual póliza ($)</Label>
            <Input
              id="costo_poliza_anual"
              type="number"
              step="0.01"
              min={0}
              {...register("costo_poliza_anual")}
              className="mt-1"
              placeholder="Opcional"
            />
          </div>
        </div>
      </div>

      {/* Sección: Notas */}
      <div>
        <Label htmlFor="notas">Notas</Label>
        <Textarea
          id="notas"
          {...register("notas")}
          className="mt-1"
          rows={3}
          placeholder="Observaciones generales del vehículo..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear Vehículo"}
        </Button>
      </div>
    </form>
  );
}
