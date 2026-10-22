"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { centroVisible } from "@/lib/auth-utils";
import { hoyBogota } from "@/lib/fechas";
import { inicioVentanaAbiertos } from "@/lib/servicios-abiertos";
import { condicionServiciosVisibles } from "@/lib/servicios-centro-servidor";

/** Quiénes reciben el aviso de fin de día: los que pueden cerrar servicios. */
const ROLES_AVISO_FIN_DE_DIA = ["ADMIN", "REGULACION", "ANALISTA", "COORDINACION"];

/**
 * Servicios que siguen abiertos (PROGRAMADO o CURSO) de hoy y de los últimos días, los mismos que muestra la sala de
 * control (ver `servicios-abiertos.ts`: lo más viejo se revisa aparte). Para el aviso de fin de día. Cuenta, no lista,
 * y respeta el centro de quien consulta (la misma regla que la lista de servicios: `servicios-centro.ts`). No usa `requireRole`: se llama sola desde las pantallas y un rol sin aviso no debe terminar redirigido.
 */
export async function getResumenAbiertosFinDeDia(): Promise<
  { aplica: false } | { aplica: true; programado: number; curso: number; enlace: string }
> {
  const profile = await getProfile();
  if (!profile || !ROLES_AVISO_FIN_DE_DIA.includes(profile.role_codigo)) return { aplica: false };

  const supabase = createClient();
  const centro = centroVisible(profile);
  const condicionCentro = centro ? await condicionServiciosVisibles(centro.id, centro.codigo) : null;
  const desde = `${inicioVentanaAbiertos(hoyBogota())}T00:00:00-05:00`;
  const ahora = new Date().toISOString();
  const contar = async (etapa: "PROGRAMADO" | "CURSO") => {
    let query = supabase
      .from("medical_services")
      .select("id", { count: "exact", head: true })
      .eq("etapa", etapa)
      .gte("fecha_hora_programacion", desde)
      .lte("fecha_hora_programacion", ahora);
    if (condicionCentro) query = query.or(condicionCentro);
    const { count, error } = await query;
    if (error) throw new Error(error.message);
    return count ?? 0;
  };
  const [programado, curso] = await Promise.all([contar("PROGRAMADO"), contar("CURSO")]);
  return { aplica: true, programado, curso, enlace: profile.role_codigo === "COORDINACION" ? "/servicios" : "/regulacion" };
}
