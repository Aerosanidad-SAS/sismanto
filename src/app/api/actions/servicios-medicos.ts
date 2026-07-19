"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MedicalServiceFormData, EtapaServicio } from "@/lib/validations";
import { medicalServiceSchema, ETAPAS_SERVICIO } from "@/lib/validations";
import { z } from "zod";

// Transiciones de etapa válidas — mismas reglas que SISRES:
// PROGRAMADO puede pasar a CURSO o cerrarse directo (cancelado/fallido/no efectivo);
// CURSO solo puede cerrarse; las etapas de cierre son terminales.
const TRANSICIONES: Record<EtapaServicio, EtapaServicio[]> = {
  PROGRAMADO: ["CURSO", "CANCELADO", "FALLIDO", "NO_EFECTIVO"],
  CURSO: ["FINALIZADO", "CANCELADO", "FALLIDO", "NO_EFECTIVO"],
  FINALIZADO: [],
  CANCELADO: [],
  FALLIDO: [],
  NO_EFECTIVO: [],
};

/** Minutos entre dos timestamps ISO; null si falta alguno o el resultado es negativo. */
function minutosEntre(desde?: string | null, hasta?: string | null): number | null {
  if (!desde || !hasta) return null;
  const d = new Date(desde).getTime();
  const h = new Date(hasta).getTime();
  if (Number.isNaN(d) || Number.isNaN(h) || h < d) return null;
  return Math.round(((h - d) / 60000) * 100) / 100;
}

// Mismos cálculos que insertarServicios.php:
// oportunidad = programación → llegada a origen; origen = estancia en origen;
// intermedia = estancia en punto intermedio; destino = estancia en destino;
// total = suma de los cuatro.
function calcularTiempos(d: {
  fecha_hora_programacion?: string;
  fecha_hora_llegada_origen?: string;
  fecha_hora_salida_origen?: string;
  fecha_hora_llegada_intermedia?: string;
  fecha_hora_salida_intermedia?: string;
  fecha_hora_llegada_destino?: string;
  fecha_hora_salida_destino?: string;
}) {
  const oportunidad = minutosEntre(d.fecha_hora_programacion, d.fecha_hora_llegada_origen);
  const origen = minutosEntre(d.fecha_hora_llegada_origen, d.fecha_hora_salida_origen);
  const intermedia = minutosEntre(d.fecha_hora_llegada_intermedia, d.fecha_hora_salida_intermedia);
  const destino = minutosEntre(d.fecha_hora_llegada_destino, d.fecha_hora_salida_destino);
  const partes = [oportunidad, origen, intermedia, destino].filter((v): v is number => v !== null);
  const total = partes.length > 0 ? Math.round(partes.reduce((a, b) => a + b, 0) * 100) / 100 : null;
  return {
    oportunidad_atencion: oportunidad,
    tiempo_total_origen: origen,
    tiempo_espera_intermedia: intermedia,
    tiempo_espera_destino: destino,
    tiempo_total: total,
  };
}

function aFilaServicio(parsed: z.output<typeof medicalServiceSchema>) {
  const tiempos = calcularTiempos(parsed);
  return {
    ...parsed,
    patient_id: parsed.patient_id ?? null,
    vehicle_id: parsed.vehicle_id ?? null,
    valor_servicio: parsed.valor_servicio ?? null,
    fecha_hora_programacion: parsed.fecha_hora_programacion || null,
    fecha_hora_llegada_origen: parsed.fecha_hora_llegada_origen || null,
    fecha_hora_salida_origen: parsed.fecha_hora_salida_origen || null,
    fecha_hora_llegada_intermedia: parsed.fecha_hora_llegada_intermedia || null,
    fecha_hora_salida_intermedia: parsed.fecha_hora_salida_intermedia || null,
    fecha_hora_llegada_destino: parsed.fecha_hora_llegada_destino || null,
    fecha_hora_salida_destino: parsed.fecha_hora_salida_destino || null,
    ...tiempos,
  };
}

export async function getServiciosMedicos(filtro?: { etapa?: string; desde?: string; hasta?: string }) {
  const supabase = createClient();
  let query = supabase
    .from("medical_services")
    .select("*, patients(cedula, nombre1, apellido1), vehicles(placa)")
    .order("fecha_hora_registro", { ascending: false })
    .limit(500);

  if (filtro?.etapa && (ETAPAS_SERVICIO as readonly string[]).includes(filtro.etapa)) {
    query = query.eq("etapa", filtro.etapa);
  }
  if (filtro?.desde) query = query.gte("fecha_hora_registro", filtro.desde);
  if (filtro?.hasta) query = query.lte("fecha_hora_registro", filtro.hasta);

  const { data } = await query;
  return data || [];
}

export async function crearServicioMedico(formData: MedicalServiceFormData) {
  const parsed = medicalServiceSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("medical_services")
    .insert({
      ...aFilaServicio(parsed.data),
      etapa: "PROGRAMADO",
      created_by: userData.user?.id ?? null,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/servicios");
  return { success: true, data };
}

export async function actualizarServicioMedico(id: number, formData: MedicalServiceFormData) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const parsed = medicalServiceSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { error } = await supabase
    .from("medical_services")
    .update({ ...aFilaServicio(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  revalidatePath("/servicios");
  return { success: true };
}

/**
 * Cambio de etapa con guarda optimista — port de cambiarEtapaRapido.php:
 * el UPDATE incluye la etapa actual esperada en el WHERE, así dos usuarios
 * simultáneos no pisan la transición del otro.
 */
export async function cambiarEtapaServicio(id: number, etapaActual: string, etapaNueva: string) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const actual = ETAPAS_SERVICIO.find((e) => e === etapaActual);
  const nueva = ETAPAS_SERVICIO.find((e) => e === etapaNueva);
  if (!actual || !nueva) return { error: "Etapa inválida" };
  if (!TRANSICIONES[actual].includes(nueva)) {
    return { error: `No se puede pasar de ${actual} a ${nueva}` };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("medical_services")
    .update({ etapa: nueva, updated_at: new Date().toISOString() })
    .eq("id", idParsed.data)
    .eq("etapa", actual)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: `El servicio ya no está en ${actual}. Puede que otro usuario ya lo haya actualizado.` };
  }
  revalidatePath("/servicios");
  return { success: true };
}

export async function eliminarServicioMedico(id: number) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { error } = await supabase.from("medical_services").delete().eq("id", idParsed.data);
  if (error) return { error: error.message };
  revalidatePath("/servicios");
  return { success: true };
}

export async function getCatalogoCie(busqueda: string) {
  const parsed = z.string().trim().min(1).max(60).safeParse(busqueda);
  if (!parsed.success) return [];

  const supabase = createClient();
  const { data } = await supabase
    .from("cie10")
    .select("codigo, descripcion")
    .or(`codigo.ilike.%${parsed.data}%,descripcion.ilike.%${parsed.data}%`)
    .limit(20);
  return data || [];
}
