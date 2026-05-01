"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupplierFormData } from "@/lib/validations";
import { supplierSchema } from "@/lib/validations";
import { z } from "zod";

export async function getProveedores() {
  const supabase = createClient();
  const { data } = await supabase
    .from("suppliers")
    .select("*")
    .eq("activo", true)
    .order("nombre");
  return data || [];
}

export async function getProveedoresAll() {
  const supabase = createClient();
  const { data } = await supabase
    .from("suppliers")
    .select("*")
    .order("nombre");
  return data || [];
}

export async function crearProveedor(formData: SupplierFormData) {
  const parsed = supplierSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      nombre: parsed.data.nombre,
      nit: parsed.data.nit || null,
      contacto: parsed.data.contacto || null,
      activo: true,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/configuracion");
  return { success: true, data };
}

export async function actualizarProveedor(id: number, formData: SupplierFormData) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: idParsed.error.issues[0]?.message ?? "Datos inválidos" };

  const parsed = supplierSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { error } = await supabase
    .from("suppliers")
    .update({
      nombre: parsed.data.nombre,
      nit: parsed.data.nit || null,
      contacto: parsed.data.contacto || null,
    })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  revalidatePath("/configuracion");
  return { success: true };
}

export async function eliminarProveedor(id: number) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: idParsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  // Soft delete
  const { error } = await supabase
    .from("suppliers")
    .update({ activo: false })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  revalidatePath("/configuracion");
  return { success: true };
}
