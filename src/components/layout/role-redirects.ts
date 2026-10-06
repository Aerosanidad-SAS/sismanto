import { esRolRestringido, rutaPermitidaARolRestringido, getDefaultRoute, type UserRole } from "@/lib/auth-utils";
import { rutaDeRespaldo, rutaOculta } from "@/lib/permisos";

const MANTENIMIENTO_BLOCKED = ["/kpis", "/consumo", "/combustible", "/configuracion", "/regulacion", "/admin", "/ovem"];
const GERENCIAL_ALLOWED = ["/", "/kpis", "/consumo", "/combustible", "/estadisticas", "/ai-chat", "/ai-insights", "/gerencial", "/soporte"];
const COORDINACION_ALLOWED = ["/", "/servicios", "/capacitaciones", "/pacientes", "/equipos", "/comunicaciones", "/estadisticas", "/ai-insights", "/soporte", "/captacion"];

const startsWithAny = (pathname: string, bases: string[]) =>
  bases.some((b) => pathname === b || pathname.startsWith(`${b}/`));

/**
 * Where a role must be sent when it opens a route that is not its own, or null when it can stay.
 * Pure: same rules the dashboard layout used to apply inside an effect. The database (RLS) is still the real barrier;
 * this only decides which screens the UI shows.
 */
export function getRoleRedirect(role: UserRole, pathname: string): string | null {
  // Support roles: only the support desk (restrictive RLS from migration 076).
  if (esRolRestringido(role) && !rutaPermitidaARolRestringido(pathname)) return "/soporte";

  if (role === "OVEM" && ["/", "/kpis", "/consumo", "/combustible"].includes(pathname)) return "/ovem";

  if (role === "MANTENIMIENTO" && startsWithAny(pathname, MANTENIMIENTO_BLOCKED)) return "/vehiculos";

  if (role === "GERENCIAL" && !GERENCIAL_ALLOWED.includes(pathname) && !pathname.startsWith("/admin")) return "/";

  if (role === "COORDINACION" && !startsWithAny(pathname, COORDINACION_ALLOWED)) return "/";

  // SISRES clinical roles and Regulación land on their working screen. ANALISTA is excluded on purpose
  // (parity with ADMIN, migration 046).
  if (["MEDICO", "AUXILIAR_ENFERMERIA", "VISTA", "REGULACION"].includes(role) && pathname === "/") {
    return getDefaultRoute(role);
  }

  return null;
}

/**
 * Role redirect first; otherwise, if an administrator hid the module from this role (Administración → Permisos),
 * the first module the role still sees. Null when the user can stay on the page.
 */
export function getRedirectFor(role: UserRole, pathname: string, hiddenModules: readonly string[]): string | null {
  const byRole = getRoleRedirect(role, pathname);
  if (byRole && byRole !== pathname) return byRole;
  if (!rutaOculta(pathname, hiddenModules)) return null;
  const fallback = rutaDeRespaldo(role, hiddenModules, getDefaultRoute(role));
  return fallback && fallback !== pathname ? fallback : null;
}
