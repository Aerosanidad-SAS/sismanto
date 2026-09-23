"use server";

import { createClient } from "@/lib/supabase/server";
import { aTimestamptzColombia } from "@/lib/hora-colombia";
import { revalidatePath } from "next/cache";
import type { AssessmentFormData } from "@/lib/validations";
import { assessmentSchema } from "@/lib/validations";
import { getProfile } from "@/app/api/actions/auth";
import {
  COLUMNAS_BUSQUEDA_VALORACIONES,
  VALORACIONES_POR_PAGINA,
  palabrasBusquedaValoraciones,
} from "@/lib/valoraciones-lista";
import { z } from "zod";

/**
 * Una página de valoraciones (25) con búsqueda en el servidor, como
 * mostrarValoraciones.php de SISRES. Antes se traían las 500 más recientes y
 * la búsqueda y las tarjetas solo veían esas. Cada palabra debe aparecer en
 * alguna de las columnas de búsqueda (varios `.or()` encadenados = AND).
 */
export async function buscarValoraciones(q: string, pagina: number) {
  const supabase = createClient();
  const desde = (Math.max(1, pagina) - 1) * VALORACIONES_POR_PAGINA;
  let query = supabase
    .from("medical_assessments")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(desde, desde + VALORACIONES_POR_PAGINA - 1);
  for (const palabra of palabrasBusquedaValoraciones(q)) {
    query = query.or(COLUMNAS_BUSQUEDA_VALORACIONES.map((c) => `${c}.ilike.%${palabra}%`).join(","));
  }
  const { data, count, error } = await query;
  if (error) return { valoraciones: [], total: 0, error: error.message as string };
  return { valoraciones: data ?? [], total: count ?? 0 };
}

/** Totales de las tarjetas: sobre TODAS las valoraciones, no sobre la página ni la búsqueda. */
export async function getResumenValoraciones() {
  const supabase = createClient();
  const todas = () => supabase.from("medical_assessments").select("id", { count: "exact", head: true });
  // ilike sin comodines = igualdad sin distinguir mayúsculas: "APTO" no incluye a "NO APTO".
  const [total, aptos, noAptos] = await Promise.all([
    todas(),
    todas().ilike("valoracion", "APTO"),
    todas().ilike("valoracion", "NO APTO"),
  ]);
  return { total: total.count ?? 0, aptos: aptos.count ?? 0, noAptos: noAptos.count ?? 0 };
}

export async function crearValoracion(formData: AssessmentFormData) {
  const parsed = assessmentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const profile = await getProfile();

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
      fecha_hora_vuelo: aTimestamptzColombia(parsed.data.fecha_hora_vuelo),
      // Igual que los campos ocultos de registroValoracion.php: el médico es quien registra
      // (no se puede firmar a nombre de otro) y el pasajero es el paciente.
      medico: profile?.nombre_completo ?? profile?.email ?? null,
      pasajero: parsed.data.nombre_completo,
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
      fecha_hora_vuelo: aTimestamptzColombia(parsed.data.fecha_hora_vuelo),
      // El médico que valoró no cambia al editar; el pasajero sigue al nombre del paciente.
      pasajero: parsed.data.nombre_completo,
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
