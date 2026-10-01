import { randomBytes } from "node:crypto";

// Reglas del enlace de seguimiento GPS de un servicio (migración 105). Solo servidor (usa node:crypto).

export const HORAS_VIGENCIA_ENLACE = 24;
/** Etapas en las que tiene sentido seguir la ambulancia (va en camino o está en el servicio). */
export const ETAPAS_CON_SEGUIMIENTO = ["PROGRAMADO", "CURSO"] as const;

/** Token opaco de 256 bits, apto para URL. */
export function nuevoTokenSeguimiento(): string {
  return randomBytes(32).toString("base64url");
}

export function esTokenSeguimiento(v: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(v);
}

export function etapaConSeguimiento(etapa: string | null | undefined): boolean {
  return (ETAPAS_CON_SEGUIMIENTO as readonly string[]).includes(etapa ?? "");
}

/** ¿El enlace público sigue vigente? (24 h desde que se generó y el servicio aún en PROGRAMADO o CURSO). */
export function enlaceVigente(creado: string | null | undefined, etapa: string | null | undefined, ahora = Date.now()): boolean {
  if (!creado || !etapaConSeguimiento(etapa)) return false;
  const t = Date.parse(creado);
  return Number.isFinite(t) && ahora - t < HORAS_VIGENCIA_ENLACE * 3_600_000;
}
