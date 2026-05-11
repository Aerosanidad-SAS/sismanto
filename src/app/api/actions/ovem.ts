"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "./auth";
import { revalidatePath } from "next/cache";
import { dailyCheckSchema, updateKilometrajeOdometerSchema } from "@/lib/validations";

export async function getChecklistItemsActivos() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("checklist_items")
    .select("id, categoria, descripcion, cantidad_esperada, orden, activo")
    .eq("activo", true)
    .order("orden", { ascending: true });
  if (error) return [];
  return data || [];
}

export async function getAssignedVehicles(userId: string) {
  const supabase = createClient();
  const hoy = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("vehicle_assignments")
    .select(`
      id,
      vehicle_id,
      fecha_inicio,
      fecha_fin,
      vehicles(id, placa, marca, modelo, estado_actual)
    `)
    .eq("user_id", userId)
    .eq("activo", true)
    .lte("fecha_inicio", hoy)
    .or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`);

  return (data || []).map((a: any) => ({
    ...a.vehicles,
    assignment_id: a.id,
  }));
}

export async function getVehiculoPorOVEM(userId: string, vehicleId: string) {
  const vehicles = await getAssignedVehicles(userId);
  return vehicles.find((v: any) => v.id === vehicleId) || null;
}

export async function submitDailyCheck(data: {
  userId: string;
  vehicleId: string;
  fecha: string;
  kilometrajeInicial: number;
  kilometrajeFinal?: number;
  observaciones?: string;
  isAssignment?: boolean;
  items?: Array<{
    checklistItemId: number;
    estado: "OK" | "FALLA" | "NO_APLICA";
    cantidadOk?: number;
    observacion?: string;
  }>;
}) {
  const parsed = dailyCheckSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const row = parsed.data;

  const profile = await requireRole(["OVEM", "ADMIN"]);
  if (profile.role_codigo === "OVEM" && profile.user_id !== row.userId) {
    return { error: "No autorizado" };
  }

  const supabase = createClient();

  const { data: checkRow, error: checkError } = await supabase
    .from("daily_checks")
    .upsert(
      {
        user_id: row.userId,
        vehicle_id: row.vehicleId,
        fecha: row.fecha,
        kilometraje_inicial: row.kilometrajeInicial,
        kilometraje_final: row.kilometrajeFinal ?? null,
        checklist_ok: false,
        observaciones: row.observaciones ?? null,
        is_assignment: row.isAssignment,
      },
      { onConflict: "user_id,vehicle_id,fecha" }
    )
    .select("id")
    .single();

  if (checkError) return { error: checkError.message };

  const dailyCheckId = checkRow?.id;
  if (dailyCheckId && row.items && row.items.length > 0) {
    // Upsert por item. Si cantidadOk < cantidad esperada, UI ya manda estado=FALLA.
    const payload = row.items.map((it) => ({
      daily_check_id: dailyCheckId,
      checklist_item_id: it.checklistItemId,
      estado: it.estado,
      cantidad_ok: it.cantidadOk ?? null,
      observacion: it.observacion?.trim() || null,
    }));

    const { error: itemsErr } = await supabase
      .from("daily_check_items")
      .upsert(payload, { onConflict: "daily_check_id,checklist_item_id" });
    if (itemsErr) return { error: itemsErr.message };
  }

  // Si el OVEM marcó asignación, crear vehicle_assignment para hoy
  if (row.isAssignment) {
    const { error: assignError } = await supabase
      .from("vehicle_assignments")
      .upsert(
        {
          user_id: row.userId,
          vehicle_id: row.vehicleId,
          fecha_inicio: row.fecha,
          fecha_fin: row.fecha,
          activo: true,
          asignado_por: row.userId,
        },
        { onConflict: "user_id,vehicle_id,fecha_inicio" }
      );
    if (assignError) return { error: assignError.message };
  }

  revalidatePath("/ovem");
  return { success: true };
}

export async function updateKilometrajeOdometer(
  userId: string,
  vehicleId: string,
  fecha: string,
  kilometraje: number
) {
  const parsed = updateKilometrajeOdometerSchema.safeParse({
    userId,
    vehicleId,
    fecha,
    kilometraje,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const { userId: uid, vehicleId: vid, fecha: fechaVal, kilometraje: kmVal } = parsed.data;

  const profile = await requireRole(["OVEM", "ADMIN"]);
  const supabase = createClient();
  if (profile.role_codigo === "OVEM") {
    const { data: v } = await supabase.from("vehicles").select("id").eq("id", vid).maybeSingle();
    if (!v) return { error: "Vehículo no encontrado" };
  }
  const { data: ultimo } = await supabase
    .from("mileage_logs")
    .select("lectura_kilometraje")
    .eq("vehicle_id", vid)
    .order("fecha", { ascending: false })
    .limit(1)
    .single();

  const ultimoKm = ultimo?.lectura_kilometraje || 0;
  if (kmVal < ultimoKm) {
    return { error: `El kilometraje no puede ser menor al último registrado (${ultimoKm})` };
  }

  const { error } = await supabase.from("mileage_logs").upsert(
    {
      vehicle_id: vid,
      fecha: fechaVal,
      lectura_kilometraje: kmVal,
    },
    { onConflict: "vehicle_id,fecha" }
  );

  if (error) return { error: error.message };
  revalidatePath("/ovem");
  return { success: true };
}

export async function getDailyCheckForToday(userId: string, vehicleId: string) {
  const supabase = createClient();
  const hoy = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("daily_checks")
    .select("*")
    .eq("user_id", userId)
    .eq("vehicle_id", vehicleId)
    .eq("fecha", hoy)
    .single();
  return data;
}

export async function getDailyCheckItemsForToday(userId: string, vehicleId: string) {
  const supabase = createClient();
  const hoy = new Date().toISOString().split("T")[0];

  const { data: check } = await supabase
    .from("daily_checks")
    .select("id")
    .eq("user_id", userId)
    .eq("vehicle_id", vehicleId)
    .eq("fecha", hoy)
    .single();

  if (!check?.id) return [];

  const { data, error } = await supabase
    .from("daily_check_items")
    .select("checklist_item_id, estado, observacion, cantidad_ok")
    .eq("daily_check_id", check.id);

  if (error) return [];
  return data || [];
}
