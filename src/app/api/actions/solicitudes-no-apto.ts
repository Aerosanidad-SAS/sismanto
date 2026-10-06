"use server";

import { revalidatePath } from "next/cache";
import { auditar } from "@/lib/auditoria";
import { centroVisible } from "@/lib/auth-utils";
import { hoyBogota } from "@/lib/fechas";
import { avisarVehiculoNoApto } from "@/lib/notifications/alerta-no-apto";
import { puedeResolver, validarDecision, validarMotivo, type DecisionNoApto, type OrigenSolicitud } from "@/lib/solicitud-no-apto";
import { createClient } from "@/lib/supabase/server";
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
  const profile = await requireRole(["ADMIN", "COORDINACION"]);
  const malo = validarDecision(decision, nota);
  if (malo) return { error: malo };

  const supabase = createClient() as any;
  const { data: sol } = await supabase
    .from("vehicle_no_apto_solicitudes")
    .select("id, vehicle_id, estado, vehicles(placa, centro_operativo, estado_actual)")
    .eq("id", id)
    .maybeSingle();
  if (!sol) return { error: "No encontramos la solicitud." };
  if (sol.estado !== "PENDIENTE") return { error: "Esta solicitud ya fue resuelta." };

  const centro = centroVisible(await getProfile());
  if (!puedeResolver(profile.role_codigo, centro?.codigo ?? null, sol.vehicles?.centro_operativo ?? null)) {
    return { error: "Solo puedes resolver las solicitudes de tu centro." };
  }

  const aval = decision === "AVALAR";
  const { error } = await supabase
    .from("vehicle_no_apto_solicitudes")
    .update({ estado: aval ? "AVALADA" : "RECHAZADA", revisado_por: profile.user_id, revisado_at: new Date().toISOString(), nota_revision: nota?.trim() || null })
    .eq("id", id)
    .eq("estado", "PENDIENTE");
  if (error) return { error: error.message };

  if (aval && sol.vehicles?.estado_actual !== "FUERA_DE_SERVICIO") {
    const anterior = sol.vehicles?.estado_actual ?? null;
    const { error: eVeh } = await supabase
      .from("vehicles")
      .update({ estado_actual: "FUERA_DE_SERVICIO", fds_desde: hoyBogota(), updated_at: new Date().toISOString() })
      .eq("id", sol.vehicle_id);
    if (eVeh) return { error: "La solicitud quedó avalada, pero no se pudo cambiar el estado del vehículo: " + eVeh.message };
    await supabase.from("vehicle_status_history").insert({
      vehicle_id: sol.vehicle_id,
      estado_nuevo: "FUERA_DE_SERVICIO",
      estado_anterior: anterior,
      registrado_por: profile.user_id,
      fecha_cambio: new Date().toISOString(),
      notas: "NO APTO avalado" + (nota?.trim() ? ": " + nota.trim() : ""),
    });
  }

  await auditar("MODIFICAR", "vehiculos", sol.vehicle_id, "Solicitud de NO APTO " + (aval ? "avalada" : "rechazada"));
  revalidatePath("/regulacion");
  revalidatePath("/vehiculos");
  revalidatePath("/novedades");
  revalidatePath("/coordinacion");
  revalidatePath("/ovem");
  revalidatePath("/");
  return { success: true };
}
