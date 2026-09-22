import type { Database } from "@/lib/supabase/database.types";

export type UserRole =
  | "OVEM"
  | "ADMIN"
  | "REGULACION"
  | "GERENCIAL"
  | "MANTENIMIENTO"
  | "COORDINACION"
  // Roles de la integración SISRES (migración 035)
  | "ANALISTA"
  | "MEDICO"
  | "AUXILIAR_ENFERMERIA"
  | "VISTA";

export function isAdminLike(role: UserRole): boolean {
  return role === "ADMIN" || role === "ANALISTA";
}

/** Código de centro operativo: mismo valor en operational_centers.codigo y en vehicles.centro_operativo. */
export type CentroOperativo = Database["public"]["Enums"]["operational_center"];

/**
 * Roles que ven solo la operación de su centro operativo (decisión de
 * Daniel, 2026-09-21: un centro por usuario). Admin, Analista, Gerencial,
 * Coordinación, Mantenimiento y Vista ven todos los centros.
 */
export const ROLES_POR_CENTRO: readonly UserRole[] = ["REGULACION", "OVEM", "MEDICO", "AUXILIAR_ENFERMERIA"];

export function veSoloSuCentro(role: UserRole | string | undefined | null): boolean {
  return ROLES_POR_CENTRO.includes(role as UserRole);
}

/**
 * Centro al que se limita lo que ve el usuario, o null si ve todos: su rol
 * no está limitado por centro, o todavía no tiene centro asignado (en ese
 * caso la UI lo avisa, en vez de dejarlo sin datos).
 */
export function centroVisible(
  profile: { role_codigo: UserRole; operational_center_id: number | null; centro_codigo: string | null } | null
): { id: number; codigo: CentroOperativo } | null {
  if (!profile || !veSoloSuCentro(profile.role_codigo)) return null;
  if (profile.operational_center_id === null || !profile.centro_codigo) return null;
  return { id: profile.operational_center_id, codigo: profile.centro_codigo as CentroOperativo };
}

/** Roles que pueden alternar OPERATIVO ↔ FUERA_DE_SERVICIO desde la UI (despacho). */
export function puedeCambiarEstadoOperativoVehiculo(role: UserRole | string | undefined | null): boolean {
  return role === "ADMIN" || role === "REGULACION" || role === "MANTENIMIENTO";
}

export function puedeGestionarCapacitaciones(role: UserRole | string | undefined | null): boolean {
  return role === "ADMIN";
}

export function puedeVerCapacitaciones(role: UserRole | string | undefined | null): boolean {
  return role === "ADMIN" || role === "COORDINACION" || role === "OVEM";
}

export function puedeCalificarCapacitaciones(role: UserRole | string | undefined | null): boolean {
  return role === "ADMIN" || role === "COORDINACION";
}

export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case "OVEM":           return "/ovem";
    case "ADMIN":          return "/";
    case "REGULACION":     return "/servicios";
    case "GERENCIAL":      return "/";
    case "MANTENIMIENTO":  return "/vehiculos";
    case "COORDINACION":   return "/coordinacion";
    case "ANALISTA":       return "/";
    case "MEDICO":         return "/pacientes";
    case "AUXILIAR_ENFERMERIA": return "/pacientes";
    case "VISTA":          return "/servicios";
    default:               return "/login";
  }
}
