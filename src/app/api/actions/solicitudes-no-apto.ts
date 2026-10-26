"use server";

import { revalidatePath } from "next/cache";
import { auditar } from "@/lib/auditoria";
import { centroVisible } from "@/lib/auth-utils";
import { avisarVehiculoNoApto } from "@/lib/notifications/alerta-no-apto";
import { validarDecision, validarMotivo, type DecisionNoApto, type OrigenSolicitud } from "@/lib/solicitud-no-apto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile, requireRole } from "./auth";

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este repo (ver CLAUDE.md).
type Fila = Record<string, any>;

export interface SolicitudNoApto {
  id: number;
  vehicleId: string;
  placa: string;
  centro: string | null;
  origen: OrigenSolicitud;
  motivo: string;
  solicitadoPor: string;
  solicitadoAt: string;
}

/**
 * El OVEM (o Regulación) pide que un vehículo quede NO APTO. No cambia el estado del vehículo: abre una solicitud que
 * debe avalar Coordinación del CRA o el administrador, y mientras tanto el vehículo queda en bloqueo provisional.
 * Si ya hay una solicitud pendiente de ese vehículo, no abre otra: se ata el nuevo reporte a la existente.
 */
export async function crearSolicitudNoApto(args: { vehicleId: string; motivo: string; origen: OrigenSolicitud; incidentId?: number }) {
  const profile = await requireRole(["OVEM", "REGULACION", "ADMIN"]);
  const malo = validarMotivo(args.motivo);
  if (malo) return { error: malo };

  const supabase = createClient() as any;
  const { data: existente } = await supabase.from("vehicle_no_apto_solicitudes").select("id").eq("vehicle_id", args.vehicleId).eq("estado", "PENDIENTE").maybeSingle();
  if (existente) return { success: true, id: existente.id as number, yaPendiente: true };

  const { data, error } = await supabase
    .from("vehicle_no_apto_solicitudes")
    .insert({
      vehicle_id: args.vehicleId,
      incident_id: args.incidentId ?? null,
      origen: args.origen,
      motivo: args.motivo.trim(),
      solicitado_por: profile.user_id,
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "No se pudo enviar la solicitud" };

  await auditar("INSERTAR", "vehiculos", args.vehicleId, "Solicitud de NO APTO (pendiente de aval)");
  await avisarVehiculoNoApto(supabase, { vehicleId: args.vehicleId, hallazgos: [args.motivo.trim()], reportadoPor: profile.nombre_completo || profile.email || "OVEM", tipo: "SOLICITUD" });
  revalidatePath("/regulacion");
  revalidatePath("/novedades");
  revalidatePath("/coordinacion");
  revalidatePath("/ovem");
  return { success: true, id: data.id as number, yaPendiente: false };
}

/**
 * ¿Tiene este vehículo una solicitud de NO APTO pendiente? Para bloquear asignarle tripulación o un servicio
 * mientras se resuelve — "el OVEM no decide a criterio sacar un vehículo de servicio" solo es cierto si algo más
 * que la pantalla de Solicitudes NO APTO lo hace cumplir. Con la clave de servicio: la pregunta es un hecho del
 * vehículo, no un dato sobre la solicitud, así que no debe depender de si quien pregunta puede leer esa tabla (el
 * propio OVEM, al auto-asignarse, normalmente no podría).
 */
export async function tieneNoAptoPendiente(vehicleId: string): Promise<boolean> {
  // Es una acción de servidor expuesta (y usa la clave de servicio): sin sesión no responde. Todos los llamadores reales tienen sesión.
  if (!(await getProfile())) return false;
  const { data } = await createAdminClient()
    .from("vehicle_no_apto_solicitudes")
    .select("id")
    .eq("vehicle_id", vehicleId)
    .eq("estado", "PENDIENTE")
    .maybeSingle();
  return Boolean(data);
}

/** Solicitudes pendientes visibles para quien consulta (Coordinación: solo las de su centro). */
export async function getSolicitudesNoAptoPendientes(): Promise<SolicitudNoApto[]> {
  await requireRole(["ADMIN", "ANALISTA", "GERENCIAL", "REGULACION", "COORDINACION", "MANTENIMIENTO"]);
  const supabase = createClient() as any;
  const { data } = await supabase
    .from("vehicle_no_apto_solicitudes")
    .select("id, vehicle_id, origen, motivo, solicitado_por, solicitado_at, vehicles(placa, centro_operativo)")
    .eq("estado", "PENDIENTE")
    .order("solicitado_at", { ascending: true });
  const centro = centroVisible(await getProfile());
  const filas = ((data ?? []) as Fila[]).filter((f) => !centro || f.vehicles?.centro_operativo === centro.codigo);

  const ids = Array.from(new Set(filas.map((f) => f.solicitado_por as string)));
  const { data: perfiles } = ids.length > 0 ? await supabase.from("user_profiles").select("user_id, nombre_completo, email").in("user_id", ids) : { data: [] };
  const nombre = new Map(((perfiles ?? []) as Fila[]).map((p) => [p.user_id as string, (p.nombre_completo || p.email || "") as string]));

  return filas.map((f) => ({
    id: f.id,
    vehicleId: f.vehicle_id,
    placa: f.vehicles?.placa ?? "",
    centro: f.vehicles?.centro_operativo ?? null,
    origen: f.origen,
    motivo: f.motivo,
    solicitadoPor: nombre.get(f.solicitado_por) ?? "",
    solicitadoAt: f.solicitado_at,
  }));
}

/**
 * Avalar o rechazar. Avalar deja el vehículo FUERA_DE_SERVICIO (con fecha e historial, igual que el cambio manual de
 * Regulación); rechazar lo deja como estaba y exige una nota. Coordinación solo resuelve las de su centro.
 */
export async function resolverSolicitudNoApto(id: number, decision: DecisionNoApto, nota?: string) {
  await requireRole(["ADMIN", "COORDINACION", "MANTENIMIENTO"]);
  const malo = validarDecision(decision, nota);
  if (malo) return { error: malo };

  // Migración 138: la solicitud, el estado del vehículo y el historial se escriben en una sola transacción dentro de la
  // base, que también valida el rol y el centro. Antes eran tres escrituras con la sesión de quien resuelve, y la RLS de
  // `vehicles` filtraba en silencio el UPDATE de Coordinación y Mantenimiento: la solicitud quedaba avalada y el vehículo
  // seguía operativo.
  const supabase = createClient() as any;
  const { data, error } = await supabase.rpc("resolver_solicitud_no_apto", { p_id: id, p_decision: decision, p_nota: nota?.trim() || null });
  if (error) return { error: error.message };
  if (!data?.ok) return { error: (data?.error as string | undefined) ?? "No se pudo resolver la solicitud." };

  const aval = decision === "AVALAR";
  await auditar("MODIFICAR", "vehiculos", data.vehicle_id as string, "Solicitud de NO APTO " + (aval ? "avalada" : "rechazada"));
  revalidatePath("/regulacion");
  revalidatePath("/vehiculos");
  revalidatePath("/novedades");
  revalidatePath("/coordinacion");
  revalidatePath("/ovem");
  revalidatePath("/");
  return { success: true };
}
