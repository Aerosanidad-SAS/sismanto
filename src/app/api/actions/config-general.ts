"use server";

import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { correoEfectivo } from "@/lib/correo-config-servidor";
import { resumenCorreo, type ResumenCorreo } from "@/lib/entorno-diagnostico";
import { enviarCorreo } from "@/lib/notifications/email";
import { esCorreoInterno } from "@/lib/recuperar-contrasena";

// Administración → Configuración general. Solo ADMIN. Nunca devuelve una clave: solo qué falta y de dónde sale cada dato.

async function admin() {
  const profile = await getProfile();
  return profile && profile.role_codigo === "ADMIN" ? profile : null;
}

export interface EstadoCorreo extends ResumenCorreo {
  /** Campos del SMTP que salen de lo escrito en la aplicación (el resto, de las variables de entorno). */
  desdeLaAplicacion: string[];
  nombreRemitente: string;
  /** Con qué dirección salen los correos (visible: no es un secreto), o null si falta. */
  remitente: string | null;
}

export async function getEstadoCorreo(): Promise<EstadoCorreo | { error: string }> {
  if (!(await admin())) return { error: "Solo un Administrador puede ver la configuración general" };
  const c = await correoEfectivo();
  return {
    ...resumenCorreo(c.env),
    desdeLaAplicacion: c.desdeLaAplicacion,
    nombreRemitente: c.nombreRemitente,
    remitente: c.env.NOTIFICATIONS_MAIL_FROM?.trim() || null,
  };
}

/** «a***@dominio.com»: confirma a quién llegó sin dejar el correo completo en pantalla ni en la bitácora. */
function enmascararCorreo(correo: string): string {
  const [local, dominio] = correo.split("@");
  return `${local.slice(0, 1)}***@${dominio ?? ""}`;
}

/**
 * Manda un correo de prueba al correo del propio administrador que lo pide (nunca a otra dirección), para comprobar el
 * servidor, el usuario y la clave sin esperar a un ticket o a un código de recuperación.
 */
export async function enviarCorreoDePrueba() {
  const profile = await admin();
  if (!profile) return { error: "Solo un Administrador puede enviar el correo de prueba" };
  const destino = profile.email?.trim();
  if (!destino || esCorreoInterno(destino)) {
    return { error: "Tu usuario no tiene un correo real registrado: la prueba se envía a tu propio correo." };
  }
  const c = await correoEfectivo();
  const resumen = resumenCorreo(c.env);
  if (resumen.proveedor === "ninguno") {
    return { error: `Falta configurar el correo: ${resumen.faltanSmtp.length ? "completa " + resumen.faltanSmtp.join(", ") + "." : "no hay servidor, usuario ni clave."}` };
  }
  const r = await enviarCorreo(
    [destino],
    "Prueba de correo de SISMANTO",
    `<div style="font-family:sans-serif;color:#111827">
      <p>Este es un correo de prueba enviado desde <strong>Administración → Configuración general</strong>.</p>
      <p>Si lo estás leyendo, el servidor, el usuario y la clave del correo funcionan.</p>
    </div>`
  );
  if (!r.ok) {
    await auditar("ERROR", "configuracion", "smtp", `Correo de prueba fallido: ${(r.error ?? "").slice(0, 200)}`);
    return { error: r.error ?? "No se pudo enviar el correo de prueba" };
  }
  await auditar("NOTIFICAR", "configuracion", "smtp", "Correo de prueba enviado al administrador");
  return { success: true as const, mensaje: `Correo de prueba enviado a ${enmascararCorreo(destino)}. Revisa la bandeja y la carpeta de spam.` };
}
