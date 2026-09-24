/**
 * Ayudas de servidor compartidas por las acciones de los Formatos TI. No lleva "use server" (no son acciones
 * que el cliente pueda invocar): se importan desde las acciones de cada formato.
 */
import { headers } from "next/headers";
import { getProfile } from "@/app/api/actions/auth";
import { ROLES_FORMATOS_TI } from "./comun";

/** URL pública del sitio para armar enlaces de correo: NEXT_PUBLIC_APP_URL o, si falta, el host de la petición. */
export function urlBaseSitio(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  if (env) return env.replace(/\/+$/, "");
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "";
  return `${h.get("x-forwarded-proto") ?? "https"}://${host}`;
}

/** Corta la acción si quien la llama no es de TI. Devuelve el mensaje de error, o null si puede seguir. */
export async function errorSiNoEsTi(): Promise<string | null> {
  const profile = await getProfile();
  return (ROLES_FORMATOS_TI as readonly string[]).includes(profile?.role_codigo ?? "")
    ? null
    : "No tienes permiso para los Formatos TI";
}
