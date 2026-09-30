"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import {
  MAX_NOMBRE_PLANTILLA,
  MAX_TEXTO_PLANTILLA,
  esCampoPlantilla,
  type PlantillaTexto,
} from "@/lib/biomedico-plantillas";

// Plantillas de texto del mantenimiento biomédico. Esquema y RLS: migración 093.
const ROLES_LEER = ["ADMIN", "MANTENIMIENTO", "COORDINACION", "GERENCIAL", "ANALISTA", "VISTA"];
const ROLES_EDITAR = ["ADMIN", "MANTENIMIENTO"];

/** Todas las plantillas. Vacío si el rol no puede leerlas o la tabla aún no existe (el formulario sigue igual). */
export async function getPlantillasBiomedicas(): Promise<{ plantillas: PlantillaTexto[]; puedeEditar: boolean }> {
  const profile = await getProfile();
  if (!profile || !ROLES_LEER.includes(profile.role_codigo)) return { plantillas: [], puedeEditar: false };
  const puedeEditar = ROLES_EDITAR.includes(profile.role_codigo);
  const { data, error } = await createClient().from("biomedical_plantillas_texto").select("id, campo, nombre, texto").order("nombre");
  if (error) return { plantillas: [], puedeEditar };
  const plantillas = ((data ?? []) as unknown as PlantillaTexto[]).filter((p) => esCampoPlantilla(p.campo));
  return { plantillas, puedeEditar };
}

const plantillaSchema = z.object({
  campo: z.string().refine(esCampoPlantilla, "Campo no admite plantillas"),
  nombre: z.string().trim().min(1, "Escribe un nombre").max(MAX_NOMBRE_PLANTILLA, `Nombre de hasta ${MAX_NOMBRE_PLANTILLA} caracteres`),
  texto: z.string().trim().min(1, "Escribe el texto").max(MAX_TEXTO_PLANTILLA, `Texto de hasta ${MAX_TEXTO_PLANTILLA} caracteres`),
});

async function editor() {
  const profile = await getProfile();
  return profile && ROLES_EDITAR.includes(profile.role_codigo) ? profile : null;
}

function refrescar() {
  revalidatePath("/equipos");
  revalidatePath("/equipos/plantillas");
}

/** Crea (sin `id`) o actualiza una plantilla. Solo ADMIN y MANTENIMIENTO. */
export async function guardarPlantillaBiomedica(datos: { id?: number; campo: string; nombre: string; texto: string }) {
  const profile = await editor();
  if (!profile) return { error: "Sin permisos para editar plantillas" };
  const parsed = plantillaSchema.safeParse(datos);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const id = z.number().int().positive().optional().safeParse(datos.id);
  if (!id.success) return { error: "Plantilla inválida" };

  const fila = { ...parsed.data, updated_at: new Date().toISOString(), updated_by: profile.user_id };
  const s = createClient().from("biomedical_plantillas_texto");
  const { data, error } = id.data
    ? await s.update(fila as never).eq("id", id.data).select("id, campo, nombre, texto")
    : await s.insert(fila as never).select("id, campo, nombre, texto");
  if (error) {
    return { error: error.code === "23505" ? "Ya existe una plantilla con ese nombre para ese campo" : error.message };
  }
  const guardada = (data ?? [])[0] as unknown as PlantillaTexto | undefined;
  if (!guardada) return { error: "La plantilla no existe" };
  await auditar(id.data ? "MODIFICAR" : "INSERTAR", "inventario", guardada.id, `Plantilla de mantenimiento «${guardada.nombre}»`);
  refrescar();
  return { success: true as const, plantilla: guardada };
}

/** Elimina una plantilla. Solo ADMIN y MANTENIMIENTO. */
export async function eliminarPlantillaBiomedica(id: number) {
  const profile = await editor();
  if (!profile) return { error: "Sin permisos para editar plantillas" };
  const idOk = z.number().int().positive().safeParse(id);
  if (!idOk.success) return { error: "Plantilla inválida" };
  const { data, error } = await createClient().from("biomedical_plantillas_texto").delete().eq("id", idOk.data).select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "La plantilla no existe" };
  await auditar("ELIMINAR", "inventario", idOk.data, "Plantilla de mantenimiento eliminada");
  refrescar();
  return { success: true as const };
}
