/** Búsqueda, filtro por columna y orden de la tabla de usuarios (Administración). Puro, para probarlo sin pantalla. */
export const COLUMNAS_USUARIO = ["nombre", "email", "cedula", "ciudad", "centro", "rol", "estado"] as const;
export type ColumnaUsuario = (typeof COLUMNAS_USUARIO)[number];

/** Lo que la tabla muestra en cada columna, como texto: se busca, filtra y ordena sobre lo que el usuario ve. */
export type TextosUsuario = Record<ColumnaUsuario, string>;
export type FiltrosColumna = Partial<Record<ColumnaUsuario, string>>;
export interface OrdenUsuarios {
  columna: ColumnaUsuario;
  dir: "asc" | "desc";
}

/** La búsqueda general mira nombre, correo, cédula y rol. */
const COLUMNAS_BUSQUEDA: ColumnaUsuario[] = ["nombre", "email", "cedula", "rol"];

const sinAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export function hayFiltrosUsuarios(busqueda: string, filtros: FiltrosColumna): boolean {
  return Boolean(busqueda.trim() || Object.values(filtros).some((v) => v?.trim()));
}

/** Siguiente estado al pulsar un encabezado: ascendente → descendente → sin orden (el original del servidor). */
export function siguienteOrden(actual: OrdenUsuarios | null, columna: ColumnaUsuario): OrdenUsuarios | null {
  if (actual?.columna !== columna) return { columna, dir: "asc" };
  return actual.dir === "asc" ? { columna, dir: "desc" } : null;
}

export function filtrarYOrdenar<T extends { texto: TextosUsuario }>(
  filas: T[],
  busqueda: string,
  filtros: FiltrosColumna,
  orden: OrdenUsuarios | null
): T[] {
  const q = sinAcentos(busqueda);
  const porColumna = COLUMNAS_USUARIO.flatMap((c) => {
    const v = sinAcentos(filtros[c] ?? "");
    return v ? [[c, v] as const] : [];
  });
  const resultado = filas.filter(
    (f) =>
      (!q || COLUMNAS_BUSQUEDA.some((c) => sinAcentos(f.texto[c]).includes(q))) &&
      porColumna.every(([c, v]) => sinAcentos(f.texto[c]).includes(v))
  );
  if (!orden) return resultado;
  const signo = orden.dir === "asc" ? 1 : -1;
  // Array.sort es estable: los empates conservan el orden del servidor. Los vacíos van siempre al final.
  return [...resultado].sort((a, b) => {
    const x = a.texto[orden.columna].trim();
    const y = b.texto[orden.columna].trim();
    if (!x || !y) return x === y ? 0 : x ? -1 : 1;
    return signo * x.localeCompare(y, "es", { numeric: true, sensitivity: "base" });
  });
}
