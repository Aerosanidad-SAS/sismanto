/** Parámetros de período global del dashboard (ver `DashboardGlobalFiltros`). */
export const DASHBOARD_GLOBAL_KEYS = ["gInicio", "gFin", "gCentro"] as const;

export function stripDashboardGlobalParams(params: URLSearchParams) {
  for (const k of DASHBOARD_GLOBAL_KEYS) {
    params.delete(k);
  }
}
