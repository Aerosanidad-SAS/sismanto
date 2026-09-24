"use server";

import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProfile } from "@/app/api/actions/auth";
import { ROLES_ADMIN_AEROLINEAS } from "@/lib/aeropuertos";

export interface AerolineaFila {
  id: number;
  nombre: string;
  activo: boolean;
}

const nombreSchema = z.string().trim().min(2, "Nombre requerido").max(150);

async function exigirAdmin(): Promise<string | null> {
  const profile = await getProfile();
  return ROLES_ADMIN_AEROLINEAS.includes(profile?.role_codigo ?? "")
    ? null
    : "No tienes permiso para administrar aerolíneas";
}

/** Todas las aerolíneas (para la pantalla de administración) o solo las activas (para los combos). */
export async function getAerolineas(soloActivas = false): Promise<AerolineaFila[]> {
  const supabase = createClient();
  let query = supabase.from("airlines").select("id, nombre, activo").order("nombre");
  if (soloActivas) query = query.eq("activo", true);
  const { data } = await query;
  return (data ?? []) as AerolineaFila[];
}

export async function crearAerolinea(nombre: string) {
  const sinPermiso = await exigirAdmin();
  if (sinPermiso) return { error: sinPermiso };
  const parsed = nombreSchema.safeParse(nombre);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Nombre inválido" };

  const supabase = createClient();
  const { error } = await supabase.from("airlines").insert({ nombre: parsed.data });
  if (error) return { error: error.code === "23505" ? "Ya existe una aerolínea con ese nombre" : error.message };
  await auditar("INSERTAR", "valoraciones", "", `Catálogo de aerolíneas: creada «${parsed.data}»`);
  revalidatePath("/aerolineas");
  return { success: true };
}

export async function actualizarAerolinea(id: number, datos: { nombre: string; activo: boolean }) {
  const sinPermiso = await exigirAdmin();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };
  const parsed = nombreSchema.safeParse(datos.nombre);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Nombre inválido" };

  const supabase = createClient();
  const { error } = await supabase
    .from("airlines")
    .update({ nombre: parsed.data, activo: !!datos.activo, updated_at: new Date().toISOString() })
    .eq("id", idParsed.data);
  if (error) return { error: error.code === "23505" ? "Ya existe una aerolínea con ese nombre" : error.message };
  await auditar("MODIFICAR", "valoraciones", idParsed.data, `Catálogo de aerolíneas: «${parsed.data}» ${datos.activo ? "activa" : "inactiva"}`);
  revalidatePath("/aerolineas");
  return { success: true };
}

/** Eliminar = desactivar, como en SISRES (act_eliminar_aerolinea). Las valoraciones guardan el nombre como texto y no se ven afectadas. */
export async function eliminarAerolinea(id: number) {
  const sinPermiso = await exigirAdmin();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { error } = await supabase
    .from("airlines")
    .update({ activo: false, updated_at: new Date().toISOString() })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  await auditar("ELIMINAR", "valoraciones", idParsed.data, "Catálogo de aerolíneas: aerolínea desactivada");
  revalidatePath("/aerolineas");
  return { success: true };
}
