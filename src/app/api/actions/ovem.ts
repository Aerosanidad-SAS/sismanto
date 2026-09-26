"use server";

import { hoyBogota } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { requireRole } from "./auth";
import { revalidatePath } from "next/cache";
import {
  dailyCheckSchema,
  ovemFuelLogSchema,
  roadAccidentSchema,
  supplyCheckSchema,
  updateKilometrajeOdometerSchema,
} from "@/lib/validations";
import type { RoadAccidentFormData } from "@/lib/validations";

/** Día de Colombia, igual que daily_checks y supply_checks. Las políticas RLS lo comparan con `hoy_bogota()` (migración 088), no con CURRENT_DATE (UTC). */
function hoyOvem() {
  return hoyBogota();
}

export async function getChecklistItemsActivos(lista: "PREOPERACIONAL" | "DOTACION" = "PREOPERACIONAL") {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("checklist_items")
    .select("id, categoria, descripcion, cantidad_esperada, orden, activo")
    .eq("activo", true)
    .eq("lista", lista)
    .order("orden", { ascending: true });
  if (!error) return data || [];

  // Sin la migración 060 no existe `lista`: el preoperacional sigue funcionando
  // con el catálogo completo (antes de 060 todo era preoperacional).
  if (lista === "DOTACION") return [];
  const { data: legacy } = await supabase
    .from("checklist_items")
    .select("id, categoria, descripcion, cantidad_esperada, orden, activo")
    .eq("activo", true)
    .order("orden", { ascending: true });
  return legacy || [];
}

export async function getAssignedVehicles(userId: string) {
  const supabase = createClient();
  const hoy = hoyBogota();

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

  const profile = await requireRole(["OVEM", "ADMIN", "ANALISTA"]);
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

  const profile = await requireRole(["OVEM", "ADMIN", "ANALISTA"]);
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
  const hoy = hoyBogota();
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
  const hoy = hoyBogota();

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

// ─── Dotación e insumos ──────────────────────────────────────────────────────

const ROLES_DOTACION = ["AUXILIAR_ENFERMERIA", "ADMIN", "ANALISTA"] as const;

export async function getSupplyCheckForToday(vehicleId: string) {
  const profile = await requireRole([...ROLES_DOTACION]);
  const supabase = createClient();
  const { data: check } = await supabase
    .from("supply_checks")
    .select("id, observaciones")
    .eq("user_id", profile.user_id)
    .eq("vehicle_id", vehicleId)
    .eq("fecha", hoyOvem())
    .maybeSingle();
  if (!check) return null;

  const { data: items } = await supabase
    .from("supply_check_items")
    .select("checklist_item_id, estado, observacion, cantidad_ok")
    .eq("supply_check_id", check.id);
  return { observaciones: check.observaciones as string | null, items: items ?? [] };
}

export async function submitSupplyCheck(data: {
  vehicleId: string;
  observaciones?: string;
  items: Array<{
    checklistItemId: number;
    estado: "OK" | "FALLA" | "NO_APLICA";
    cantidadOk?: number;
    observacion?: string;
  }>;
}) {
  const parsed = supplyCheckSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const row = parsed.data;

  const profile = await requireRole([...ROLES_DOTACION]);
  const supabase = createClient();
  const faltantes = row.items.filter((it) => it.estado === "FALLA").length;

  const { data: check, error: checkError } = await supabase
    .from("supply_checks")
    .upsert(
      {
        user_id: profile.user_id,
        vehicle_id: row.vehicleId,
        fecha: hoyOvem(),
        completo: faltantes === 0,
        observaciones: row.observaciones?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,vehicle_id,fecha" }
    )
    .select("id")
    .single();
  if (checkError || !check) return { error: checkError?.message ?? "No se pudo guardar la dotación" };

  const { error: itemsError } = await supabase.from("supply_check_items").upsert(
    row.items.map((it) => ({
      supply_check_id: check.id,
      checklist_item_id: it.checklistItemId,
      estado: it.estado,
      cantidad_ok: it.cantidadOk ?? null,
      observacion: it.observacion?.trim() || null,
    })),
    { onConflict: "supply_check_id,checklist_item_id" }
  );
  if (itemsError) return { error: itemsError.message };

  revalidatePath("/ovem");
  return { success: true, faltantes };
}

// ─── Combustible ─────────────────────────────────────────────────────────────

export async function submitOvemFuelLog(data: {
  vehicleId: string;
  fecha: string;
  kilometraje: number;
  galones: number;
  costo?: number;
  numeroVenta?: string;
}) {
  const parsed = ovemFuelLogSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const row = parsed.data;
  if (row.fecha > hoyOvem()) return { error: "La fecha del tanqueo no puede ser futura" };

  const profile = await requireRole(["OVEM", "ADMIN", "ANALISTA"]);
  const supabase = createClient();
  const { error } = await supabase.from("fuel_logs").insert({
    vehicle_id: row.vehicleId,
    fecha: row.fecha,
    kilometraje: row.kilometraje,
    galones: row.galones,
    costo: row.costo ?? null,
    numero_venta: row.numeroVenta || null,
    registrado_por: profile.user_id,
  });
  if (error) return { error: error.message };

  revalidatePath("/ovem");
  revalidatePath("/combustible");
  return { success: true };
}

// ─── Siniestros viales ───────────────────────────────────────────────────────

/**
 * Registra el siniestro y una novedad ligada, para que aparezca en el flujo
 * de novedades de Regulación y Mantenimiento. La novedad va primero: si el
 * vehículo no queda operativo, el trigger de incidents lo pasa a FDS.
 */
export async function reportRoadAccident(data: RoadAccidentFormData) {
  const parsed = roadAccidentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const row = parsed.data;

  const profile = await requireRole(["OVEM", "ADMIN", "ANALISTA", "REGULACION"]);
  const supabase = createClient();

  const resumen = [
    `Siniestro vial en ${row.lugar}.`,
    row.descripcion,
    row.pacienteABordo ? "Con paciente a bordo." : null,
    row.hayLesionados ? `Lesionados: ${row.lesionadosDetalle}.` : "Sin lesionados.",
    row.hayTerceros ? `Tercero: ${[row.terceroPlaca, row.terceroNombre].filter(Boolean).join(" · ")}.` : null,
    row.intervinoAutoridad ? `Intervino autoridad${row.numeroIpat ? `, IPAT ${row.numeroIpat}` : ""}.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const { data: incident, error: incidentError } = await supabase
    .from("incidents")
    .insert({
      vehicle_id: row.vehicleId,
      descripcion: resumen,
      severidad: row.hayLesionados || !row.vehiculoOperativo ? "ALTA" : "MEDIA",
      reportado_por: profile.nombre_completo || profile.email || "OVEM",
      afecta_operatividad: !row.vehiculoOperativo,
      estado: "ABIERTO",
    })
    .select("id")
    .single();
  if (incidentError || !incident) return { error: incidentError?.message ?? "No se pudo crear la novedad" };
  // Se registra en cuanto la novedad existe: si el detalle del siniestro falla más abajo, la novedad ya creada no queda sin rastro.
  await auditar("INSERTAR", "novedades", incident.id as number, "Siniestro vial reportado");

  const { error } = await supabase.from("road_accidents").insert({
    vehicle_id: row.vehicleId,
    reportado_por: profile.user_id,
    fecha_hora: new Date(row.fechaHora).toISOString(),
    lugar: row.lugar,
    descripcion: row.descripcion,
    paciente_a_bordo: row.pacienteABordo,
    hay_lesionados: row.hayLesionados,
    lesionados_detalle: row.hayLesionados ? row.lesionadosDetalle || null : null,
    hay_terceros: row.hayTerceros,
    tercero_placa: row.hayTerceros ? row.terceroPlaca?.toUpperCase() || null : null,
    tercero_nombre: row.hayTerceros ? row.terceroNombre || null : null,
    tercero_telefono: row.hayTerceros ? row.terceroTelefono || null : null,
    tercero_aseguradora: row.hayTerceros ? row.terceroAseguradora || null : null,
    intervino_autoridad: row.intervinoAutoridad,
    numero_ipat: row.intervinoAutoridad ? row.numeroIpat || null : null,
    vehiculo_operativo: row.vehiculoOperativo,
    incident_id: incident.id,
  });
  if (error) {
    return { error: `La novedad #${incident.id} quedó creada, pero el detalle del siniestro no se guardó: ${error.message}` };
  }

  revalidatePath("/ovem");
  revalidatePath("/novedades");
  revalidatePath("/regulacion");
  return { success: true, incidentId: incident.id as number };
}
