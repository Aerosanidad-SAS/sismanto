"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { AREAS_INVENTARIO, MAX_CORREOS_AREA, esAreaInventario, leerCorreos, type AreaInventario } from "@/lib/inventario-notificaciones";

// Destinatarios de los avisos de vencimiento del inventario por área. Esquema y RLS: migración 100 (solo ADMIN).

/** Correos configurados por área (vacío = comportamiento por defecto de esa área). */
export async function getNotificacionesInventario(): Promise<Record<AreaInventario, string[]> | { error: string }> {
  const profile = await getProfile();
  if (!profile || profile.role_codigo !== "ADMIN") return { error: "Solo un Administrador puede ver esta configuración" };
  const { data, error } = await createClient().from("inventario_notificaciones_config").select("area, correos");
  if (error) return { error: "La configuración todavía no está disponible (falta aplicar la migración 100)" };
  const r = Object.fromEntries(AREAS_INVENTARIO.map(({ area }) => [area, [] as string[]])) as Record<AreaInventario, string[]>;
  for (const f of (data ?? []) as unknown as { area: string; correos: string[] | null }[]) {
    if (esAreaInventario(f.area)) r[f.area] = f.correos ?? [];
  }
  return r;
}

/** Guarda la lista de correos de un área (uno por línea). Lista vacía = volver al comportamiento por defecto. */
export async function guardarNotificacionesInventario(area: string, texto: string) {
  const profile = await getProfile();
  if (!profile || profile.role_codigo !== "ADMIN") return { error: "Solo un Administrador puede cambiar esta configuración" };
  if (!esAreaInventario(area)) return { error: "Área inválida" };
  const t = z.string().max(5000).safeParse(texto);
  if (!t.success) return { error: "Lista demasiado larga" };
  const { validos, invalidos } = leerCorreos(t.data);
  if (invalidos.length > 0) return { error: `No son correos válidos: ${invalidos.slice(0, 3).join(", ")}` };
  if (validos.length > MAX_CORREOS_AREA) return { error: `Máximo ${MAX_CORREOS_AREA} correos por área` };

  const { error } = await createClient()
    .from("inventario_notificaciones_config")
    .upsert({ area, correos: validos, updated_at: new Date().toISOString(), updated_by: profile.user_id } as never, {
      onConflict: "area",
    });
  if (error) return { error: error.message };
  await auditar("MODIFICAR", "configuracion", area, `Avisos de vencimiento del inventario (${area}): ${validos.length} correos`);
  revalidatePath("/equipos/notificaciones");
  return { success: true as const, correos: validos };
}
