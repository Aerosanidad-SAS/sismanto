"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { MODULOS_CAMPOS, camposDelModulo, esModuloCampos, filtrarConocidos } from "@/lib/campos-obligatorios";

// Campos obligatorios configurables por módulo. Esquema y RLS: migración 101.

/**
 * Campos marcados como obligatorios en un módulo. Vacío si no hay sesión, el módulo no existe o la tabla aún no está
 * (en ese caso el formulario funciona como antes: ningún opcional es obligatorio).
 */
export async function getCamposObligatoriosModulo(modulo: string): Promise<string[]> {
  if (!esModuloCampos(modulo)) return [];
  const profile = await getProfile();
  if (!profile) return [];
  const { data, error } = await createClient()
    .from("campos_obligatorios")
    .select("campo")
    .eq("modulo", modulo)
    .eq("obligatorio", true);
  if (error) return [];
  return filtrarConocidos(modulo, ((data ?? []) as unknown as { campo: string }[]).map((r) => r.campo));
}

/** Guarda la lista COMPLETA de campos obligatorios de un módulo (los no incluidos quedan opcionales). Solo ADMIN. */
export async function guardarCamposObligatoriosModulo(modulo: string, campos: string[]) {
  const profile = await getProfile();
  if (!profile || profile.role_codigo !== "ADMIN") return { error: "Solo un Administrador puede configurar los campos" };
  if (!esModuloCampos(modulo)) return { error: "Módulo no configurable" };
  const lista = z.array(z.string().max(60)).max(200).safeParse(campos);
  if (!lista.success) return { error: "Datos inválidos" };
  const conocidos = camposDelModulo(modulo);
  const desconocido = lista.data.find((c) => !conocidos.includes(c));
  if (desconocido) return { error: `Campo no configurable: ${desconocido}` };

  const ahora = new Date().toISOString();
  const filas = conocidos.map((campo) => ({
    modulo,
    campo,
    obligatorio: lista.data.includes(campo),
    updated_at: ahora,
    updated_by: profile.user_id,
  }));
  const { error } = await createClient().from("campos_obligatorios").upsert(filas as never, { onConflict: "modulo,campo" });
  if (error) return { error: error.message };
  await auditar("MODIFICAR", "configuracion", modulo, `Campos obligatorios de ${MODULOS_CAMPOS[modulo].etiqueta}: ${lista.data.length} marcados`);
  revalidatePath("/admin/campos-obligatorios");
  revalidatePath(`/${modulo}`);
  return { success: true as const };
}
