"use client";

import { HALLAZGOS_CRITICOS, PREFIJO_CRITICO } from "@/lib/hallazgos-criticos";
import { crearSolicitudNoApto } from "@/app/api/actions/solicitudes-no-apto";
import { useId, useState } from "react";
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

export function IncidentForm({
  vehicleId,
  afectaOperatividad,
  onSuccess,
  reportadoPorDefault,
  hideSeveridad = false,
  initialDescripcion,
}: IncidentFormProps) {
  const uid = useId();
  const idSeveridad = `${uid}-severidad`;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Envío con hallazgo crítico: se pide una confirmación explícita antes de sacar el vehículo de servicio. */
  const [confirmarCritico, setConfirmarCritico] = useState(false);

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
  const [critico, setCritico] = useState<string | null>(null);
  /** Pide que el vehículo quede NO APTO: no lo cambia, abre una solicitud que avala Coordinación o el administrador. */
  const [pedirNoApto, setPedirNoApto] = useState(false);

  // Un hallazgo crítico marca la novedad como severa y que impide operar: el trigger de la base pasa el vehículo a FDS.
  const elegirCritico = (hallazgo: string | null) => {
    setCritico(hallazgo);
    setConfirmarCritico(false);
    setValue("afectaOperatividad", hallazgo !== null);
    setValue("severidad", hallazgo !== null ? "ALTA" : "MEDIA");
    setValue("descripcion", hallazgo !== null ? `${PREFIJO_CRITICO}${hallazgo}. ` : "");
  };

  const onSubmit = async (data: IncidentFormData) => {
    if (critico !== null && !confirmarCritico) {
      setConfirmarCritico(true);
      return;
    }
    setConfirmarCritico(false);
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createIncident(data);
      if (result.error) {
        setError(result.error);
      } else {
        if (pedirNoApto) {
          const incidentId = (result.data as { id?: number } | undefined)?.id;
          const sol = await crearSolicitudNoApto({ vehicleId: data.vehicleId, motivo: data.descripcion, origen: "REPORTE_OVEM", incidentId });
          if ("error" in sol && sol.error) {
            setError("La novedad quedó reportada, pero la solicitud de NO APTO no se envió: " + sol.error);
            return;
          }
        }
        onSuccess();
      }
    } catch (err) {
      setError("No se pudo crear la novedad. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {hideSeveridad && (
        <div>
          <p id={`${uid}-critico`} className="text-sm font-medium leading-none">
            ¿Es un hallazgo crítico?
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Si lo es, el sistema deja el vehículo NO APTO y avisa de inmediato a Regulación, Coordinación y Mantenimiento. No operes el vehículo.
          </p>
          <div role="group" aria-labelledby={`${uid}-critico`} className="mt-2 flex flex-wrap gap-2">
            {HALLAZGOS_CRITICOS.map((h) => (
              <button
                key={h}
                type="button"
                aria-pressed={critico === h}
                onClick={() => elegirCritico(critico === h ? null : h)}
                className={`min-h-11 rounded-md border px-3 py-2 text-sm ${critico === h ? "border-destructive bg-destructive/10 font-semibold text-destructive" : "hover:bg-muted"}`}
              >
                {h}
              </button>
            ))}
          </div>
          {critico === null && (
            <label className="mt-3 flex min-h-11 items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0"
                checked={pedirNoApto}
                onChange={(e) => {
                  setPedirNoApto(e.target.checked);
                  setValue("severidad", e.target.checked ? "ALTA" : "MEDIA");
                }}
              />
              <span>
                Solicitar que el vehículo quede NO APTO
                <span className="block text-xs text-muted-foreground">
                  Coordinación o Mantenimiento deben avalarlo. Mientras tanto el vehículo queda bloqueado: no lo operes.
                </span>
              </span>
            </label>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="descripcion">Descripción *</Label>
        <Textarea
          id="descripcion"
          {...register("descripcion")}
          aria-invalid={errors.descripcion ? "true" : undefined}
          aria-describedby={errors.descripcion ? `${uid}-descripcion-error` : undefined}
          placeholder="Describe la novedad o incidente. Si te la reportó otra persona, escribe quién."
          className="mt-1"
        />
        {errors.descripcion && (
          <p id={`${uid}-descripcion-error`} role="alert" className="text-sm text-destructive mt-1">
            {errors.descripcion.message}
          </p>
        )}
      </div>

      {!hideSeveridad && (
        <div>
          <Label htmlFor={idSeveridad}>Clasificación del reporte *</Label>
          <Select
            value={severidad ?? "MEDIA"}
            onValueChange={(value) =>
              setValue("severidad", value as "BAJA" | "MEDIA" | "ALTA")
            }
          >
            <SelectTrigger id={idSeveridad} className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BAJA">Leve</SelectItem>
              <SelectItem value="MEDIA">Moderada</SelectItem>
              <SelectItem value="ALTA">Severa</SelectItem>
            </SelectContent>
          </Select>
          {errors.severidad && (
            <p role="alert" className="text-sm text-destructive mt-1">
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
          aria-invalid={errors.reportadoPor ? "true" : undefined}
          aria-describedby={errors.reportadoPor ? `${uid}-reportado-error` : undefined}
          placeholder="Nombre de quien reporta"
          readOnly={Boolean(reportadoPorDefault)}
          className="mt-1"
        />
        {errors.reportadoPor && (
          <p id={`${uid}-reportado-error`} role="alert" className="text-sm text-destructive mt-1">
            {errors.reportadoPor.message}
          </p>
        )}
      </div>

      {error && (
        <div role="alert" className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {confirmarCritico && critico !== null && (
        <div role="alert" className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-foreground">
          <p className="font-semibold">Confirma: {critico}</p>
          <p className="mt-1">Al enviar, el vehículo queda fuera de servicio y se avisa a Regulación y Mantenimiento.</p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="min-h-11"
          variant={confirmarCritico ? "destructive" : "default"}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Guardando..."
            : confirmarCritico
              ? "Sí, sacar de servicio y enviar"
              : critico !== null
                ? "Revisar y enviar"
                : "Guardar novedad"}
        </Button>
      </div>
    </form>
  );
}
