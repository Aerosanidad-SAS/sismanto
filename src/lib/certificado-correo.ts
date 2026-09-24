/**
 * Correo con el certificado de valoración adjunto (SISRES: tcpdf/EnviarValoracionCorreo.php).
 * Funciones puras: validar el correo y armar el mensaje. Sin dependencias de servidor.
 */

/** Correo razonable: algo@dominio.tld sin espacios. La validación real la hace el servidor de correo. */
export const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Quién puede enviar certificados: los mismos roles que pueden registrar y editar valoraciones. */
export const ROLES_ENVIAR_CERTIFICADO: readonly string[] = ["ADMIN", "MEDICO", "ANALISTA"];

/** Los adjuntos de Graph `sendMail` van en el cuerpo JSON: el total no debe pasar de 3 MB. */
export const ADJUNTO_MAX_BYTES = 3 * 1024 * 1024;

/** Escapa texto que viene del usuario antes de meterlo en el HTML. */
export function escaparHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function asuntoCertificado(numero: number): string {
  return `Certificado de valoración médica N° ${numero} — Aerosanidad`;
}

/** Cuerpo del correo. El nombre del pasajero va escapado; no se repite el concepto clínico en el cuerpo (solo en el adjunto). */
export function armarCorreoCertificado(d: { nombre: string; numero: number }): string {
  const e = escaparHtml;
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#f0f4f8;font-family:Arial,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;">
      <tr><td style="background:#1B6368;padding:22px 32px;color:#ffffff;">
        <strong style="font-size:18px;letter-spacing:1px;">AEROSANIDAD S.A.S.</strong>
      </td></tr>
      <tr><td style="padding:28px 32px;font-size:15px;line-height:1.55;">
        <p>Hola <strong>${e(d.nombre)}</strong>,</p>
        <p>Adjuntamos tu <strong>certificado de valoración médica N° ${d.numero}</strong> (aptitud de vuelo) en formato PDF.</p>
        <p style="font-size:13px;color:#666;">Este mensaje contiene información de salud y es confidencial. Si lo recibiste por error, bórralo y avisa a Aerosanidad.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

/** Nombre del archivo adjunto. */
export function nombreAdjuntoCertificado(numero: number): string {
  return `certificado-valoracion-${numero}.pdf`;
}
