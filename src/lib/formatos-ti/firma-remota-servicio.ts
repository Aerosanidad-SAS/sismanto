/**
 * Lógica de la firma remota del Acta de Entrega (SISRES: firmarActaCorreo.php + procesarFirmaActaCorreo.php).
 * Recibe el cliente de servicio por parámetro y no depende de Next: la acción pública solo pone la sesión-less
 * `createAdminClient()` y la IP, y aquí se puede probar con una base y un Storage de mentira.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { camposClaveEntrega, type ActaEntregaFila } from "./acta-entrega";
import { anclaFecha, validarFirmaPng } from "./firma";
import { tokenVigente } from "./firma-remota";
import { borrarFirmas, guardarFirma } from "./storage-firmas";
import { leerToken, liberarToken, reclamarToken } from "./tokens-firma";

type Cliente = SupabaseClient<Database>;

export type ContextoFirma =
  | { estado: "invalido" | "usado" | "vencido" | "firmada" }
  | { estado: "ok"; nombre: string; equipo: string; placa: string; numeroOrden: string; vence: string };

const TABLA = "ti_acta_entrega";

/** Qué debe mostrar la pantalla pública para un token. Nunca devuelve más datos que los que necesita esa pantalla. */
export async function contextoFirma(db: Cliente, token: string): Promise<ContextoFirma> {
  const t = await leerToken(db, token);
  if (!t || t.tabla !== TABLA) return { estado: "invalido" };
  const { data } = await db
    .from(TABLA)
    .select("numero_orden, equipo_referencia, equipo_marca, equipo_modelo, equipo_placa, firma_recibe_ruta")
    .eq("id", t.registro_id)
    .maybeSingle();
  const acta = data as Pick<ActaEntregaFila, "numero_orden" | "equipo_referencia" | "equipo_marca" | "equipo_modelo" | "equipo_placa" | "firma_recibe_ruta"> | null;
  if (!acta) return { estado: "invalido" };
  // Ya firmada (por este enlace o a mano): se dice así, sin ofrecer firmar de nuevo.
  if (acta.firma_recibe_ruta) return { estado: "firmada" };
  if (t.usado) return { estado: "usado" };
  if (!tokenVigente(t)) return { estado: "vencido" };
  return {
    estado: "ok",
    nombre: t.nombre_firmante,
    equipo: [acta.equipo_referencia, acta.equipo_marca, acta.equipo_modelo].filter(Boolean).join(" "),
    placa: acta.equipo_placa,
    numeroOrden: acta.numero_orden,
    vence: t.expira_en,
  };
}

/**
 * Guarda la firma de quien recibe. El token se reclama de forma atómica: un enlace firma una sola vez.
 * Si algo falla DESPUÉS de reclamarlo y antes de guardar, el token se libera para que pueda reintentar con el mismo enlace.
 */
export async function procesarFirmaRemota(db: Cliente, token: string, dataUri: string, ip: string | null): Promise<{ success: true } | { error: string }> {
  // La imagen se valida ANTES de reclamar el token: una firma corrupta no debe quemar el enlace.
  if (!validarFirmaPng(dataUri)) return { error: "La firma no es válida. Dibújala de nuevo." };

  const t = await reclamarToken(db, token, ip);
  if (!t || t.tabla !== TABLA) return { error: "Este enlace ya no es válido: se usó o venció." };

  const { data } = await db.from(TABLA).select("*").eq("id", t.registro_id).maybeSingle();
  const acta = data as unknown as ActaEntregaFila | null;
  if (!acta) return { error: "El acta ya no existe." };
  // Ya se firmó por otra vía mientras el enlace estaba pendiente: no se pisa esa firma.
  if (acta.firma_recibe_ruta) return { error: "Esta acta ya está firmada." };

  let guardada;
  try {
    guardada = await guardarFirma(db, "acta-entrega", acta.id, "recibe", dataUri, camposClaveEntrega(acta), anclaFecha(acta.created_at));
  } catch (e) {
    await liberarToken(db, t.id);
    return { error: e instanceof Error ? e.message : "No se pudo guardar la firma." };
  }
  if (!guardada) {
    await liberarToken(db, t.id);
    return { error: "No se pudo guardar la firma." };
  }

  // `.eq("firma_recibe_ruta", "")` cierra la carrera con una firma manual que llegue justo ahora.
  const { data: actualizadas, error } = await db
    .from(TABLA)
    .update({
      firma_recibe_ruta: guardada.ruta,
      firma_recibe_hash: guardada.hash,
      firmas_png: { ...(acta.firmas_png ?? {}), recibe: guardada.hashPng },
      updated_at: new Date().toISOString(),
    })
    .eq("id", acta.id)
    .eq("firma_recibe_ruta", "")
    .select("id");
  if (error || !actualizadas || actualizadas.length === 0) {
    await borrarFirmas(db, [guardada.ruta]);
    if (error) {
      await liberarToken(db, t.id);
      return { error: "No se pudo guardar la firma. Intenta de nuevo." };
    }
    return { error: "Esta acta ya está firmada." };
  }
  return { success: true };
}
