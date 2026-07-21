"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "./auth";
import { revalidatePath } from "next/cache";
import { toggleVehicleStatusSchema, vehicleAssignmentSchema } from "@/lib/validations";
import { z } from "zod";

export async function toggleVehicleStatus(vehicleId: string, nuevoEstado: "OPERATIVO" | "FUERA_DE_SERVICIO") {
  const profile = await requireRole(["ADMIN", "ANALISTA", "REGULACION", "MANTENIMIENTO"]);

  const parsed = toggleVehicleStatusSchema.safeParse({ vehicleId, nuevoEstado });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();

  // Leer estado anterior para el historial
  const { data: vehicleActual } = await supabase
    .from("vehicles")
    .select("estado_actual")
    .eq("id", parsed.data.vehicleId)
    .single();

  const estadoAnterior = vehicleActual?.estado_actual ?? null;
  const hoy = new Date().toISOString().split("T")[0];

  const { error } = await supabase
    .from("vehicles")
    .update({
      estado_actual: parsed.data.nuevoEstado,
      // fds_desde: se establece al entrar a FDS y se borra al volver a OPERATIVO
      fds_desde: parsed.data.nuevoEstado === "FUERA_DE_SERVICIO" ? hoy : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.vehicleId);

  if (error) return { error: error.message };

  // Registrar en historial (fallo silencioso para no bloquear la operación)
  await supabase.from("vehicle_status_history").insert({
    vehicle_id: parsed.data.vehicleId,
    estado_nuevo: parsed.data.nuevoEstado,
    estado_anterior: estadoAnterior,
    registrado_por: profile.user_id,
    fecha_cambio: new Date().toISOString(),
  });

  revalidatePath("/regulacion");
  revalidatePath("/vehiculos");
  revalidatePath(`/vehiculos/${parsed.data.vehicleId}`);
  revalidatePath("/configuracion");
  revalidatePath("/");
  return { success: true };
}

export async function assignVehicleToOvem(
  vehicleId: string,
  userId: string,
  fechaInicio: string,
  fechaFin?: string
) {
  const profile = await requireRole(["ADMIN", "ANALISTA", "REGULACION", "OVEM"]);

  // OVEM solo puede asignarse a sí mismo
  if (profile.role_codigo === "OVEM" && userId !== profile.user_id) {
    return { error: "Un OVEM solo puede asignarse a sí mismo" };
  }

  const parseFin = fechaFin?.trim() ? fechaFin.trim() : undefined;
  const parsed = vehicleAssignmentSchema.safeParse({
    vehicleId,
    userId,
    fechaInicio,
    fechaFin: parseFin ?? null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const fin = parsed.data.fechaFin?.trim() || null;

  const { error } = await supabase.from("vehicle_assignments").insert({
    user_id: parsed.data.userId,
    vehicle_id: parsed.data.vehicleId,
    fecha_inicio: parsed.data.fechaInicio,
    fecha_fin: fin,
    activo: true,
    asignado_por: profile.user_id,
  });

  if (error) return { error: error.message };
  revalidatePath("/regulacion");
  return { success: true };
}

export async function unassignVehicle(assignmentId: number) {
  await requireRole(["ADMIN", "ANALISTA", "REGULACION"]);
  const idParsed = z.number().int().positive().safeParse(assignmentId);
  if (!idParsed.success) return { error: idParsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();

  const { error } = await supabase
    .from("vehicle_assignments")
    .update({ activo: false })
    .eq("id", idParsed.data);

  if (error) return { error: error.message };
  revalidatePath("/regulacion");
  return { success: true };
}

export async function getFleetWithAssignments() {
  const supabase = createClient();
  const hoy = new Date().toISOString().split("T")[0];

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, placa, marca, modelo, estado_actual, centro_operativo")
    .order("placa");

  const { data: assignments } = await supabase
    .from("vehicle_assignments")
    .select("id, vehicle_id, user_id, fecha_inicio, fecha_fin")
    .eq("activo", true)
    .lte("fecha_inicio", hoy)
    .or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`);

  const userIds = [...new Set((assignments || []).map((a: any) => a.user_id))];
  const { data: profiles } = userIds.length > 0
    ? await supabase.from("user_profiles").select("user_id, nombre_completo, email").in("user_id", userIds)
    : { data: [] };
  const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

  const assignMap = new Map<string, any[]>();
  (assignments || []).forEach((a: any) => {
    const list = assignMap.get(a.vehicle_id) || [];
    list.push({ ...a, driver: profileMap.get(a.user_id) });
    assignMap.set(a.vehicle_id, list);
  });

  return (vehicles || []).map((v) => ({
    ...v,
    assignments: assignMap.get(v.id) || [],
  }));
}

export async function getOvemUsers() {
  const supabase = createClient();
  const { data: role } = await supabase.from("roles").select("id").eq("codigo", "OVEM").single();
  if (!role) return [];
  const { data } = await supabase
    .from("user_profiles")
    .select("user_id, nombre_completo, email")
    .eq("activo", true)
    .eq("role_id", role.id);
  return data || [];
}
