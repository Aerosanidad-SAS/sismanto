/**
 * Lista de pacientes paginada en servidor, como mostrarPacientes.php de SISRES
 * (100 por página, búsqueda en el servidor). Sin dependencias de servidor:
 * la usan la página, la acción y el cliente.
 */

export const PACIENTES_POR_PAGINA = 100;

/** Columnas donde se busca cada palabra (las mismas que buscaba el filtro del navegador). */
export const COLUMNAS_BUSQUEDA_PACIENTES = ["cedula", "nombre1", "nombre2", "apellido1", "apellido2", "eps", "ciudad"] as const;

/** Lee `q` y `pagina` de los searchParams de la URL, descartando valores inválidos. */
export function leerBusquedaPacientes(params: Record<string, string | string[] | undefined>): { q: string; pagina: number } {
  const bruto = Array.isArray(params.q) ? params.q[0] : params.q;
  const p = Number(Array.isArray(params.pagina) ? params.pagina[0] : params.pagina);
  return { q: (bruto ?? "").trim().slice(0, 80), pagina: Number.isInteger(p) && p > 0 ? p : 1 };
}

/**
 * Palabras a buscar, ya limpias para usarlas dentro de `.or("col.ilike.%x%,...")`
 * de PostgREST: se quitan `, ( ) " \` (rompen la sintaxis del filtro) y `% * _`
 * (comodines), para que un texto escrito por el usuario no pueda agregar
 * condiciones propias. Cada palabra debe aparecer en alguna columna.
 */
export function palabrasBusquedaPacientes(q: string): string[] {
  return q
    .replace(/[,()"\\%*_]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
}

export function pacientesAQuery(q: string, pagina = 1): string {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (pagina > 1) sp.set("pagina", String(pagina));
  const s = sp.toString();
  return s ? `?${s}` : "";
}
