"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import {
  AUDITORIA_POR_PAGINA,
  rangoFechasColombia,
  textoBusquedaAuditoria,
  type FiltrosAuditoria,
} from "@/lib/auditoria-lista";

export interface FilaAuditoria {
  id: number;
  at: string;
  user_label: string;
  role: string;
  action: string;
  entity: string;
  entity_id: string;
  detail: string;
  ip: string;
}

/**
 * Una página de la bitácora (50) con los filtros de mostrarLog.php: usuario, acción, módulo y rango de fechas.
 * Solo el ADMIN: la política RLS de `audit_log` ya lo exige; aquí se vuelve a comprobar para dar un error claro.
 */
export async function listarAuditoria(f: FiltrosAuditoria) {
  const profile = await getProfile();
  if (profile?.role_codigo !== "ADMIN") return { filas: [] as FilaAuditoria[], total: 0, error: "Solo el Administrador puede ver la bitácora" };

  const supabase = createClient();
  const desdeFila = (Math.max(1, f.pagina) - 1) * AUDITORIA_POR_PAGINA;
  let query = supabase
    .from("audit_log")
    .select("id, at, user_label, role, action, entity, entity_id, detail, ip", { count: "exact" })
    .order("at", { ascending: false })
    .order("id", { ascending: false })
    .range(desdeFila, desdeFila + AUDITORIA_POR_PAGINA - 1);

  if (f.accion) query = query.eq("action", f.accion);
  if (f.entidad) query = query.eq("entity", f.entidad);
  const usuario = textoBusquedaAuditoria(f.usuario);
  if (usuario) query = query.ilike("user_label", `%${usuario}%`);
  const { desde, hastaExclusivo } = rangoFechasColombia(f.desde, f.hasta);
  if (desde) query = query.gte("at", desde);
  if (hastaExclusivo) query = query.lt("at", hastaExclusivo);

  const { data, count, error } = await query;
  if (error) return { filas: [] as FilaAuditoria[], total: 0, error: error.message };
  return { filas: (data ?? []) as unknown as FilaAuditoria[], total: count ?? 0 };
}
