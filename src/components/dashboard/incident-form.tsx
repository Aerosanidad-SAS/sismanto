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
  /** Prefill de descripción (p. ej. desde un ítem fallado del preoperacional) */
  initialDescripcion?: string;
}

/** Hallazgos que sacan el vehículo de servicio en el acto (decisión de Daniel, 2026-09-30). */
const HALLAZGOS_CRITICOS = [
  "Sin aceite de motor",
  "Fuga excesiva de líquido en el piso",
  "Falla de frenos",
  "Falla de dirección o suspensión",
  "Sobrecalentamiento del motor",
  "Humo excesivo",
  "Sin SOAT o SOAT vencido",
  "Sin revisión técnico-mecánica vigente",
] as const;

export function IncidentForm({
  vehicleId,
  afectaOperatividad,
  onSuccess,
  reportadoPorDefault,
  hideSeveridad = false,
  initialDescripcion,
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
      descripcion: initialDescripcion || "",
      ...(hideSeveridad ? {} : { severidad: "MEDIA" as const }),
      reportadoPor: reportadoPorDefault || "",
    },
  });

  const severidad = watch("severidad");
  const afecta = watch("afectaOperatividad");
  const [critico, setCritico] = useState<string | null>(null);

  // Un hallazgo crítico marca la novedad como severa y que impide operar: el trigger de la base pasa el vehículo a FDS.
  const elegirCritico = (hallazgo: string | null) => {
    setCritico(hallazgo);
    setValue("afectaOperatividad", hallazgo !== null);
    setValue("severidad", hallazgo !== null ? "ALTA" : "MEDIA");
    setValue("descripcion", hallazgo !== null ? `CRÍTICO: ${hallazgo}. ` : "");
  };

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
      {hideSeveridad && (
        <div>
          <Label>¿Es un hallazgo crítico?</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Si lo es, el vehículo queda fuera de servicio y se avisa a Regulación y Mantenimiento.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {HALLAZGOS_CRITICOS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => elegirCritico(critico === h ? null : h)}
                className={`rounded-md border px-3 py-1.5 text-sm ${critico === h ? "border-red-600 bg-red-50 text-red-700" : "hover:bg-muted"}`}
              >
                {h}
              </button>
            ))}
          </div>
          {critico === null && (
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(afecta)}
                onChange={(e) => setValue("afectaOperatividad", e.target.checked)}
              />
              Otro problema que impide seguir operando el vehículo
            </label>
          )}
        </div>
      )}

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
