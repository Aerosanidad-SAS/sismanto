// Envío de correo. Dos proveedores, elegidos por las variables de entorno (ver proveedor-correo.ts):
//  · SMTP (HostGator u otro) con nodemailer — equivale a PHPMailer de SISRES. Variables: SMTP_HOST, SMTP_PORT (465 por
//    defecto), SMTP_USER, SMTP_PASS y NOTIFICATIONS_MAIL_FROM. Si ambos están configurados, gana SMTP.
//  · Microsoft Graph (sendMail), con el flujo app-only de src/lib/graph/client.ts.
// Sin ninguno de los dos opera en modo desarrollo: no envía y simula OK.
// Quien llama no cambia: sigue usando enviarCorreo() y emailConfigurado().

import nodemailer from "nodemailer";
import { getAccessToken } from "@/lib/graph/client";
import { configSmtp, proveedorCorreo } from "@/lib/notifications/proveedor-correo";

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
  return proveedorCorreo(process.env) !== "ninguno";
}

/** Envío por SMTP. Los tiempos de espera son cortos: en una función serverless un servidor que no responde no debe colgarla. */
async function enviarPorSmtp(destinatarios: string[], asunto: string, cuerpoHtml: string, adjuntos: AdjuntoCorreo[]): Promise<EmailSendResult> {
  const cfg = configSmtp(process.env);
  try {
    const transporte = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    await transporte.sendMail({
      from: { name: "SISMANTO — Aerosanidad", address: process.env.NOTIFICATIONS_MAIL_FROM!.trim() },
      to: destinatarios,
      subject: asunto,
      html: cuerpoHtml,
      attachments: adjuntos.map((a) => ({ filename: a.nombre, contentType: a.contentType, content: Buffer.from(a.base64, "base64") })),
    });
    return { ok: true, error: null };
  } catch (e) {
    // El mensaje del servidor SMTP no incluye la clave; se recorta por si trae el detalle largo de la conversación.
    return { ok: false, error: `SMTP: ${(e instanceof Error ? e.message : "Error de red").slice(0, 300)}` };
  }
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

  const proveedor = proveedorCorreo(process.env);
  if (proveedor === "ninguno") {
    return { ok: true, error: null };
  }
  if (proveedor === "smtp") return enviarPorSmtp(destinatarios, asunto, cuerpoHtml, adjuntos);

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
