"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/app/api/actions/auth";
import type { WaCampaignFormData } from "@/lib/validations";
import { waCampaignSchema } from "@/lib/validations";
import { sanitizarTelefono, enviarPlantilla, whatsappConfigurado } from "@/lib/notifications/whatsapp";
import { z } from "zod";
import { leerDestinatariosDeBase } from "@/lib/campanas-base";
import { mascararTelefono, normalizarDestinatarios, resumenOmitidos } from "@/lib/campanas-destinatarios";

const ROLES_CAMPANAS = ["ADMIN", "COORDINACION"];

// Mismo ritmo que procesarLoteCampana.php de SISRES (BATCH=5 + sleep(2)):
// Meta limita por tasa y puede restringir el número si recibe ráfagas.
const LOTE_CAMPANA = 5;
const PAUSA_ENTRE_ENVIOS_MS = 2000;
const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getCampanas() {
  const supabase = createClient();
  const { data } = await supabase
    .from("wa_campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return data || [];
}

export async function getDestinatariosCampana(campaignId: number) {
  const idParsed = z.number().int().positive().safeParse(campaignId);
  if (!idParsed.success) return [];

  const supabase = createClient();
  const { data } = await supabase
    .from("wa_campaign_recipients")
    .select("*")
    .eq("campaign_id", idParsed.data)
    .order("id");
  return data || [];
}

type DestinatarioListo = { telefonoNormalizado: string; nombre?: string; parametros: string[] };

/** Inserta la campaña y sus destinatarios (ya validados y normalizados). Compartido por las tres formas de crearla. */
async function insertarCampana(
  datos: { nombre: string; plantilla: string; idioma: string },
  destinatarios: DestinatarioListo[]
) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: campana, error } = await supabase
    .from("wa_campaigns")
    .insert({
      nombre: datos.nombre,
      plantilla: datos.plantilla,
      idioma: datos.idioma,
      estado: "BORRADOR",
      total_destinatarios: destinatarios.length,
      created_by: userData.user?.id ?? null,
    })
    .select()
    .single();
  if (error || !campana) return { error: error?.message ?? "No se pudo crear la campaña" };

  const { error: errDest } = await supabase.from("wa_campaign_recipients").insert(
    destinatarios.map((d) => ({
      campaign_id: campana.id,
      telefono: d.telefonoNormalizado,
      nombre: d.nombre ?? null,
      parametros: d.parametros,
      estado: "PENDIENTE",
    }))
  );
  if (errDest) return { error: errDest.message };

  revalidatePath("/comunicaciones");
  return { success: true as const, data: campana };
}

async function exigirRolCampanas(): Promise<string | null> {
  const profile = await getProfile();
  return profile && ROLES_CAMPANAS.includes(profile.role_codigo) ? null : "Sin permisos";
}

/**
 * Campaña con destinatarios escritos a mano o leídos de un Excel. Con `omitirInvalidos` (Excel) los teléfonos inválidos
 * y repetidos se omiten y se cuentan en `resumen`; sin él (texto pegado) un teléfono inválido es un error, como siempre.
 */
export async function crearCampana(formData: WaCampaignFormData, opciones: { omitirInvalidos?: boolean } = {}) {
  const sinPermiso = await exigirRolCampanas();
  if (sinPermiso) return { error: sinPermiso };

  const parsed = waCampaignSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  if (opciones.omitirInvalidos) {
    const { destinatarios, omitidos } = normalizarDestinatarios(parsed.data.destinatarios.map((d) => ({ ...d, parametros: d.parametros ?? [] })));
    if (destinatarios.length === 0) return { error: "Ningún destinatario tiene un teléfono válido." };
    const res = await insertarCampana(parsed.data, destinatarios);
    return "error" in res ? res : { ...res, resumen: resumenOmitidos(omitidos) };
  }

  // Validar teléfonos ANTES de crear nada (mismo criterio que waSanitizarTelefono)
  const destinatarios = parsed.data.destinatarios.map((d) => ({
    ...d,
    telefonoNormalizado: sanitizarTelefono(d.telefono),
  }));
  const invalidos = destinatarios.filter((d) => !d.telefonoNormalizado);
  if (invalidos.length > 0) {
    return { error: `${invalidos.length} teléfono(s) inválido(s), ej: "${invalidos[0].telefono}"` };
  }
  return insertarCampana(parsed.data, destinatarios as DestinatarioListo[]);
}

const entradaBaseSchema = z.object({
  fuente: z.enum(["pacientes", "clientes"]),
  ciudad: z.string().trim().max(100).default(""),
  mapeo: z.array(z.string().max(40)).max(10).default([]),
});

/** Vista previa de una campaña desde la base: cuántos destinatarios saldrían y cuántos se omiten, sin crear nada ni devolver teléfonos completos. */
export async function previsualizarDestinatariosBase(entrada: z.input<typeof entradaBaseSchema>) {
  const sinPermiso = await exigirRolCampanas();
  if (sinPermiso) return { error: sinPermiso };
  const parsed = entradaBaseSchema.safeParse(entrada);
  if (!parsed.success) return { error: "Origen de destinatarios inválido" };

  const res = await leerDestinatariosDeBase(createClient(), parsed.data);
  if ("error" in res) return res;
  return {
    total: res.destinatarios.length,
    registros: res.registros,
    resumen: resumenOmitidos(res.omitidos),
    // Solo una muestra, con el teléfono enmascarado: la vista previa no es una exportación de datos personales.
    muestra: res.destinatarios.slice(0, 5).map((d) => ({ telefono: mascararTelefono(d.telefonoNormalizado), nombre: d.nombre ?? "", parametros: d.parametros })),
  };
}

/** Crea la campaña con los pacientes o clientes activos (y de la ciudad indicada, si se pidió) que tengan un celular válido. */
export async function crearCampanaDesdeBase(datos: { nombre: string; plantilla: string; idioma: string } & z.input<typeof entradaBaseSchema>) {
  const sinPermiso = await exigirRolCampanas();
  if (sinPermiso) return { error: sinPermiso };
  const base = entradaBaseSchema.safeParse(datos);
  if (!base.success) return { error: "Origen de destinatarios inválido" };
  const cab = waCampaignSchema.pick({ nombre: true, plantilla: true, idioma: true }).safeParse(datos);
  if (!cab.success) return { error: cab.error.issues[0]?.message ?? "Datos inválidos" };

  const res = await leerDestinatariosDeBase(createClient(), base.data);
  if ("error" in res) return res;
  const creada = await insertarCampana(cab.data, res.destinatarios);
  return "error" in creada ? creada : { ...creada, resumen: resumenOmitidos(res.omitidos) };
}

/**
 * Procesa un lote de destinatarios PENDIENTES (LOTE_CAMPANA por invocación,
 * con pausa entre envíos, como procesarLoteCampana.php) — la UI lo invoca
 * repetidamente hasta completar. Sin credenciales de WhatsApp configuradas
 * simula el envío sin pausas (modo staging).
 */
export async function procesarLoteCampana(campaignId: number) {
  const profile = await getProfile();
  if (!profile || !ROLES_CAMPANAS.includes(profile.role_codigo)) return { error: "Sin permisos" };

  const idParsed = z.number().int().positive().safeParse(campaignId);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data: campana } = await supabase
    .from("wa_campaigns")
    .select("*")
    .eq("id", idParsed.data)
    .single();
  if (!campana) return { error: "Campaña no encontrada" };
  if (campana.estado === "COMPLETADA" || campana.estado === "CANCELADA") {
    return { error: `La campaña ya está ${campana.estado}` };
  }

  const { data: pendientes } = await supabase
    .from("wa_campaign_recipients")
    .select("*")
    .eq("campaign_id", campana.id)
    .eq("estado", "PENDIENTE")
    .order("id")
    .limit(LOTE_CAMPANA);

  if (!pendientes || pendientes.length === 0) {
    await supabase
      .from("wa_campaigns")
      .update({ estado: "COMPLETADA", updated_at: new Date().toISOString() })
      .eq("id", campana.id);
    revalidatePath("/comunicaciones");
    return { success: true, procesados: 0, restantes: 0 };
  }

  await supabase
    .from("wa_campaigns")
    .update({ estado: "EN_PROCESO", updated_at: new Date().toISOString() })
    .eq("id", campana.id);

  let enviados = 0;
  let fallidos = 0;
  const envioReal = whatsappConfigurado();
  for (let i = 0; i < pendientes.length; i++) {
    const dest = pendientes[i];
    if (envioReal && i > 0) await esperar(PAUSA_ENTRE_ENVIOS_MS);
    const params = Array.isArray(dest.parametros) ? (dest.parametros as string[]).map(String) : [];
    const resultado = await enviarPlantilla(dest.telefono, campana.plantilla, campana.idioma, params);
    if (resultado.ok) enviados++;
    else fallidos++;
    await supabase
      .from("wa_campaign_recipients")
      .update({
        estado: resultado.ok ? "ENVIADO" : "FALLIDO",
        wamid: resultado.wamid,
        error: resultado.error,
        sent_at: new Date().toISOString(),
      })
      .eq("id", dest.id);
  }

  const { count: restantes } = await supabase
    .from("wa_campaign_recipients")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campana.id)
    .eq("estado", "PENDIENTE");

  await supabase
    .from("wa_campaigns")
    .update({
      total_enviados: campana.total_enviados + enviados,
      total_fallidos: campana.total_fallidos + fallidos,
      estado: (restantes ?? 0) === 0 ? "COMPLETADA" : "EN_PROCESO",
      updated_at: new Date().toISOString(),
    })
    .eq("id", campana.id);

  revalidatePath("/comunicaciones");
  return { success: true, procesados: pendientes.length, restantes: restantes ?? 0, simulado: !envioReal };
}
