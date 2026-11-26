// Reglas puras de la solicitud de asignación de vehículo (migración 141), sin base de datos para poder probarlas.

export const MIN_CARACTERES_NOTA = 5;

export type DecisionAsignacion = "CONFIRMAR" | "RECHAZAR";

/** Mensaje de error si la decisión no es válida; null si lo es. Rechazar exige explicar por qué. */
export function validarDecisionAsignacion(decision: string, nota?: string | null): string | null {
  if (decision !== "CONFIRMAR" && decision !== "RECHAZAR") return "Decisión inválida.";
  if (decision === "RECHAZAR" && (nota ?? "").trim().length < MIN_CARACTERES_NOTA) {
    return `Explica por qué rechazas (mínimo ${MIN_CARACTERES_NOTA} caracteres).`;
  }
  return null;
}

/** Los operadores del vehículo ese día con el que llega, sin repetirlo y en el mismo orden. */
export function operadoresConLlegada(previos: string[], userId: string): string[] {
  return previos.includes(userId) ? previos : [...previos, userId];
}

/**
 * Mensaje de error si la solicitud ya no se puede confirmar; null si se puede. Se revisa al confirmar y no solo al pedir:
 * entre una cosa y la otra puede cambiar el día o llegar una solicitud de NO APTO.
 */
export function motivoNoConfirmable(s: { fechaSolicitud: string; hoy: string; noAptoPendiente: boolean }): string | null {
  if (s.fechaSolicitud !== s.hoy) return "La solicitud es de otro día: ya no se puede confirmar. Recházala o pide al conductor que la envíe de nuevo.";
  if (s.noAptoPendiente) return "El vehículo tiene una solicitud de NO APTO pendiente de aval: resuélvela antes o rechaza esta solicitud.";
  return null;
}

export type AvisoAsignacion = "OCULTO" | "CONFIRMADA" | "PENDIENTE" | "RECHAZADA" | "PEDIR";

/**
 * Qué le muestra el preoperacional al OVEM sobre el vehículo elegido. Manda la programación del día: si el vehículo está
 * asignado no se ofrece pedirlo (solo se confirma la respuesta, si la hubo) y, si lo retiraron después de confirmarle,
 * puede volver a pedirlo. `enviadaAhora` cubre el instante entre enviar y recibir la solicitud ya guardada.
 */
export function avisoAsignacion(s: {
  vehicleId: string;
  asignadoHoy: boolean;
  solicitud: { vehicleId: string; estado: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" } | null;
  enviadaAhora: boolean;
}): AvisoAsignacion {
  const estado = s.solicitud?.vehicleId === s.vehicleId ? s.solicitud.estado : null;
  if (s.asignadoHoy) return estado === "CONFIRMADA" ? "CONFIRMADA" : "OCULTO";
  if (estado === "PENDIENTE" || estado === "RECHAZADA") return estado;
  return estado === null && s.enviadaAhora ? "PENDIENTE" : "PEDIR";
}
