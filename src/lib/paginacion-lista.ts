// Paginación de una lista que ya está en memoria (directorios de clientes y prestadores). Pura, para probarla.

export const FILAS_POR_PAGINA = 100;

export interface PaginaDeLista<T> {
  filas: T[];
  /** Página mostrada, ya acotada al rango válido (1…paginas). */
  pagina: number;
  paginas: number;
  total: number;
  /** Posición (desde 1) de la primera y la última fila mostradas; 0 si no hay filas. */
  desde: number;
  hasta: number;
}

export function paginarLista<T>(filas: readonly T[], pagina: number, porPagina = FILAS_POR_PAGINA): PaginaDeLista<T> {
  const total = filas.length;
  const tam = Math.max(1, Math.floor(porPagina));
  const paginas = Math.max(1, Math.ceil(total / tam));
  const actual = Math.min(Math.max(1, Math.floor(Number.isFinite(pagina) ? pagina : 1)), paginas);
  const inicio = (actual - 1) * tam;
  const visibles = filas.slice(inicio, inicio + tam);
  return {
    filas: visibles,
    pagina: actual,
    paginas,
    total,
    desde: total === 0 ? 0 : inicio + 1,
    hasta: inicio + visibles.length,
  };
}
