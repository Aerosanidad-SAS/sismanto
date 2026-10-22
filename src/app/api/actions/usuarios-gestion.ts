"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { auditar } from "@/lib/auditoria";
import { requireRole } from "@/app/api/actions/auth";
import { toggleUserActiveSchema } from "@/lib/validations";
import {
  confirmacionEliminarValida,
  esCorreoDuplicado,
  motivoBloqueoCorreo,
  motivoBloqueoEliminar,
  validarCorreoNuevo,
  type TablaConHistorial,
} from "@/lib/usuarios-gestion";

const SIN_CLAVE_SERVICIO = "SUPABASE_SERVICE_ROLE_KEY no configurado.";

/**
 * Elimina de verdad a un usuario SIN historial (cuenta de Auth + perfil). Solo ADMIN.
 * Con historial (servicios, preoperacionales, tanqueos…) se bloquea: ver `usuario_tiene_historial` (migración 136).
 * Un solo borrado, sin estados a medias: `auth.users` arrastra su perfil por ON DELETE CASCADE, y si alguna llave foránea
 * lo impide, Postgres revierte todo. `confirmacion` se vuelve a validar aquí: el diálogo no es una barrera.
 */
export async function eliminarUsuario(userId: string, confirmacion: string) {
  const caller = await requireRole(["ADMIN"]);
  const id = toggleUserActiveSchema.shape.userId.safeParse(userId);
  if (!id.success) return { error: "ID de usuario inválido" };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { error: SIN_CLAVE_SERVICIO };

  const admin = createAdminClient() as any;
  const { data: perfil } = await admin
    .from("user_profiles")
    .select("user_id, nombre_completo, email, activo, roles!inner(codigo)")
    .eq("user_id", id.data)
    .maybeSingle();
  if (!perfil) return { error: "Usuario no encontrado" };
  if (!confirmacionEliminarValida(confirmacion, perfil.email)) return { error: "La confirmación no coincide." };

  const { count: otrosAdminsActivos } = await admin
    .from("user_profiles")
    .select("user_id, roles!inner(codigo)", { count: "exact", head: true })
    .eq("roles.codigo", "ADMIN")
    .eq("activo", true)
    .neq("user_id", id.data);
  const { data: historial, error: errHistorial } = await admin.rpc("usuario_tiene_historial", { p_user: id.data });
  // Sin poder comprobar el historial no se borra: un falso «sin historial» destruiría registros.
  if (errHistorial) {
    console.error("[usuarios] no se pudo comprobar el historial:", errHistorial.code, errHistorial.message);
    return { error: "No se pudo comprobar si el usuario tiene historial. No se eliminó nada; inténtalo de nuevo." };
  }

  const bloqueo = motivoBloqueoEliminar({
    actorId: caller.user_id,
    actorRol: caller.role_codigo,
    objetivoId: perfil.user_id,
    objetivoRol: perfil.roles?.codigo ?? "",
    objetivoActivo: perfil.activo !== false,
    otrosAdminsActivos: otrosAdminsActivos ?? 0,
    historial: ((historial ?? []) as { tabla: string; filas: number | string }[]).map<TablaConHistorial>((h) => ({
      tabla: h.tabla,
      filas: Number(h.filas),
    })),
  });
  if (bloqueo) return { error: bloqueo };

  const { error } = await admin.auth.admin.deleteUser(id.data);
  if (error) {
    console.error("[usuarios] no se pudo eliminar:", error.status, error.message);
    return { error: "No se pudo eliminar el usuario. No se borró nada; si tiene registros asociados, usa «Deshabilitar»." };
  }
  await auditar("ELIMINAR", "usuarios", id.data, `Usuario eliminado: ${perfil.nombre_completo ?? "sin nombre"} (${perfil.email ?? "sin correo"}, rol ${perfil.roles?.codigo})`);
  revalidatePath("/admin/usuarios");
  return { success: true as const };
}

/**
 * Cambia el correo de inicio de sesión de un usuario. Solo ADMIN. Actualiza Auth (la identidad real) y después
 * `user_profiles.email`; si la segunda escritura falla, devuelve Auth al correo anterior para no dejar a la persona
 * con dos correos distintos. No toca la clave ni cierra sesiones: la sesión abierta sigue hasta que venza y el acceso
 * por cédula sigue igual (se resuelve al correo de Auth en cada ingreso).
 */
export async function cambiarCorreoUsuario(userId: string, correoNuevo: string) {
  const caller = await requireRole(["ADMIN"]);
  const id = toggleUserActiveSchema.shape.userId.safeParse(userId);
  if (!id.success) return { error: "ID de usuario inválido" };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { error: SIN_CLAVE_SERVICIO };

  const admin = createAdminClient() as any;
  const { data: perfil } = await admin.from("user_profiles").select("user_id, email, roles!inner(codigo)").eq("user_id", id.data).maybeSingle();
  if (!perfil) return { error: "Usuario no encontrado" };
  const bloqueo = motivoBloqueoCorreo({ actorId: caller.user_id, objetivoId: id.data, objetivoRol: perfil.roles?.codigo ?? "" });
  if (bloqueo) return { error: bloqueo };
  // El correo de Auth es la verdad: sin poder leerlo no se sabe a qué volver si algo falla, así que no se toca nada.
  const { data: authActual, error: errLectura } = await admin.auth.admin.getUserById(id.data);
  if (errLectura || !authActual?.user) {
    console.error("[usuarios] no se pudo leer la cuenta de Auth:", errLectura?.message);
    return { error: "No se pudo leer la cuenta del usuario. No se cambió nada; inténtalo de nuevo." };
  }
  const anterior: string | null = authActual.user.email ?? null;

  const v = validarCorreoNuevo(correoNuevo, anterior);
  if (!v.ok) return { error: v.error };
  const duplicado = { error: "Ese correo ya está en uso por otro usuario." };

  // Otro perfil con el mismo correo (sin distinguir mayúsculas): Auth no lo vería si el perfil quedó desfasado.
  const { data: repetido } = await admin.from("user_profiles").select("user_id").ilike("email", v.correo.replace(/[\\%_]/g, "\\$&")).neq("user_id", id.data).limit(1);
  if (repetido?.length) return duplicado;

  const { error: errAuth } = await admin.auth.admin.updateUserById(id.data, { email: v.correo, email_confirm: true });
  if (errAuth) {
    if (esCorreoDuplicado(errAuth.message, (errAuth as { code?: string }).code)) return duplicado;
    console.error("[usuarios] no se pudo cambiar el correo en Auth:", errAuth.status, errAuth.message);
    return { error: "No se pudo cambiar el correo. No se cambió nada; inténtalo de nuevo." };
  }

  const { error: errPerfil } = await admin
    .from("user_profiles")
    .update({ email: v.correo, updated_at: new Date().toISOString() })
    .eq("user_id", id.data);
  if (errPerfil) {
    const { error: errReversa } = anterior
      ? await admin.auth.admin.updateUserById(id.data, { email: anterior, email_confirm: true })
      : { error: { message: "la cuenta no tenía correo anterior al que volver" } };
    if (errReversa) {
      console.error("[usuarios] correo desincronizado (Auth cambió, perfil no, y no se pudo revertir):", id.data, errReversa.message);
      await auditar("ERROR", "usuarios", id.data, "Cambio de correo a medias: Auth con el correo nuevo y perfil con el anterior; revisar a mano");
      return { error: "El correo cambió en el acceso pero no en el perfil y no se pudo revertir. Avisa a Sistemas: hay que corregirlo a mano." };
    }
    return { error: "No se pudo guardar el correo en el perfil. No se cambió nada." };
  }

  // Los códigos de recuperación emitidos antes se mandaron al buzón anterior: dejan de servir.
  const { error: errCodigos } = await admin.from("password_reset_codes").delete().eq("user_id", id.data);
  if (errCodigos) console.error("[usuarios] no se pudieron invalidar los códigos de recuperación:", errCodigos.message);
  await auditar("MODIFICAR", "usuarios", id.data, `Correo cambiado de ${anterior ?? "(ninguno)"} a ${v.correo}`);
  revalidatePath("/admin/usuarios");
  return { success: true as const, correo: v.correo };
}
