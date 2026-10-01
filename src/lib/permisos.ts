import type { UserRole } from "@/lib/auth-utils";
import { NAV_GROUPS, type NavItem } from "./navegacion";

// Módulos del menú que el administrador le oculta a un rol (Administración → Permisos, migración 107).
// El código (NAV_GROUPS) dice qué módulos PUEDE ver cada rol; la tabla rol_modulo_oculto solo guarda lo que se le
// quitó. Esto restringe la interfaz (menú y rutas); la RLS de la base no cambia.

export const MODULOS: readonly NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

/** Roles que aparecen en el menú, menos ADMIN: a ADMIN no se le oculta nada (no se quedaría sin esta pantalla). */
export const ROLES_CONFIGURABLES: readonly UserRole[] = Array.from(new Set(MODULOS.flatMap((m) => m.roles))).filter(
  (r) => r !== "ADMIN"
);

/** Solo se puede ocultar un módulo que el código le da al rol. */
export function rolPuedeOcultar(rol: string, href: string): boolean {
  return (
    (ROLES_CONFIGURABLES as readonly string[]).includes(rol) &&
    MODULOS.some((m) => m.href === href && (m.roles as readonly string[]).includes(rol))
  );
}

/**
 * Módulo al que pertenece una ruta: el href del menú más largo que la contiene (`/servicios/configuracion` es parte de
 * Servicios; `/soporte/gestion` es su propio módulo, no Soporte). El Dashboard (`/`) solo cubre la raíz exacta.
 */
export function moduloDeRuta(pathname: string): string | null {
  let mejor: string | null = null;
  for (const { href } of MODULOS) {
    const cubre = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
    if (cubre && (mejor === null || href.length > mejor.length)) mejor = href;
  }
  return mejor;
}

export function rutaOculta(pathname: string, ocultos: readonly string[]): boolean {
  const modulo = moduloDeRuta(pathname);
  return modulo !== null && ocultos.includes(modulo);
}

/** Módulos del menú que el rol ve: los que el código le da, menos los ocultos. */
export function moduloVisible(item: NavItem, rol: UserRole, ocultos: readonly string[]): boolean {
  return item.roles.includes(rol) && !ocultos.includes(item.href);
}

/** A dónde mandar a alguien que abrió un módulo oculto: su inicio si lo sigue viendo; si no, el primer módulo visible. */
export function rutaDeRespaldo(rol: UserRole, ocultos: readonly string[], inicio: string): string | null {
  if (!rutaOculta(inicio, ocultos)) return inicio;
  return MODULOS.find((m) => moduloVisible(m, rol, ocultos))?.href ?? null;
}
