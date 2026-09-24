/**
 * Núcleo de la bitácora sin dependencias de Next: recibe el cliente de servicio por parámetro para poder probarse con
 * una base de mentira. `src/lib/auditoria.ts` lo envuelve con la sesión y la IP de la petición.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { sanearTexto, type AccionAuditoria } from "@/lib/auditoria-lista";

interface PerfilFila {
  nombre_completo: string | null;
  email: string | null;
  roles: { codigo: string } | { codigo: string }[] | null;
}

export interface ActorResuelto {
  userId: string | null;
  label: string;
  role: string;
}

/** Nombre y rol de un usuario AL MOMENTO del hecho (un cambio de rol posterior no reescribe la historia). */
export async function resolverActorPorId(
  admin: SupabaseClient<Database>,
  userId: string | null,
  dado: { label?: string; role?: string } = {}
): Promise<ActorResuelto> {
  if (!userId) return { userId: null, label: dado.label ?? "sistema", role: dado.role ?? "" };
  if (dado.label && dado.role) return { userId, label: dado.label, role: dado.role };

  const { data } = await admin.from("user_profiles").select("nombre_completo, email, roles(codigo)").eq("user_id", userId).maybeSingle();
  const p = data as unknown as PerfilFila | null;
  const rol = Array.isArray(p?.roles) ? p?.roles[0]?.codigo : p?.roles?.codigo;
  // El nombre legible primero: los usuarios migrados de SISRES tienen un correo sintético que nadie ve.
  return { userId, label: dado.label || p?.nombre_completo || p?.email || userId, role: dado.role || rol || "" };
}

export interface EntradaAuditoria {
  actor: ActorResuelto;
  accion: AccionAuditoria;
  entidad: string;
  entidadId: string | number;
  detalle: string;
  ip: string;
}

/** Inserta la fila (saneada). Devuelve el mensaje de error o null. */
export async function insertarAuditoria(admin: SupabaseClient<Database>, e: EntradaAuditoria): Promise<string | null> {
  const { error } = await admin.from("audit_log").insert({
    user_id: e.actor.userId,
    user_label: sanearTexto(e.actor.label, 150),
    role: sanearTexto(e.actor.role, 50),
    action: e.accion,
    entity: sanearTexto(e.entidad, 50),
    entity_id: sanearTexto(String(e.entidadId), 100),
    detail: sanearTexto(e.detalle),
    ip: sanearTexto(e.ip, 45),
  });
  return error ? error.message : null;
}
