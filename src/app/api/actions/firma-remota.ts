"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { auditar } from "@/lib/auditoria";
import { contextoFirma, procesarFirmaRemota, type ContextoFirma } from "@/lib/formatos-ti/firma-remota-servicio";

/**
 * Acciones PÚBLICAS de la firma remota (no piden sesión: el enlace del correo es la credencial). Usan el cliente
 * de servicio porque quien firma no tiene cuenta. La lógica vive en `firma-remota-servicio.ts` (probada aparte).
 */
export async function contextoFirmaRemota(token: string): Promise<ContextoFirma> {
  return contextoFirma(createAdminClient(), token);
}

export async function firmarRemoto(token: string, dataUri: string): Promise<{ success: true } | { error: string }> {
  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const res = await procesarFirmaRemota(createAdminClient(), token, dataUri, ip);
  if ("success" in res) {
    // Quien firma no tiene cuenta: el actor es el propio enlace del correo. userId nulo a propósito.
    await auditar("MODIFICAR", "formatos_ti", res.registroId, "Firma remota registrada por el funcionario (enlace por correo)", { userId: null, label: "firma remota (enlace por correo)", role: "" });
    revalidatePath("/formatos-ti/acta-entrega");
  }
  return res;
}
