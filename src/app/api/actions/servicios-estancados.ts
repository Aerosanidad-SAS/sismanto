"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { UMBRAL_ESTANCADO_HORAS, type UmbralesEstancado } from "@/lib/servicios-lista";

// Umbral configurable de servicios estancados (migración 103, columnas de company_settings).

export interface ConfigEstancado {
  activo: boolean;
  horasProgramado: number;
  horasCurso: number;
}

const POR_DEFECTO: ConfigEstancado = {
  activo: true,
  horasProgramado: UMBRAL_ESTANCADO_HORAS.PROGRAMADO,
  horasCurso: UMBRAL_ESTANCADO_HORAS.CURSO,
};

/** Configuración vigente. Si las columnas aún no existen o no hay sesión, los valores por defecto del código. */
export async function getConfigEstancado(): Promise<ConfigEstancado> {
  const profile = await getProfile();
  if (!profile) return POR_DEFECTO;
  const { data, error } = await createClient()
    .from("company_settings")
    .select("estancado_activo, estancado_horas_programado, estancado_horas_curso")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return POR_DEFECTO;
  const d = data as unknown as { estancado_activo: boolean; estancado_horas_programado: number; estancado_horas_curso: number };
  return { activo: d.estancado_activo, horasProgramado: d.estancado_horas_programado, horasCurso: d.estancado_horas_curso };
}

/** Configuración y si quien la ve puede cambiarla (para la tarjeta de Configuración → Servicios). */
export async function getConfigEstancadoEditable(): Promise<ConfigEstancado & { puedeEditar: boolean }> {
  const [config, profile] = await Promise.all([getConfigEstancado(), getProfile()]);
  return { ...config, puedeEditar: profile?.role_codigo === "ADMIN" };
}

/** Los umbrales como los usa horasEstancado(): null si el aviso está desactivado. */
export async function getUmbralesEstancado(): Promise<UmbralesEstancado> {
  const c = await getConfigEstancado();
  return c.activo ? { PROGRAMADO: c.horasProgramado, CURSO: c.horasCurso } : null;
}

const schema = z.object({
  activo: z.boolean(),
  horasProgramado: z.number().int().min(1, "Mínimo 1 hora").max(720, "Máximo 720 horas (30 días)"),
  horasCurso: z.number().int().min(1, "Mínimo 1 hora").max(720, "Máximo 720 horas (30 días)"),
});

/** Guarda la configuración. Solo ADMIN (la RLS de company_settings lo exige igual). */
export async function guardarConfigEstancado(datos: ConfigEstancado) {
  const profile = await getProfile();
  if (!profile || profile.role_codigo !== "ADMIN") return { error: "Solo un Administrador puede cambiar esta configuración" };
  const parsed = schema.safeParse(datos);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const { data, error } = await createClient()
    .from("company_settings")
    .update({
      estancado_activo: parsed.data.activo,
      estancado_horas_programado: parsed.data.horasProgramado,
      estancado_horas_curso: parsed.data.horasCurso,
      updated_at: new Date().toISOString(),
      updated_by: profile.user_id,
    } as never)
    .eq("id", 1)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "No se pudo guardar la configuración" };
  await auditar(
    "MODIFICAR",
    "configuracion",
    "estancados",
    parsed.data.activo
      ? `Alerta de estancados: PROGRAMADO ${parsed.data.horasProgramado} h, CURSO ${parsed.data.horasCurso} h`
      : "Alerta de estancados desactivada"
  );
  revalidatePath("/servicios");
  return { success: true as const };
}
