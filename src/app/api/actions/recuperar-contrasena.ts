"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { auditar } from "@/lib/auditoria";
import { enviarCorreo, emailConfigurado } from "@/lib/notifications/email";
import { permitirIntento } from "@/lib/rate-limit-memoria";
import {
  LARGO_MINIMO_CONTRASENA,
  MINUTOS_VIGENCIA_CODIGO,
  codigoCoincide,
  estadoCodigo,
  generarCodigo,
  hashCodigo,
  normalizarCedula,
} from "@/lib/recuperar-contrasena";

// Recuperar la contraseña con un código por correo (migración 102), como recuperarPassword.php de SISRES.
// Es público (sin sesión): todo pasa por la clave de servicio y las respuestas no revelan si una cédula tiene cuenta.

const MENSAJE_ENVIO =
  "Si la cédula corresponde a un usuario activo con correo registrado, en unos segundos le llegará un código de 6 dígitos. Revise también la carpeta de spam.";
const CODIGO_INVALIDO = "Código inválido o vencido. Solicite uno nuevo si ya pasaron 15 minutos o se agotaron los intentos.";

function ip(): string {
  return headers().get("x-forwarded-for")?.split(",")[0]?.trim() || "sin-ip";
}

const ANONIMO = { userId: null, label: "anónimo" } as const;

/** Usuario activo con esa cédula y su correo, o null. */
async function usuarioPorCedula(cedula: string): Promise<{ userId: string; email: string } | null> {
  const admin = createAdminClient();
  const { data: perfil } = await admin
    .from("user_profiles")
    .select("user_id")
    .eq("cedula", cedula)
    .eq("activo", true)
    .maybeSingle<{ user_id: string }>();
  if (!perfil) return null;
  const { data } = await admin.auth.admin.getUserById(perfil.user_id);
  const email = data.user?.email;
  return email ? { userId: perfil.user_id, email } : null;
}

/** Paso 1: envía un código al correo del usuario con esa cédula. Siempre responde lo mismo. */
export async function solicitarCodigoRecuperacion(cedulaEscrita: string) {
  // Frena scripts: 5 solicitudes por IP cada 15 minutos, y 3 por cédula cada 15 minutos (no llenar el correo de nadie).
  if (!permitirIntento(`recuperar-ip:${ip()}`, 5, 15 * 60_000)) {
    return { error: "Demasiadas solicitudes. Espere unos minutos e intente de nuevo." };
  }
  const cedula = normalizarCedula(z.string().max(30).catch("").parse(cedulaEscrita));
  if (!cedula) return { error: "Escriba su número de cédula, solo números." };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !emailConfigurado()) {
    return { error: "La recuperación de contraseña no está disponible en este momento. Pida ayuda a un administrador." };
  }
  if (!permitirIntento(`recuperar-cedula:${cedula}`, 3, 15 * 60_000)) return { success: true as const, mensaje: MENSAJE_ENVIO };

  const usuario = await usuarioPorCedula(cedula);
  if (usuario) {
    const admin = createAdminClient();
    const codigo = generarCodigo();
    // Un código nuevo invalida los anteriores de ese usuario.
    await admin.from("password_reset_codes").update({ usado: true } as never).eq("user_id", usuario.userId).eq("usado", false);
    const { error } = await admin.from("password_reset_codes").insert({
      user_id: usuario.userId,
      codigo_hash: hashCodigo(usuario.userId, codigo),
      expira_en: new Date(Date.now() + MINUTOS_VIGENCIA_CODIGO * 60_000).toISOString(),
    } as never);
    if (!error) {
      await enviarCorreo(
        [usuario.email],
        "Código para recuperar su contraseña de Aeromanto",
        `<div style="font-family:sans-serif;color:#111827">
          <p>Recibimos una solicitud para cambiar la contraseña de su cuenta.</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:6px">${codigo}</p>
          <p>El código vence en ${MINUTOS_VIGENCIA_CODIGO} minutos y sirve una sola vez.</p>
          <p style="color:#6b7280;font-size:12px">Si usted no lo pidió, ignore este correo: su contraseña no cambia.</p>
        </div>`
      );
      await auditar("NOTIFICAR", "login", usuario.userId, "Código de recuperación de contraseña enviado", ANONIMO);
    }
  }
  return { success: true as const, mensaje: MENSAJE_ENVIO };
}

const restablecerSchema = z.object({
  cedula: z.string().max(30),
  codigo: z.string().trim().regex(/^\d{6}$/, "El código tiene 6 dígitos"),
  nueva: z.string().min(LARGO_MINIMO_CONTRASENA, `La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres`).max(72),
});

/** Paso 2: con el código correcto, cambia la contraseña. Máximo 5 intentos por código. */
export async function restablecerContrasena(datos: z.input<typeof restablecerSchema>) {
  if (!permitirIntento(`restablecer-ip:${ip()}`, 10, 15 * 60_000)) {
    return { error: "Demasiados intentos. Espere unos minutos e intente de nuevo." };
  }
  const parsed = restablecerSchema.safeParse(datos);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const cedula = normalizarCedula(parsed.data.cedula);
  if (!cedula || !process.env.SUPABASE_SERVICE_ROLE_KEY) return { error: CODIGO_INVALIDO };

  const usuario = await usuarioPorCedula(cedula);
  if (!usuario) return { error: CODIGO_INVALIDO };

  const admin = createAdminClient();
  const { data: fila } = await admin
    .from("password_reset_codes")
    .select("id, codigo_hash, expira_en, usado, intentos")
    .eq("user_id", usuario.userId)
    .order("creado_en", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: number; codigo_hash: string; expira_en: string; usado: boolean; intentos: number }>();
  if (!fila || estadoCodigo(fila) !== "valido") return { error: CODIGO_INVALIDO };

  if (!codigoCoincide(usuario.userId, parsed.data.codigo, fila.codigo_hash)) {
    await admin.from("password_reset_codes").update({ intentos: fila.intentos + 1 } as never).eq("id", fila.id);
    await auditar("ERROR", "login", usuario.userId, "Código de recuperación incorrecto", ANONIMO);
    return { error: CODIGO_INVALIDO };
  }

  // Se marca usado ANTES de cambiar la clave: un segundo envío con el mismo código ya no pasa.
  const { data: marcado } = await admin
    .from("password_reset_codes")
    .update({ usado: true } as never)
    .eq("id", fila.id)
    .eq("usado", false)
    .select("id");
  if (!marcado || marcado.length === 0) return { error: CODIGO_INVALIDO };

  const { error } = await admin.auth.admin.updateUserById(usuario.userId, { password: parsed.data.nueva });
  if (error) return { error: "No se pudo cambiar la contraseña. Intente de nuevo o pida ayuda a un administrador." };
  // La eligió la persona misma: ya no hace falta llevarla a /cambiar-password (marca de la carga masiva).
  await admin.from("user_profiles").update({ debe_cambiar_password: false, updated_at: new Date().toISOString() } as never).eq("user_id", usuario.userId);
  await auditar("MODIFICAR", "login", usuario.userId, "Contraseña restablecida con código", ANONIMO);
  return { success: true as const };
}
