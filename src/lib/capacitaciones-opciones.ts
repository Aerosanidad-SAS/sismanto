import type { UserRole } from "@/lib/auth-utils";

/**
 * Columnas de `training_question_options` que puede leer quien RINDE una evaluación: nunca `es_correcta` (migración 121:
 * la base tampoco se la entrega al rol `authenticated`).
 */
export const COLUMNAS_OPCION_PUBLICAS = "id, question_id, orden, texto";

/** Quién ve la clave de respuestas (quien arma y califica las evaluaciones). */
export function puedeVerRespuestasCorrectas(role: UserRole | string | null | undefined): boolean {
  return role === "ADMIN" || role === "COORDINACION";
}

/** `select` anidado de las opciones de cada pregunta, según quién consulta. */
export function seleccionOpciones(role: UserRole | string | null | undefined): string {
  return puedeVerRespuestasCorrectas(role) ? "*" : COLUMNAS_OPCION_PUBLICAS;
}
