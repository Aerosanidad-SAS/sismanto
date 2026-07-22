"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { IncidentFormData } from "@/lib/validations";
import { incidentSchema, updateIncidentPrioridadSchema } from "@/lib/validations";
import { requireRole } from "@/app/api/actions/auth";
import { z } from "zod";

const ROLES_CIERRE = ["ADMIN", "ANALISTA", "REGULACION", "MANTENIMIENTO"] as const;

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
  await requireRole(["ADMIN", "ANALISTA"]);
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

/**
 * Cierre manual de una novedad — botón "Cerrar" en /novedades.
 * Dos caminos, decididos por el usuario en el diálogo:
 *  - Ligada a un mantenimiento ya registrado (mantenimientoId existente).
 *  - Sin mantenimiento: requiere una nota explicando por qué se cierra.
 * (El tercer camino, "registrar un mantenimiento nuevo", no pasa por acá:
 * usa el flujo ya existente de crearMantenimiento con incidentId, que ya
 * cierra la novedad como parte de esa transacción.)
 */
export async function closeIncident(
  incidentId: number,
  payload: { mantenimientoId: number } | { notaCierre: string }
) {
  const profile = await requireRole([...ROLES_CIERRE]);

  const idParsed = z.number().int().positive().safeParse(incidentId);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const base = {
    estado: "CERRADO" as const,
    fecha_cierre: new Date().toISOString(),
    cerrado_por: profile.user_id,
  };

  if ("mantenimientoId" in payload) {
    const mantParsed = z.number().int().positive().safeParse(payload.mantenimientoId);
    if (!mantParsed.success) return { error: "Mantenimiento inválido" };

    const { error } = await supabase
      .from("incidents")
      .update({ ...base, mantenimiento_cierre_id: mantParsed.data })
      .eq("id", idParsed.data);
    if (error) return { error: error.message };
  } else {
    const nota = payload.notaCierre.trim();
    if (nota.length < 5) return { error: "La nota de cierre debe tener al menos 5 caracteres" };

    const { error } = await supabase
      .from("incidents")
      .update({ ...base, nota_cierre: nota })
      .eq("id", idParsed.data);
    if (error) return { error: error.message };
  }

  revalidatePath("/novedades");
  revalidatePath("/");
  revalidatePath("/vehiculos");
  return { success: true };
}

/** Mantenimientos existentes de un vehículo — para ligar el cierre de una novedad a uno ya registrado. */
export async function getMantenimientosPorVehiculo(vehicleId: string) {
  const idParsed = z.string().uuid().safeParse(vehicleId);
  if (!idParsed.success) return [];

  const supabase = createClient();
  const { data } = await supabase
    .from("maintenance_records")
    .select("id_manto, fecha, tipo, descripcion_trabajo")
    .eq("vehicle_id", idParsed.data)
    .order("fecha", { ascending: false })
    .limit(50);
  return data || [];
}
