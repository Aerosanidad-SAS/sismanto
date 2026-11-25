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
