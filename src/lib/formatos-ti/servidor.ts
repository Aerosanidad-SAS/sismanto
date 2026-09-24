/**
 * Ayudas de servidor compartidas por las acciones de los Formatos TI. No lleva "use server" (no son acciones
 * que el cliente pueda invocar): se importan desde las acciones de cada formato.
 */
import { getProfile } from "@/app/api/actions/auth";
import { ROLES_FORMATOS_TI } from "./comun";

/** Corta la acción si quien la llama no es de TI. Devuelve el mensaje de error, o null si puede seguir. */
export async function errorSiNoEsTi(): Promise<string | null> {
  const profile = await getProfile();
  return (ROLES_FORMATOS_TI as readonly string[]).includes(profile?.role_codigo ?? "")
    ? null
    : "No tienes permiso para los Formatos TI";
}
