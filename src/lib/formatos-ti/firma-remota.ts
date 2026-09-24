/**
 * Firma remota por correo del Acta de Entrega (SISRES: firmarActaCorreo.php, includes/firmaTokenHelper.php,
 * includes/enviarCorreoFirmaActa.php). Funciones puras: generar el token, su huella y armar el correo.
 */
import { createHash, randomBytes } from "node:crypto";

/** Días de validez del enlace (SISRES: `firma_correo_dias_validez`, por defecto 7). */
export const DIAS_VALIDEZ_FIRMA = 7;

/** Asunto por defecto; `{placa}` se reemplaza por la placa del equipo (SISRES: `firma_correo_asunto`). */
export const ASUNTO_FIRMA = "Firma pendiente — Acta de Entrega de Equipos ({placa})";

/** Frase de introducción por defecto (SISRES: `firma_correo_mensaje`). */
export const MENSAJE_FIRMA = "El área de Sistemas registró la entrega del siguiente equipo a tu nombre:";

/** Token de 256 bits (64 hex): viaja solo en el enlace del correo. */
export function generarToken(): string {
  return randomBytes(32).toString("hex");
}

/** Formato válido de un token: exactamente 64 caracteres hexadecimales. Se comprueba antes de tocar la base. */
export function tokenValido(token: string | null | undefined): token is string {
  return typeof token === "string" && /^[0-9a-f]{64}$/.test(token);
}

/** SHA-256 hex del token: lo único que se guarda en la base. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Escapa texto que viene del usuario antes de meterlo en el HTML del correo. */
export function escaparHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Enlace público de firma. `base` sin barra final. */
export function urlFirma(base: string, token: string): string {
  return `${base.replace(/\/+$/, "")}/firmar/${token}`;
}

export interface DatosCorreoFirma {
  nombre: string;
  equipo: string;
  placa: string;
  numeroOrden: string;
  enlace: string;
  dias: number;
}

export function asuntoCorreoFirma(placa: string, plantilla = ASUNTO_FIRMA): string {
  // Sin saltos de línea en el asunto (evita inyectar cabeceras si algún día se cambia el transporte).
  return plantilla.replace("{placa}", placa).replace(/[\r\n]+/g, " ").trim();
}

/** HTML del correo. Todo dato del usuario va escapado; el enlace lo arma el servidor, no el usuario. */
export function armarCorreoFirma(d: DatosCorreoFirma, mensaje = MENSAJE_FIRMA): string {
  const e = escaparHtml;
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:30px 0;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
      <tr><td style="background:#1B6368;padding:28px 40px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:20px;letter-spacing:1px;">AEROSANIDAD S.A.S.</h1>
        <p style="margin:6px 0 0;color:#d0f0f3;font-size:13px;">Acta de Entrega de Equipos ${e(d.numeroOrden)}</p>
      </td></tr>
      <tr><td style="padding:32px 40px;color:#333;font-size:15px;line-height:1.5;">
        <p>Hola <strong>${e(d.nombre)}</strong>,</p>
        <p>${e(mensaje)}</p>
        <p style="background:#f4f8f9;border-left:4px solid #2BB6C7;padding:12px 16px;margin:16px 0;">
          <strong>${e(d.equipo || "Equipo")}</strong><br>Placa: ${e(d.placa)}
        </p>
        <p>Para confirmar que lo recibiste, firma el acta en este enlace (no necesitas cuenta ni contraseña):</p>
        <p style="text-align:center;margin:28px 0;">
          <a href="${e(d.enlace)}" style="background:#1B6368;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;display:inline-block;">Firmar el acta</a>
        </p>
        <p style="font-size:13px;color:#666;">El enlace es personal, se puede usar una sola vez y vence en ${d.dias} días. Si no reconoces esta entrega, ignora este correo o avisa al área de Sistemas.</p>
        <p style="font-size:12px;color:#999;word-break:break-all;">Si el botón no funciona, copia este enlace en tu navegador:<br>${e(d.enlace)}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

/** Vigencia de un token: sin usar y sin vencer, comparado contra un instante dado. */
export function tokenVigente(t: { usado: boolean; expira_en: string | Date }, ahora: Date = new Date()): boolean {
  return !t.usado && new Date(t.expira_en).getTime() > ahora.getTime();
}

/** Instante de vencimiento a `dias` días desde `desde`. */
export function venceEn(dias: number, desde: Date = new Date()): string {
  return new Date(desde.getTime() + dias * 86400000).toISOString();
}
