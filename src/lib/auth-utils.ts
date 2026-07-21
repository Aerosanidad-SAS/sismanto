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
    case "REGULACION":     return "/regulacion";
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
