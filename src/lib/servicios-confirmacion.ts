// Confirmación de los servicios programados (#383). Al armar o cambiar la tripulación de un móvil, la reasignación de sus
// servicios ya no es silenciosa: el regulador confirma que los PROGRAMADO del día quedaron asignados al móvil y a la
// tripulación que los van a hacer. Un servicio sin confirmar se marca «por confirmar»; si cambia el móvil o la
// tripulación, la confirmación se borra (la base lo hace sola: migración 145). Sin dependencias de servidor, para probarlo sin base.

import { diaEnBogota } from "@/lib/fechas";
import { tripulacionPorCompletar } from "@/lib/servicio-detalle";

export interface ServicioConfirmable {
  etapa: string;
  vehicle_id?: string | null;
  confirmado_at?: string | null;
  fecha_hora_programacion?: string | null;
}

/**
 * ¿Falta confirmarlo? PROGRAMADO, con móvil, sin confirmar y programado hoy o después (hora de Colombia). Los programados
 * de días pasados no cuentan: son servicios viejos sin cerrar, no una asignación por revisar. `hoy` es el día de hoy en Bogotá.
 */
export function porConfirmar(s: ServicioConfirmable, hoy: string): boolean {
  if (s.etapa !== "PROGRAMADO" || !s.vehicle_id || s.confirmado_at) return false;
  if (!s.fecha_hora_programacion) return true;
  return diaEnBogota(s.fecha_hora_programacion) >= hoy;
}

export function serviciosPorConfirmarDelDia<T extends ServicioConfirmable>(servicios: readonly T[], hoy: string): T[] {
  return servicios.filter((s) => porConfirmar(s, hoy));
}

/** Quienes pueden confirmar (a mano, o al crear el servicio ya completo). */
export const ROLES_CONFIRMAN = ["ADMIN", "ANALISTA", "REGULACION"] as const;

export interface ServicioNuevo {
  etapa: string;
  tipo_servicio: string;
  vehicle_id?: string | null;
  ovem_user_id?: string | null;
  medico_user_id?: string | null;
  auxiliar_user_id?: string | null;
}

/**
 * Un servicio que Regulación crea ya PROGRAMADO, con móvil y con la tripulación completa de su tipo (el OVEM siempre)
 * nace confirmado (#383): quien lo crea acaba de elegirlos. Devuelve las columnas a insertar, o nada (por confirmar).
 */
export function confirmacionAlCrear(
  s: ServicioNuevo,
  creador: { user_id?: string | null; role_codigo?: string | null } | null | undefined,
  ahora: string = new Date().toISOString()
): { confirmado_at?: string; confirmado_por?: string } {
  if (!creador?.user_id || !(ROLES_CONFIRMAN as readonly string[]).includes(creador.role_codigo ?? "")) return {};
  if (s.etapa !== "PROGRAMADO" || !s.vehicle_id) return {};
  const faltan = tripulacionPorCompletar(s.tipo_servicio, { ovem: s.ovem_user_id, medico: s.medico_user_id, auxiliar: s.auxiliar_user_id });
  return faltan.length === 0 ? { confirmado_at: ahora, confirmado_por: creador.user_id } : {};
}

/** Filtro de PostgREST (`.or`) para «de hoy en adelante o sin hora», en hora de Colombia. */
export function filtroDesdeHoy(hoy: string): string {
  return `fecha_hora_programacion.is.null,fecha_hora_programacion.gte.${hoy}T00:00:00-05:00`;
}

/**
 * Borra la confirmación de los servicios PROGRAMADO de los móviles cuyo equipo cambió. Devuelve cuántos quedaron por
 * confirmar. `db` es el cliente de Supabase de la sesión (tipado laxo: en este repo colapsa a `never`).
 */
export async function quitarConfirmacion(db: any, vehicleIds: string[]): Promise<number> {
  if (vehicleIds.length === 0) return 0;
  const { data } = await db
    .from("medical_services")
    .update({ confirmado_at: null, confirmado_por: null, updated_at: new Date().toISOString() })
    .in("vehicle_id", [...new Set(vehicleIds)])
    .eq("etapa", "PROGRAMADO")
    .not("confirmado_at", "is", null)
    .select("id");
  return (data ?? []).length;
}
