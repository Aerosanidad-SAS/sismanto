"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AssessmentFormData } from "@/lib/validations";
import { assessmentSchema } from "@/lib/validations";
import { z } from "zod";

export async function getValoraciones() {
  const supabase = createClient();
  const { data } = await supabase
    .from("medical_assessments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  return data || [];
}

export async function crearValoracion(formData: AssessmentFormData) {
  const parsed = assessmentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  // Si el paciente existe en el maestro, se enlaza (SISRES solo guardaba la cédula)
  const { data: paciente } = await supabase
    .from("patients")
    .select("id")
    .eq("cedula", parsed.data.cedula)
    .maybeSingle();

  const { data, error } = await supabase
    .from("medical_assessments")
    .insert({
      ...parsed.data,
      patient_id: paciente?.id ?? null,
      fecha_nacimiento: parsed.data.fecha_nacimiento || null,
      fecha_hora_vuelo: parsed.data.fecha_hora_vuelo || null,
      created_by: userData.user?.id ?? null,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/valoraciones");
  return { success: true, data };
}

export async function actualizarValoracion(id: number, formData: AssessmentFormData) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const parsed = assessmentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { error } = await supabase
    .from("medical_assessments")
    .update({
      ...parsed.data,
      fecha_nacimiento: parsed.data.fecha_nacimiento || null,
      fecha_hora_vuelo: parsed.data.fecha_hora_vuelo || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  revalidatePath("/valoraciones");
  return { success: true };
}

export async function eliminarValoracion(id: number) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { error } = await supabase.from("medical_assessments").delete().eq("id", idParsed.data);
  if (error) return { error: error.message };
  revalidatePath("/valoraciones");
  return { success: true };
}
