"use server";

import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { revalidatePath } from "next/cache";
import type { ClientFormData } from "@/lib/validations";
import { clientSchema } from "@/lib/validations";
import { z } from "zod";

export async function getClientes() {
  const supabase = createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("activo", true)
    .order("nombre");
  return data || [];
}

export async function crearCliente(formData: ClientFormData) {
  const parsed = clientSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { data: existente } = await supabase
    .from("clients")
    .select("id")
    .eq("numero", parsed.data.numero)
    .maybeSingle();
  if (existente) return { error: "Ya existe un cliente con ese NIT/documento" };

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...parsed.data, activo: true })
    .select()
    .single();
  if (error) return { error: error.message };
  await auditar("INSERTAR", "clientes", "", "Cliente creado");
  revalidatePath("/configuracion");
  return { success: true, data };
}

export async function actualizarCliente(id: number, formData: ClientFormData) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const parsed = clientSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { error } = await supabase
    .from("clients")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  await auditar("MODIFICAR", "clientes", idParsed.data, "Cliente actualizado");
  revalidatePath("/configuracion");
  return { success: true };
}

export async function eliminarCliente(id: number) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  // Soft delete
  const { error } = await supabase
    .from("clients")
    .update({ activo: false })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  await auditar("ELIMINAR", "clientes", idParsed.data, "Cliente desactivado");
  revalidatePath("/configuracion");
  return { success: true };
}
