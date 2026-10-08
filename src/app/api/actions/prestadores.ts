"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { prestadorSchema, puedeEditarPrestadores, type PrestadorFormData } from "@/lib/prestadores";

// Crear y editar prestadores médicos (medical_providers). La RLS (migraciones 058 y 123) limita INSERT/UPDATE a
// ADMIN, ANALISTA y REGULACION; aquí se revisa también para dar un mensaje claro.

async function editor() {
  const profile = await getProfile();
  return profile && puedeEditarPrestadores(profile.role_codigo) ? profile : null;
}

/** Como SISRES (insertarProveedor.php): no se repite el mismo documento + dígito de verificación. */
async function documentoRepetido(numero: string, dv: string | null, excluirId?: number) {
  let q = createClient().from("medical_providers").select("id").eq("numero", numero);
  q = dv ? q.eq("digito_verificacion", dv) : q.is("digito_verificacion", null);
  if (excluirId) q = q.neq("id", excluirId);
  const { data } = await q.limit(1);
  return (data ?? []).length > 0;
}

export async function crearPrestador(datos: PrestadorFormData) {
  if (!(await editor())) return { error: "Sin permisos para crear prestadores" };
  const parsed = prestadorSchema.safeParse(datos);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  if (await documentoRepetido(parsed.data.numero, parsed.data.digito_verificacion)) {
    return { error: "Ya existe un prestador con ese documento" };
  }
  const { data, error } = await createClient().from("medical_providers").insert(parsed.data as never).select("id").single();
  if (error) return { error: error.message };
  const id = (data as { id: number }).id;
  await auditar("INSERTAR", "proveedores", id, "Prestador creado");
  revalidatePath("/proveedores");
  return { success: true as const, id };
}

export async function actualizarPrestador(id: number, datos: PrestadorFormData) {
  if (!(await editor())) return { error: "Sin permisos para editar prestadores" };
  const idOk = z.number().int().positive().safeParse(id);
  if (!idOk.success) return { error: "Prestador inválido" };
  const parsed = prestadorSchema.safeParse(datos);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  if (await documentoRepetido(parsed.data.numero, parsed.data.digito_verificacion, idOk.data)) {
    return { error: "Ya existe otro prestador con ese documento" };
  }
  const { data, error } = await createClient()
    .from("medical_providers")
    .update({ ...parsed.data, updated_at: new Date().toISOString() } as never)
    .eq("id", idOk.data)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "El prestador no existe o no tienes permiso" };
  await auditar("MODIFICAR", "proveedores", idOk.data, `Prestador actualizado${parsed.data.activo ? "" : " (inactivo)"}`);
  revalidatePath("/proveedores");
  return { success: true as const };
}
