import { test } from "@playwright/test";
import { RolClave, archivoSesion, tieneCredenciales } from "./roles";

/**
 * Llamar dentro de un `describe`: aplica la sesión del rol y omite el bloque si no hay credenciales.
 * La sesión la crea `auth.setup.ts` antes de las pruebas, así que no se puede comprobar el archivo al cargar:
 * si el login de un rol falla, es ese test de `setup` el que debe fallar a la vista.
 */
export function usarRol(clave: RolClave) {
  test.skip(!tieneCredenciales(clave), `sin credenciales para ${clave}`);
  test.use({ storageState: archivoSesion(clave) });
}
