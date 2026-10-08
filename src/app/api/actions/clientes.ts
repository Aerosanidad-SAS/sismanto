"use server";

import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { revalidatePath } from "next/cache";
import type { ClientFormData } from "@/lib/validations";
import { getCamposObligatoriosModulo } from "@/app/api/actions/campos-obligatorios";
import { camposFaltantes, mensajeFaltantes } from "@/lib/campos-obligatorios";
import { clientSchema } from "@/lib/validations";
import { getProfile } from "@/app/api/actions/auth";
import { puedeDesactivarCliente, puedeEscribirClientes } from "@/lib/clientes-reglas";
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
  if (!puedeEscribirClientes((await getProfile())?.role_codigo)) return { error: "Sin permiso para registrar clientes" };
  const parsed = clientSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  // Campos opcionales que el administrador volvió obligatorios (migración 101).
  const faltan = mensajeFaltantes(camposFaltantes("clientes", parsed.data, await getCamposObligatoriosModulo("clientes")));
  if (faltan) return { error: faltan };

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
  revalidatePath("/clientes");
  return { success: true, data };
}

export async function actualizarCliente(id: number, formData: ClientFormData) {
  if (!puedeEscribirClientes((await getProfile())?.role_codigo)) return { error: "Sin permiso para editar clientes" };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const parsed = clientSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  // Campos opcionales que el administrador volvió obligatorios (migración 101).
  const faltan = mensajeFaltantes(camposFaltantes("clientes", parsed.data, await getCamposObligatoriosModulo("clientes")));
  if (faltan) return { error: faltan };

  const supabase = createClient();
  const { error } = await supabase
    .from("clients")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  await auditar("MODIFICAR", "clientes", idParsed.data, "Cliente actualizado");
  revalidatePath("/configuracion");
  revalidatePath("/clientes");
  return { success: true };
}

export async function eliminarCliente(id: number) {
  if (!puedeDesactivarCliente((await getProfile())?.role_codigo)) return { error: "Sin permiso: solo un administrador puede desactivar clientes" };
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
  revalidatePath("/clientes");
  return { success: true };
}
