"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "./auth";

// Directorios de consulta para Regulación (en SISRES: Clientes y Proveedores
// del menú del regulador). Editar sigue en Configuración, para Admin/Analista.
const ROLES_DIRECTORIOS = ["ADMIN", "REGULACION", "ANALISTA"] as const;

export async function getDirectorioClientes() {
  await requireRole([...ROLES_DIRECTORIOS]);
  const supabase = createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, tipo_documento, numero, nombre, sector, ciudad, telefono1, correo")
    .eq("activo", true)
    .order("nombre");
  return (data ?? []) as Record<string, string | number | null>[];
}

/** Prestadores de salud cargados desde SISRES (tabla `proveedores` allá, `medical_providers` acá). */
export async function getDirectorioProveedores() {
  await requireRole([...ROLES_DIRECTORIOS]);
  const supabase = createClient();
  const { data } = await supabase
    .from("medical_providers")
    .select("id, tipo_documento, numero, nombre, sector, area, ciudad, telefono1, correo")
    .eq("activo", true)
    .order("nombre");
  return (data ?? []) as Record<string, string | number | null>[];
}
