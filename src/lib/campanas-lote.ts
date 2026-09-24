/**
 * Envío por lotes de una campaña de WhatsApp y cambios de estado (SISRES: procesarLoteCampana.php, estadoCampana.php).
 * Recibe el cliente de base de datos y el envío por parámetro (sin Next ni red) para poder probarlo con dobles.
 *
 * Garantías que da este módulo, y que el código anterior no daba:
 *  1. **Un destinatario no recibe el mensaje dos veces.** Cada uno se RECLAMA con un UPDATE condicional
 *     (PENDIENTE → ENVIANDO) antes de enviarlo: si dos lotes corren a la vez (dos pestañas, reanudar con un lote viejo
 *     todavía activo), solo uno lo consigue.
 *  2. **Pausar/cancelar detiene el envío incluso en medio de un lote:** se vuelve a leer el estado antes de cada envío.
 *  3. **Un lote que termina no pisa una pausa o una cancelación:** los cambios de estado del lote son condicionales
 *     (`WHERE estado IN (...)`). Antes el UPDATE final ponía EN_PROCESO/COMPLETADA sin mirar, y cancelar mientras se
 *     enviaba no servía.
 *  4. **Los contadores se recalculan desde los destinatarios** (no "el valor que leí + lo que envié"): dos lotes
 *     simultáneos ya no se pisan el total.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  ESTADOS_SIN_ENVIO,
  MINUTOS_RECLAMO_VENCIDO,
  TRANSICIONES,
  mensajeNoPermitido,
  type AccionCampana,
} from "@/lib/campanas-estado";

type Cliente = SupabaseClient<Database>;

export interface ResultadoEnvio {
  ok: boolean;
  wamid: string | null;
  error: string | null;
}

export interface DepsLote {
  enviar: (telefono: string, plantilla: string, idioma: string, parametros: string[]) => Promise<ResultadoEnvio>;
  esperar: (ms: number) => Promise<unknown>;
  ahora: () => Date;
  /** false = simulación (sin credenciales): no hay pausa entre envíos. */
  envioReal: boolean;
  pausaEntreEnviosMs: number;
  tamanoLote: number;
}

export type ResultadoLote =
  | { error: string }
  | { success: true; procesados: number; restantes: number; estado: string; simulado: boolean };

async function contar(db: Cliente, campaignId: number, estados: string[]): Promise<number> {
  const { count } = await db
    .from("wa_campaign_recipients")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .in("estado", estados);
  return count ?? 0;
}

/** Devuelve a PENDIENTE los destinatarios que llevan demasiado tiempo ENVIANDO (el servidor cayó a mitad de un lote). */
export async function liberarReclamosVencidos(db: Cliente, campaignId: number, ahora: Date): Promise<void> {
  const limite = new Date(ahora.getTime() - MINUTOS_RECLAMO_VENCIDO * 60000).toISOString();
  await db
    .from("wa_campaign_recipients")
    .update({ estado: "PENDIENTE", sent_at: null })
    .eq("campaign_id", campaignId)
    .eq("estado", "ENVIANDO")
    .lt("sent_at", limite);
}

async function estadoActual(db: Cliente, campaignId: number): Promise<string | null> {
  const { data } = await db.from("wa_campaigns").select("estado").eq("id", campaignId).maybeSingle();
  return (data as { estado: string } | null)?.estado ?? null;
}

export async function procesarLote(db: Cliente, campaignId: number, deps: DepsLote): Promise<ResultadoLote> {
  const { data } = await db.from("wa_campaigns").select("*").eq("id", campaignId).maybeSingle();
  const campana = data as unknown as { id: number; estado: string; plantilla: string; idioma: string } | null;
  if (!campana) return { error: "Campaña no encontrada" };
  if (campana.estado === "PAUSADA") return { error: "La campaña está pausada. Reanúdala para seguir enviando." };
  if (campana.estado === "COMPLETADA" || campana.estado === "CANCELADA") return { error: `La campaña ya está ${campana.estado}` };

  await liberarReclamosVencidos(db, campana.id, deps.ahora());

  const { data: pend } = await db
    .from("wa_campaign_recipients")
    .select("id, telefono, parametros")
    .eq("campaign_id", campana.id)
    .eq("estado", "PENDIENTE")
    .order("id")
    .limit(deps.tamanoLote);
  const pendientes = (pend ?? []) as unknown as { id: number; telefono: string; parametros: unknown }[];

  if (pendientes.length === 0) {
    // Nada que reclamar: o terminó, o otro lote todavía está enviando lo último (ENVIANDO).
    const enCurso = await contar(db, campana.id, ["ENVIANDO"]);
    if (enCurso === 0) {
      await cerrarSiTermino(db, campana.id, deps);
    }
    return { success: true, procesados: 0, restantes: enCurso, estado: (await estadoActual(db, campana.id)) ?? campana.estado, simulado: !deps.envioReal };
  }

  // Empieza (o sigue) el envío: solo desde BORRADOR/EN_PROCESO, nunca sobre una pausa o cancelación que llegó ahora mismo.
  await db
    .from("wa_campaigns")
    .update({ estado: "EN_PROCESO", updated_at: deps.ahora().toISOString() })
    .eq("id", campana.id)
    .in("estado", ["BORRADOR", "EN_PROCESO"]);

  let procesados = 0;
  for (let i = 0; i < pendientes.length; i++) {
    if (i > 0) {
      if (deps.envioReal) await deps.esperar(deps.pausaEntreEnviosMs);
      // Pausar o cancelar durante el lote: se corta aquí. Lo que no se reclamó sigue PENDIENTE.
      const estado = await estadoActual(db, campana.id);
      if (estado === null || (ESTADOS_SIN_ENVIO as readonly string[]).includes(estado)) break;
    }
    const dest = pendientes[i];
    const { data: reclamado } = await db
      .from("wa_campaign_recipients")
      .update({ estado: "ENVIANDO", sent_at: deps.ahora().toISOString() })
      .eq("id", dest.id)
      .eq("estado", "PENDIENTE")
      .select("id");
    if (!reclamado || reclamado.length === 0) continue; // otro lote ya lo tomó

    const params = Array.isArray(dest.parametros) ? (dest.parametros as unknown[]).map(String) : [];
    const res = await deps.enviar(dest.telefono, campana.plantilla, campana.idioma, params);
    await db
      .from("wa_campaign_recipients")
      .update({
        estado: res.ok ? "ENVIADO" : "FALLIDO",
        wamid: res.wamid,
        error: res.error,
        sent_at: deps.ahora().toISOString(),
      })
      .eq("id", dest.id);
    procesados++;
  }

  await cerrarSiTermino(db, campana.id, deps);
  const restantes = await contar(db, campana.id, ["PENDIENTE", "ENVIANDO"]);
  return { success: true, procesados, restantes, estado: (await estadoActual(db, campana.id)) ?? campana.estado, simulado: !deps.envioReal };
}

/** Recalcula los contadores desde los destinatarios y, si ya no queda nada por enviar, cierra la campaña SOLO si sigue EN_PROCESO. */
async function cerrarSiTermino(db: Cliente, campaignId: number, deps: DepsLote): Promise<void> {
  const [enviados, fallidos, restantes] = await Promise.all([
    contar(db, campaignId, ["ENVIADO"]),
    contar(db, campaignId, ["FALLIDO"]),
    contar(db, campaignId, ["PENDIENTE", "ENVIANDO"]),
  ]);
  await db
    .from("wa_campaigns")
    .update({ total_enviados: enviados, total_fallidos: fallidos, updated_at: deps.ahora().toISOString() })
    .eq("id", campaignId);
  if (restantes === 0) {
    await db
      .from("wa_campaigns")
      .update({ estado: "COMPLETADA", updated_at: deps.ahora().toISOString() })
      .eq("id", campaignId)
      .in("estado", ["BORRADOR", "EN_PROCESO"]);
  }
}

/**
 * Pausa, reanuda o cancela. El UPDATE es condicional al estado de origen: si otra persona ya la cambió (o ya terminó),
 * no hace nada y se explica el motivo. Al reanudar se liberan los reclamos abandonados.
 */
export async function cambiarEstadoCampana(
  db: Cliente,
  campaignId: number,
  accion: AccionCampana,
  ahora: () => Date = () => new Date()
): Promise<{ error: string } | { success: true; estado: string }> {
  const t = TRANSICIONES[accion];
  const { data } = await db
    .from("wa_campaigns")
    .update({ estado: t.hacia, updated_at: ahora().toISOString() })
    .eq("id", campaignId)
    .in("estado", [...t.desde])
    .select("id");
  if (!data || data.length === 0) {
    const actual = await estadoActual(db, campaignId);
    return { error: actual === null ? "Campaña no encontrada" : mensajeNoPermitido(actual, accion) };
  }
  if (accion === "reanudar") await liberarReclamosVencidos(db, campaignId, ahora());
  return { success: true, estado: t.hacia };
}
