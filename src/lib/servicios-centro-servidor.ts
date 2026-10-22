import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { ciudadDeCentro, condicionServiciosDeCentro } from "@/lib/servicios-centro";

const CRA = ["CRA_BOGOTA", "CRA_MEDELLIN"];

/**
 * `condicionServiciosDeCentro` ya con las placas de los móviles de la otra CRA. Las placas se leen con la clave de servicio
 * (solo salen placas). Si la lectura falla, falla cerrado: solo los servicios con el centro del usuario, no los históricos.
 */
export const condicionServiciosVisibles = cache(async (id: number, codigo: string): Promise<string> => {
  if (!ciudadDeCentro(codigo)) return condicionServiciosDeCentro({ id, codigo });
  const { data, error } = await (createAdminClient() as any)
    .from("vehicles")
    .select("placa")
    .in("centro_operativo", CRA)
    .neq("centro_operativo", codigo);
  if (error) {
    console.error("[servicios] no se pudieron leer los móviles de la otra CRA:", error.code, error.message);
    return `operational_center_id.eq.${id}`;
  }
  return condicionServiciosDeCentro({ id, codigo }, ((data ?? []) as { placa: string }[]).map((v) => v.placa));
});
