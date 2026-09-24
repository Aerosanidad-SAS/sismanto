"use server";

import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/app/api/actions/auth";
import type { WaCampaignFormData } from "@/lib/validations";
import { waCampaignSchema } from "@/lib/validations";
import { sanitizarTelefono, enviarPlantilla, whatsappConfigurado, subirMediaMeta } from "@/lib/notifications/whatsapp";
import { z } from "zod";
import { procesarLote, cambiarEstadoCampana } from "@/lib/campanas-lote";
import type { AccionCampana } from "@/lib/campanas-estado";
import { adjuntarMedia, quitarMedia, resolverMediaEnvio, type AlmacenMedia } from "@/lib/campanas-media-servicio";
import { filasDetalle, filasHistorial } from "@/lib/campanas-exportar";
import { leerDestinatariosDeBase } from "@/lib/campanas-base";
import { mascararTelefono, normalizarDestinatarios, resumenOmitidos } from "@/lib/campanas-destinatarios";
import { auditar } from "@/lib/auditoria";

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

  // NOTIFICAR = envío masivo. Se registra quién la creó y cuántos destinatarios; nunca los teléfonos.
  await auditar("NOTIFICAR", "campanas", campana.id, `Campaña creada con ${destinatarios.length} destinatarios`);
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

  const supabase = createClient();
  const res = await procesarLote(supabase, idParsed.data, {
    enviar: enviarPlantilla,
    media: (campana) => resolverMediaEnvio(supabase, almacenMedia(supabase), campana, subirMediaMeta),
    esperar,
    ahora: () => new Date(),
    envioReal: whatsappConfigurado(),
    pausaEntreEnviosMs: PAUSA_ENTRE_ENVIOS_MS,
    tamanoLote: LOTE_CAMPANA,
  });
  // Un registro por campaña al terminar (no uno por lote de 5 mensajes: inundaría la bitácora).
  if ("success" in res && res.estado === "COMPLETADA" && res.restantes === 0 && res.procesados > 0) {
    await auditar("NOTIFICAR", "campanas", idParsed.data, "Envío de la campaña completado");
  }
  revalidatePath("/comunicaciones");
  return res;
}

async function cambiarEstado(campaignId: number, accion: AccionCampana) {
  const profile = await getProfile();
  if (!profile || !ROLES_CAMPANAS.includes(profile.role_codigo)) return { error: "Sin permisos" };
  const idParsed = z.number().int().positive().safeParse(campaignId);
  if (!idParsed.success) return { error: "ID inválido" };

  const res = await cambiarEstadoCampana(createClient(), idParsed.data, accion);
  if ("success" in res) {
    await auditar("MODIFICAR", "campanas", idParsed.data, `Campaña ${{ pausar: "pausada", reanudar: "reanudada", cancelar: "cancelada" }[accion]}`);
    revalidatePath("/comunicaciones");
  }
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

function almacenMedia(supabase: ReturnType<typeof createClient>): AlmacenMedia {
  return {
    descargar: async (ruta) => {
      const { data, error } = await supabase.storage.from("campanas-media").download(ruta);
      return error || !data ? null : new Uint8Array(await data.arrayBuffer());
    },
    borrar: async (ruta) => {
      await supabase.storage.from("campanas-media").remove([ruta]);
    },
  };
}

/**
 * El navegador ya subió el archivo a Storage (`<user_id>/<archivo>`); aquí se valida su contenido, se sube a Meta y
 * se guarda en la campaña. Solo en BORRADOR.
 */
export async function adjuntarMediaCampana(campaignId: number, ruta: string) {
  const profile = await getProfile();
  if (!profile || !ROLES_CAMPANAS.includes(profile.role_codigo)) return { error: "Sin permisos" };
  const idParsed = z.number().int().positive().safeParse(campaignId);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const res = await adjuntarMedia(supabase, almacenMedia(supabase), {
    campaignId: idParsed.data,
    ruta,
    userId: profile.user_id,
    subir: subirMediaMeta,
  });
  if ("success" in res) {
    await auditar("MODIFICAR", "campanas", idParsed.data, `Adjunto agregado a la campaña (${res.tipo})`);
    revalidatePath("/comunicaciones");
  }
  return res;
}

export async function quitarMediaCampana(campaignId: number) {
  const profile = await getProfile();
  if (!profile || !ROLES_CAMPANAS.includes(profile.role_codigo)) return { error: "Sin permisos" };
  const idParsed = z.number().int().positive().safeParse(campaignId);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const res = await quitarMedia(supabase, almacenMedia(supabase), idParsed.data);
  if ("success" in res) {
    await auditar("MODIFICAR", "campanas", idParsed.data, "Adjunto quitado de la campaña");
    revalidatePath("/comunicaciones");
  }
  return res;
}

/** Filas para el Excel de una campaña (el archivo se arma en el navegador). Mismo permiso que el resto del módulo. */
export async function exportarDetalleCampana(campaignId: number) {
  const profile = await getProfile();
  if (!profile || !ROLES_CAMPANAS.includes(profile.role_codigo)) return { error: "Sin permisos" };
  const idParsed = z.number().int().positive().safeParse(campaignId);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data: camp } = await supabase.from("wa_campaigns").select("nombre").eq("id", idParsed.data).maybeSingle();
  if (!camp) return { error: "Campaña no encontrada" };
  const { data, error } = await supabase.from("wa_campaign_recipients").select("*").eq("campaign_id", idParsed.data).order("id").limit(20000);
  // Un fallo de la base NO es un Excel vacío ni una exportación que registrar.
  if (error) return { error: error.message };
  // Los destinatarios son teléfonos de personas: queda quién los exportó y cuántos (no el contenido).
  await auditar("EXPORTAR", "campanas", idParsed.data, `Exportación del detalle de la campaña (${(data ?? []).length} destinatarios)`);
  return {
    success: true as const,
    nombre: (camp as unknown as { nombre: string }).nombre,
    filas: filasDetalle((data ?? []) as unknown as Record<string, unknown>[]),
  };
}

export async function exportarHistorialCampanas() {
  const profile = await getProfile();
  if (!profile || !ROLES_CAMPANAS.includes(profile.role_codigo)) return { error: "Sin permisos" };
  const supabase = createClient();
  const { data, error } = await supabase.from("wa_campaigns").select("*").order("created_at", { ascending: false }).limit(5000);
  if (error) return { error: error.message };
  await auditar("EXPORTAR", "campanas", "", `Exportación del historial de campañas (${(data ?? []).length} campañas)`);
  return { success: true as const, filas: filasHistorial((data ?? []) as unknown as Record<string, unknown>[]) };
}
