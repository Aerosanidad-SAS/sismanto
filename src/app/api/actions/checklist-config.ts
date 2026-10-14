"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auditar } from "@/lib/auditoria";
import { tiposDesdeAplica } from "@/lib/checklist-tipo";
import { tieneReglaPorNombre } from "@/lib/documentos-preop";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "./auth";

/**
 * Configuración → Preoperacional: lista maestra de ítems, grupos y a qué vehículos aplica cada ítem. Solo ADMIN: lo exige
 * `requireRole` en cada acción. Se usa la sesión del propio ADMIN (no la clave de servicio) para que rija la RLS: la de
 * `checklist_groups` (131) es solo ADMIN; la de `checklist_items` deja escribir también a ANALISTA (047), por eso la puerta
 * real es `requireRole`.
 */

export interface GrupoConfig {
  id: number;
  nombre: string;
  orden: number;
  activo: boolean;
}

export interface ItemConfig {
  id: number;
  categoria: string;
  descripcion: string;
  group_id: number | null;
  cantidad_esperada: string | null;
  es_inventario: boolean | null;
  severidad_falla: "CRITICA" | "ALTA" | "MEDIA" | "BAJA" | null;
  tipos_vehiculo: string[] | null;
  orden: number;
  activo: boolean;
}

/** Categoría de siempre de cada grupo sembrado; un grupo nuevo deja la categoría genérica. */
const CATEGORIA_DE_GRUPO: Record<string, string> = {
  General: "GENERAL",
  Luces: "LUCES",
  Cabina: "CABINA",
  "Equipo básico": "EQUIPO_BASICO",
  "Equipo de carretera": "EQUIPO_CARRETERA",
};
const CATEGORIA_NUEVA = "PERSONALIZADO";

const mensajeUnico = "Ya existe un ítem con ese nombre en la misma categoría (los grupos nuevos comparten una categoría). Usa otro nombre.";

function mensaje(e: { code?: string; message?: string } | null | undefined, alterno: string): string {
  if (!e) return alterno;
  if (e.code === "23505") return mensajeUnico;
  console.error("[checklist-config]", e.code, e.message);
  return alterno;
}

export async function getConfigPreoperacional(): Promise<{ grupos: GrupoConfig[]; items: ItemConfig[] } | { error: string }> {
  await requireRole(["ADMIN"]);
  const supabase = createClient() as any;
  const [g, i] = await Promise.all([
    supabase.from("checklist_groups").select("id, nombre, orden, activo").order("orden").order("nombre"),
    supabase
      .from("checklist_items")
      .select("id, categoria, descripcion, group_id, cantidad_esperada, es_inventario, severidad_falla, tipos_vehiculo, orden, activo")
      .eq("lista", "PREOPERACIONAL")
      .order("orden"),
  ]);
  if (g.error || i.error) {
    console.error("[checklist-config] lectura:", g.error?.message ?? i.error?.message);
    return { error: "No se pudo leer la lista. ¿Se aplicó la migración 131?" };
  }
  return { grupos: g.data as GrupoConfig[], items: i.data as ItemConfig[] };
}

const grupoSchema = z.object({
  id: z.number().int().positive().optional(),
  nombre: z.string().trim().min(2, "El grupo necesita un nombre").max(80),
  orden: z.number().int().min(0).max(10000),
  activo: z.boolean(),
});

export async function guardarGrupo(input: z.infer<typeof grupoSchema>): Promise<{ success: true } | { error: string }> {
  await requireRole(["ADMIN"]);
  const p = grupoSchema.safeParse(input);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Datos inválidos" };
  const { id, ...fila } = p.data;
  const supabase = createClient() as any;
  const { error } = id ? await supabase.from("checklist_groups").update(fila).eq("id", id) : await supabase.from("checklist_groups").insert(fila);
  if (error) return { error: error.code === "23505" ? "Ya existe un grupo con ese nombre." : mensaje(error, "No se pudo guardar el grupo.") };
  await auditar(id ? "MODIFICAR" : "INSERTAR", "configuracion", id ?? fila.nombre, `Grupo del preoperacional «${fila.nombre}»${fila.activo ? "" : " (desactivado)"}`);
  revalidatePath("/configuracion");
  revalidatePath("/ovem");
  return { success: true };
}

export async function eliminarGrupo(id: number): Promise<{ success: true } | { error: string }> {
  await requireRole(["ADMIN"]);
  if (!Number.isInteger(id) || id <= 0) return { error: "Grupo inválido" };
  const supabase = createClient() as any;
  const { count, error: errorCuenta } = await supabase.from("checklist_items").select("id", { count: "exact", head: true }).eq("group_id", id);
  if (errorCuenta) return { error: mensaje(errorCuenta, "No se pudo comprobar los ítems del grupo.") };
  if ((count ?? 0) > 0) return { error: "El grupo tiene ítems: muévelos a otro grupo o desactiva el grupo." };
  const { error } = await supabase.from("checklist_groups").delete().eq("id", id);
  if (error) return { error: mensaje(error, "No se pudo eliminar el grupo.") };
  await auditar("ELIMINAR", "configuracion", id, "Grupo del preoperacional eliminado (sin ítems)");
  revalidatePath("/configuracion");
  return { success: true };
}

const itemSchema = z.object({
  id: z.number().int().positive().optional(),
  descripcion: z.string().trim().min(3, "El ítem necesita un nombre").max(300),
  groupId: z.number().int().positive("Elige un grupo"),
  ambulancia: z.boolean(),
  domiciliaria: z.boolean(),
  /** Si las casillas no cambiaron, `tipos_vehiculo` no se reescribe (el mapeo a dos familias perdería matices como solo TAB). */
  cambiaTipos: z.boolean(),
  /** null = se responde OK / Falla; un número = se cuenta. */
  cantidad: z.number().int().min(1).max(99).nullable(),
  /** Cantidad no numérica heredada del catálogo («1 Par»): se conserva tal cual si no se cambia a un número. */
  conservarCantidad: z.string().trim().max(20).optional(),
  esInventario: z.boolean().nullable(),
  severidad: z.enum(["CRITICA", "ALTA", "MEDIA", "BAJA"]),
  orden: z.number().int().min(0).max(100000),
  activo: z.boolean(),
});

export async function guardarItem(input: z.infer<typeof itemSchema>): Promise<{ success: true } | { error: string }> {
  await requireRole(["ADMIN"]);
  const p = itemSchema.safeParse(input);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Datos inválidos" };
  const d = p.data;
  const tipos = tiposDesdeAplica({ ambulancia: d.ambulancia, domiciliaria: d.domiciliaria });
  if (tipos === undefined) return { error: "Marca al menos un tipo de vehículo al que aplique (ambulancia o medicina domiciliaria)." };

  const supabase = createClient() as any;
  const { data: grupo } = await supabase.from("checklist_groups").select("nombre").eq("id", d.groupId).maybeSingle();
  if (!grupo) return { error: "El grupo ya no existe." };

  const fila: Record<string, unknown> = {
    descripcion: d.descripcion,
    group_id: d.groupId,
    cantidad_esperada: d.cantidad === null ? (d.conservarCantidad || "OK") : String(d.cantidad),
    es_inventario: d.cantidad === null ? null : d.esInventario,
    severidad_falla: d.severidad,
    orden: d.orden,
    activo: d.activo,
    lista: "PREOPERACIONAL",
  };
  if (!d.id || d.cambiaTipos) fila.tipos_vehiculo = tipos;
  // Un ítem con regla por nombre en el portal no se renombra (la regla dejaría de aplicar sin avisar).
  if (d.id) {
    const { data: actual } = await supabase.from("checklist_items").select("descripcion").eq("id", d.id).eq("lista", "PREOPERACIONAL").maybeSingle();
    if (!actual) return { error: "El ítem ya no existe." };
    if (tieneReglaPorNombre(actual.descripcion as string) && (actual.descripcion as string).trim() !== d.descripcion) {
      return { error: "Este ítem tiene una regla ligada a su nombre en el portal del OVEM: no se puede renombrar." };
    }
  }
  // La categoría de siempre solo se fija al crear (un ítem que se mueve de grupo conserva la suya: su historial no cambia).
  if (!d.id) fila.categoria = CATEGORIA_DE_GRUPO[grupo.nombre as string] ?? CATEGORIA_NUEVA;

  // Solo ítems del preoperacional: los de dotación (lista DOTACION) no se editan desde aquí.
  const { error } = d.id
    ? await supabase.from("checklist_items").update(fila).eq("id", d.id).eq("lista", "PREOPERACIONAL")
    : await supabase.from("checklist_items").insert(fila);
  if (error) return { error: mensaje(error, "No se pudo guardar el ítem.") };
  await auditar(d.id ? "MODIFICAR" : "INSERTAR", "configuracion", d.id ?? d.descripcion, `Ítem del preoperacional «${d.descripcion}» (grupo ${grupo.nombre})`);
  revalidatePath("/configuracion");
  revalidatePath("/ovem");
  return { success: true };
}

/**
 * Eliminar un ítem: se borra de verdad solo si nunca se respondió en un preoperacional; si tiene historial se DESACTIVA (los
 * preoperacionales ya enviados lo siguen referenciando) y el resultado lo dice.
 */
export async function eliminarItem(id: number): Promise<{ success: true; desactivado: boolean } | { error: string }> {
  await requireRole(["ADMIN"]);
  if (!Number.isInteger(id) || id <= 0) return { error: "Ítem inválido" };
  const supabase = createClient() as any;
  const { data: existe } = await supabase.from("checklist_items").select("id").eq("id", id).eq("lista", "PREOPERACIONAL").maybeSingle();
  if (!existe) return { error: "El ítem ya no existe." };
  const { count, error: errorCuenta } = await supabase.from("daily_check_items").select("id", { count: "exact", head: true }).eq("checklist_item_id", id);
  if (errorCuenta) return { error: mensaje(errorCuenta, "No se pudo comprobar el historial del ítem.") };
  let desactivado = (count ?? 0) > 0;
  if (!desactivado) {
    const { data: borrados, error } = await supabase.from("checklist_items").delete().eq("id", id).eq("lista", "PREOPERACIONAL").select("id");
    // Otra tabla (dotación) puede referenciarlo, o la RLS no dejar borrar: en ambos casos se desactiva en vez de decir que se borró.
    if (error || !borrados || borrados.length === 0) desactivado = true;
  }
  if (desactivado) {
    const { error } = await supabase.from("checklist_items").update({ activo: false }).eq("id", id).eq("lista", "PREOPERACIONAL");
    if (error) return { error: mensaje(error, "No se pudo eliminar el ítem.") };
  }
  await auditar("ELIMINAR", "configuracion", id, desactivado ? "Ítem del preoperacional desactivado (tiene historial)" : "Ítem del preoperacional eliminado (sin historial)");
  revalidatePath("/configuracion");
  revalidatePath("/ovem");
  return { success: true, desactivado };
}
