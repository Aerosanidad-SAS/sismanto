"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PatientFormData } from "@/lib/validations";
import { patientSchema } from "@/lib/validations";
import { z } from "zod";

export async function getPacientes() {
  const supabase = createClient();
  const { data } = await supabase
    .from("patients")
    .select("*")
    .eq("activo", true)
    .order("apellido1");
  return data || [];
}

export async function buscarPacientePorCedula(cedula: string) {
  const parsed = z.string().trim().min(4).max(20).safeParse(cedula);
  if (!parsed.success) return null;

  const supabase = createClient();
  const { data } = await supabase
    .from("patients")
    .select("*")
    .eq("cedula", parsed.data)
    .eq("activo", true)
    .maybeSingle();
  return data;
}

export async function crearPaciente(formData: PatientFormData) {
  const parsed = patientSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();

  // Regla de SISRES (insertarPacientes.php): la cédula no se repite
  const { data: existente } = await supabase
    .from("patients")
    .select("id")
    .eq("cedula", parsed.data.cedula)
    .maybeSingle();
  if (existente) return { error: "Ya existe un paciente con ese documento" };

  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("patients")
    .insert({
      ...parsed.data,
      fecha_nacimiento: parsed.data.fecha_nacimiento || null,
      created_by: userData.user?.id ?? null,
      activo: true,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/pacientes");
  return { success: true, data };
}

export async function actualizarPaciente(id: number, formData: PatientFormData) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const parsed = patientSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { error } = await supabase
    .from("patients")
    .update({
      ...parsed.data,
      fecha_nacimiento: parsed.data.fecha_nacimiento || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  revalidatePath("/pacientes");
  return { success: true };
}

export async function eliminarPaciente(id: number) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  // Soft delete — el historial de servicios del paciente se conserva
  const { error } = await supabase
    .from("patients")
    .update({ activo: false })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  revalidatePath("/pacientes");
  return { success: true };
}
