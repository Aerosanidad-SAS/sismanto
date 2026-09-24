/**
 * Lista de valoraciones médicas como mostrarValoraciones.php de SISRES:
 * paginada y con búsqueda en el servidor (25 por página; SISRES parte de 25).
 * Sin dependencias de servidor: la usan la página, las acciones y el cliente.
 */

export const VALORACIONES_POR_PAGINA = 25;

/** Concepto de aptitud: select cerrado en SISRES (registroValoracion.php), no texto libre. */
export const VALORACION_OPCIONES = ["APTO", "NO APTO"] as const;

/** Estado del registro: select ACTIVO / INACTIVO en SISRES (se guarda como 0 / 1 en el campo estadoServicio). */
export const ESTADO_VALORACION_OPCIONES = ["ACTIVO", "INACTIVO"] as const;

/** Columnas donde se busca cada palabra (mismas que buscarValoraciones de SISRES: cédula, nombre, médico, aerolínea). */
export const COLUMNAS_BUSQUEDA_VALORACIONES = ["cedula", "nombre_completo", "medico", "aerolinea"] as const;

/** Lee `q` y `pagina` de los searchParams de la URL, descartando valores inválidos. */
export function leerBusquedaValoraciones(params: Record<string, string | string[] | undefined>): { q: string; pagina: number } {
  const bruto = Array.isArray(params.q) ? params.q[0] : params.q;
  const p = Number(Array.isArray(params.pagina) ? params.pagina[0] : params.pagina);
  return { q: (bruto ?? "").trim().slice(0, 80), pagina: Number.isInteger(p) && p > 0 ? p : 1 };
}

/**
 * Palabras a buscar, ya limpias para usarlas dentro de `.or("col.ilike.%x%,...")`
 * de PostgREST: se quitan `, ( ) " \` (rompen la sintaxis del filtro) y `% * _`
 * (comodines), para que el texto del usuario no pueda agregar condiciones propias.
 * Cada palabra debe aparecer en alguna columna.
 */
export function palabrasBusquedaValoraciones(q: string): string[] {
  return q
    .replace(/[,()"\\%*_]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
}

export function valoracionesAQuery(q: string, pagina = 1): string {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (pagina > 1) sp.set("pagina", String(pagina));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

const normalizar = (x: string | null | undefined) => (x ?? "").trim().replace(/\s+/g, " ").toUpperCase();

/**
 * Clasificación del concepto. Igualdad exacta, NO `includes("APTO")`: "NO APTO"
 * contiene la palabra "APTO", y con `includes` la tarjeta "Con concepto APTO"
 * contaba también los NO APTO.
 */
export function clasificarValoracion(valoracion: string | null | undefined): "APTO" | "NO APTO" | "OTRO" {
  const v = normalizar(valoracion);
  return v === "APTO" ? "APTO" : v === "NO APTO" ? "NO APTO" : "OTRO";
}

/**
 * Estado legible. Los datos que vienen del ETL de SISRES traen el código del
 * select (`0` = ACTIVO, `1` = INACTIVO); los registros nuevos guardan el texto.
 */
export function estadoLegible(estado: string | null | undefined): string {
  const e = (estado ?? "").trim();
  if (e === "0") return "ACTIVO";
  if (e === "1") return "INACTIVO";
  return normalizar(e);
}

/** Edad en años cumplidos a `hoyIso` (YYYY-MM-DD); "" si no hay fecha válida. En SISRES la edad se guarda y queda vieja; acá se calcula. */
export function edadEnAnios(fechaNacimiento: string | null | undefined, hoyIso: string): number | "" {
  if (!fechaNacimiento) return "";
  const [ny, nm, nd] = fechaNacimiento.slice(0, 10).split("-").map(Number);
  const [hy, hm, hd] = hoyIso.split("-").map(Number);
  if (![ny, nm, nd, hy, hm, hd].every(Number.isFinite)) return "";
  let edad = hy - ny;
  if (hm < nm || (hm === nm && hd < nd)) edad--;
  return edad < 0 ? "" : edad;
}

/** Nombre completo del paciente en el orden de SISRES: nombre1 nombre2 apellido1 apellido2. */
export function nombreCompletoPaciente(p: {
  nombre1?: string | null;
  nombre2?: string | null;
  apellido1?: string | null;
  apellido2?: string | null;
}): string {
  return [p.nombre1, p.nombre2, p.apellido1, p.apellido2].map((x) => (x ?? "").trim()).filter(Boolean).join(" ");
}
