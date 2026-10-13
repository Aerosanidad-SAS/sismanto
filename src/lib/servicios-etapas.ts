/**
 * Reglas del cambio de etapa de un servicio hecho por Regulación (hallazgos E1 y E2 del QA 2026-10-10).
 * Sin dependencias de servidor: las usan la acción y la pantalla.
 *
 * - Las etapas negativas piden un motivo (y la pantalla, confirmación): quedan en la bitácora con quién y por qué.
 * - Sacar un servicio de una etapa cerrada (FINALIZADO, CANCELADO, DUPLICADO) lo hace solo un ADMIN, con bitácora.
 */

/** Etapas que cierran un servicio sin que se haya prestado: hay que decir por qué. */
export const ETAPAS_NEGATIVAS = ["CANCELADO", "FALLIDO", "NO EFECTIVO", "DUPLICADO"] as const;

/** Etapas cerradas: reabrirlas (cambiar a otra etapa) es una corrección que solo hace un ADMIN. */
export const ETAPAS_CERRADAS = ["FINALIZADO", "CANCELADO", "DUPLICADO"] as const;

export const MOTIVO_MIN = 5;
export const MOTIVO_MAX = 200;

export const esEtapaNegativa = (etapa: string): boolean => (ETAPAS_NEGATIVAS as readonly string[]).includes(etapa);
export const esEtapaCerrada = (etapa: string): boolean => (ETAPAS_CERRADAS as readonly string[]).includes(etapa);

/** Quién puede sacar un servicio de una etapa cerrada. */
export function puedeReabrir(role: string | null | undefined): boolean {
  return role === "ADMIN";
}

/** Mensaje de error si el cambio no cumple las reglas; null si procede. `motivo` es lo que escribió la persona. */
export function errorDeCambioEtapa(
  actual: string,
  nueva: string,
  role: string | null | undefined,
  motivo: string | null | undefined
): string | null {
  if (esEtapaCerrada(actual) && actual !== nueva && !puedeReabrir(role)) {
    return `Un servicio ${actual} no se reabre desde aquí: pídele a un administrador que lo corrija.`;
  }
  if (esEtapaNegativa(nueva)) {
    const texto = (motivo ?? "").trim();
    if (texto.length < MOTIVO_MIN) return `Escribe el motivo (mínimo ${MOTIVO_MIN} caracteres) para pasar el servicio a ${nueva}.`;
    if (texto.length > MOTIVO_MAX) return `El motivo es demasiado largo (máximo ${MOTIVO_MAX} caracteres).`;
  }
  return null;
}
