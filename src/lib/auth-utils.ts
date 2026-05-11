export type UserRole =
  | "OVEM"
  | "ADMIN"
  | "REGULACION"
  | "GERENCIAL"
  | "MANTENIMIENTO";

export function isAdminLike(role: UserRole): boolean {
  return role === "ADMIN";
}

/** Roles que pueden alternar OPERATIVO ↔ FUERA_DE_SERVICIO desde la UI (despacho). */
export function puedeCambiarEstadoOperativoVehiculo(role: UserRole | string | undefined | null): boolean {
  return role === "ADMIN" || role === "REGULACION" || role === "MANTENIMIENTO";
}

export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case "OVEM":           return "/ovem";
    case "ADMIN":          return "/";
    case "REGULACION":     return "/regulacion";
    case "GERENCIAL":      return "/";
    case "MANTENIMIENTO":  return "/vehiculos";
    default:               return "/login";
  }
}
