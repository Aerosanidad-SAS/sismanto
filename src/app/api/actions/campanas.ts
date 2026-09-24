"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/app/api/actions/auth";
import type { WaCampaignFormData } from "@/lib/validations";
import { waCampaignSchema } from "@/lib/validations";
import { sanitizarTelefono, enviarPlantilla, whatsappConfigurado } from "@/lib/notifications/whatsapp";
import { z } from "zod";
import { procesarLote, cambiarEstadoCampana } from "@/lib/campanas-lote";
import type { AccionCampana } from "@/lib/campanas-estado";

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
 * Procesa un lote de destinatarios PENDIENTES (LOTE_CAMPANA por invocación, con pausa entre envíos, como
 * procesarLoteCampana.php) — la UI lo invoca repetidamente hasta completar o hasta que la campaña se pause/cancele.
 * Sin credenciales de WhatsApp configuradas simula el envío sin pausas (modo staging).
 * La lógica (reclamo atómico por destinatario, corte al pausar, contadores recalculados) está en `campanas-lote.ts`.
 */
export async function procesarLoteCampana(campaignId: number) {
  const profile = await getProfile();
  if (!profile || !ROLES_CAMPANAS.includes(profile.role_codigo)) return { error: "Sin permisos" };

  const idParsed = z.number().int().positive().safeParse(campaignId);
  if (!idParsed.success) return { error: "ID inválido" };

  const res = await procesarLote(createClient(), idParsed.data, {
    enviar: enviarPlantilla,
    esperar,
    ahora: () => new Date(),
    envioReal: whatsappConfigurado(),
    pausaEntreEnviosMs: PAUSA_ENTRE_ENVIOS_MS,
    tamanoLote: LOTE_CAMPANA,
  });
  revalidatePath("/comunicaciones");
  return res;
}

async function cambiarEstado(campaignId: number, accion: AccionCampana) {
  const profile = await getProfile();
  if (!profile || !ROLES_CAMPANAS.includes(profile.role_codigo)) return { error: "Sin permisos" };
  const idParsed = z.number().int().positive().safeParse(campaignId);
  if (!idParsed.success) return { error: "ID inválido" };

  const res = await cambiarEstadoCampana(createClient(), idParsed.data, accion);
  if ("success" in res) revalidatePath("/comunicaciones");
  return res;
}

/** Detiene el envío de una campaña EN_PROCESO; lo ya enviado queda enviado y el resto PENDIENTE. */
export async function pausarCampana(campaignId: number) {
  return cambiarEstado(campaignId, "pausar");
}

/** Retoma una campaña PAUSADA (el panel vuelve a llamar los lotes). */
export async function reanudarCampana(campaignId: number) {
  return cambiarEstado(campaignId, "reanudar");
}

/** Cancela definitivamente: los destinatarios que no se alcanzaron a enviar quedan PENDIENTE y ya no se envían. */
export async function cancelarCampana(campaignId: number) {
  return cambiarEstado(campaignId, "cancelar");
}
