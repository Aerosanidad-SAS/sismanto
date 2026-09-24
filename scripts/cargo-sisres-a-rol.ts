/**
 * Mapeo de los cargos de SISRES (`usuarios.cargo` / `roles.id`) a los roles de SISMANTO. Lo usará el ETL de usuarios.
 * Decidido por León el 2026-09-24:
 *   - 9 "Técnico" gestiona los tickets → TECNICO.
 *   - 10, 11 y 12 ("… Aeropuerto") son personal del aeropuerto que solo registra tickets → AEROPUERTO (un solo rol).
 * La base real de SISRES tiene 12 cargos (la documentación decía 9).
 */
export const CARGO_SISRES_A_ROL: Readonly<Record<number, string>> = {
  1: "ADMIN", // Administrador
  2: "COORDINACION", // Coordinador
  3: "ANALISTA", // Analista
  4: "REGULACION", // Regulador
  5: "MEDICO", // Médico
  6: "AUXILIAR_ENFERMERIA", // Auxiliar de Enfermería
  7: "OVEM", // OVEM
  8: "VISTA", // Vista
  9: "TECNICO", // Técnico (gestiona tickets)
  10: "AEROPUERTO", // Médico Aeropuerto
  11: "AEROPUERTO", // Auxiliar de Enfermería Aeropuerto
  12: "AEROPUERTO", // OVEM Aeropuerto
};

/**
 * Rol de SISMANTO para un cargo de SISRES, o `null` si el cargo no está mapeado (p. ej. el 0 de un usuario mal
 * cargado). El ETL debe RECHAZAR ese usuario con motivo, no darle un rol por defecto: un rol por defecto sería
 * un permiso que nadie decidió.
 */
export function rolParaCargoSisres(cargo: number | string | null | undefined): string | null {
  const n = typeof cargo === "string" ? Number(cargo.trim()) : cargo;
  if (n === null || n === undefined || !Number.isInteger(n)) return null;
  return CARGO_SISRES_A_ROL[n] ?? null;
}
