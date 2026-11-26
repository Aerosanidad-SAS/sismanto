"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { hoyBogota } from "@/lib/fechas";
import { requireRole } from "./auth";
import { filtroDesdeHoy, ROLES_CONFIRMAN, serviciosPorConfirmarDelDia } from "@/lib/servicios-confirmacion";

export interface ServicioPorConfirmar {
  id: number;
  tipo_servicio: string;
  fecha_hora_programacion: string | null;
  ovem: string | null;
  medico: string | null;
  auxiliar: string | null;
}

/**
 * Servicios PROGRAMADO de hoy en adelante de un móvil que el regulador aún no confirma, con la tripulación que tiene cada
 * servicio (no la del móvil: es justo lo que se compara). La RLS recorta a lo que el regulador ve de su centro.
 */
export async function getServiciosPorConfirmar(vehicleId: string): Promise<ServicioPorConfirmar[]> {
  await requireRole([...ROLES_CONFIRMAN]);
  if (!z.string().uuid().safeParse(vehicleId).success) return [];
  const supabase = createClient() as any;
  const hoy = hoyBogota();
  const { data, error } = await supabase
    .from("medical_services")
    .select("id, tipo_servicio, etapa, vehicle_id, fecha_hora_programacion, confirmado_at, ovem_user_id, medico_user_id, auxiliar_user_id")
    .eq("vehicle_id", vehicleId)
    .eq("etapa", "PROGRAMADO")
    .is("confirmado_at", null)
    // En la consulta y no solo después: los programados viejos sin cerrar no deben llenar el tope y tapar los de hoy.
    .or(filtroDesdeHoy(hoy))
    .order("fecha_hora_programacion", { ascending: true, nullsFirst: false })
    .limit(200);
  // Un fallo no puede parecer «no hay nada por confirmar»: el diálogo muestra el error.
  if (error) throw new Error("No se pudieron leer los servicios por confirmar");
  const filas = serviciosPorConfirmarDelDia((data ?? []) as any[], hoy);
  const ids = [...new Set(filas.flatMap((s) => [s.ovem_user_id, s.medico_user_id, s.auxiliar_user_id]).filter(Boolean))] as string[];
  const { data: personas } = ids.length
    ? await supabase.from("user_profiles").select("user_id, nombre_completo, email").in("user_id", ids)
    : { data: [] };
  const nombre = new Map<string, string>((personas ?? []).map((p: any) => [p.user_id, p.nombre_completo || p.email || "—"]));
  const de = (id: string | null) => (id ? nombre.get(id) ?? "—" : null);
  return filas.map((s) => ({
    id: s.id,
    tipo_servicio: s.tipo_servicio,
    fecha_hora_programacion: s.fecha_hora_programacion,
    ovem: de(s.ovem_user_id),
    medico: de(s.medico_user_id),
    auxiliar: de(s.auxiliar_user_id),
  }));
}

/** Confirma servicios PROGRAMADO: quedan marcados con quién y cuándo. Los que ya no estén programados o ya estén confirmados se ignoran. */
export async function confirmarServicios(servicioIds: number[]) {
  const profile = await requireRole([...ROLES_CONFIRMAN]);
  const ids = z.array(z.number().int().positive()).min(1).max(500).safeParse(servicioIds);
  if (!ids.success) return { error: "Elige al menos un servicio para confirmar." };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("medical_services")
    .update({ confirmado_at: new Date().toISOString(), confirmado_por: profile.user_id } as never)
    .in("id", ids.data)
    .eq("etapa", "PROGRAMADO")
    .not("vehicle_id", "is", null)
    .is("confirmado_at", null)
    .select("id");
  if (error) return { error: error.message };
  const confirmados = ((data ?? []) as { id: number }[]).map((s) => s.id);
  if (confirmados.length > 0) await auditar("MODIFICAR", "servicios", confirmados[0], `Servicios programados confirmados: ${confirmados.join(", ")}`);
  revalidatePath("/regulacion");
  revalidatePath("/servicios");
  return { success: true as const, confirmados };
}
