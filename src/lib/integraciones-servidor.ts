import { createAdminClient } from "@/lib/supabase/admin";
import { CAMPOS_INTEGRACION, campoIntegracion } from "@/lib/integraciones";

// Lectura de los parámetros de integraciones (migración 099) SOLO en el servidor, con la clave de servicio: la tabla
// no tiene políticas. Orden: valor escrito en la aplicación → variable de entorno → valor por defecto del catálogo.
// Nunca importar esto desde un componente de cliente (usa la clave de servicio).

export type ClaveIntegracion = (typeof CAMPOS_INTEGRACION)[number]["clave"];

/** Valores guardados en la tabla (o {} si no existe todavía o no hay clave de servicio). */
export async function leerIntegracionesGuardadas(): Promise<Record<string, string>> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return {};
  const { data, error } = await createAdminClient().from("integraciones_config").select("clave, valor");
  if (error || !data) return {};
  return Object.fromEntries((data as unknown as { clave: string; valor: string }[]).map((r) => [r.clave, r.valor]));
}

/** Valor efectivo de un parámetro, o null si no está configurado en ningún lado. */
export async function valorIntegracion(clave: ClaveIntegracion, guardados?: Record<string, string>): Promise<string | null> {
  const campo = campoIntegracion(clave);
  if (!campo) return null;
  const g = guardados ?? (await leerIntegracionesGuardadas());
  return g[clave]?.trim() || process.env[campo.env]?.trim() || campo.porDefecto || null;
}
