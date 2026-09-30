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
/**
 * Todos los prestadores, activos e inactivos, como SISRES (mostrarProveedores.php los lista todos con su estado; en
 * los datos migrados 1.329 de 1.332 están en estado 0). Se leen por páginas: son más de las 1000 filas que PostgREST
 * devuelve por consulta.
 */
export async function getDirectorioProveedores() {
  await requireRole([...ROLES_DIRECTORIOS]);
  const supabase = createClient();
  const filas: Record<string, string | number | boolean | null>[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data } = await supabase
      .from("medical_providers")
      .select("id, tipo_documento, numero, digito_verificacion, nombre, sector, direccion, departamento, ciudad, telefono1, telefono2, telefono3, correo, area, activo")
      .order("nombre")
      .order("id")
      .range(desde, desde + 999);
    filas.push(...((data ?? []) as Record<string, string | number | boolean | null>[]));
    if (!data || data.length < 1000) break;
  }
  return filas.map((f) => ({ ...f, estado: f.activo ? "ACTIVO" : "INACTIVO" }));
}
