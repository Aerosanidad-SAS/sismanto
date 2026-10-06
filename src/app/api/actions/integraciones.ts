"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { CAMPOS_INTEGRACION, campoIntegracion, enmascarar, type EstadoCampoIntegracion } from "@/lib/integraciones";
import { leerIntegracionesGuardadas, valorIntegracion } from "@/lib/integraciones-servidor";
import { tokenProtrack } from "@/lib/gps/protrack";

// Administración → Integraciones (migración 104). Solo ADMIN. Nunca devuelve un secreto completo.

async function admin() {
  const profile = await getProfile();
  return profile && profile.role_codigo === "ADMIN" ? profile : null;
}

/** Estado de cada parámetro para la pantalla: valor visible (los secretos enmascarados) y de dónde sale. */
export async function getEstadoIntegraciones(): Promise<EstadoCampoIntegracion[] | { error: string }> {
  if (!(await admin())) return { error: "Solo un Administrador puede ver las integraciones" };
  const guardados = await leerIntegracionesGuardadas();
  return CAMPOS_INTEGRACION.map((c) => {
    const app = guardados[c.clave]?.trim();
    const env = process.env[c.env]?.trim();
    const valor = app || env || c.porDefecto || "";
    const origen = app ? "aplicacion" : env ? "entorno" : c.porDefecto ? "por_defecto" : "sin_configurar";
    return { clave: c.clave, visible: c.secreto ? enmascarar(valor) : valor, origen };
  });
}

/**
 * Guarda un parámetro. Texto vacío = borrar el valor de la aplicación (vuelve a la variable de entorno o al valor
 * por defecto). Para un secreto, la pantalla solo manda valor cuando se escribe uno nuevo.
 */
export async function guardarIntegracion(clave: string, valor: string) {
  const profile = await admin();
  if (!profile) return { error: "Solo un Administrador puede cambiar las integraciones" };
  const campo = campoIntegracion(clave);
  if (!campo) return { error: "Parámetro desconocido" };
  const v = z.string().trim().max(500, "Máximo 500 caracteres").safeParse(valor);
  if (!v.success) return { error: v.error.issues[0]?.message ?? "Valor inválido" };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { error: "Falta la clave de servicio en el servidor" };

  const s = createAdminClient().from("integraciones_config");
  const { error } = v.data
    ? await s.upsert({ clave, valor: v.data, updated_at: new Date().toISOString(), updated_by: profile.user_id } as never, { onConflict: "clave" })
    : await s.delete().eq("clave", clave);
  if (error) return { error: error.message };
  // Nunca el valor en la auditoría: solo qué parámetro cambió.
  await auditar("MODIFICAR", "configuracion", clave, `Integración «${campo.etiqueta}» ${v.data ? "actualizada" : "borrada"}`);
  revalidatePath("/admin/integraciones");
  return { success: true as const };
}

/** Pide un token a ProTrack365 con la cuenta y la llave vigentes, para comprobar que funcionan. */
export async function probarProtrack() {
  if (!(await admin())) return { error: "Solo un Administrador puede probar la conexión" };
  const guardados = await leerIntegracionesGuardadas();
  const [cuenta, llave] = await Promise.all([valorIntegracion("protrack_cuenta", guardados), valorIntegracion("protrack_api_key", guardados)]);
  if (!cuenta || !llave) return { error: "Faltan la cuenta o la llave de ProTrack365" };
  const r = await tokenProtrack(cuenta, llave, true);
  return "error" in r ? { error: r.error } : { success: true as const, mensaje: "Conexión correcta: ProTrack365 entregó un token." };
}
