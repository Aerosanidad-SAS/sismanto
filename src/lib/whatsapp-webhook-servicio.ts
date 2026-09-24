/**
 * Aplica a la base los estados que informa el webhook de WhatsApp. Recibe el cliente de servicio por parámetro (sin Next
 * ni red) para poder probarlo con una base de mentira.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { parchePorEvento, type EventoEstado } from "@/lib/whatsapp-webhook";

type Cliente = SupabaseClient<Database>;

interface FilaDestinatario {
  id: number;
  campaign_id: number;
  wamid: string;
  estado: string;
  estado_meta: string | null;
  entregado_at: string | null;
  leido_at: string | null;
}

export interface ResumenAplicado {
  eventos: number;
  /** Destinatarios que cambiaron. */
  actualizados: number;
  /** Eventos cuyo wamid no es de una campaña (mensajes automáticos de otros módulos): se ignoran. */
  ignorados: number;
  campanas: number;
}

async function contar(db: Cliente, campaignId: number, columna: "estado" | "entregado_at" | "leido_at", valor?: string): Promise<number> {
  let q = db.from("wa_campaign_recipients").select("id", { count: "exact", head: true }).eq("campaign_id", campaignId);
  q = valor !== undefined ? q.eq(columna, valor) : q.not(columna, "is", null);
  const { count } = await q;
  return count ?? 0;
}

/** Recalcula los contadores de una campaña desde sus destinatarios (no acumula: es seguro ante reintentos y desorden). */
export async function recalcularContadores(db: Cliente, campaignId: number, ahora: () => Date = () => new Date()): Promise<void> {
  const [enviados, fallidos, entregados, leidos] = await Promise.all([
    contar(db, campaignId, "estado", "ENVIADO"),
    contar(db, campaignId, "estado", "FALLIDO"),
    contar(db, campaignId, "entregado_at"),
    contar(db, campaignId, "leido_at"),
  ]);
  await db
    .from("wa_campaigns")
    .update({ total_enviados: enviados, total_fallidos: fallidos, total_entregados: entregados, total_leidos: leidos, updated_at: ahora().toISOString() })
    .eq("id", campaignId);
}

export async function aplicarEstados(db: Cliente, eventos: EventoEstado[], ahora: () => Date = () => new Date()): Promise<ResumenAplicado> {
  const resumen: ResumenAplicado = { eventos: eventos.length, actualizados: 0, ignorados: 0, campanas: 0 };
  if (eventos.length === 0) return resumen;

  const wamids = Array.from(new Set(eventos.map((e) => e.wamid)));
  const { data } = await db
    .from("wa_campaign_recipients")
    .select("id, campaign_id, wamid, estado, estado_meta, entregado_at, leido_at")
    .in("wamid", wamids);
  const porWamid = new Map<string, FilaDestinatario>();
  for (const f of (data ?? []) as unknown as FilaDestinatario[]) porWamid.set(f.wamid, { ...f });

  // Los eventos de un mismo mensaje se aplican en orden cronológico sobre el estado que se va acumulando.
  const ordenados = [...eventos].sort((a, b) => a.en.localeCompare(b.en));
  const campanas = new Set<number>();
  const cambiados = new Set<number>();
  for (const ev of ordenados) {
    const fila = porWamid.get(ev.wamid);
    if (!fila) {
      resumen.ignorados++;
      continue;
    }
    const parche = parchePorEvento(fila, ev);
    if (!parche) continue;
    const { error } = await db.from("wa_campaign_recipients").update(parche).eq("id", fila.id);
    if (error) throw new Error(`No se pudo actualizar el destinatario ${fila.id}: ${error.message}`);
    Object.assign(fila, parche);
    campanas.add(fila.campaign_id);
    cambiados.add(fila.id);
  }

  for (const id of campanas) await recalcularContadores(db, id, ahora);
  resumen.actualizados = cambiados.size;
  resumen.campanas = campanas.size;
  return resumen;
}
