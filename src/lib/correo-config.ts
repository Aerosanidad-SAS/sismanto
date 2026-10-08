// Configuración del correo saliente editable por el ADMIN (Administración → Configuración general). Puro, para probarlo.
//
// Los valores se guardan con el mismo mecanismo que las integraciones (tabla `integraciones_config`, migración 104:
// sin políticas, solo el servidor con la clave de servicio). Lo escrito en la aplicación TIENE PRIORIDAD sobre las
// variables de entorno (SMTP_HOST, SMTP_USER…), campo por campo: así un cambio en pantalla se nota enseguida, sin
// redeploy. Si un campo no está en la aplicación, se usa la variable de entorno.

import type { CampoIntegracion } from "@/lib/integraciones";

type Entorno = Record<string, string | undefined>;

export const NOMBRE_REMITENTE_POR_DEFECTO = "SISMANTO — Aerosanidad";

const HOST = /^[A-Za-z0-9]([A-Za-z0-9.-]{0,251}[A-Za-z0-9])?$/;
const CORREO = /^[^\s@"'<>]+@[^\s@"'<>]+\.[^\s@"'<>]+$/;

/** Mensaje de error si el valor no sirve para ese campo, o null si está bien. */
export const VALIDAR_HOST = (v: string): string | null =>
  HOST.test(v) && v.includes(".") ? null : "Escribe solo el nombre del servidor, p. ej. mail.sudominio.com (sin https://, sin espacios ni comillas).";

export const VALIDAR_PUERTO = (v: string): string | null => {
  const n = Number(v);
  return /^\d{1,5}$/.test(v) && n >= 1 && n <= 65535 ? null : "El puerto es un número entre 1 y 65535 (HostGator: 465, o 587).";
};

export const VALIDAR_CORREO = (v: string): string | null =>
  CORREO.test(v) ? null : "Escribe un correo completo, p. ej. sistemas@sudominio.com (sin comillas ni espacios).";

export const VALIDAR_NOMBRE = (v: string): string | null =>
  /[\r\n<>"]/.test(v) ? "El nombre no puede tener saltos de línea, comillas ni < >." : null;

export const VALIDAR_CLAVE = (v: string): string | null =>
  /[\r\n]/.test(v) ? "La clave no puede tener saltos de línea." : null;

export const CAMPOS_CORREO: CampoIntegracion[] = [
  { clave: "smtp_host", etiqueta: "Servidor SMTP", ayuda: "Nombre del servidor de correo saliente (en HostGator, el que aparece en «Configurar cliente de correo»).", secreto: false, env: "SMTP_HOST", validar: VALIDAR_HOST },
  { clave: "smtp_port", etiqueta: "Puerto", ayuda: "465 (SSL/TLS, el de siempre) o 587 (STARTTLS). Si queda vacío se usa 465.", secreto: false, env: "SMTP_PORT", validar: VALIDAR_PUERTO },
  { clave: "smtp_user", etiqueta: "Usuario de la cuenta (correo)", ayuda: "El correo completo con el que se inicia sesión en el servidor.", secreto: false, env: "SMTP_USER", validar: VALIDAR_CORREO },
  { clave: "smtp_pass", etiqueta: "Clave de la cuenta", ayuda: "Solo la lee el servidor; en pantalla solo se ven sus últimos 4 caracteres. Escríbala sin comillas.", secreto: true, env: "SMTP_PASS", validar: VALIDAR_CLAVE },
  { clave: "smtp_nombre", etiqueta: "Nombre del remitente", ayuda: "Lo que ve quien recibe el correo como «De:».", secreto: false, env: "SMTP_FROM_NAME", porDefecto: NOMBRE_REMITENTE_POR_DEFECTO, validar: VALIDAR_NOMBRE },
  { clave: "smtp_remitente", etiqueta: "Correo remitente", ayuda: "Dirección desde la que salen los correos. Si queda vacío se usa el usuario de la cuenta.", secreto: false, env: "NOTIFICATIONS_MAIL_FROM", validar: VALIDAR_CORREO },
];

export interface CorreoEfectivo {
  /** Variables de entorno «efectivas»: las de la aplicación pisan a las del servidor, campo por campo. */
  env: Entorno;
  nombreRemitente: string;
  /** Qué campos del SMTP salen de lo escrito en la aplicación. */
  desdeLaAplicacion: string[];
}

/** Mezcla lo guardado en la aplicación (claves `smtp_*`) con las variables de entorno. */
export function mezclarCorreo(env: Entorno, guardados: Record<string, string>): CorreoEfectivo {
  const app = (clave: string) => guardados[clave]?.trim() || undefined;
  const efectivo: Entorno = { ...env };
  const desde: string[] = [];
  const poner = (nombreEnv: string, clave: string) => {
    const v = app(clave);
    if (v !== undefined) {
      efectivo[nombreEnv] = v;
      desde.push(clave);
    }
  };
  poner("SMTP_HOST", "smtp_host");
  poner("SMTP_PORT", "smtp_port");
  poner("SMTP_USER", "smtp_user");
  poner("SMTP_PASS", "smtp_pass");
  poner("SMTP_FROM_NAME", "smtp_nombre");
  // El remitente: el escrito aquí, si no el usuario escrito aquí, si no el de la variable de entorno.
  const remitente = app("smtp_remitente") ?? app("smtp_user");
  if (remitente !== undefined) {
    efectivo.NOTIFICATIONS_MAIL_FROM = remitente;
    if (app("smtp_remitente") !== undefined) desde.push("smtp_remitente");
  }
  return { env: efectivo, nombreRemitente: efectivo.SMTP_FROM_NAME?.trim() || NOMBRE_REMITENTE_POR_DEFECTO, desdeLaAplicacion: desde };
}
