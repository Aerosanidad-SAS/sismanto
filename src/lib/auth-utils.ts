export type UserRole =
  | "OVEM"
  | "ADMIN"
  | "REGULACION"
  | "GERENCIAL";

export function isAdminLike(role: UserRole): boolean {
  return role === "ADMIN";
}

export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case "OVEM":       return "/ovem";
    case "ADMIN":      return "/";
    case "REGULACION": return "/regulacion";
    case "GERENCIAL":  return "/";
    default:           return "/login";
  }
}
