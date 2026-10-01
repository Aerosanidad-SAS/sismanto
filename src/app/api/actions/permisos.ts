"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { ROLES_CONFIGURABLES, rolPuedeOcultar } from "@/lib/permisos";

// Módulos del menú ocultos por rol (Administración → Permisos). Esquema y RLS: migración 107.

type Fila = { role_codigo: string; href: string };

/** Módulos ocultos para el rol de quien pregunta. ADMIN nunca tiene; si la tabla no existe o falla, ninguno. */
export async function getMisModulosOcultos(): Promise<string[]> {
  const profile = await getProfile();
  if (!profile || profile.role_codigo === "ADMIN") return [];
  const { data, error } = await createClient()
    .from("rol_modulo_oculto")
    .select("href")
    .eq("role_codigo", profile.role_codigo);
  if (error) return [];
  return ((data ?? []) as unknown as Pick<Fila, "href">[]).map((f) => f.href);
}

/** Módulos ocultos de todos los roles configurables. Solo ADMIN. */
export async function getModulosOcultosPorRol(): Promise<Record<string, string[]>> {
  const profile = await getProfile();
  const vacio = Object.fromEntries(ROLES_CONFIGURABLES.map((r) => [r, [] as string[]]));
  if (!profile || profile.role_codigo !== "ADMIN") return vacio;
  const { data, error } = await createClient().from("rol_modulo_oculto").select("role_codigo, href");
  if (error) return vacio;
  for (const f of (data ?? []) as unknown as Fila[]) {
    if (vacio[f.role_codigo]) vacio[f.role_codigo].push(f.href);
  }
  return vacio;
}

const guardarSchema = z.object({
  rol: z.string().refine((r) => (ROLES_CONFIGURABLES as readonly string[]).includes(r), "Rol no configurable"),
  ocultos: z.array(z.string().max(120)).max(100),
});

/** Reemplaza la lista de módulos ocultos de un rol. Solo ADMIN. Lista vacía = el rol ve todo lo que el código le da. */
export async function guardarModulosOcultos(rol: string, ocultos: string[]) {
  const profile = await getProfile();
  if (!profile || profile.role_codigo !== "ADMIN") return { error: "Solo un Administrador puede cambiar los permisos" };
  const parsed = guardarSchema.safeParse({ rol, ocultos });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const lista = Array.from(new Set(parsed.data.ocultos));
  const invalido = lista.find((href) => !rolPuedeOcultar(parsed.data.rol, href));
  if (invalido) return { error: `El módulo ${invalido} no aplica a este rol` };

  const supabase = createClient();
  // Primero se agregan los nuevos y después se quitan los que ya no van: si falla a mitad, queda oculto de más (lo
  // conservador), nunca visible de más.
  if (lista.length > 0) {
    const ahora = new Date().toISOString();
    const { error } = await supabase.from("rol_modulo_oculto").upsert(
      lista.map((href) => ({ role_codigo: parsed.data.rol, href, updated_at: ahora, updated_by: profile.user_id })) as never,
      { onConflict: "role_codigo,href" }
    );
    if (error) return { error: error.message };
  }
  let borrar = supabase.from("rol_modulo_oculto").delete().eq("role_codigo", parsed.data.rol);
  if (lista.length > 0) borrar = borrar.not("href", "in", `(${lista.map((h) => `"${h}"`).join(",")})`);
  const { error } = await borrar;
  if (error) return { error: error.message };

  await auditar(
    "MODIFICAR",
    "configuracion",
    `permisos:${parsed.data.rol}`,
    lista.length > 0 ? `Módulos ocultos para ${parsed.data.rol}: ${lista.join(", ")}` : `${parsed.data.rol} ve todos sus módulos`
  );
  revalidatePath("/admin/permisos");
  return { success: true as const, ocultos: lista };
}
