/**
 * Tokens de firma remota (tabla `ti_firma_tokens`, migración 074). Todo pasa por el cliente de servicio: la firma
 * remota es pública (sin sesión) y el usuario autenticado no tiene permiso de escritura sobre esta tabla.
 * Recibe el cliente por parámetro para poder probarlo con una base de mentira.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { generarToken, hashToken, tokenValido, venceEn } from "./firma-remota";

type Cliente = SupabaseClient<Database>;

export interface TokenFirma {
  id: number;
  tabla: string;
  registro_id: number;
  campo_firma: string;
  nombre_firmante: string;
  correo_destino: string;
  usado: boolean;
  expira_en: string;
}

const COLUMNAS = "id, tabla, registro_id, campo_firma, nombre_firmante, correo_destino, usado, expira_en";

/** Marca como usados los tokens vigentes de ese registro y campo (un enlace viejo no debe poder pisar lo nuevo). */
export async function invalidarTokensPendientes(db: Cliente, tabla: string, registroId: number, campo: string): Promise<void> {
  await db.from("ti_firma_tokens").update({ usado: true }).eq("tabla", tabla).eq("registro_id", registroId).eq("campo_firma", campo).eq("usado", false);
}

/**
 * Crea un token nuevo e invalida los pendientes anteriores (solo hay un enlace vivo por registro y campo).
 * Devuelve el token en claro — es la única vez que existe fuera del correo.
 */
export async function crearTokenFirma(
  db: Cliente,
  p: { tabla: string; registroId: number; campo: string; nombre: string; correo: string; dias: number }
): Promise<{ token: string } | { error: string }> {
  await invalidarTokensPendientes(db, p.tabla, p.registroId, p.campo);
  const token = generarToken();
  const { error } = await db.from("ti_firma_tokens").insert({
    tabla: p.tabla,
    registro_id: p.registroId,
    campo_firma: p.campo,
    token_hash: hashToken(token),
    nombre_firmante: p.nombre,
    correo_destino: p.correo,
    expira_en: venceEn(p.dias),
  });
  return error ? { error: error.message } : { token };
}

/** Registros (de una lista) que tienen un enlace de firma vivo: para mostrar "Pendiente de firma por correo". */
export async function registrosConTokenPendiente(db: Cliente, tabla: string, campo: string, ids: number[]): Promise<Set<number>> {
  if (ids.length === 0) return new Set();
  const { data } = await db
    .from("ti_firma_tokens")
    .select("registro_id")
    .eq("tabla", tabla)
    .eq("campo_firma", campo)
    .eq("usado", false)
    .gt("expira_en", new Date().toISOString())
    .in("registro_id", ids);
  return new Set(((data ?? []) as { registro_id: number }[]).map((r) => r.registro_id));
}

/** Lee un token tal cual esté (usado, vencido o vigente) para decidir qué mensaje mostrar. null si el formato o el token no existen. */
export async function leerToken(db: Cliente, token: string | null | undefined): Promise<TokenFirma | null> {
  if (!tokenValido(token)) return null;
  const { data } = await db.from("ti_firma_tokens").select(COLUMNAS).eq("token_hash", hashToken(token)).maybeSingle();
  return (data as TokenFirma | null) ?? null;
}

/**
 * Reclama el token de forma atómica: un solo UPDATE que lo marca usado solo si sigue vigente y devuelve la fila.
 * Si dos envíos llegan a la vez (doble clic, dos pestañas), solo uno recibe la fila; el otro recibe null. Es el
 * equivalente del SELECT … FOR UPDATE de SISRES sin necesitar una transacción abierta.
 */
export async function reclamarToken(db: Cliente, token: string, ip: string | null): Promise<TokenFirma | null> {
  if (!tokenValido(token)) return null;
  const ahora = new Date().toISOString();
  const { data } = await db
    .from("ti_firma_tokens")
    .update({ usado: true, firmado_en: ahora, ip_firmante: ip ? ip.slice(0, 45) : null })
    .eq("token_hash", hashToken(token))
    .eq("usado", false)
    .gt("expira_en", ahora)
    .select(COLUMNAS)
    .maybeSingle();
  return (data as TokenFirma | null) ?? null;
}

/** Deshace un reclamo cuando la firma no llegó a guardarse: el empleado puede volver a intentarlo con el mismo enlace. */
export async function liberarToken(db: Cliente, id: number): Promise<void> {
  await db.from("ti_firma_tokens").update({ usado: false, firmado_en: null, ip_firmante: null }).eq("id", id);
}
