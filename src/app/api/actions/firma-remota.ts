"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { auditar } from "@/lib/auditoria";
import { contextoFirma, procesarFirmaRemota, type ContextoFirma } from "@/lib/formatos-ti/firma-remota-servicio";
import { permitirIntento } from "@/lib/rate-limit-memoria";

/**
 * Acciones PÚBLICAS de la firma remota (no piden sesión: el enlace del correo es la credencial). Usan el cliente
 * de servicio porque quien firma no tiene cuenta. La lógica vive en `firma-remota-servicio.ts` (probada aparte).
 *
 * Límite por IP (ver rate-limit-memoria.ts): el token de 256 bits ya hace inviable adivinarlo; esto solo frena un
 * script golpeando el endpoint sin necesidad. 30 intentos / 5 minutos alcanza de sobra para alguien firmando a mano,
 * incluso con reintentos.
 */
const MAXIMO_INTENTOS = 30;
const VENTANA_MS = 5 * 60_000;

async function ipDeLaPeticion(): Promise<string> {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "sin-ip";
}

export async function contextoFirmaRemota(token: string): Promise<ContextoFirma> {
  if (!permitirIntento(`contexto:${await ipDeLaPeticion()}`, MAXIMO_INTENTOS, VENTANA_MS)) return { estado: "invalido" };
  return contextoFirma(createAdminClient(), token);
}

export async function firmarRemoto(token: string, dataUri: string): Promise<{ success: true } | { error: string }> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  if (!permitirIntento(`firmar:${ip ?? "sin-ip"}`, MAXIMO_INTENTOS, VENTANA_MS)) {
    return { error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." };
  }
  const res = await procesarFirmaRemota(createAdminClient(), token, dataUri, ip);
  if ("success" in res) {
    // Quien firma no tiene cuenta: el actor es el propio enlace del correo. userId nulo a propósito.
    await auditar("MODIFICAR", "formatos_ti", res.registroId, "Firma remota registrada por el funcionario (enlace por correo)", { userId: null, label: "firma remota (enlace por correo)", role: "" });
    revalidatePath("/formatos-ti/acta-entrega");
  }
  // Al firmante (público) solo se le confirma el resultado: el id del registro es interno.
  return "success" in res ? { success: true } : res;
}
