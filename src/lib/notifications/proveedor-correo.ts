// Qué servicio de correo usar según las variables de entorno. Puro (sin red ni librerías) para poder probarlo.
//
//  · SMTP (HostGator u otro): SMTP_HOST + SMTP_USER + SMTP_PASS + NOTIFICATIONS_MAIL_FROM. Es lo que usaba SISRES (PHPMailer).
//  · Microsoft Graph: AZURE_TENANT_ID + AZURE_CLIENT_ID + AZURE_CLIENT_SECRET + NOTIFICATIONS_MAIL_FROM.
//  · Si están los dos conjuntos, gana SMTP: es el que la organización ya tiene en uso.
//  · Si no hay ninguno, el envío se simula (modo desarrollo), como siempre.

export type ProveedorCorreo = "smtp" | "graph" | "ninguno";

type Entorno = Record<string, string | undefined>;

export function proveedorCorreo(env: Entorno): ProveedorCorreo {
  const remitente = Boolean(env.NOTIFICATIONS_MAIL_FROM?.trim());
  if (remitente && env.SMTP_HOST?.trim() && env.SMTP_USER?.trim() && env.SMTP_PASS) return "smtp";
  if (remitente && env.AZURE_TENANT_ID && env.AZURE_CLIENT_ID && env.AZURE_CLIENT_SECRET) return "graph";
  return "ninguno";
}

export interface ConfigSmtp {
  host: string;
  port: number;
  /** true = TLS desde el inicio (puerto 465); false = STARTTLS en 587. */
  secure: boolean;
  user: string;
  pass: string;
}

/** Puerto 465 por defecto (HostGator: SSL/TLS). `SMTP_SECURE` puede forzarlo; si no, se deduce del puerto. */
export function configSmtp(env: Entorno): ConfigSmtp {
  const puertoLeido = Number.parseInt(env.SMTP_PORT ?? "", 10);
  const port = Number.isInteger(puertoLeido) && puertoLeido > 0 && puertoLeido <= 65535 ? puertoLeido : 465;
  const forzado = env.SMTP_SECURE?.trim().toLowerCase();
  const secure = forzado === "true" ? true : forzado === "false" ? false : port === 465;
  return { host: (env.SMTP_HOST ?? "").trim(), port, secure, user: (env.SMTP_USER ?? "").trim(), pass: env.SMTP_PASS ?? "" };
}
