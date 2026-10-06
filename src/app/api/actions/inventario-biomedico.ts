"use server";

import { randomUUID } from "crypto";
import { diasEntre, hoyBogota, normalizarDia } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import type { BiomedicalEquipmentFormData, BiomedicalMaintenanceFormData } from "@/lib/validations";
import { biomedicalEquipmentSchema, biomedicalMaintenanceSchema } from "@/lib/validations";
import { HojaVidaBiomedicaPdf } from "@/lib/pdf/hoja-vida-biomedica";
import { getProfile, requireRole } from "@/app/api/actions/auth";
import { z } from "zod";
import { auditar } from "@/lib/auditoria";
import { tipoImagenPorContenido } from "@/lib/imagen-contenido";
import { completarFechasProximas, fechasTrasMantenimiento, type FechasEquipo } from "@/lib/biomedico-fechas";
import {
  CHECKLIST_GENERAL,
  MAX_ITEMS_CHECKLIST,
  MAX_LARGO_ITEM,
  armarChecklist,
  limpiarItems,
  normalizarEquipo,
  type CatalogoChecklists,
} from "@/lib/biomedico-checklist";

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

  const hoy = hoyBogota();
  const diasHasta = (fecha: string) => diasEntre(hoy, normalizarDia(fecha));
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
      ...(fechasNulas(completarFechasProximas(parsed.data), CAMPOS_FECHA_EQUIPO) as typeof parsed.data),
      created_by: userData.user?.id ?? null,
      activo: true,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  await auditar("INSERTAR", "inventario", data.id, "Equipo biomédico creado");
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
      ...(fechasNulas(completarFechasProximas(parsed.data), CAMPOS_FECHA_EQUIPO) as typeof parsed.data),
      updated_at: new Date().toISOString(),
    })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  await auditar("MODIFICAR", "inventario", idParsed.data, "Equipo biomédico actualizado");
  revalidatePath("/equipos");
  return { success: true };
}

const ROLES_FOTO_EQUIPO = ["ADMIN", "MANTENIMIENTO", "ANALISTA"] as const;
const BUCKET_FOTOS_EQUIPO = "equipos-fotos";
const MAX_MB_FOTO_EQUIPO = 8;
const MAX_BYTES_FOTO_EQUIPO = MAX_MB_FOTO_EQUIPO * 1024 * 1024;

/** Foto representativa del equipo (migración 112): reemplaza la anterior y borra su archivo. */
export async function subirFotoEquipoBiomedico(
  equipmentId: number,
  file: File
): Promise<{ error: string; success?: undefined } | { error?: undefined; success: true; ruta: string }> {
  await requireRole([...ROLES_FOTO_EQUIPO]);
  const idParsed = z.number().int().positive().safeParse(equipmentId);
  if (!idParsed.success) return { error: "ID inválido" };
  if (file.size > MAX_BYTES_FOTO_EQUIPO) return { error: `La foto no puede pesar más de ${MAX_MB_FOTO_EQUIPO} MB` };
  const cabecera = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const tipo = tipoImagenPorContenido(cabecera);
  if (!tipo) return { error: "Formato no soportado — usa PNG, JPG o WEBP" };

  const supabase = createClient();
  const ruta = `equipo-${idParsed.data}/${randomUUID()}.${tipo.ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_FOTOS_EQUIPO)
    .upload(ruta, file, { cacheControl: "3600", upsert: false, contentType: tipo.mime });
  if (uploadError) return { error: uploadError.message };

  const anterior = await supabase.from("biomedical_equipment").select("imagen_url").eq("id", idParsed.data).maybeSingle();
  const { error } = await supabase
    .from("biomedical_equipment")
    .update({ imagen_url: ruta, updated_at: new Date().toISOString() } as never)
    .eq("id", idParsed.data);
  if (error) {
    await supabase.storage.from(BUCKET_FOTOS_EQUIPO).remove([ruta]);
    return { error: error.message };
  }
  const rutaAnterior = (anterior.data as { imagen_url: string | null } | null)?.imagen_url;
  if (rutaAnterior) await supabase.storage.from(BUCKET_FOTOS_EQUIPO).remove([rutaAnterior]);

  await auditar("MODIFICAR", "inventario", idParsed.data, "Foto del equipo actualizada");
  revalidatePath("/equipos");
  return { success: true as const, ruta };
}

/** Enlace temporal (1 hora) para mostrar la foto del equipo — el bucket es privado. */
export async function getUrlFotoEquipoBiomedico(ruta: string): Promise<string | null> {
  const parsed = z.string().trim().min(1).safeParse(ruta);
  if (!parsed.success) return null;
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(BUCKET_FOTOS_EQUIPO).createSignedUrl(parsed.data, 3600);
  if (error || !data) return null;
  return data.signedUrl;
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
  await auditar("ELIMINAR", "inventario", idParsed.data, "Equipo biomédico desactivado");
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

const checklistEnviadoSchema = z
  .object({
    todos: z.array(z.string().max(MAX_LARGO_ITEM)).max(MAX_ITEMS_CHECKLIST),
    marcados: z.array(z.string().max(MAX_LARGO_ITEM)).max(MAX_ITEMS_CHECKLIST),
  })
  .optional();

/**
 * `checklist`: todos los ítems que se mostraron y los que se marcaron como «cumple» (migración 097). Si no viene
 * o está vacío, el mantenimiento se guarda sin checklist, como antes.
 */
export async function crearMantenimientoBiomedico(
  formData: BiomedicalMaintenanceFormData,
  checklist?: { todos: string[]; marcados: string[] }
) {
  const parsed = biomedicalMaintenanceSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const chkParsed = checklistEnviadoSchema.safeParse(checklist);
  if (!chkParsed.success) return { error: "Lista de chequeo inválida" };
  const chk = chkParsed.data ? armarChecklist(chkParsed.data.todos, chkParsed.data.marcados) : null;

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("biomedical_maintenance")
    .insert({
      ...parsed.data,
      cantidad: parsed.data.cantidad ?? null,
      chk_items: chk?.chk_items ?? null,
      chk_total: chk?.chk_total ?? null,
      chk_marcados: chk?.chk_marcados ?? null,
      created_by: userData.user?.id ?? null,
    } as never)
    .select()
    .single();
  if (error) return { error: error.message };

  // Registrar un mantenimiento mueve el «último» del equipo y recalcula el «próximo» (o la calibración, según el
  // tipo). Antes solo se movía el último y el equipo seguía «Vencido» y avisando por correo todos los días.
  const { data: equipo } = await supabase
    .from("biomedical_equipment")
    .select("ultimo_mantenimiento, ultima_calibracion, frec_mantenimiento, frec_calibracion")
    .eq("id", parsed.data.equipment_id)
    .maybeSingle();
  const cambios = fechasTrasMantenimiento(
    (equipo ?? {}) as FechasEquipo,
    normalizarDia(parsed.data.fecha_mantenimiento),
    parsed.data.tipo_mantenimiento
  );
  if (Object.keys(cambios).length > 0) {
    await supabase
      .from("biomedical_equipment")
      .update({ ...cambios, updated_at: new Date().toISOString() } as never)
      .eq("id", parsed.data.equipment_id);
  }

  await auditar("INSERTAR", "inventario", parsed.data.equipment_id, "Mantenimiento biomédico registrado");
  revalidatePath("/equipos");
  return { success: true, data };
}

// ── Listas de chequeo (migración 097) ────────────────────────

const ROLES_LEER_CHECKLIST = ["ADMIN", "MANTENIMIENTO", "COORDINACION", "GERENCIAL", "ANALISTA", "VISTA"];
const ROLES_EDITAR_CHECKLIST = ["ADMIN", "MANTENIMIENTO"];

/** Todas las listas, por clave de equipo. Vacío si el rol no puede leerlas o la tabla aún no existe. */
export async function getChecklistsBiomedicos(): Promise<CatalogoChecklists> {
  const profile = await getProfile();
  if (!profile || !ROLES_LEER_CHECKLIST.includes(profile.role_codigo)) return {};
  const { data, error } = await createClient().from("biomedical_checklists").select("equipo, items").order("equipo");
  if (error) return {};
  const catalogo: CatalogoChecklists = {};
  for (const f of (data ?? []) as unknown as { equipo: string; items: unknown }[]) {
    if (Array.isArray(f.items)) catalogo[f.equipo] = limpiarItems(f.items);
  }
  return catalogo;
}

/** Crea o reemplaza la lista de un tipo de equipo (el nombre se normaliza a la clave). Solo ADMIN y MANTENIMIENTO. */
export async function guardarChecklistBiomedico(equipo: string, items: string[]) {
  const profile = await getProfile();
  if (!profile || !ROLES_EDITAR_CHECKLIST.includes(profile.role_codigo)) return { error: "Sin permisos para editar listas de chequeo" };
  const clave = normalizarEquipo(z.string().max(150).catch("").parse(equipo));
  if (!clave) return { error: "Escribe el tipo de equipo" };
  const lista = z.array(z.string().max(MAX_LARGO_ITEM, `Cada ítem puede tener hasta ${MAX_LARGO_ITEM} caracteres`)).max(MAX_ITEMS_CHECKLIST).safeParse(items);
  if (!lista.success) return { error: lista.error.issues[0]?.message ?? "Ítems inválidos" };
  const limpios = limpiarItems(lista.data);
  if (limpios.length === 0) return { error: "Agrega al menos un ítem" };

  const { error } = await createClient()
    .from("biomedical_checklists")
    .upsert({ equipo: clave, items: limpios, updated_at: new Date().toISOString(), updated_by: profile.user_id } as never, {
      onConflict: "equipo",
    });
  if (error) return { error: error.message };
  await auditar("MODIFICAR", "inventario", clave, `Lista de chequeo ${clave}: ${limpios.length} ítems`);
  revalidatePath("/equipos");
  revalidatePath("/equipos/checklists");
  return { success: true as const, equipo: clave, items: limpios };
}

/** Elimina la lista de un tipo de equipo (sus equipos pasan a usar la GENERAL). La GENERAL no se elimina. */
export async function eliminarChecklistBiomedico(equipo: string) {
  const profile = await getProfile();
  if (!profile || !ROLES_EDITAR_CHECKLIST.includes(profile.role_codigo)) return { error: "Sin permisos para editar listas de chequeo" };
  const clave = normalizarEquipo(z.string().max(150).catch("").parse(equipo));
  if (!clave) return { error: "Lista inválida" };
  if (clave === CHECKLIST_GENERAL) return { error: "La lista GENERAL no se elimina: es la que usan los equipos sin lista propia" };
  const { data, error } = await createClient().from("biomedical_checklists").delete().eq("equipo", clave).select("equipo");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "La lista no existe" };
  await auditar("ELIMINAR", "inventario", clave, `Lista de chequeo ${clave} eliminada`);
  revalidatePath("/equipos");
  revalidatePath("/equipos/checklists");
  return { success: true as const };
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

  // El bucket es privado: react-pdf no puede pedir la signed URL por su cuenta, así que se baja el archivo aquí
  // (con la sesión del usuario, igual que cualquier otra lectura) y se pasa como data URI.
  let fotoDataUri: string | null = null;
  const rutaFoto = (hoja.equipo as { imagen_url?: string | null }).imagen_url;
  if (rutaFoto) {
    const { data: blob } = await createClient().storage.from(BUCKET_FOTOS_EQUIPO).download(rutaFoto);
    if (blob) {
      const buf = Buffer.from(await blob.arrayBuffer());
      fotoDataUri = `data:${blob.type || "image/jpeg"};base64,${buf.toString("base64")}`;
    }
  }

  try {
    const buffer = await renderToBuffer(
      createElement(HojaVidaBiomedicaPdf, {
        equipo: hoja.equipo,
        mantenimientos: hoja.mantenimientos,
        generadoPor: profile?.nombre_completo || profile?.email || "Usuario Aeromanto",
        fotoDataUri,
      })
    );
    return { success: true, data: buffer.toString("base64"), filename: `hoja-vida-${hoja.equipo.placa_equipo}.pdf` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo generar el PDF" };
  }
}
