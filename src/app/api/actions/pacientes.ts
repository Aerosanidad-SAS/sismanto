"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PatientFormData } from "@/lib/validations";
import { patientSchema } from "@/lib/validations";
import { z } from "zod";
import { requireRole } from "@/app/api/actions/auth";
import { EXPORT_PACIENTES_MAX_FILAS, ROLES_EXPORTAR_PACIENTES, type PacienteExport } from "@/lib/pacientes-export";
import {
  COLUMNAS_BUSQUEDA_PACIENTES,
  COLUMNAS_TYPEAHEAD_PACIENTES,
  PACIENTES_POR_PAGINA,
  condicionOrPalabra,
  palabrasBusquedaPacientes,
} from "@/lib/pacientes-lista";
import { auditar } from "@/lib/auditoria";

/**
 * Una página de pacientes activos (100) con búsqueda en el servidor. Antes se
 * traían todos de una vez y PostgREST corta en 1000 filas sin avisar, así que
 * la lista se truncaba en silencio. Cada palabra debe aparecer en alguna de
 * las columnas de búsqueda (varios `.or()` encadenados = AND).
 */
export async function buscarPacientes(q: string, pagina: number) {
  const supabase = createClient();
  const desde = (Math.max(1, pagina) - 1) * PACIENTES_POR_PAGINA;
  let query = supabase
    .from("patients")
    .select("*", { count: "exact" })
    .eq("activo", true)
    .order("apellido1")
    .order("id")
    .range(desde, desde + PACIENTES_POR_PAGINA - 1);
  for (const palabra of palabrasBusquedaPacientes(q)) {
    query = query.or(condicionOrPalabra(COLUMNAS_BUSQUEDA_PACIENTES, palabra));
  }
  const { data, count, error } = await query;
  if (error) return { pacientes: [], total: 0, error: error.message as string };
  return { pacientes: data ?? [], total: count ?? 0 };
}

/** Totales de las tarjetas de arriba: sobre todos los pacientes activos, no sobre la página ni la búsqueda. */
export async function getResumenPacientes() {
  const supabase = createClient();
  const activos = () => supabase.from("patients").select("id", { count: "exact", head: true }).eq("activo", true);
  const [total, conCelular, conEps] = await Promise.all([
    activos(),
    activos().not("celular", "is", null).neq("celular", ""),
    activos().not("eps", "is", null).neq("eps", ""),
  ]);
  return { total: total.count ?? 0, conCelular: conCelular.count ?? 0, conEps: conEps.count ?? 0 };
}

/** Catálogo real de EPS (tabla `eps`, migración 058_etl_identidad_origen,
 * 30 filas de sisres.eps) — mismo criterio que registroPacientes.php de
 * SISRES: select cerrado, sin texto libre. Ver PARIDAD_REGULACION.md
 * (sección Pacientes): la tabla ya existía sin usar en el formulario. */
export async function getEpsCatalog(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("eps")
    .select("entidad")
    .eq("activo", true)
    .order("entidad");
  return (data ?? []).map((r) => r.entidad as string);
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

  // El texto se limpia antes de entrar al .or() de PostgREST (ver palabrasBusquedaPacientes):
  // sin esto, comas o paréntesis del usuario podían agregar condiciones propias al filtro.
  const palabras = palabrasBusquedaPacientes(parsed.data);
  if (palabras.length === 0) return [];

  const supabase = createClient();
  let query = supabase
    .from("patients")
    .select("id, cedula, nombre1, nombre2, apellido1, apellido2")
    .eq("activo", true);
  for (const palabra of palabras) {
    query = query.or(condicionOrPalabra(COLUMNAS_TYPEAHEAD_PACIENTES, palabra));
  }
  const { data } = await query.order("apellido1").order("id").limit(15);
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

/** Todos los pacientes (activos e inactivos, como SISRES) para el Excel, en lotes de 1000, con tope EXPORT_PACIENTES_MAX_FILAS. */
export async function exportarPacientes() {
  await requireRole([...ROLES_EXPORTAR_PACIENTES]);
  const supabase = createClient();
  const filas: PacienteExport[] = [];
  const LOTE = 1000; // PostgREST devuelve máximo 1000 filas por consulta
  for (let desde = 0; desde < EXPORT_PACIENTES_MAX_FILAS; desde += LOTE) {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("id", { ascending: false })
      .range(desde, desde + LOTE - 1);
    if (error) return { error: error.message as string };
    filas.push(...((data ?? []) as PacienteExport[]));
    if (!data || data.length < LOTE) break;
  }
  return { filas, truncado: filas.length >= EXPORT_PACIENTES_MAX_FILAS };
}
