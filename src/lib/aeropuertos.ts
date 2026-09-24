/**
 * Catálogo de aeropuertos y aerolíneas (SISRES: mostrarAeropuertos.php, buscarAeropuertoAjax.php,
 * mostrarAerolineas.php). Sin dependencias de servidor: lo usan la página, las acciones y el cliente.
 */

export const AEROPUERTOS_POR_PAGINA = 25;
/** Resultados del buscador incremental (LIMIT 20 en buscarAeropuertoAjax.php). */
export const AEROPUERTOS_TYPEAHEAD = 20;
/** Mínimo de letras para buscar (buscarAeropuertoAjax.php exige 2). */
export const AEROPUERTOS_MIN_CARACTERES = 2;

export interface AeropuertoLista {
  id: number;
  ident: string | null;
  tipo: string | null;
  nombre: string;
  municipio: string | null;
  pais: string | null;
  region: string | null;
  iata_code: string | null;
  icao_code: string | null;
  servicio_regular: boolean;
}

/** Columnas donde se busca cada palabra: mismas que SISRES (nombre, municipio, IATA, ICAO, ident). */
export const COLUMNAS_BUSQUEDA_AEROPUERTOS = ["nombre", "municipio", "iata_code", "icao_code", "ident"] as const;

/**
 * Palabras limpias para usar dentro de `.or("col.ilike.%x%,...")` de PostgREST: se quitan `, ( ) " \`
 * (rompen la sintaxis del filtro) y `% * _` (comodines), para que el texto del usuario no agregue condiciones.
 */
export function palabrasBusquedaAeropuertos(q: string): string[] {
  return q
    .replace(/[,()"\%*_]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
}

/** Código corto del aeropuerto: IATA, si no ICAO, si no ident (como buscarAeropuertoAjax.php). */
export function codigoAeropuerto(a: Pick<AeropuertoLista, "iata_code" | "icao_code" | "ident">): string {
  return a.iata_code || a.icao_code || a.ident || "";
}

/**
 * Texto que se guarda en Origen/Destino de una valoración, igual que el `display` de SISRES:
 * "Nombre - Municipio (PAÍS/CÓDIGO)". Origen y destino siguen siendo texto (no FK): así las valoraciones
 * históricas y las nuevas se leen igual y el certificado no depende de que el aeropuerto siga en el catálogo.
 */
export function etiquetaAeropuerto(a: Pick<AeropuertoLista, "nombre" | "municipio" | "pais" | "iata_code" | "icao_code" | "ident">): string {
  const codigo = codigoAeropuerto(a);
  let s = a.nombre;
  if (a.municipio) s += ` - ${a.municipio}`;
  if (a.pais) s += ` (${a.pais}${codigo ? `/${codigo}` : ""})`;
  return s;
}

/** "small_airport" → "Small Airport" (tipoLegible de mostrarAeropuertos.php). */
export function tipoAeropuertoLegible(tipo: string | null | undefined): string {
  return (tipo ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Lee `q`, `pais` y `pagina` de los searchParams, descartando valores inválidos. */
export function leerBusquedaAeropuertos(params: Record<string, string | string[] | undefined>): {
  q: string;
  pais: string;
  pagina: number;
} {
  const uno = (k: string) => {
    const x = params[k];
    return (Array.isArray(x) ? x[0] : x) ?? "";
  };
  const p = Number(uno("pagina"));
  const pais = uno("pais").trim().toUpperCase();
  return {
    q: uno("q").trim().slice(0, 80),
    pais: /^[A-Z]{2}$/.test(pais) ? pais : "",
    pagina: Number.isInteger(p) && p > 0 ? p : 1,
  };
}

export function aeropuertosAQuery(q: string, pais: string, pagina = 1): string {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (pais) sp.set("pais", pais);
  if (pagina > 1) sp.set("pagina", String(pagina));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const ROLES_ADMIN_AEROLINEAS: readonly string[] = ["ADMIN", "ANALISTA"];
