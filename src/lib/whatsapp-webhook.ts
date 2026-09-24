/**
 * Webhook de WhatsApp Cloud API (SISRES: wa_api/waWebhook.php). Funciones puras: verificar que la petición viene de Meta,
 * extraer los estados de los mensajes y decidir qué cambiar en cada destinatario. Sin Next ni base de datos.
 *
 * Diferencia deliberada con SISRES: allí la verificación de la firma era OPCIONAL (si no se definía el secreto, el
 * webhook aceptaba cualquier POST de cualquiera). Aquí es OBLIGATORIA: sin `WHATSAPP_APP_SECRET` el webhook rechaza todo.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

/** Igualdad de textos en tiempo constante (no revela cuántos caracteres coinciden). */
export function igualesSeguro(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Verificación del webhook (GET): Meta manda `hub.mode=subscribe`, `hub.verify_token` y `hub.challenge`; hay que
 * devolver el challenge tal cual si el token coincide. null si no corresponde responder.
 */
export function responderVerificacion(
  params: { mode: string | null; token: string | null; challenge: string | null },
  tokenEsperado: string | undefined
): string | null {
  if (!tokenEsperado || params.mode !== "subscribe" || !params.token || params.challenge === null) return null;
  return igualesSeguro(params.token, tokenEsperado) ? params.challenge : null;
}

/**
 * Firma del cuerpo (POST): `X-Hub-Signature-256: sha256=<hex>` = HMAC-SHA256 del cuerpo CRUDO con el secreto de la app.
 * Se verifica sobre los bytes recibidos, no sobre el JSON re-serializado. Sin secreto configurado siempre da false.
 */
export function firmaValida(cuerpoCrudo: string | Buffer, cabecera: string | null, secreto: string | undefined): boolean {
  if (!secreto || !cabecera) return false;
  const esperada = `sha256=${createHmac("sha256", secreto).update(cuerpoCrudo).digest("hex")}`;
  return igualesSeguro(esperada, cabecera.trim());
}

export type EstadoMeta = "sent" | "delivered" | "read" | "failed";

export interface EventoEstado {
  wamid: string;
  estado: EstadoMeta;
  /** Instante del evento según Meta, en ISO. */
  en: string;
  error: string | null;
}

const ESTADOS: readonly string[] = ["sent", "delivered", "read", "failed"];
const MAX_EVENTOS = 500;

/** Saca los estados de mensaje del payload de Meta; ignora lo que no tenga la forma esperada (mensajes entrantes, otros campos). */
export function extraerEstados(payload: unknown, ahora: () => Date = () => new Date()): EventoEstado[] {
  const out: EventoEstado[] = [];
  const entradas = (payload as { entry?: unknown } | null)?.entry;
  if (!Array.isArray(entradas)) return out;
  for (const entrada of entradas) {
    const cambios = (entrada as { changes?: unknown })?.changes;
    if (!Array.isArray(cambios)) continue;
    for (const cambio of cambios) {
      const estados = (cambio as { value?: { statuses?: unknown } })?.value?.statuses;
      if (!Array.isArray(estados)) continue;
      for (const st of estados) {
        const s = st as { id?: unknown; status?: unknown; timestamp?: unknown; errors?: unknown };
        if (typeof s.id !== "string" || s.id === "" || s.id.length > 120) continue;
        if (typeof s.status !== "string" || !ESTADOS.includes(s.status)) continue;
        const seg = Number(s.timestamp);
        const en = Number.isFinite(seg) && seg > 0 ? new Date(seg * 1000) : ahora();
        const err = Array.isArray(s.errors) ? (s.errors[0] as { code?: unknown; title?: unknown; message?: unknown } | undefined) : undefined;
        const textoError = err ? [err.code, err.title ?? err.message].filter((x) => x !== undefined && x !== null && x !== "").join(" — ").slice(0, 300) : "";
        out.push({ wamid: s.id, estado: s.status as EstadoMeta, en: en.toISOString(), error: s.status === "failed" ? textoError || "Falló según WhatsApp" : null });
        if (out.length >= MAX_EVENTOS) return out;
      }
    }
  }
  return out;
}

export interface DestinatarioActual {
  estado: string;
  estado_meta: string | null;
  entregado_at: string | null;
  leido_at: string | null;
}

export type Parche = Partial<{
  estado: string;
  estado_meta: string;
  entregado_at: string;
  leido_at: string;
  error: string;
}>;

const ORDEN: Record<string, number> = { sent: 1, delivered: 2, read: 3 };

/**
 * Qué cambiar en un destinatario ante un evento. Reglas:
 *  - **No retrocede:** los eventos pueden llegar desordenados o repetidos (Meta reintenta). Un `delivered` que llega
 *    después de un `read` no pisa el estado ni las fechas; una fecha ya guardada no se reescribe.
 *  - `read` implica `delivered`: si nunca llegó el aviso de entrega, la fecha de entrega es la de lectura.
 *  - `failed` pasa el destinatario a FALLIDO con el motivo de Meta (un mensaje que la API aceptó y luego no se entregó),
 *    salvo que ya se haya confirmado entregado o leído (un `failed` tardío no desmiente una entrega).
 * null si el evento no cambia nada.
 */
export function parchePorEvento(actual: DestinatarioActual, ev: EventoEstado): Parche | null {
  const p: Parche = {};
  if (ev.estado === "failed") {
    if (actual.entregado_at || actual.leido_at || actual.estado === "FALLIDO") return null;
    p.estado = "FALLIDO";
    p.estado_meta = "failed";
    if (ev.error) p.error = ev.error;
    return p;
  }
  const rangoNuevo = ORDEN[ev.estado];
  const rangoActual = ORDEN[actual.estado_meta ?? ""] ?? 0;
  if (rangoNuevo > rangoActual) p.estado_meta = ev.estado;
  if ((ev.estado === "delivered" || ev.estado === "read") && !actual.entregado_at) p.entregado_at = ev.en;
  if (ev.estado === "read" && !actual.leido_at) p.leido_at = ev.en;
  return Object.keys(p).length > 0 ? p : null;
}
