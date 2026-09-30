import type { UserRole } from "@/lib/auth-utils";

export type DashboardTabKey = "operacion" | "servicios" | "biomedicos" | "financiero";

/**
 * Qué roles ven cada pestaña de Dashboard y Tablero ejecutivo — mismo criterio en las dos pantallas, fuente
 * única para no repetir la lista de roles en cada page.tsx. "operacion" reúne lo que antes vivía repartido
 * entre Dashboard (flota, mantenimiento, novedades, disponibilidad, vencimientos) y Coordinación (OVEM
 * activos, novedades reportadas, mantenimientos preventivos, cobertura por centro).
 * MANTENIMIENTO y COORDINACION nunca vieron cifras de costos (antes `hideFinanceKpis`/página aparte): no
 * entran a "financiero". COORDINACION y MANTENIMIENTO tampoco vieron el resumen de servicios por ciudad
 * (eso vivía solo en Tablero ejecutivo, visible a ADMIN/GERENCIAL/ANALISTA): no entran a "servicios".
 */
export const DASHBOARD_TAB_ROLES: Record<DashboardTabKey, UserRole[]> = {
  operacion: ["ADMIN", "GERENCIAL", "MANTENIMIENTO", "ANALISTA", "COORDINACION"],
  servicios: ["ADMIN", "GERENCIAL", "ANALISTA"],
  biomedicos: ["ADMIN", "GERENCIAL", "MANTENIMIENTO", "ANALISTA"],
  financiero: ["ADMIN", "GERENCIAL", "ANALISTA"],
};

export function puedeVerPestanaDashboard(tab: DashboardTabKey, role: UserRole | string | null | undefined): boolean {
  return !!role && (DASHBOARD_TAB_ROLES[tab] as string[]).includes(role);
}
