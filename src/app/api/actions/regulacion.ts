"use server";

import { esDia, hoyBogota, sumarDias } from "@/lib/fechas";
import { camposTripulacionDestino, serviciosMovibles, tripulacionVigente } from "@/lib/cambio-vehiculo";
import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { getProfile, requireRole } from "./auth";
import { centroVisible } from "@/lib/auth-utils";
import { errorSiVehiculoDeOtroCentro } from "@/lib/vehiculo-centro";
import { diasHasta, documentosVehiculo, fechaBogota, type DocumentoVehiculo } from "@/lib/vencimientos";
import { revalidatePath } from "next/cache";
import { perfilFormularioServicio, toggleVehicleStatusSchema, vehicleAssignmentSchema } from "@/lib/validations";
import { tieneNoAptoPendiente } from "./solicitudes-no-apto";
import { z } from "zod";
import { inicioVentanaAbiertos } from "@/lib/servicios-abiertos";

export async function toggleVehicleStatus(vehicleId: string, nuevoEstado: "OPERATIVO" | "FUERA_DE_SERVICIO") {
  const profile = await requireRole(["ADMIN", "ANALISTA", "REGULACION", "MANTENIMIENTO"]);

  const parsed = toggleVehicleStatusSchema.safeParse({ vehicleId, nuevoEstado });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();

  const otroCentro = await errorSiVehiculoDeOtroCentro(supabase, profile, parsed.data.vehicleId);
  if (otroCentro) return { error: otroCentro };

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
): Promise<number> {
  const { data } = await supabase
    .from("medical_services")
    .update({ [CAMPO_TRIPULACION[rol]]: userId, updated_at: new Date().toISOString() })
    .eq("vehicle_id", vehicleId)
    .eq("etapa", "PROGRAMADO")
    .is("fecha_hora_inicio_desplazamiento", null)
    .select("id");
  return (data ?? []).length;
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
  // Bloqueo provisional (migración 113): mientras una solicitud de NO APTO espera aval, nadie —ni el propio
  // OVEM autoasignándose— pone tripulación en ese vehículo.
  if (await tieneNoAptoPendiente(parsed.data.vehicleId)) {
    return { error: "Este vehículo tiene una solicitud de NO APTO pendiente de aval — no se le puede asignar tripulación." };
  }

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
  const reasignados = await reasignarServiciosNoIniciados(supabase, parsed.data.vehicleId, parsed.data.rol, parsed.data.userId);
  await auditar("MODIFICAR", "regulacion", parsed.data.vehicleId, `Tripulación asignada (rol ${parsed.data.rol}); servicios reasignados: ${reasignados}`);
  revalidatePath("/regulacion");
  revalidatePath("/servicios");
  return { success: true, reasignados };
}

/**
 * Tripulación que tenía el vehículo ayer, por rol (para "Repetir tripulación de ayer").
 * Solo lee: el regulador revisa los campos y confirma con "Guardar tripulación".
 * Por rol toma la asignación más reciente que ya había empezado ayer y no había terminado.
 */
export async function getTripulacionDeAyer(vehicleId: string) {
  await requireRole(["ADMIN", "ANALISTA", "REGULACION"]);
  const idParsed = z.string().uuid().safeParse(vehicleId);
  if (!idParsed.success) return { error: "Vehículo inválido" };

  const ayer = sumarDias(hoyBogota(), -1);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicle_assignments")
    .select("user_id, rol_en_turno, fecha_inicio, id")
    .eq("vehicle_id", idParsed.data)
    .lte("fecha_inicio", ayer)
    .or(`fecha_fin.is.null,fecha_fin.gte.${ayer}`)
    .order("fecha_inicio", { ascending: false })
    .order("id", { ascending: false });
  if (error) return { error: error.message };

  const porRol: Partial<Record<"OVEM" | "MEDICO" | "AUXILIAR_ENFERMERIA", string>> = {};
  for (const a of (data ?? []) as any[]) {
    const rol = a.rol_en_turno as keyof typeof CAMPO_TRIPULACION;
    if (rol in CAMPO_TRIPULACION && !porRol[rol]) porRol[rol] = a.user_id;
  }
  return { success: true as const, tripulacion: porRol };
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

const UUID_VEHICULO = z.string().uuid("Vehículo inválido");

export interface ServicioMovibleResumen {
  id: number;
  tipo_servicio: string;
  fecha_hora_programacion: string | null;
}

/**
 * Servicios de un vehículo que todavía se pueden mover a otro: PROGRAMADO y sin desplazamiento iniciado. Con `fecha`
 * solo los programados ese día (y los que no tienen hora de programación). Alimenta el «¿mover los N servicios?».
 */
export async function getServiciosMovibles(vehicleId: string, fecha?: string): Promise<ServicioMovibleResumen[]> {
  await requireRole(["ADMIN", "REGULACION"]);
  if (!UUID_VEHICULO.safeParse(vehicleId).success) return [];
  const supabase = createClient() as any;
  let q = supabase
    .from("medical_services")
    .select("id, tipo_servicio, fecha_hora_programacion, vehicle_id, etapa, fecha_hora_inicio_desplazamiento")
    .eq("vehicle_id", vehicleId)
    .eq("etapa", "PROGRAMADO")
    .is("fecha_hora_inicio_desplazamiento", null)
    .order("fecha_hora_programacion", { ascending: true, nullsFirst: false })
    .limit(500);
  if (fecha && esDia(fecha)) {
    q = q.or(`and(fecha_hora_programacion.gte.${fecha}T00:00:00-05:00,fecha_hora_programacion.lt.${sumarDias(fecha, 1)}T00:00:00-05:00),fecha_hora_programacion.is.null`);
  }
  const { data } = await q;
  const filas = (data ?? []) as any[];
  const movibles = new Set(serviciosMovibles(filas, vehicleId));
  return filas
    .filter((s) => movibles.has(s.id))
    .map((s) => ({ id: s.id, tipo_servicio: s.tipo_servicio, fecha_hora_programacion: s.fecha_hora_programacion }));
}

/**
 * Reasigna a otro vehículo los servicios del origen que NO han iniciado desplazamiento (Daniel, 2026-10-02: el
 * servicio pertenece al VEHÍCULO, no a la persona; Regulación lo reasigna para adaptarse a la operación). Los
 * iniciados nunca se mueven. La tripulación del servicio se recalcula con la vigente del destino (el médico solo en
 * los servicios de traslado, igual que el formulario). El destino debe estar OPERATIVO. Con `servicioIds` solo se
 * mueven esos (los que no cumplan se ignoran).
 */
export async function reasignarServiciosAVehiculo(vehicleOrigenId: string, vehicleDestinoId: string, servicioIds?: number[]) {
  await requireRole(["ADMIN", "REGULACION"]);
  const o = UUID_VEHICULO.safeParse(vehicleOrigenId);
  const d = UUID_VEHICULO.safeParse(vehicleDestinoId);
  if (!o.success || !d.success) return { error: "Vehículo inválido" };
  if (vehicleOrigenId === vehicleDestinoId) return { error: "El vehículo de origen y el de destino son el mismo." };
  const ids = servicioIds === undefined ? undefined : z.array(z.number().int().positive()).max(500).safeParse(servicioIds);
  if (ids && !ids.success) return { error: "Servicios inválidos" };

  const supabase = createClient() as any;
  const centro = centroVisible(await getProfile());
  const { data: vehiculos } = await supabase.from("vehicles").select("id, placa, estado_actual, centro_operativo").in("id", [vehicleOrigenId, vehicleDestinoId]);
  const origen = (vehiculos ?? []).find((v: any) => v.id === vehicleOrigenId);
  const destino = (vehiculos ?? []).find((v: any) => v.id === vehicleDestinoId);
  if (!origen || !destino) return { error: "No se encontró alguno de los vehículos." };
  if (destino.estado_actual !== "OPERATIVO") return { error: `La ${destino.placa} no está operativa: elige otro vehículo de destino.` };
  if (centro && (origen.centro_operativo !== centro.codigo || destino.centro_operativo !== centro.codigo)) {
    return { error: "Solo puedes mover servicios entre vehículos de tu centro." };
  }

  const { data: servicios } = await supabase
    .from("medical_services")
    .select("id, vehicle_id, etapa, fecha_hora_inicio_desplazamiento, tipo_servicio")
    .eq("vehicle_id", vehicleOrigenId)
    .eq("etapa", "PROGRAMADO")
    .is("fecha_hora_inicio_desplazamiento", null)
    .limit(1000);
  const aMover = serviciosMovibles((servicios ?? []) as any[], vehicleOrigenId, ids?.data);
  if (aMover.length === 0) return { success: true as const, movidos: 0 };

  const hoy = hoyBogota();
  const { data: asignaciones } = await supabase
    .from("vehicle_assignments")
    .select("id, user_id, rol_en_turno, fecha_inicio")
    .eq("vehicle_id", vehicleDestinoId)
    .eq("activo", true)
    .lte("fecha_inicio", hoy)
    .or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`);
  const tripulacion = tripulacionVigente((asignaciones ?? []) as any[]);

  let operationalCenterId: number | null = null;
  if (destino.centro_operativo) {
    const { data: c } = await supabase.from("operational_centers").select("id").eq("codigo", destino.centro_operativo).maybeSingle();
    operationalCenterId = c?.id ?? null;
  }

  const porTipo = new Map<number, string>(((servicios ?? []) as any[]).map((s) => [s.id, s.tipo_servicio]));
  const conMedico = aMover.filter((id) => perfilFormularioServicio(porTipo.get(id) ?? "") === "TRASLADO");
  const sinMedico = aMover.filter((id) => !conMedico.includes(id));
  let movidos = 0;
  for (const [grupo, medicoDelVehiculo] of [[conMedico, true], [sinMedico, false]] as const) {
    if (grupo.length === 0) continue;
    // Las guardas van en el WHERE: si un servicio arrancó entre la lectura y la escritura, no se mueve.
    const { data: hechos, error } = await supabase
      .from("medical_services")
      .update({
        vehicle_id: vehicleDestinoId,
        ...camposTripulacionDestino(tripulacion, medicoDelVehiculo),
        ...(operationalCenterId !== null ? { operational_center_id: operationalCenterId } : {}),
        updated_at: new Date().toISOString(),
      })
      .in("id", grupo)
      .eq("vehicle_id", vehicleOrigenId)
      .eq("etapa", "PROGRAMADO")
      .is("fecha_hora_inicio_desplazamiento", null)
      .select("id");
    if (error) return { error: error.message, movidos };
    movidos += (hechos ?? []).length;
  }

  await auditar("MODIFICAR", "servicios", vehicleOrigenId, `Reasignados ${movidos} servicios sin iniciar de ${origen.placa} a ${destino.placa}`);
  revalidatePath("/regulacion");
  revalidatePath("/servicios");
  return { success: true as const, movidos };
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

  // Servicios: los abiertos de hoy y de los últimos días, más los cerrados de hoy. Los abiertos más antiguos no entran
  // (ver `servicios-abiertos.ts`): se cuentan aparte en `antiguosSinCerrar`.
  const desde = inicioVentanaAbiertos(hoy);
  let serviciosQuery = supabase
    .from("medical_services")
    .select("*, vehicles(placa)")
    .or(`and(etapa.in.(PROGRAMADO,CURSO),fecha_hora_programacion.gte.${desde}T00:00:00-05:00),fecha_hora_programacion.gte.${hoy}T00:00:00-05:00,fecha_hora_registro.gte.${hoy}T00:00:00-05:00`)
    .order("fecha_hora_programacion", { ascending: true, nullsFirst: false })
    .limit(300);
  if (centro) serviciosQuery = serviciosQuery.or(`operational_center_id.eq.${centro.id},operational_center_id.is.null`);
  const { data: servicios } = await serviciosQuery;

  let antiguosQuery = supabase
    .from("medical_services")
    .select("id", { count: "exact", head: true })
    .in("etapa", ["PROGRAMADO", "CURSO"])
    .lt("fecha_hora_programacion", `${desde}T00:00:00-05:00`);
  if (centro) antiguosQuery = antiguosQuery.or(`operational_center_id.eq.${centro.id},operational_center_id.is.null`);
  const { count: antiguosSinCerrar } = await antiguosQuery;

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

  return { hoy, servicios: serviciosDelDia, antiguosSinCerrar: antiguosSinCerrar ?? 0, vencimientos, mantenimiento };
}
