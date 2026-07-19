// Envío de correo vía Microsoft Graph (sendMail) — reutiliza el flujo
// app-only de src/lib/graph/client.ts. Reemplaza a PHPMailer/SMTP de SISRES.
// Env adicional: NOTIFICATIONS_MAIL_FROM (buzón remitente del tenant).
// Sin esa variable opera en modo desarrollo: no envía y simula OK.

import { getAccessToken } from "@/lib/graph/client";

export interface EmailSendResult {
  ok: boolean;
  error: string | null;
}

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
  cuerpoHtml: string
): Promise<EmailSendResult> {
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
