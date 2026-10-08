"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { centroVisible } from "@/lib/auth-utils";
import { hoyBogota } from "@/lib/fechas";
import { alertasDocumentosVehiculos, type AlertaVehiculo } from "@/lib/alertas-vehiculos";

/** Quién ve la campana: los roles que ya ven la flota. Para los demás no hay campana (no es un error). */
const ROLES_CAMPANA = ["ADMIN", "REGULACION", "ANALISTA", "COORDINACION", "MANTENIMIENTO"];
/** Los de la lista que además tienen la pantalla /vehiculos en su menú (Coordinación no): sin ella, no se ofrece el enlace. */
const ROLES_CON_VEHICULOS = ["ADMIN", "REGULACION", "ANALISTA", "MANTENIMIENTO"];

/**
 * Documentos de los vehículos (SOAT, técnico-mecánica, pase aeroportuario) vencidos o que vencen en el año, con
 * semáforo. Regulación y Coordinación ven los de su centro; Admin, Analista y Mantenimiento, todos. No usa `requireRole`
 * a propósito: se llama desde el menú de todas las pantallas y un rol sin campana no debe terminar redirigido.
 */
export async function getAlertasDocumentosVehiculos(): Promise<{ visible: boolean; verVehiculos: boolean; alertas: AlertaVehiculo[]; error?: boolean }> {
  const profile = await getProfile();
  if (!profile || !ROLES_CAMPANA.includes(profile.role_codigo)) return { visible: false, verVehiculos: false, alertas: [] };

  const supabase = createClient();
  const centro = centroVisible(profile);
  let query = supabase
    .from("vehicles")
    .select("placa, vencimiento_soat, vencimiento_rtm, vencimiento_tecnicomecanica, fecha_pase_aeroportuario")
    .order("placa")
    .limit(1000);
  if (centro) query = query.eq("centro_operativo", centro.codigo);
  const { data, error } = await query;
  // Un fallo de la base no debe verse como «Sin alertas activas»: se avisa para que la campana conserve lo último que vio.
  if (error) return { visible: true, verVehiculos: ROLES_CON_VEHICULOS.includes(profile.role_codigo), alertas: [], error: true };
  return {
    visible: true,
    verVehiculos: ROLES_CON_VEHICULOS.includes(profile.role_codigo),
    alertas: alertasDocumentosVehiculos(
      (data ?? []) as { placa: string; vencimiento_soat: string | null; vencimiento_rtm: string | null; vencimiento_tecnicomecanica: string | null; fecha_pase_aeroportuario: string | null }[],
      hoyBogota()
    ),
  };
}
