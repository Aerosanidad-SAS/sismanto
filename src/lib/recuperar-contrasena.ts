import { createHash, randomInt, timingSafeEqual } from "node:crypto";

// Recuperación de contraseña con código por correo (migración 102), como recuperarPassword.php de SISRES.
// Solo servidor (usa node:crypto).

export const MINUTOS_VIGENCIA_CODIGO = 15;
export const MAX_INTENTOS_CODIGO = 5;
export const LARGO_MINIMO_CONTRASENA = 8; // mismo mínimo que al crear usuarios (validations.ts)

/** Correo inventado por la carga masiva para quien no tiene uno (usuario.<cédula>@sismanto.invalid): no recibe nada. */
export function esCorreoInterno(email: string): boolean {
  return /@sismanto\.(invalid|test)$/i.test(email.trim());
}

/** Código de 6 dígitos con un generador criptográfico (incluye ceros a la izquierda). */
export function generarCodigo(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Hash del código ligado al usuario: el mismo código de otro usuario da otro hash. Nunca se guarda el código. */
export function hashCodigo(userId: string, codigo: string): string {
  return createHash("sha256").update(`${userId}:${codigo}`).digest("hex");
}

/** Compara en tiempo constante el código escrito contra el hash guardado. */
export function codigoCoincide(userId: string, codigo: string, hashGuardado: string): boolean {
  const a = Buffer.from(hashCodigo(userId, codigo), "hex");
  const b = Buffer.from(hashGuardado, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export type EstadoCodigo = "valido" | "vencido" | "usado" | "bloqueado";

/** Si un código guardado todavía se puede usar. */
export function estadoCodigo(c: { expira_en: string; usado: boolean; intentos: number }, ahora = Date.now()): EstadoCodigo {
  if (c.usado) return "usado";
  if (c.intentos >= MAX_INTENTOS_CODIGO) return "bloqueado";
  if (Date.parse(c.expira_en) <= ahora) return "vencido";
  return "valido";
}

/**
 * Cómo se reclama un intento sobre un código ya leído: la actualización solo vale si `intentos` sigue siendo
 * `esperado` (compare-and-swap). Quien la pierde no compara el código. Ver `restablecerContrasena`.
 */
export function reclamoDeIntento(fila: { id: number; intentos: number }): { id: number; esperado: number; nuevo: number } {
  return { id: fila.id, esperado: fila.intentos, nuevo: fila.intentos + 1 };
}

/** Cédula normalizada (sin puntos ni espacios) o null si no parece una cédula; mismo criterio que el login. */
export function normalizarCedula(valor: string): string | null {
  const cedula = valor.replace(/[\s.]/g, "");
  return /^\d{5,15}$/.test(cedula) ? cedula : null;
}
