// Confirmación de los servicios programados (#383). Al armar o cambiar la tripulación de un móvil, la reasignación de sus
// servicios ya no es silenciosa: el regulador confirma que los PROGRAMADO del día quedaron asignados al móvil y a la
// tripulación que los van a hacer. Un servicio sin confirmar se marca «por confirmar»; si cambia el móvil o la
// tripulación, la confirmación se borra (la base lo hace sola: migración 145). Puro, para probarlo sin base de datos.

import { diaEnBogota } from "@/lib/fechas";

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
