/**
 * Filtros del inventario de equipos (SISRES: includes/inventarioQuery.php). Puros, para probarlos con datos reales.
 * En SISRES no existe un módulo aparte para el inventario de Sistemas: es el mismo inventario con el filtro «Área».
 */
export interface FiltrosEquipos {
  buscar: string;
  /** Igualdad exacta (SISTEMAS, BIOMEDICA…); se compara sin espacios sobrantes, igual que MySQL con `=`. */
  area: string;
  /** Contiene, sin distinguir mayúsculas (como `equipo LIKE %x%`). */
  equipo: string;
  /** «Sanidad» en SISRES = la sede/aeropuerto del equipo; igualdad exacta. */
  aeropuerto: string;
}

export const SIN_FILTROS: FiltrosEquipos = { buscar: "", area: "", equipo: "", aeropuerto: "" };

interface EquipoFiltrable {
  placa_equipo: string;
  equipo: string;
  marca?: string | null;
  serie?: string | null;
  area?: string | null;
  aeropuerto?: string | null;
  ciudad?: string | null;
}

const bajo = (s: string | null | undefined) => (s ?? "").toLowerCase();

export function hayFiltros(f: FiltrosEquipos): boolean {
  return Boolean(f.buscar.trim() || f.area || f.equipo.trim() || f.aeropuerto);
}

export function filtrarEquipos<T extends EquipoFiltrable>(equipos: T[], f: FiltrosEquipos): T[] {
  const q = f.buscar.trim().toLowerCase();
  const tipo = f.equipo.trim().toLowerCase();
  return equipos.filter((e) => {
    if (q && ![e.placa_equipo, e.equipo, e.marca, e.serie, e.area, e.aeropuerto, e.ciudad].some((v) => bajo(v).includes(q))) return false;
    if (f.area && (e.area ?? "").trim() !== f.area) return false;
    if (tipo && !bajo(e.equipo).includes(tipo)) return false;
    if (f.aeropuerto && (e.aeropuerto ?? "").trim() !== f.aeropuerto) return false;
    return true;
  });
}

/** Valores distintos y no vacíos, ordenados: alimentan los selects. */
export function valoresDistintos<T>(filas: T[], campo: (f: T) => string | null | undefined): string[] {
  return Array.from(new Set(filas.map((f) => (campo(f) ?? "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
}
