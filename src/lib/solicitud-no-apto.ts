// Reglas puras de las solicitudes de NO APTO con aval (migración 109): sin base de datos, para poder probarlas.

export type OrigenSolicitud = "SINIESTRO" | "REPORTE_OVEM";
export type EstadoSolicitud = "PENDIENTE" | "AVALADA" | "RECHAZADA";

export const MIN_CARACTERES_MOTIVO = 5;

/** Un siniestro pide NO APTO si hay lesionados o el OVEM declara el vehículo no operativo (decisión del 2026-10-02). */
export function siniestroPideNoApto(s: { hayLesionados: boolean; vehiculoOperativo: boolean }): boolean {
  return s.hayLesionados || !s.vehiculoOperativo;
}

export function validarMotivo(motivo: string): string | null {
  return motivo.trim().length >= MIN_CARACTERES_MOTIVO ? null : "Cuéntanos qué pasó con el vehículo (mínimo " + MIN_CARACTERES_MOTIVO + " caracteres).";
}

export type DecisionNoApto = "AVALAR" | "RECHAZAR";

/** El rechazo exige una nota: quien pidió el NO APTO debe saber por qué se le negó. */
export function validarDecision(decision: DecisionNoApto, nota: string | undefined): string | null {
  if (decision === "RECHAZAR" && (nota ?? "").trim().length < MIN_CARACTERES_MOTIVO) return "Explica por qué rechazas la solicitud (mínimo " + MIN_CARACTERES_MOTIVO + " caracteres).";
  return null;
}

/**
 * ¿Puede este rol resolver una solicitud de este vehículo? Coordinación solo la de su centro; el administrador, todas.
 * (La RLS de la base permite a los dos roles: la restricción por centro se aplica aquí, como en el resto del sistema.)
 */
export function puedeResolver(rol: string, centroDelRevisor: string | null, centroDelVehiculo: string | null): boolean {
  if (rol === "ADMIN") return true;
  if (rol === "COORDINACION") return Boolean(centroDelRevisor) && centroDelRevisor === centroDelVehiculo;
  return false;
}

export interface TextoBloqueo {
  titulo: string;
  detalle: string;
}

/** Lo que ve el OVEM y Regulación mientras la solicitud espera aval. */
export function textoBloqueoProvisional(): TextoBloqueo {
  return {
    titulo: "NO APTO — pendiente de aval",
    detalle: "No operes este vehículo ni le asignes servicios hasta que Coordinación o Mantenimiento resuelvan la solicitud.",
  };
}
