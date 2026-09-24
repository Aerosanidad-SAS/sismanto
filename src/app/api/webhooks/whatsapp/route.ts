import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { aplicarEstados } from "@/lib/whatsapp-webhook-servicio";
import { extraerEstados, firmaValida, responderVerificacion } from "@/lib/whatsapp-webhook";

/**
 * Webhook de WhatsApp Cloud API (Meta) — PÚBLICO a propósito: Meta lo llama sin sesión. La autenticidad la da:
 *   GET  → el token de verificación (`WHATSAPP_WEBHOOK_VERIFY_TOKEN`), comparado en tiempo constante;
 *   POST → la firma HMAC-SHA256 del cuerpo con `WHATSAPP_APP_SECRET` (OBLIGATORIA: sin secreto se rechaza todo).
 * Activación en Meta: Webhooks → Callback URL = https://<dominio>/api/webhooks/whatsapp, Verify token = el mismo valor
 * de WHATSAPP_WEBHOOK_VERIFY_TOKEN, y suscribir el campo "messages".
 */
export const dynamic = "force-dynamic";

const CUERPO_MAX_BYTES = 1024 * 1024;

export async function GET(request: NextRequest): Promise<Response> {
  const p = request.nextUrl.searchParams;
  const challenge = responderVerificacion(
    { mode: p.get("hub.mode"), token: p.get("hub.verify_token"), challenge: p.get("hub.challenge") },
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  );
  if (challenge === null) return new Response("Forbidden", { status: 403 });
  return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
}

export async function POST(request: NextRequest): Promise<Response> {
  const secreto = process.env.WHATSAPP_APP_SECRET;
  // Despliegue mal configurado: mejor un error visible que aceptar eventos sin poder comprobar de dónde vienen.
  if (!secreto) return new Response("Webhook no configurado", { status: 503 });

  const declarado = Number(request.headers.get("content-length") ?? 0);
  if (declarado > CUERPO_MAX_BYTES) return new Response("Demasiado grande", { status: 413 });

  const crudo = Buffer.from(await request.arrayBuffer());
  if (crudo.length > CUERPO_MAX_BYTES) return new Response("Demasiado grande", { status: 413 });
  if (!firmaValida(crudo, request.headers.get("x-hub-signature-256"), secreto)) return new Response("Firma inválida", { status: 403 });

  let payload: unknown;
  try {
    payload = JSON.parse(crudo.toString("utf8"));
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }

  try {
    await aplicarEstados(createAdminClient(), extraerEstados(payload));
  } catch (e) {
    // 500 para que Meta reintente (los eventos son idempotentes y no retroceden estados).
    console.error("[webhook whatsapp]", e instanceof Error ? e.message : e);
    return new Response("Error interno", { status: 500 });
  }
  return new Response("EVENT_RECEIVED", { status: 200 });
}
