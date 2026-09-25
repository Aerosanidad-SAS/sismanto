import type { UserRole } from "@/lib/auth-utils";

/**
 * Selector de roles para desarrollo ("Ver como…"). Constantes compartidas entre la acción de servidor, el
 * componente y el script de siembra. Sin dependencias de Next para poder importarlo desde `scripts/`.
 */

/** Roles a los que el ADMIN puede "entrar" (uno por usuario de prueba). ADMIN no está: es la sesión real. */
export const ROLES_SELECTOR: UserRole[] = [
  "REGULACION",
  "OVEM",
  "MEDICO",
  "AUXILIAR_ENFERMERIA",
  "MANTENIMIENTO",
  "COORDINACION",
  "GERENCIAL",
  "ANALISTA",
  "VISTA",
  "TECNICO",
  "AEROPUERTO",
];

/** Dominio inexistente: los usuarios de prueba no tienen buzón, solo se entra por el selector. */
export const TEST_EMAIL_DOMAIN = "sismanto.test";

export function testEmailForRole(role: string): string {
  return `test.${role.toLowerCase()}@${TEST_EMAIL_DOMAIN}`;
}

/** Cookie httpOnly firmada con la sesión del ADMIN de origen (para poder volver). */
export const ORIGIN_COOKIE = "sismanto_role_switch_origin";
export const ORIGIN_TTL_SECONDS = 8 * 60 * 60;

/**
 * El selector solo existe si `ROLE_SWITCHER_ENABLED=true` (variable de servidor que se define únicamente en el
 * entorno Preview de Vercel y en `.env.local`) y el despliegue NO es de producción. `VERCEL_ENV` lo pone la
 * plataforma en tiempo de ejecución. Sin la variable, todo queda apagado (fail-closed).
 */
export function roleSwitcherEnabled(): boolean {
  return process.env.ROLE_SWITCHER_ENABLED === "true" && process.env.VERCEL_ENV !== "production";
}
