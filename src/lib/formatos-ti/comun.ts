/**
 * Piezas compartidas por los 4 Formatos TI del SIG (Acta de Entrega, Diagnóstico, Baja, Préstamo).
 * Sin dependencias de servidor: las usan páginas, acciones y componentes de cliente.
 */

/** Quién usa los Formatos TI: el área de Sistemas. En SISRES cada formato tiene su permiso por rol (arranca en cero); acá, ADMIN y ANALISTA. */
export const ROLES_FORMATOS_TI = ["ADMIN", "ANALISTA"] as const;

export const FORMATOS_POR_PAGINA = 25;

/** Opciones de las pruebas de un listado de chequeo. En SISRES se guarda "N-A" (con guion) para "N/A". */
export const OPCIONES_CHEQUEO = ["BUENO", "MALO", "N-A"] as const;
export type OpcionChequeo = (typeof OPCIONES_CHEQUEO)[number];

export function etiquetaChequeo(v: string | null | undefined): string {
  return v === "N-A" ? "N/A" : (v ?? "");
}

/** Lados de firma de un formato: clave corta usada en la ruta del PNG y en `firmas_png`. */
export type LadoFirma = string;

/** Bucket de Storage donde viven todas las firmas de los formatos (migración 070). */
export const BUCKET_FIRMAS = "formatos-firmas";

/** Estado de la integridad de una firma, para las insignias del listado y el PDF. */
export type EstadoFirma = "sin_firma" | "ok" | "modificada";

/** Lee un parámetro de la URL como texto recortado. */
export function paramTexto(params: Record<string, string | string[] | undefined>, clave: string, max = 80): string {
  const x = params[clave];
  return ((Array.isArray(x) ? x[0] : x) ?? "").trim().slice(0, max);
}

/** Página pedida en la URL; cualquier valor inválido es la 1. */
export function paramPagina(params: Record<string, string | string[] | undefined>): number {
  const p = Number(paramTexto(params, "pagina", 10));
  return Number.isInteger(p) && p > 0 ? p : 1;
}

/**
 * Palabras limpias para usar dentro de `.or("col.ilike.%x%,...")` de PostgREST: se quitan `, ( ) " \`
 * (rompen la sintaxis del filtro) y `% * _` (comodines), para que el texto del usuario no agregue condiciones.
 */
export function palabrasBusqueda(q: string): string[] {
  return q
    .replace(/[,()"\\%*_]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
}

/** "?q=..&tipo=..&pagina=2" sin parámetros vacíos, para los enlaces de paginación y filtros. */
export function aQuery(valores: Record<string, string | number | null | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(valores)) {
    if (v === null || v === undefined || v === "" || (k === "pagina" && Number(v) <= 1)) continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Fecha YYYY-MM-DD a dd/mm/aaaa sin pasar por Date (evita el corrimiento de zona horaria de las fechas sin hora). */
export function fechaCorta(iso: string | null | undefined): string {
  if (!iso) return "—";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

/** Hoy en hora de Colombia (YYYY-MM-DD). */
export function hoyColombia(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}
