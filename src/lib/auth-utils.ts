export type UserRole =
  | "OVEM"
  | "ADMIN"
  | "REGULACION"
  | "GERENCIAL"
  | "MANTENIMIENTO";

export function isAdminLike(role: UserRole): boolean {
  return role === "ADMIN";
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
