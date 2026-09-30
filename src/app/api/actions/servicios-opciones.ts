"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import {
  CAMPOS_OPCIONES_SERVICIO,
  MAX_LARGO_OPCION,
  MAX_OPCIONES,
  combinarOpciones,
  esCampoOpcionesServicio,
  limpiarOpciones,
  opcionesDeFabrica,
  type OpcionesServicio,
} from "@/lib/servicios-opciones";

// Opciones administrables de 7 selects del formulario de servicios. Esquema y RLS: migración 091.

/** Opciones vigentes de los 7 campos. Si la tabla aún no existe o falla la lectura, las de fábrica. */
export async function getOpcionesServicio(): Promise<OpcionesServicio> {
  const profile = await getProfile();
  if (!profile) return opcionesDeFabrica();
  const { data, error } = await createClient().from("servicio_opciones_campo").select("campo, opciones");
  if (error) return opcionesDeFabrica();
  return combinarOpciones((data ?? []) as unknown as { campo: string; opciones: unknown }[]);
}

const listaSchema = z.array(z.string().max(MAX_LARGO_OPCION, `Cada opción puede tener hasta ${MAX_LARGO_OPCION} caracteres`)).max(MAX_OPCIONES);

/** Reemplaza la lista completa de opciones de un campo. Solo ADMIN. Una lista vacía no se permite. */
export async function guardarOpcionesServicio(campo: string, opciones: string[]) {
  const profile = await getProfile();
  if (!profile || profile.role_codigo !== "ADMIN") return { error: "Solo un Administrador puede configurar estas opciones" };
  if (!esCampoOpcionesServicio(campo)) return { error: "Campo no configurable" };
  const parsed = listaSchema.safeParse(opciones);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const lista = limpiarOpciones(parsed.data);
  if (lista.length === 0) return { error: "Deja al menos una opción" };

  const { error } = await createClient()
    .from("servicio_opciones_campo")
    .upsert({ campo, opciones: lista, updated_at: new Date().toISOString(), updated_by: profile.user_id } as never, {
      onConflict: "campo",
    });
  if (error) return { error: error.message };

  const etiqueta = CAMPOS_OPCIONES_SERVICIO.find((c) => c.campo === campo)?.etiqueta ?? campo;
  await auditar("MODIFICAR", "configuracion", campo, `Opciones de servicio «${etiqueta}»: ${lista.length}`);
  revalidatePath("/servicios");
  revalidatePath("/servicios/configuracion");
  return { success: true as const, opciones: lista };
}

/** Vuelve un campo a sus opciones de fábrica (borra la lista del administrador). Solo ADMIN. */
export async function restaurarOpcionesServicio(campo: string) {
  const profile = await getProfile();
  if (!profile || profile.role_codigo !== "ADMIN") return { error: "Solo un Administrador puede configurar estas opciones" };
  if (!esCampoOpcionesServicio(campo)) return { error: "Campo no configurable" };
  const { error } = await createClient().from("servicio_opciones_campo").delete().eq("campo", campo);
  if (error) return { error: error.message };
  await auditar("MODIFICAR", "configuracion", campo, "Opciones de servicio restauradas a las de fábrica");
  revalidatePath("/servicios");
  revalidatePath("/servicios/configuracion");
  return { success: true as const, opciones: opcionesDeFabrica()[campo] };
}
