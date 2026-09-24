/**
 * Ayudas de servidor compartidas por las acciones de los Formatos TI. No lleva "use server" (no son acciones
 * que el cliente pueda invocar): se importan desde las acciones de cada formato.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfile } from "@/app/api/actions/auth";
import type { Database } from "@/lib/supabase/database.types";
import { BUCKET_FIRMAS, ROLES_FORMATOS_TI } from "./comun";
import { calcularHashRegistro, rutaFirma, validarFirmaPng } from "./firma";

/** Corta la acción si quien la llama no es de TI. Devuelve el mensaje de error, o null si puede seguir. */
export async function errorSiNoEsTi(): Promise<string | null> {
  const profile = await getProfile();
  return (ROLES_FORMATOS_TI as readonly string[]).includes(profile?.role_codigo ?? "")
    ? null
    : "No tienes permiso para los Formatos TI";
}

export interface FirmaGuardada {
  ruta: string;
  hash: string;
  hashPng: string;
}

/**
 * Valida una firma dibujada, la sube a Storage y calcula su hash de integridad con los campos clave del
 * registro. null si no llegó firma; lanza Error con un mensaje legible si llegó pero es inválida o no se pudo subir.
 */
export async function guardarFirma(
  supabase: SupabaseClient<Database>,
  formato: string,
  registroId: number,
  lado: string,
  dataUri: string | null | undefined,
  camposClave: Record<string, unknown>,
  fechaCreacion: string
): Promise<FirmaGuardada | null> {
  if (!dataUri) return null;
  const valida = validarFirmaPng(dataUri);
  if (!valida) throw new Error(`La firma "${lado}" no es una imagen PNG válida`);
  const ruta = rutaFirma(formato, registroId, lado);
  const { error } = await supabase.storage.from(BUCKET_FIRMAS).upload(ruta, valida.bytes, {
    contentType: "image/png",
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(`No se pudo guardar la firma "${lado}": ${error.message}`);
  return { ruta, hashPng: valida.hashPng, hash: calcularHashRegistro(camposClave, valida.hashPng, fechaCreacion) };
}

/** Borra archivos de firma de Storage sin interrumpir el flujo si alguno falla (es limpieza, no lógica de negocio). */
export async function borrarFirmas(supabase: SupabaseClient<Database>, rutas: (string | null | undefined)[]) {
  const validas = rutas.filter((r): r is string => !!r);
  if (validas.length === 0) return;
  await supabase.storage.from(BUCKET_FIRMAS).remove(validas);
}

/** URL firmada de una firma (5 minutos), o null si no existe. */
export async function urlFirmada(supabase: SupabaseClient<Database>, ruta: string | null | undefined): Promise<string | null> {
  if (!ruta) return null;
  const { data, error } = await supabase.storage.from(BUCKET_FIRMAS).createSignedUrl(ruta, 300);
  return error || !data ? null : data.signedUrl;
}

/** Descarga los bytes de una firma desde Storage (para incrustarla en el PDF y recalcular su hash). */
export async function descargarFirma(supabase: SupabaseClient<Database>, ruta: string | null | undefined): Promise<Buffer | null> {
  if (!ruta) return null;
  const { data, error } = await supabase.storage.from(BUCKET_FIRMAS).download(ruta);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}
