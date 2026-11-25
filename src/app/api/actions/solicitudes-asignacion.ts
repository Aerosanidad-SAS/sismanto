"use server";

import { revalidatePath } from "next/cache";
import { auditar } from "@/lib/auditoria";
import { centroVisible } from "@/lib/auth-utils";
import { hoyBogota } from "@/lib/fechas";
import { operadoresConLlegada, validarDecisionAsignacion, type DecisionAsignacion } from "@/lib/solicitud-asignacion";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile, requireRole } from "./auth";
import { cambiarOperadoresDelDia } from "./programacion";
import { tieneNoAptoPendiente } from "./solicitudes-no-apto";

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este repo (ver CLAUDE.md).
type Fila = Record<string, any>;

export interface SolicitudAsignacion {
  id: number;
  vehicleId: string;
  placa: string;
  centro: string | null;
  conductor: string;
  solicitadoAt: string;
}

export interface MiSolicitudAsignacion {
  vehicleId: string;
  placa: string;
  estado: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA";
  nota: string | null;
}

/**
 * El OVEM pide asignarse el vehículo que va a usar hoy (Regulación se lo dijo de palabra o él se anticipó). No cambia
 * la programación: abre una solicitud que Regulación confirma o rechaza en la sala de control. Si ya tenía otra
 * pendiente, la reemplaza.
 */
export async function solicitarAsignacionVehiculo(vehicleId: string) {
  const profile = await requireRole(["OVEM"]);
  if (await tieneNoAptoPendiente(vehicleId)) {
    return { error: "Este vehículo tiene una solicitud de NO APTO pendiente de aval: no se le puede asignar a nadie." };
  }
  const supabase = createClient() as any;
  const { data: veh } = await supabase.from("vehicles").select("id, placa").eq("id", vehicleId).maybeSingle();
  if (!veh) return { error: "No encontramos ese vehículo." };

  // Una pendiente por persona: la anterior se reemplaza (borrarla requiere la clave de servicio; no hay política de DELETE).
  await (createAdminClient() as any).from("vehicle_solicitudes_asignacion").delete().eq("user_id", profile.user_id).eq("estado", "PENDIENTE");
  const { error } = await supabase
    .from("vehicle_solicitudes_asignacion")
    .insert({ vehicle_id: vehicleId, user_id: profile.user_id, rol_en_turno: "OVEM", fecha: hoyBogota() });
  if (error) return { error: "No se pudo enviar la solicitud. Inténtalo de nuevo." };

  await auditar("INSERTAR", "regulacion", vehicleId, `Solicitud de asignación de vehículo (OVEM) ${veh.placa}`);
  revalidatePath("/regulacion");
  revalidatePath("/ovem");
  return { success: true };
}

/** La última solicitud de hoy de este conductor (pendiente o ya resuelta), para decirle qué pasó. */
export async function getMiSolicitudAsignacion(): Promise<MiSolicitudAsignacion | null> {
  const profile = await getProfile();
  if (!profile || profile.role_codigo !== "OVEM") return null;
  const { data } = await (createClient() as any)
    .from("vehicle_solicitudes_asignacion")
    .select("vehicle_id, estado, nota_revision, vehicles(placa)")
    .eq("user_id", profile.user_id)
    .eq("fecha", hoyBogota())
    .order("solicitado_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return { vehicleId: data.vehicle_id, placa: data.vehicles?.placa ?? "", estado: data.estado, nota: data.nota_revision ?? null };
}

/** Solicitudes pendientes de hoy para la sala de control (Regulación solo ve las de su centro). */
export async function getSolicitudesAsignacionPendientes(): Promise<SolicitudAsignacion[]> {
  await requireRole(["ADMIN", "ANALISTA", "REGULACION"]);
  const supabase = createClient() as any;
  const { data } = await supabase
    .from("vehicle_solicitudes_asignacion")
    .select("id, vehicle_id, user_id, solicitado_at, vehicles(placa, centro_operativo)")
    .eq("estado", "PENDIENTE")
    .eq("fecha", hoyBogota())
    .order("solicitado_at", { ascending: true });
  const centro = centroVisible(await getProfile());
  const filas = ((data ?? []) as Fila[]).filter((f) => !centro || f.vehicles?.centro_operativo === centro.codigo);
  const ids = Array.from(new Set(filas.map((f) => f.user_id as string)));
  const { data: perfiles } = ids.length > 0 ? await supabase.from("user_profiles").select("user_id, nombre_completo, email").in("user_id", ids) : { data: [] };
  const nombre = new Map(((perfiles ?? []) as Fila[]).map((p) => [p.user_id as string, (p.nombre_completo || p.email || "") as string]));
  return filas.map((f) => ({
    id: f.id,
    vehicleId: f.vehicle_id,
    placa: f.vehicles?.placa ?? "",
    centro: f.vehicles?.centro_operativo ?? null,
    conductor: nombre.get(f.user_id) ?? "",
    solicitadoAt: f.solicitado_at,
  }));
}

/**
 * Confirmar mete al conductor en la programación de hoy del vehículo (con la misma acción y las mismas reglas que
 * Regulación usa a mano: si viene de otro vehículo, sale de él); rechazar exige una nota que el OVEM verá.
 */
export async function resolverSolicitudAsignacion(id: number, decision: DecisionAsignacion, nota?: string) {
  const profile = await requireRole(["ADMIN", "REGULACION"]);
  const malo = validarDecisionAsignacion(decision, nota);
  if (malo) return { error: malo };

  const admin = createAdminClient() as any;
  const { data: sol } = await admin.from("vehicle_solicitudes_asignacion").select("*, vehicles(placa, centro_operativo)").eq("id", id).maybeSingle();
  if (!sol || sol.estado !== "PENDIENTE") return { error: "La solicitud ya fue resuelta." };
  const centro = centroVisible(profile);
  if (centro && sol.vehicles?.centro_operativo !== centro.codigo) return { error: "Esa solicitud es de otro centro operativo." };

  if (decision === "CONFIRMAR") {
    const hoy = hoyBogota();
    const { data: prev } = await admin.from("vehicle_operacion_diaria").select("user_id").eq("vehicle_id", sol.vehicle_id).eq("fecha", hoy);
    const operadores = operadoresConLlegada(((prev ?? []) as Fila[]).map((f) => f.user_id as string), sol.user_id);
    const texto = "Autoasignación pedida por el OVEM y confirmada por Regulación";
    const r = await cambiarOperadoresDelDia(sol.vehicle_id, hoy, operadores, texto, { razonCodigo: "AJUSTE_OPERATIVO", razonTexto: texto });
    if (r && "error" in r && r.error) return { error: r.error };
  }

  const { error } = await admin
    .from("vehicle_solicitudes_asignacion")
    .update({
      estado: decision === "CONFIRMAR" ? "CONFIRMADA" : "RECHAZADA",
      revisado_por: profile.user_id,
      revisado_at: new Date().toISOString(),
      nota_revision: nota?.trim() || null,
    })
    .eq("id", id)
    .eq("estado", "PENDIENTE");
  if (error) return { error: "No se pudo cerrar la solicitud. Revisa el estado en la programación." };

  await auditar("MODIFICAR", "regulacion", sol.vehicle_id, `Solicitud de asignación ${decision === "CONFIRMAR" ? "confirmada" : "rechazada"} (${sol.vehicles?.placa ?? ""})`);
  revalidatePath("/regulacion");
  revalidatePath("/ovem");
  return { success: true };
}
