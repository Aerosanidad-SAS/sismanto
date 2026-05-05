"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { IncidentFormData } from "@/lib/validations";
import { incidentSchema, updateIncidentPrioridadSchema } from "@/lib/validations";
import { requireRole } from "@/app/api/actions/auth";

export async function createIncident(data: IncidentFormData) {
  const parsed = incidentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();

  try {
    const payload = parsed.data;
    const severidad = payload.severidad ?? "MEDIA";
    const { data: incident, error } = await supabase
      .from("incidents")
      .insert({
        vehicle_id: payload.vehicleId,
        descripcion: payload.descripcion,
        severidad,
        reportado_por: payload.reportadoPor,
        afecta_operatividad: payload.afectaOperatividad,
        estado: "ABIERTO",
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // El trigger de la BD actualizará el estado del vehículo si afecta_operatividad = true

    revalidatePath("/");
    revalidatePath("/novedades");
    revalidatePath(`/vehiculos/${payload.vehicleId}`);

    return { success: true, data: incident };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/** Prioridad operativa BAJA/MEDIA/ALTA: solo administradores. */
export async function updateIncidentPrioridad(incidentId: number, prioridad: "BAJA" | "MEDIA" | "ALTA" | null) {
  await requireRole(["ADMIN"]);
  const parsed = updateIncidentPrioridadSchema.safeParse({ incidentId, prioridad });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { error } = await supabase
    .from("incidents")
    .update({ prioridad: parsed.data.prioridad })
    .eq("id", parsed.data.incidentId);

  if (error) return { error: error.message };
  revalidatePath("/novedades");
  revalidatePath("/");
  revalidatePath("/vehiculos");
  return { success: true };
}
