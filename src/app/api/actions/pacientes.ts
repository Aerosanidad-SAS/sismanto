"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PatientFormData } from "@/lib/validations";
import { patientSchema } from "@/lib/validations";
import { z } from "zod";
import { auditar } from "@/lib/auditoria";

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

export interface PacienteTypeahead {
  id: number;
  cedula: string;
  nombre1: string;
  nombre2: string | null;
  apellido1: string;
  apellido2: string | null;
}

/** Búsqueda incremental por cédula o nombre (cualquier parte) — para el combobox
 * de "buscar paciente" en el modal de Nuevo servicio, mínimo 2 caracteres. */
export async function buscarPacientesTypeahead(busqueda: string): Promise<PacienteTypeahead[]> {
  const parsed = z.string().trim().min(2).max(60).safeParse(busqueda);
  if (!parsed.success) return [];

  const supabase = createClient();
  const q = parsed.data;
  const { data } = await supabase
    .from("patients")
    .select("id, cedula, nombre1, nombre2, apellido1, apellido2")
    .eq("activo", true)
    .or(`cedula.ilike.%${q}%,nombre1.ilike.%${q}%,nombre2.ilike.%${q}%,apellido1.ilike.%${q}%,apellido2.ilike.%${q}%`)
    .order("apellido1")
    .limit(15);
  return (data ?? []) as PacienteTypeahead[];
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
  // Se identifica por id, no por cédula ni nombre: la bitácora no debe copiar datos personales.
  await auditar("INSERTAR", "pacientes", data.id, "Paciente creado");
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
  await auditar("MODIFICAR", "pacientes", idParsed.data, "Paciente actualizado");
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
  await auditar("ELIMINAR", "pacientes", idParsed.data, "Paciente desactivado");
  revalidatePath("/pacientes");
  return { success: true };
}
