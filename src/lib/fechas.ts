/**
 * Política de fechas de SISMANTO. Todo lo de negocio ocurre en Colombia (America/Bogota, UTC-5, sin horario de verano)
 * y el mismo código corre en Vercel (UTC), en el computador de cada desarrollador (Bogotá) y en el navegador de cada
 * usuario. Para que el resultado sea idéntico en los tres:
 *
 *  1. Una fecha de negocio es un DÍA (`"YYYY-MM-DD"`, como las columnas `DATE` de la base), no un instante. Se trata como
 *     texto y se opera con aritmética de calendario. Nunca `new Date("2024-01-01")` (es medianoche UTC, o sea el 31 de
 *     diciembre a las 7 p. m. en Colombia) ni `getFullYear()/getMonth()/getDate()/setMonth()/…` sobre ella: esos métodos
 *     responden en la zona del equipo que ejecuta, y de ahí sale un resultado distinto en local y en producción.
 *  2. Un instante (`timestamptz`, `Date.now()`) se convierte a día con `diaEnBogota()`.
 *  3. "Hoy" es `hoyBogota()`, no `new Date().toISOString().slice(0, 10)` (que es el día UTC y cambia a las 7 p. m.).
 *
 * Este módulo es el único que puede usar los getters `getUTC*` de `Date` (para la aritmética de calendario) y no
 * depende de Next para poder usarse en scripts y pruebas. ESLint prohíbe los patrones peligrosos en el resto del código.
 */

export const ZONA_NEGOCIO = "America/Bogota";

/** Día de calendario `YYYY-MM-DD`. */
export type Dia = string;

const RE_DIA = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_DIA = 86_400_000;

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;

const dos = (n: number) => String(n).padStart(2, "0");
const cuatro = (n: number) => String(n).padStart(4, "0");

// ─── Validación y conversión ────────────────────────────────────────────────

/** `true` si es un día real (rechaza `2024-02-30` y cualquier texto con hora). */
export function esDia(valor: unknown): valor is Dia {
  if (typeof valor !== "string") return false;
  const m = valor.match(RE_DIA);
  if (!m) return false;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  return d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

function partes(dia: Dia): [number, number, number] {
  if (!esDia(dia)) throw new RangeError(`Día inválido: ${String(dia)}`);
  return [Number(dia.slice(0, 4)), Number(dia.slice(5, 7)), Number(dia.slice(8, 10))];
}

function aMs(dia: Dia): number {
  const [a, m, d] = partes(dia);
  return Date.UTC(a, m - 1, d);
}

function deMs(ms: number): Dia {
  const d = new Date(ms);
  return `${cuatro(d.getUTCFullYear())}-${dos(d.getUTCMonth() + 1)}-${dos(d.getUTCDate())}`;
}

/** Día de calendario, en hora de Colombia, en el que ocurre un instante. */
export function diaEnBogota(instante: Date | string | number): Dia {
  return new Date(instante).toLocaleDateString("en-CA", { timeZone: ZONA_NEGOCIO });
}

/** Hoy en Colombia (`ahora` solo se usa en pruebas). */
export function hoyBogota(ahora: Date | number = new Date()): Dia {
  return diaEnBogota(ahora);
}

/**
 * Lleva a día lo que llegue de la base o de un formulario: un `DATE` (`"2024-03-22"`) queda igual; un `timestamptz`
 * (`"2024-03-22T02:00:00+00:00"`) o un `Date` se convierte al día que era en Colombia.
 */
export function normalizarDia(valor: string | Date): Dia {
  if (typeof valor === "string" && esDia(valor)) return valor;
  return diaEnBogota(valor);
}

// ─── Componentes ────────────────────────────────────────────────────────────

export function anioDe(dia: Dia): number {
  return partes(dia)[0];
}

/** Mes 1-12. */
export function mesDe(dia: Dia): number {
  return partes(dia)[1];
}

export function diaDelMes(dia: Dia): number {
  return partes(dia)[2];
}

export function esBisiesto(anio: number): boolean {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
}

export function diasDelAnio(anio: number): number {
  return esBisiesto(anio) ? 366 : 365;
}

/** Último día del mes (mes 1-12). */
export function ultimoDiaDelMes(anio: number, mes: number): number {
  return new Date(Date.UTC(anio, mes, 0)).getUTCDate();
}

export function primerDiaDelMes(dia: Dia): Dia {
  const [a, m] = partes(dia);
  return `${cuatro(a)}-${dos(m)}-01`;
}

export function ultimoDiaDelMesDe(dia: Dia): Dia {
  const [a, m] = partes(dia);
  return `${cuatro(a)}-${dos(m)}-${dos(ultimoDiaDelMes(a, m))}`;
}

// ─── Aritmética de calendario ───────────────────────────────────────────────

export function sumarDias(dia: Dia, dias: number): Dia {
  return deMs(aMs(dia) + dias * MS_DIA);
}

/** Suma meses conservando el día; si el mes destino es más corto queda en su último día (31 ene + 1 mes = 28/29 feb). */
export function sumarMeses(dia: Dia, meses: number): Dia {
  const [a, m, d] = partes(dia);
  const total = a * 12 + (m - 1) + meses;
  const anio = Math.floor(total / 12);
  const mes = (((total % 12) + 12) % 12) + 1;
  return `${cuatro(anio)}-${dos(mes)}-${dos(Math.min(d, ultimoDiaDelMes(anio, mes)))}`;
}

/** Días de calendario de `desde` a `hasta` (negativo si `hasta` es anterior). */
export function diasEntre(desde: Dia, hasta: Dia): number {
  return Math.round((aMs(hasta) - aMs(desde)) / MS_DIA);
}

/** Cantidad de días que abarca un rango, con ambos extremos incluidos. */
export function diasDelRango(desde: Dia, hasta: Dia): number {
  return diasEntre(desde, hasta) + 1;
}

/** Días en común de dos rangos cerrados (0 si no se tocan). */
export function solapeDias(aDesde: Dia, aHasta: Dia, bDesde: Dia, bHasta: Dia): number {
  const desde = aDesde > bDesde ? aDesde : bDesde;
  const hasta = aHasta < bHasta ? aHasta : bHasta;
  return hasta < desde ? 0 : diasEntre(desde, hasta) + 1;
}

/** Años calendario que toca un rango: 2024-12-31..2025-01-01 → [2024, 2025]. */
export function aniosDelRango(desde: Dia, hasta: Dia): number[] {
  const out: number[] = [];
  for (let a = anioDe(desde); a <= anioDe(hasta); a++) out.push(a);
  return out;
}

/** Meses `YYYY-MM` que toca un rango, en orden. */
export function mesesDelRango(desde: Dia, hasta: Dia): string[] {
  const out: string[] = [];
  let cur = primerDiaDelMes(desde);
  const fin = primerDiaDelMes(hasta);
  while (cur <= fin) {
    out.push(cur.slice(0, 7));
    cur = sumarMeses(cur, 1);
  }
  return out;
}

/** Años cumplidos a `hoy` por alguien nacido el día `nacimiento`. */
export function edadEn(nacimiento: Dia, hoy: Dia): number {
  const [an, mn, dn] = partes(nacimiento);
  const [ah, mh, dh] = partes(hoy);
  let edad = ah - an;
  if (mh < mn || (mh === mn && dh < dn)) edad--;
  return edad;
}

// ─── Rangos sobre columnas con hora (timestamptz) ───────────────────────────

/**
 * Límites de un rango de DÍAS de Colombia para filtrar una columna `timestamptz`: `desde` incluido y `hastaExclusivo`
 * (el inicio del día siguiente a `hasta`) excluido, así el último día entra completo. Con `.lte("col", "2026-09-25")`
 * la base compara contra la medianoche UTC de ese día y se pierde casi todo.
 * Colombia es UTC-5 todo el año.
 */
export function limitesInstante(desde: Dia, hasta: Dia): { desde: string; hastaExclusivo: string } {
  return {
    desde: `${desde}T00:00:00-05:00`,
    hastaExclusivo: `${sumarDias(hasta, 1)}T00:00:00-05:00`,
  };
}

// ─── Presentación ───────────────────────────────────────────────────────────

/** `dd/mm/aaaa` (`corto`) o `22 de marzo de 2024` (`largo`), sin pasar por ninguna zona horaria. */
export function formatoDia(dia: Dia, estilo: "corto" | "largo" = "corto"): string {
  const [a, m, d] = partes(dia);
  if (estilo === "largo") return `${d} de ${MESES[m - 1]} de ${a}`;
  return `${dos(d)}/${dos(m)}/${a}`;
}

/** Fecha y hora de un instante, siempre en hora de Colombia. */
export function formatoInstante(instante: Date | string | number, opciones?: Intl.DateTimeFormatOptions): string {
  return new Date(instante).toLocaleString("es-CO", {
    timeZone: ZONA_NEGOCIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...opciones,
  });
}
