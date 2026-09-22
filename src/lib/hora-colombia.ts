/**
 * La operación es toda en Colombia, pero el servidor y Postgres corren en UTC.
 *
 * Los formularios capturan y muestran "yyyy-MM-ddTHH:mm" sin zona (DateTimeField,
 * input datetime-local). Si ese texto se guarda tal cual en una columna
 * timestamptz, Postgres lo interpreta como UTC y la hora queda 5 horas antes:
 * escribir 15:15 en Medellín se guardaba como 10:15 de Medellín.
 *
 * Regla: al escribir, `aTimestamptzColombia`; al precargar un formulario,
 * `aTextoLocalColombia`.
 */

const DESPLAZAMIENTO = "-05:00"; // Colombia no tiene horario de verano
const SIN_ZONA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

/** "2026-09-22T15:15" → "2026-09-22T15:15:00-05:00". Deja intactos los valores que ya traen zona. */
export function aTimestamptzColombia(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const v = valor.trim();
  if (!v) return null;
  if (!SIN_ZONA.test(v)) return v;
  return `${v.length === 16 ? `${v}:00` : v}${DESPLAZAMIENTO}`;
}

/** Aplica `aTimestamptzColombia` a las claves indicadas de una fila. */
export function filaConHoraColombia<T extends Record<string, unknown>>(fila: T, claves: readonly string[]): T {
  const copia: Record<string, unknown> = { ...fila };
  for (const k of claves) {
    if (k in copia && typeof copia[k] === "string") copia[k] = aTimestamptzColombia(copia[k] as string);
  }
  return copia as T;
}

/** Inverso: un timestamp de la base → "yyyy-MM-ddTHH:mm" en hora de Colombia, para precargar el formulario. */
export function aTextoLocalColombia(valor: string | null | undefined): string {
  if (!valor) return "";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("sv-SE", { timeZone: "America/Bogota" }).slice(0, 16).replace(" ", "T");
}
