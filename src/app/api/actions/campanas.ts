"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/app/api/actions/auth";
import type { WaCampaignFormData } from "@/lib/validations";
import { waCampaignSchema } from "@/lib/validations";
import { sanitizarTelefono, enviarPlantilla, whatsappConfigurado } from "@/lib/notifications/whatsapp";
import { z } from "zod";

const ROLES_CAMPANAS = ["ADMIN", "COORDINACION"];

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

export async function crearCampana(formData: WaCampaignFormData) {
  const profile = await getProfile();
  if (!profile || !ROLES_CAMPANAS.includes(profile.role_codigo)) return { error: "Sin permisos" };

  const parsed = waCampaignSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  // Validar teléfonos ANTES de crear nada (mismo criterio que waSanitizarTelefono)
  const destinatarios = parsed.data.destinatarios.map((d) => ({
    ...d,
    telefonoNormalizado: sanitizarTelefono(d.telefono),
  }));
  const invalidos = destinatarios.filter((d) => !d.telefonoNormalizado);
  if (invalidos.length > 0) {
    return { error: `${invalidos.length} teléfono(s) inválido(s), ej: "${invalidos[0].telefono}"` };
  }

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: campana, error } = await supabase
    .from("wa_campaigns")
    .insert({
      nombre: parsed.data.nombre,
      plantilla: parsed.data.plantilla,
      idioma: parsed.data.idioma,
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
      telefono: d.telefonoNormalizado as string,
      nombre: d.nombre ?? null,
      parametros: d.parametros,
      estado: "PENDIENTE",
    }))
  );
  if (errDest) return { error: errDest.message };

  revalidatePath("/comunicaciones");
  return { success: true, data: campana };
}

/**
 * Procesa un lote de destinatarios PENDIENTES (máx 50 por invocación, como
 * procesarLoteCampana.php) — la UI lo invoca repetidamente hasta completar.
 * Sin credenciales de WhatsApp configuradas simula el envío (modo staging).
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
    .limit(50);

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
  for (const dest of pendientes) {
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
  return { success: true, procesados: pendientes.length, restantes: restantes ?? 0, simulado: !whatsappConfigurado() };
}
