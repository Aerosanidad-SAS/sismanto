// Envío de correo vía Microsoft Graph (sendMail) — reutiliza el flujo
// app-only de src/lib/graph/client.ts. Reemplaza a PHPMailer/SMTP de SISRES.
// Env adicional: NOTIFICATIONS_MAIL_FROM (buzón remitente del tenant).
// Sin esa variable opera en modo desarrollo: no envía y simula OK.

import { getAccessToken } from "@/lib/graph/client";

export interface EmailSendResult {
  ok: boolean;
  error: string | null;
}

/** Archivo adjunto (fileAttachment de Graph). Los bytes van en base64. */
export interface AdjuntoCorreo {
  nombre: string;
  contentType: string;
  base64: string;
}

/** Graph `sendMail` lleva los adjuntos dentro del JSON: el total no debe pasar de ~3 MB (4 MB es el tope de la petición). */
const ADJUNTOS_MAX_BYTES = 3 * 1024 * 1024;

export function emailConfigurado(): boolean {
  return Boolean(
    process.env.NOTIFICATIONS_MAIL_FROM &&
    process.env.AZURE_TENANT_ID &&
    process.env.AZURE_CLIENT_ID &&
    process.env.AZURE_CLIENT_SECRET
  );
}

export async function enviarCorreo(
  destinatarios: string[],
  asunto: string,
  cuerpoHtml: string,
  adjuntos: AdjuntoCorreo[] = []
): Promise<EmailSendResult> {
  // El tamaño se comprueba aunque el correo no esté configurado: un adjunto demasiado grande es un error de quien llama.
  const bytes = adjuntos.reduce((n, a) => n + Math.floor((a.base64.length * 3) / 4), 0);
  if (bytes > ADJUNTOS_MAX_BYTES) return { ok: false, error: "Los adjuntos superan los 3 MB permitidos" };

  if (!emailConfigurado()) {
    return { ok: true, error: null };
  }

  const from = process.env.NOTIFICATIONS_MAIL_FROM!;
  try {
    const token = await getAccessToken();
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            subject: asunto,
            body: { contentType: "HTML", content: cuerpoHtml },
            toRecipients: destinatarios.map((address) => ({ emailAddress: { address } })),
            ...(adjuntos.length > 0
              ? {
                  attachments: adjuntos.map((a) => ({
                    "@odata.type": "#microsoft.graph.fileAttachment",
                    name: a.nombre,
                    contentType: a.contentType,
                    contentBytes: a.base64,
                  })),
                }
              : {}),
          },
          saveToSentItems: true,
        }),
      }
    );

    if (res.status === 202) return { ok: true, error: null };
    const text = await res.text();
    return { ok: false, error: `Graph sendMail ${res.status}: ${text.slice(0, 300)}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error de red" };
  }
}
