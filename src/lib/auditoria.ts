/**
 * Escribe en la bitácora (`audit_log`, migración 077). Se llama desde las acciones de servidor DESPUÉS de que el
 * cambio salió bien: `await auditar("MODIFICAR", "pacientes", String(id), "Paciente actualizado")`.
 *
 * Reglas:
 *  - Escribe con la clave de servicio (ningún usuario tiene permiso de INSERT sobre la tabla).
 *  - **Nunca rompe la acción que la llama**: si no se pudo registrar, se deja el error en el log del servidor y se sigue.
 *    (Contrapartida consciente: ante una caída de la base de auditoría, la operación procede sin rastro; se prefirió
 *    no bloquear la atención de servicios médicos por un fallo del registro.)
 *  - El detalle es una línea corta (identifica el registro y qué cambió); no copiar datos clínicos ni personales.
 *
 * La lógica está en `auditoria-nucleo.ts` (sin Next); aquí solo se añaden la sesión y la IP de la petición.
 */
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { AccionAuditoria } from "@/lib/auditoria-lista";
import { insertarAuditoria, resolverActorPorId } from "@/lib/auditoria-nucleo";

export interface ActorAuditoria {
  userId: string | null;
  /** Correo o nombre. Si falta se toma del perfil. */
  label?: string;
  role?: string;
}

function ipDeLaPeticion(): string {
  try {
    return (headers().get("x-forwarded-for")?.split(",")[0] ?? "").trim();
  } catch {
    return ""; // fuera de una petición (p. ej. un cron)
  }
}

export async function auditar(
  accion: AccionAuditoria,
  entidad: string,
  entidadId: string | number = "",
  detalle = "",
  actor?: ActorAuditoria
): Promise<void> {
  try {
    // Sin `actor` explícito, el usuario es el de la sesión de la petición. En el login la sesión recién creada todavía
    // no está en las cookies, por eso quien llama pasa el `actor`.
    const userId = actor ? actor.userId : ((await createClient().auth.getUser()).data.user?.id ?? null);
    const admin = createAdminClient();
    const resuelto = await resolverActorPorId(admin, userId, { label: actor?.label, role: actor?.role });
    const err = await insertarAuditoria(admin, { actor: resuelto, accion, entidad, entidadId, detalle, ip: ipDeLaPeticion() });
    if (err) console.error("[auditoria] no se pudo registrar:", err);
  } catch (e) {
    console.error("[auditoria] no se pudo registrar:", e instanceof Error ? e.message : e);
  }
}
