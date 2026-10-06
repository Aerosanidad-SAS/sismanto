/**
 * Hora (0–23, Colombia) desde la que un preoperacional pendiente se considera incumplido. Valor provisional:
 * Daniel debe confirmar a qué hora arranca el turno; cambiarlo aquí ajusta todas las pantallas.
 */
export const HORA_LIMITE_PREOPERACIONAL = 8;

/** Hora actual en Colombia (0–23), sin depender de la zona horaria del servidor. */
export function horaBogota(ahora: Date = new Date()): number {
  const hora = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "America/Bogota" }).format(ahora);
  return Number(hora);
}
