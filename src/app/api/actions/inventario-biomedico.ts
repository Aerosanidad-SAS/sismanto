"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import type { BiomedicalEquipmentFormData, BiomedicalMaintenanceFormData } from "@/lib/validations";
import { biomedicalEquipmentSchema, biomedicalMaintenanceSchema } from "@/lib/validations";
import { HojaVidaBiomedicaPdf } from "@/lib/pdf/hoja-vida-biomedica";
import { getProfile } from "@/app/api/actions/auth";
import { z } from "zod";

function fechasNulas(d: Record<string, unknown>, campos: string[]) {
  const out: Record<string, unknown> = { ...d };
  for (const c of campos) out[c] = out[c] || null;
  return out;
}

const CAMPOS_FECHA_EQUIPO = [
  "ultimo_mantenimiento",
  "proximo_mantenimiento",
  "ultima_calibracion",
  "proxima_calibracion",
  "vencimiento_parche_adulto",
  "vencimiento_parche_pediatrico",
  "fecha_compra",
];

/**
 * Alertas de mantenimiento/calibración próximos a vencer — no existe una
 * vista SQL para esto (a diferencia de `vehicle_maintenance_alerts` en
 * vehículos), así que se calcula acá con los mismos umbrales que ya usa
 * el dashboard para SOAT/tecnomecánica (≤15 días = ROJA, ≤30 = NARANJA).
 */
export interface AlertaBiomedico {
  id: number;
  placa_equipo: string;
  equipo: string;
  ciudad: string | null;
  dias_restantes: number;
  tipo: "MANTENIMIENTO" | "CALIBRACION" | "PARCHE_ADULTO" | "PARCHE_PEDIATRICO";
  nivel: "ROJA" | "NARANJA";
}

export async function getAlertasBiomedicos() {
  const supabase = createClient();
  const { data } = await supabase
    .from("biomedical_equipment")
    .select(
      "id, placa_equipo, equipo, ciudad, proximo_mantenimiento, proxima_calibracion, vencimiento_parche_adulto, vencimiento_parche_pediatrico"
    )
    .eq("activo", true)
    // El inventario de Sistemas (area = 'SISTEMAS') comparte la tabla; no son alertas biomédicas.
    .or("area.is.null,area.neq.SISTEMAS");

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diasHasta = (fecha: string) => {
    const d = new Date(fecha);
    return Math.round((d.getTime() - hoy.getTime()) / 86400000);
  };
  const nivelDe = (dias: number): "ROJA" | "NARANJA" | null => {
    if (dias <= 15) return "ROJA";
    if (dias <= 30) return "NARANJA";
    return null;
  };

  const alertas: AlertaBiomedico[] = [];
  for (const eq of data || []) {
    if (eq.proximo_mantenimiento) {
      const dias = diasHasta(eq.proximo_mantenimiento);
      const nivel = nivelDe(dias);
      if (nivel) {
        alertas.push({ id: eq.id, placa_equipo: eq.placa_equipo, equipo: eq.equipo, ciudad: eq.ciudad, dias_restantes: dias, tipo: "MANTENIMIENTO", nivel });
      }
    }
    if (eq.proxima_calibracion) {
      const dias = diasHasta(eq.proxima_calibracion);
      const nivel = nivelDe(dias);
      if (nivel) {
        alertas.push({ id: eq.id, placa_equipo: eq.placa_equipo, equipo: eq.equipo, ciudad: eq.ciudad, dias_restantes: dias, tipo: "CALIBRACION", nivel });
      }
    }
    // Parche/pad de desfibrilador: la fecha impresa se compara directo
    // contra hoy, sin "próximo" calculado — no todo equipo la tiene
    // (típicamente solo área BIOMEDICA), así que si está vacía no genera
    // alerta, igual que el resto de fechas opcionales de este loop.
    if (eq.vencimiento_parche_adulto) {
      const dias = diasHasta(eq.vencimiento_parche_adulto);
      const nivel = nivelDe(dias);
      if (nivel) {
        alertas.push({ id: eq.id, placa_equipo: eq.placa_equipo, equipo: eq.equipo, ciudad: eq.ciudad, dias_restantes: dias, tipo: "PARCHE_ADULTO", nivel });
      }
    }
    if (eq.vencimiento_parche_pediatrico) {
      const dias = diasHasta(eq.vencimiento_parche_pediatrico);
      const nivel = nivelDe(dias);
      if (nivel) {
        alertas.push({ id: eq.id, placa_equipo: eq.placa_equipo, equipo: eq.equipo, ciudad: eq.ciudad, dias_restantes: dias, tipo: "PARCHE_PEDIATRICO", nivel });
      }
    }
  }
  alertas.sort((a, b) => a.dias_restantes - b.dias_restantes);

  return {
    totalActivos: (data || []).length,
    alertas,
    totalRojas: alertas.filter((a) => a.nivel === "ROJA").length,
    totalNaranjas: alertas.filter((a) => a.nivel === "NARANJA").length,
  };
}

export async function getEquiposBiomedicos() {
  const supabase = createClient();
  const { data } = await supabase
    .from("biomedical_equipment")
    .select("*")
    .eq("activo", true)
    .order("equipo");
  return data || [];
}

export async function crearEquipoBiomedico(formData: BiomedicalEquipmentFormData) {
  const parsed = biomedicalEquipmentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { data: existente } = await supabase
    .from("biomedical_equipment")
    .select("id")
    .eq("placa_equipo", parsed.data.placa_equipo)
    .maybeSingle();
  if (existente) return { error: "Ya existe un equipo con esa placa" };

  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("biomedical_equipment")
    .insert({
      ...(fechasNulas(parsed.data, CAMPOS_FECHA_EQUIPO) as typeof parsed.data),
      created_by: userData.user?.id ?? null,
      activo: true,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/equipos");
  return { success: true, data };
}

export async function actualizarEquipoBiomedico(id: number, formData: BiomedicalEquipmentFormData) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const parsed = biomedicalEquipmentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { error } = await supabase
    .from("biomedical_equipment")
    .update({
      ...(fechasNulas(parsed.data, CAMPOS_FECHA_EQUIPO) as typeof parsed.data),
      updated_at: new Date().toISOString(),
    })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  revalidatePath("/equipos");
  return { success: true };
}

export async function eliminarEquipoBiomedico(id: number) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  // Soft delete — la hoja de vida (mantenimientos) se conserva
  const { error } = await supabase
    .from("biomedical_equipment")
    .update({ activo: false })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  revalidatePath("/equipos");
  return { success: true };
}

// ── Mantenimientos biomédicos ────────────────────────────────

export async function getMantenimientosBiomedicos(equipmentId?: number) {
  const supabase = createClient();
  let query = supabase
    .from("biomedical_maintenance")
    .select("*, biomedical_equipment(placa_equipo, equipo, marca, modelo, serie)")
    .order("fecha_mantenimiento", { ascending: false })
    .limit(500);
  if (equipmentId) query = query.eq("equipment_id", equipmentId);
  const { data } = await query;
  return data || [];
}

export async function crearMantenimientoBiomedico(formData: BiomedicalMaintenanceFormData) {
  const parsed = biomedicalMaintenanceSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("biomedical_maintenance")
    .insert({
      ...parsed.data,
      cantidad: parsed.data.cantidad ?? null,
      created_by: userData.user?.id ?? null,
    })
    .select()
    .single();
  if (error) return { error: error.message };

  // Igual que SISRES: registrar mantenimiento actualiza la fecha de último
  // mantenimiento del equipo (la hoja de vida se arma con este historial)
  await supabase
    .from("biomedical_equipment")
    .update({ ultimo_mantenimiento: parsed.data.fecha_mantenimiento, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.equipment_id);

  revalidatePath("/equipos");
  return { success: true, data };
}

/** Hoja de vida: ficha del equipo + historial completo de mantenimientos. */
export async function getHojaDeVida(equipmentId: number) {
  const idParsed = z.number().int().positive().safeParse(equipmentId);
  if (!idParsed.success) return null;

  const supabase = createClient();
  const [{ data: equipo }, { data: mantenimientos }] = await Promise.all([
    supabase.from("biomedical_equipment").select("*").eq("id", idParsed.data).single(),
    supabase
      .from("biomedical_maintenance")
      .select("*")
      .eq("equipment_id", idParsed.data)
      .order("fecha_mantenimiento", { ascending: false }),
  ]);
  if (!equipo) return null;
  return { equipo, mantenimientos: mantenimientos || [] };
}

/**
 * Genera el PDF de hoja de vida del equipo — ficha técnica + historial de
 * mantenimientos. Formato provisional (ver PREGUNTAS_LEON_RONDA2.md §6):
 * pendiente de confirmar si SISRES exige un membrete/formato específico.
 * Devuelve el PDF en base64 (mismo patrón {data,error}, sin Route Handler).
 */
export async function generarHojaVidaPdf(equipmentId: number) {
  const hoja = await getHojaDeVida(equipmentId);
  if (!hoja) return { error: "Equipo no encontrado" };

  const profile = await getProfile();

  try {
    const buffer = await renderToBuffer(
      createElement(HojaVidaBiomedicaPdf, {
        equipo: hoja.equipo,
        mantenimientos: hoja.mantenimientos,
        generadoPor: profile?.nombre_completo || profile?.email || "Usuario Aeromanto",
      })
    );
    return { success: true, data: buffer.toString("base64"), filename: `hoja-vida-${hoja.equipo.placa_equipo}.pdf` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo generar el PDF" };
  }
}
