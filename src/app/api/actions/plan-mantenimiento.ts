"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserProfile } from "@/lib/auth-utils";
import { z } from "zod";
import type { MaintenanceAlert, MaintenancePlanItem } from "@/types";

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getAlertsForVehicle(
  vehicleId: string
): Promise<MaintenanceAlert[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicle_maintenance_alerts")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("nivel_alerta", { ascending: true }) // NARANJA/ROJA first
    .order("descripcion");

  if (error) return [];
  return (data ?? []) as MaintenanceAlert[];
}

export async function getAllAlerts(filters?: {
  centroOperativo?: string;
  nivel?: "ROJA" | "NARANJA" | "OK";
  categoria?: string;
}): Promise<MaintenanceAlert[]> {
  const supabase = createClient();
  let query = supabase
    .from("vehicle_maintenance_alerts")
    .select("*");

  if (filters?.centroOperativo)
    query = query.eq("centro_operativo", filters.centroOperativo);
  if (filters?.nivel)
    query = query.eq("nivel_alerta", filters.nivel);
  if (filters?.categoria)
    query = query.eq("categoria", filters.categoria);

  const { data, error } = await query
    .order("nivel_alerta", { ascending: true })
    .order("placa");

  if (error) return [];
  return (data ?? []) as MaintenanceAlert[];
}

export async function getPlanItems(aplica_a?: string): Promise<MaintenancePlanItem[]> {
  const supabase = createClient();
  let query = supabase
    .from("maintenance_plan_items")
    .select("*")
    .eq("activo", true)
    .order("intervalo_km")
    .order("intervalo_dias")
    .order("descripcion");

  if (aplica_a) query = query.in("aplica_a", ["TODOS", aplica_a]);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as MaintenancePlanItem[];
}

// ── Log completion ───────────────────────────────────────────────────────────

const logSchema = z.object({
  vehicle_id: z.string().uuid(),
  plan_item_id: z.number().int().positive(),
  fecha_realizado: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  km_realizado: z.number().int().nonnegative().nullable().optional(),
  maintenance_record_id: z.number().int().positive().nullable().optional(),
  notas: z.string().max(500).nullable().optional(),
});

export type LogPlanItemInput = z.infer<typeof logSchema>;

export async function registrarCumplimiento(input: LogPlanItemInput) {
  const parsed = logSchema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const profile = await getUserProfile();
  if (!profile) return { error: "No autenticado" };
  if (!["ADMIN", "MANTENIMIENTO"].includes(profile.role))
    return { error: "Sin permisos" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("vehicle_maintenance_log").insert({
    ...parsed.data,
    registrado_por: profile.user_id,
  });

  if (error) return { error: error.message };
  return { error: null };
}
