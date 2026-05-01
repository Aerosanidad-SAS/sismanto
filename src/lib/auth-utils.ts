export type UserRole =
  | "OVEM"
  | "ADMIN"
  | "SUPERADMIN"
  | "REGULACION"
  | "GERENCIAL";

/** Mismo acceso que ADMIN en la app (menú, server actions de administración). */
export function isAdminLike(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPERADMIN";
}

export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case "OVEM": return "/ovem";
    case "ADMIN": return "/";
    case "SUPERADMIN": return "/";
    case "REGULACION": return "/regulacion";
    case "GERENCIAL": return "/";
    default: return "/login";
  }
}
