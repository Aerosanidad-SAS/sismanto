"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { incidentSchema, type IncidentFormData } from "@/lib/validations";
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
import { createIncident } from "@/app/api/actions/incidents";

interface IncidentFormProps {
  vehicleId: string;
  afectaOperatividad: boolean;
  onSuccess: () => void;
  reportadoPorDefault?: string;
  /** Ocultar severidad percibida (p. ej. OVEM): el servidor usará clasificación MEDIA por defecto */
  hideSeveridad?: boolean;
}

export function IncidentForm({
  vehicleId,
  afectaOperatividad,
  onSuccess,
  reportadoPorDefault,
  hideSeveridad = false,
}: IncidentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      vehicleId,
      afectaOperatividad,
      ...(hideSeveridad ? {} : { severidad: "MEDIA" as const }),
      reportadoPor: reportadoPorDefault || "",
    },
  });

  const severidad = watch("severidad");

  const onSubmit = async (data: IncidentFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createIncident(data);
      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError("Error al crear la novedad. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="descripcion">Descripción *</Label>
        <Textarea
          id="descripcion"
          {...register("descripcion")}
          placeholder="Describa la novedad o incidente..."
          className="mt-1"
        />
        {errors.descripcion && (
          <p className="text-sm text-red-600 mt-1">
            {errors.descripcion.message}
          </p>
        )}
      </div>

      {!hideSeveridad && (
        <div>
          <Label htmlFor="severidad">Clasificación del reporte *</Label>
          <Select
            value={severidad ?? "MEDIA"}
            onValueChange={(value) =>
              setValue("severidad", value as "BAJA" | "MEDIA" | "ALTA")
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BAJA">Leve</SelectItem>
              <SelectItem value="MEDIA">Moderada</SelectItem>
              <SelectItem value="ALTA">Severa</SelectItem>
            </SelectContent>
          </Select>
          {errors.severidad && (
            <p className="text-sm text-red-600 mt-1">
              {errors.severidad.message}
            </p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="reportadoPor">Reportado por *</Label>
        <Input
          id="reportadoPor"
          {...register("reportadoPor")}
          placeholder="Nombre de quien reporta"
          className="mt-1"
        />
        {errors.reportadoPor && (
          <p className="text-sm text-red-600 mt-1">
            {errors.reportadoPor.message}
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Novedad"}
        </Button>
      </div>
    </form>
  );
}
