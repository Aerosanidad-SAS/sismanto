"use server";

import { hoyBogota } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { getProfile, requireRole } from "./auth";
import { centroVisible } from "@/lib/auth-utils";
import { diasHasta, documentosVehiculo, fechaBogota, type DocumentoVehiculo } from "@/lib/vencimientos";
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
  const hoy = hoyBogota();

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

  await auditar("MODIFICAR", "vehiculos", parsed.data.vehicleId, `Estado del vehículo: ${estadoAnterior ?? "?"} → ${parsed.data.nuevoEstado}`);
  revalidatePath("/regulacion");
  revalidatePath("/vehiculos");
  revalidatePath(`/vehiculos/${parsed.data.vehicleId}`);
  revalidatePath("/configuracion");
  revalidatePath("/");
  return { success: true };
}

const CAMPO_TRIPULACION = {
  OVEM: "ovem_user_id",
  MEDICO: "medico_user_id",
  AUXILIAR_ENFERMERIA: "auxiliar_user_id",
} as const;

/**
 * Decisión de Daniel (2026-09-21): si Regulación cambia la tripulación de un
 * vehículo, los servicios de ese vehículo que aún no inician desplazamiento
 * pasan a quien quedó en el rol (o quedan sin nadie en ese rol si se
 * desasignó). Los que ya iniciaron se quedan con quien los empezó.
 */
async function reasignarServiciosNoIniciados(
  supabase: ReturnType<typeof createClient>,
  vehicleId: string,
  rol: keyof typeof CAMPO_TRIPULACION,
  userId: string | null
) {
  await supabase
    .from("medical_services")
    .update({ [CAMPO_TRIPULACION[rol]]: userId, updated_at: new Date().toISOString() })
    .eq("vehicle_id", vehicleId)
    .eq("etapa", "PROGRAMADO")
    .is("fecha_hora_inicio_desplazamiento", null);
}

/**
 * Arma la tripulación de un vehículo para el turno — un vehículo puede
 * tener a la vez un OVEM, un médico y un auxiliar activos (roles
 * distintos), no solo un conductor. Reemplaza a assignVehicleToOvem.
 */
export async function asignarTripulacion(
  vehicleId: string,
  userId: string,
  rol: "OVEM" | "MEDICO" | "AUXILIAR_ENFERMERIA",
  fechaInicio: string,
  fechaFin?: string
) {
  const profile = await requireRole(["ADMIN", "ANALISTA", "REGULACION", "OVEM"]);

  // OVEM solo puede asignarse a sí mismo, y solo con rol OVEM
  if (profile.role_codigo === "OVEM" && (userId !== profile.user_id || rol !== "OVEM")) {
    return { error: "Un OVEM solo puede asignarse a sí mismo como conductor" };
  }

  const parseFin = fechaFin?.trim() ? fechaFin.trim() : undefined;
  const parsed = vehicleAssignmentSchema.safeParse({
    vehicleId,
    userId,
    rol,
    fechaInicio,
    fechaFin: parseFin ?? null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const fin = parsed.data.fechaFin?.trim() || null;

  // "Asignar o cambiar" — si ya hay alguien activo en ESE rol en este
  // vehículo, se desactiva antes de crear la nueva (un OVEM nuevo no debe
  // desactivar al médico que ya estaba activo en el mismo carro).
  await supabase
    .from("vehicle_assignments")
    .update({ activo: false })
    .eq("vehicle_id", parsed.data.vehicleId)
    .eq("rol_en_turno", parsed.data.rol)
    .eq("activo", true);

  const { error } = await supabase.from("vehicle_assignments").insert({
    user_id: parsed.data.userId,
    vehicle_id: parsed.data.vehicleId,
    rol_en_turno: parsed.data.rol,
    fecha_inicio: parsed.data.fechaInicio,
    fecha_fin: fin,
    activo: true,
    asignado_por: profile.user_id,
  });

  if (error) return { error: error.message };
  await reasignarServiciosNoIniciados(supabase, parsed.data.vehicleId, parsed.data.rol, parsed.data.userId);
  await auditar("MODIFICAR", "regulacion", parsed.data.vehicleId, `Tripulación asignada (rol ${parsed.data.rol})`);
  revalidatePath("/regulacion");
  revalidatePath("/servicios");
  return { success: true };
}

export async function unassignVehicle(assignmentId: number) {
  await requireRole(["ADMIN", "ANALISTA", "REGULACION"]);
  const idParsed = z.number().int().positive().safeParse(assignmentId);
  if (!idParsed.success) return { error: idParsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();

  const { data: asignacion, error } = await supabase
    .from("vehicle_assignments")
    .update({ activo: false })
    .eq("id", idParsed.data)
    .select("vehicle_id, rol_en_turno")
    .maybeSingle();

  if (error) return { error: error.message };
  const rol = asignacion?.rol_en_turno as keyof typeof CAMPO_TRIPULACION | undefined;
  if (asignacion && rol && rol in CAMPO_TRIPULACION) {
    await reasignarServiciosNoIniciados(supabase, asignacion.vehicle_id, rol, null);
  }
  await auditar("MODIFICAR", "regulacion", idParsed.data, "Asignación de tripulación finalizada");
  revalidatePath("/regulacion");
  revalidatePath("/servicios");
  return { success: true };
}

export async function getFleetWithAssignments() {
  const supabase = createClient();
  const hoy = hoyBogota();
  const centro = centroVisible(await getProfile());

  let vehiclesQuery = supabase
    .from("vehicles")
    .select("id, placa, marca, modelo, estado_actual, centro_operativo")
    .order("placa");
  if (centro) vehiclesQuery = vehiclesQuery.eq("centro_operativo", centro.codigo);
  const { data: vehicles } = await vehiclesQuery;

  const { data: assignments } = await supabase
    .from("vehicle_assignments")
    .select("id, vehicle_id, user_id, rol_en_turno, fecha_inicio, fecha_fin")
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

export async function getUsuariosPorRol(rolCodigo: "OVEM" | "MEDICO" | "AUXILIAR_ENFERMERIA" | "REGULACION") {
  const supabase = createClient();
  const { data: role } = await supabase.from("roles").select("id").eq("codigo", rolCodigo).single();
  if (!role) return [];
  let query = supabase
    .from("user_profiles")
    .select("user_id, nombre_completo, email")
    .eq("activo", true)
    .eq("role_id", role.id);
  // Personas de su centro, más las que aún no tienen centro asignado: sin
  // ellas, un centro recién configurado se quedaría sin a quién asignar.
  const centro = centroVisible(await getProfile());
  if (centro) query = query.or(`operational_center_id.eq.${centro.id},operational_center_id.is.null`);
  const { data } = await query;
  return data || [];
}

// ── Tablero de control de Regulación ──────────────────────────────────────

const VENTANA_VENCIMIENTOS_DIAS = 30;

export interface VencimientoVehiculo {
  placa: string;
  documento: DocumentoVehiculo;
  fecha: string;
  dias: number;
}

export interface MantenimientoPendiente {
  placa: string;
  descripcion: string;
  nivel: "ROJA" | "NARANJA";
  km_restantes: number | null;
  dias_restantes: number | null;
}

/**
 * Datos del tablero de Regulación, limitados al centro del usuario:
 * servicios del día (abiertos de cualquier fecha + los programados o
 * registrados hoy), vencimientos de documentos a 30 días y mantenimiento
 * vencido o próximo según el plan.
 */
export async function getTableroRegulacion() {
  await requireRole(["ADMIN", "ANALISTA", "REGULACION"]);
  const supabase = createClient();
  const centro = centroVisible(await getProfile());
  const hoy = fechaBogota(new Date());

  // Servicios: los abiertos de cualquier día más los cerrados de hoy.
  let serviciosQuery = supabase
    .from("medical_services")
    .select("*, vehicles(placa)")
    .or(`etapa.in.(PROGRAMADO,CURSO),fecha_hora_programacion.gte.${hoy}T00:00:00-05:00,fecha_hora_registro.gte.${hoy}T00:00:00-05:00`)
    .order("fecha_hora_programacion", { ascending: true, nullsFirst: false })
    .limit(300);
  if (centro) serviciosQuery = serviciosQuery.or(`operational_center_id.eq.${centro.id},operational_center_id.is.null`);
  const { data: servicios } = await serviciosQuery;

  const ids = new Set<string>();
  for (const s of (servicios ?? []) as any[]) {
    for (const id of [s.ovem_user_id, s.medico_user_id, s.auxiliar_user_id]) if (id) ids.add(id);
  }
  const { data: personas } = ids.size
    ? await supabase.from("user_profiles").select("user_id, nombre_completo, email").in("user_id", [...ids])
    : { data: [] as { user_id: string; nombre_completo: string | null; email: string | null }[] };
  const nombre = new Map((personas ?? []).map((p: any) => [p.user_id, p.nombre_completo || p.email || "—"]));

  const serviciosDelDia = ((servicios ?? []) as any[]).map((s) => ({
    ...s,
    placa: s.vehicles?.placa ?? s.movil_placa ?? null,
    ovem_nombre: s.ovem_user_id ? nombre.get(s.ovem_user_id) ?? null : null,
    medico_nombre: s.medico_user_id ? nombre.get(s.medico_user_id) ?? null : null,
    auxiliar_nombre: s.auxiliar_user_id ? nombre.get(s.auxiliar_user_id) ?? null : null,
  }));

  // Vencimientos de documentos del vehículo (vencidos o dentro de la ventana).
  let vehiculosQuery = supabase
    .from("vehicles")
    .select("placa, vencimiento_soat, vencimiento_rtm, vencimiento_tecnicomecanica, fecha_pase_aeroportuario")
    .order("placa");
  if (centro) vehiculosQuery = vehiculosQuery.eq("centro_operativo", centro.codigo);
  const { data: vehiculos } = await vehiculosQuery;

  const vencimientos: VencimientoVehiculo[] = [];
  for (const v of (vehiculos ?? []) as any[]) {
    for (const [documento, fecha] of documentosVehiculo(v)) {
      if (!fecha) continue;
      const dias = diasHasta(fecha, hoy);
      if (dias <= VENTANA_VENCIMIENTOS_DIAS) vencimientos.push({ placa: v.placa, documento, fecha, dias });
    }
  }
  vencimientos.sort((a, b) => a.dias - b.dias);

  // Mantenimiento del plan: vencido (ROJA) o próximo (NARANJA).
  let alertasQuery = supabase
    .from("vehicle_maintenance_alerts")
    .select("placa, descripcion, nivel_alerta, km_restantes, dias_restantes")
    .in("nivel_alerta", ["ROJA", "NARANJA"])
    .order("nivel_alerta", { ascending: false })
    .order("placa");
  if (centro) alertasQuery = alertasQuery.eq("centro_operativo", centro.codigo);
  const { data: alertas } = await alertasQuery;

  const mantenimiento: MantenimientoPendiente[] = ((alertas ?? []) as any[]).map((a) => ({
    placa: a.placa,
    descripcion: a.descripcion,
    nivel: a.nivel_alerta,
    km_restantes: a.km_restantes,
    dias_restantes: a.dias_restantes,
  }));

  return { hoy, servicios: serviciosDelDia, vencimientos, mantenimiento };
}
