/**
 * Crea el enlace de firma remota de un acta y lo manda por correo (SISRES: enviarCorreoFirmaActa.php).
 * Recibe el cliente de servicio y el envío por parámetro para poder probarlo sin red ni base real.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  ASUNTO_FIRMA,
  DIAS_VALIDEZ_FIRMA,
  MENSAJE_FIRMA,
  armarCorreoFirma,
  asuntoCorreoFirma,
  urlFirma,
} from "./firma-remota";
import { crearTokenFirma } from "./tokens-firma";

export type EnviarCorreoFn = (destinatarios: string[], asunto: string, cuerpoHtml: string) => Promise<{ ok: boolean; error: string | null }>;

export interface DatosEnvioFirma {
  registroId: number;
  numeroOrden: string;
  nombre: string;
  correo: string;
  equipo: string;
  placa: string;
}

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Devuelve `{ ok: true }` si el correo salió, o `{ ok: false, error }` con un mensaje para mostrar al usuario.
 * El token nuevo invalida los anteriores; si el envío falla el token queda creado (se puede reenviar desde el listado).
 */
export async function enviarEnlaceFirmaActa(
  db: SupabaseClient<Database>,
  enviar: EnviarCorreoFn,
  baseUrl: string,
  d: DatosEnvioFirma
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!CORREO.test(d.correo)) return { ok: false, error: "El acta no tiene un correo válido para enviar el enlace de firma." };
  if (!baseUrl) return { ok: false, error: "Falta la URL pública del sitio (NEXT_PUBLIC_APP_URL) para armar el enlace de firma." };

  const creado = await crearTokenFirma(db, {
    tabla: "ti_acta_entrega",
    registroId: d.registroId,
    campo: "recibe",
    nombre: d.nombre,
    correo: d.correo,
    dias: DIAS_VALIDEZ_FIRMA,
  });
  if ("error" in creado) return { ok: false, error: `No se pudo crear el enlace de firma: ${creado.error}` };

  const res = await enviar(
    [d.correo],
    asuntoCorreoFirma(d.placa, ASUNTO_FIRMA),
    armarCorreoFirma(
      { nombre: d.nombre, equipo: d.equipo, placa: d.placa, numeroOrden: d.numeroOrden, enlace: urlFirma(baseUrl, creado.token), dias: DIAS_VALIDEZ_FIRMA },
      MENSAJE_FIRMA
    )
  );
  return res.ok ? { ok: true } : { ok: false, error: `No se pudo enviar el correo: ${res.error ?? "error desconocido"}` };
}
