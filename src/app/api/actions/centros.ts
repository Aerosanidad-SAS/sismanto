"use server";

import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { revalidatePath } from "next/cache";
import type { OperationalCenterFormData } from "@/lib/validations";
import { operationalCenterSchema, operationalCenterUpdateNombreSchema } from "@/lib/validations";
import { z } from "zod";

export async function getCentrosOperaciones() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("operational_centers")
    .select("*")
    .order("nombre");
  if (error) return [];
  return data || [];
}

export async function crearCentroOperaciones(data: OperationalCenterFormData) {
  const parsed = operationalCenterSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { error } = await supabase.from("operational_centers").insert({
    codigo: parsed.data.codigo.toUpperCase(),
    nombre: parsed.data.nombre,
    activo: true,
  });
  if (error) return { error: error.message };
  await auditar("INSERTAR", "configuracion", "", "Centro de operaciones creado");
  revalidatePath("/configuracion");
  return { success: true };
}

export async function actualizarCentroOperaciones(
  id: number,
  data: Partial<OperationalCenterFormData>
) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: idParsed.error.issues[0]?.message ?? "Datos inválidos" };

  const parsed = operationalCenterUpdateNombreSchema.safeParse({ nombre: data.nombre });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { error } = await supabase
    .from("operational_centers")
    .update({ nombre: parsed.data.nombre })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  await auditar("MODIFICAR", "configuracion", idParsed.data, "Centro de operaciones actualizado");
  revalidatePath("/configuracion");
  return { success: true };
}

export async function eliminarCentroOperaciones(id: number) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: idParsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  // Verificar si hay vehículos asignados
  const { count } = await supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true })
    .eq("centro_operativo_id", idParsed.data);
  if (count && count > 0) {
    return {
      error: `No se puede eliminar: hay ${count} vehículo(s) asignados a este centro.`,
    };
  }
  // Soft delete
  const { error } = await supabase
    .from("operational_centers")
    .update({ activo: false })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  await auditar("ELIMINAR", "configuracion", idParsed.data, "Centro de operaciones desactivado");
  revalidatePath("/configuracion");
  return { success: true };
}
