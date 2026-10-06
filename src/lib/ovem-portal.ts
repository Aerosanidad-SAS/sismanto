/**
 * Lógica pura del portal OVEM (celular): kilometraje, borrador del preoperacional, resumen de respuestas y
 * detección de servicios nuevos. Vive aparte de los componentes para poder probarla sin navegador.
 */

export type EstadoItem = "OK" | "FALLA" | "NO_APLICA";

export interface RespuestaItem {
  estado: EstadoItem;
  cantidadOk?: number;
  observacion?: string;
}

export type RespuestasChecklist = Record<number, RespuestaItem>;

/** Número en formato colombiano o internacional: acepta «12,5» y «12.5». Devuelve undefined si no es un número. */
export function parseNumeroDecimal(v: string): number | undefined {
  const t = v.trim().replace(",", ".");
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

/** Kilometraje entero a partir de lo que escribe el conductor («125.430», «125430», «125 430»). */
export function parseKilometraje(v: string): number | undefined {
  const limpio = v.replace(/[\s.]/g, "").replace(",", ".");
  if (!limpio) return undefined;
  const n = Number(limpio);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

export const SALTO_KM_SOSPECHOSO = 1000;

export interface EvaluacionKm {
  nivel: "ok" | "menor" | "salto";
  mensaje: string | null;
}

const fmtKm = (n: number) => n.toLocaleString("es-CO");

/**
 * Compara el kilometraje digitado con el último registrado. Solo avisa: el conductor puede tener razón (tablero
 * cambiado, lectura anterior mal digitada), así que no bloquea.
 */
export function evaluarKilometraje(km: number | undefined, ultimo: number | null | undefined): EvaluacionKm {
  if (km === undefined || ultimo === null || ultimo === undefined || ultimo <= 0) return { nivel: "ok", mensaje: null };
  if (km < ultimo) {
    return {
      nivel: "menor",
      mensaje: `Es menor al último registrado (${fmtKm(ultimo)} km). Revisa el número del tablero.`,
    };
  }
  if (km - ultimo > SALTO_KM_SOSPECHOSO) {
    return {
      nivel: "salto",
      mensaje: `Son ${fmtKm(km - ultimo)} km más que el último registrado (${fmtKm(ultimo)} km). Revisa el número del tablero.`,
    };
  }
  return { nivel: "ok", mensaje: null };
}

export interface ResumenRespuestas {
  total: number;
  ok: number;
  falla: number;
  noAplica: number;
  sinResponder: number;
}

/** Cuenta las respuestas de los ítems visibles; lo que no tiene respuesta es «sin responder», nunca OK. */
export function resumirRespuestas(ids: number[], respuestas: RespuestasChecklist): ResumenRespuestas {
  const r: ResumenRespuestas = { total: ids.length, ok: 0, falla: 0, noAplica: 0, sinResponder: 0 };
  for (const id of ids) {
    const estado = respuestas[id]?.estado;
    if (estado === "OK") r.ok++;
    else if (estado === "FALLA") r.falla++;
    else if (estado === "NO_APLICA") r.noAplica++;
    else r.sinResponder++;
  }
  return r;
}

/** «38 OK · 1 Falla · 2 N/A»; solo muestra «sin responder» si queda alguno. */
export function textoResumen(r: ResumenRespuestas): string {
  const partes = [`${r.ok} OK`, `${r.falla} ${r.falla === 1 ? "Falla" : "Fallas"}`, `${r.noAplica} N/A`];
  if (r.sinResponder > 0) partes.push(`${r.sinResponder} sin responder`);
  return partes.join(" · ");
}

/* ─── Borrador del preoperacional (sessionStorage por vehículo y día) ─── */

export interface BorradorPreoperacional {
  km: string;
  observaciones: string;
  items: RespuestasChecklist;
}

export function claveBorrador(vehicleId: string, hoy: string): string {
  return `sismanto_ovem_borrador_${vehicleId}_${hoy}`;
}

export function serializarBorrador(b: BorradorPreoperacional): string {
  // Orden de claves estable: sirve para comparar «¿cambió algo?» como texto.
  const ids = Object.keys(b.items)
    .map(Number)
    .sort((x, y) => x - y);
  const items: RespuestasChecklist = {};
  for (const id of ids) {
    const r = b.items[id];
    items[id] = { estado: r.estado, cantidadOk: r.cantidadOk, observacion: r.observacion };
  }
  return JSON.stringify({ km: b.km, observaciones: b.observaciones, items });
}

const ESTADOS: readonly string[] = ["OK", "FALLA", "NO_APLICA"];

/** Lee un borrador guardado; si el texto está dañado o no tiene la forma esperada, devuelve null. */
export function leerBorrador(raw: string | null): BorradorPreoperacional | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<BorradorPreoperacional> | null;
    if (!o || typeof o !== "object" || typeof o.km !== "string" || typeof o.observaciones !== "string") return null;
    if (!o.items || typeof o.items !== "object") return null;
    const items: RespuestasChecklist = {};
    for (const [k, v] of Object.entries(o.items)) {
      const id = Number(k);
      if (!Number.isInteger(id) || !v || typeof v.estado !== "string" || !ESTADOS.includes(v.estado)) return null;
      items[id] = {
        estado: v.estado as EstadoItem,
        cantidadOk: typeof v.cantidadOk === "number" ? v.cantidadOk : undefined,
        observacion: typeof v.observacion === "string" ? v.observacion : undefined,
      };
    }
    return { km: o.km, observaciones: o.observaciones, items };
  } catch {
    return null;
  }
}

/* ─── Servicios nuevos (refresco automático) ─── */

/** Ids que están ahora y no estaban antes. Con `previos` null (primera carga) no hay nada «nuevo». */
export function idsNuevos(previos: Iterable<number> | null, actuales: number[]): number[] {
  if (previos === null) return [];
  const antes = new Set(previos);
  return actuales.filter((id) => !antes.has(id));
}
