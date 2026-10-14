"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auditar } from "@/lib/auditoria";
import { createAdminClient } from "@/lib/supabase/admin";
import { datosPersonalesSchema, filaExtra, nombreCompletoDe, type DatosPersonalesUsuario } from "@/lib/usuarios-sisres";
import { requireRole } from "./auth";

/**
 * Datos personales de un usuario (los campos de SISRES sin columna en `user_profiles`: tipo de documento, nombres y
 * apellidos por separado, nacimiento, RH, celular y departamento). Solo ADMIN: son datos sensibles y la tabla
 * `user_profile_extra` solo deja leerlos al propio usuario y al ADMIN. Se escribe con la llave de servicio, pero después
 * de comprobar el rol aquí.
 *
 * Nunca se escriben datos personales en la bitácora: solo que se actualizaron.
 */
export async function guardarDatosPersonales(userId: string, datos: DatosPersonalesUsuario): Promise<{ success: true } | { error: string }> {
  await requireRole(["ADMIN"]);
  const id = z.string().uuid("ID de usuario inválido").safeParse(userId);
  if (!id.success) return { error: id.error.issues[0]?.message ?? "ID de usuario inválido" };
  const parsed = datosPersonalesSchema.safeParse(datos);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { error: "Falta la clave de servicio en el servidor" };

  const d = parsed.data as DatosPersonalesUsuario;
  const admin = createAdminClient() as any;

  const { data: perfil } = await admin.from("user_profiles").select("user_id").eq("user_id", id.data).maybeSingle();
  if (!perfil) return { error: "Usuario no encontrado" };

  const { error } = await admin.from("user_profile_extra").upsert(filaExtra(id.data, d), { onConflict: "user_id" });
  if (error) {
    console.error("[usuarios] no se guardaron los datos personales:", error.code, error.message);
    return { error: "No se pudieron guardar los datos personales. Inténtalo de nuevo." };
  }

  // Con primer nombre y primer apellido, el nombre que se ve en la lista sale de las partes, como en SISRES.
  if (d.primerNombre && d.primerApellido) {
    await admin
      .from("user_profiles")
      .update({ nombre_completo: nombreCompletoDe(d), updated_at: new Date().toISOString() })
      .eq("user_id", id.data);
  }

  await auditar("MODIFICAR", "usuarios", id.data, "Datos personales actualizados");
  revalidatePath("/admin/usuarios");
  return { success: true };
}
