import type { SupabaseClient } from "@supabase/supabase-js";
import { centroVisible } from "@/lib/auth-utils";

type PerfilConCentro = Parameters<typeof centroVisible>[0];

/**
 * Los roles limitados a su centro (Regulación, Coordinación) solo pueden operar vehículos de ese centro.
 * La RLS de `vehicles` no filtra por centro, así que la comprobación vive aquí, en cada acción de escritura.
 *
 * Devuelve el mensaje de error, o null si el usuario puede operar ese vehículo (incluye a quien ve todos los centros).
 */
export async function errorSiVehiculoDeOtroCentro(
  supabase: SupabaseClient,
  profile: PerfilConCentro,
  vehicleId: string
): Promise<string | null> {
  const centro = centroVisible(profile);
  if (!centro) return null;

  const { data } = await supabase.from("vehicles").select("centro_operativo").eq("id", vehicleId).maybeSingle();
  if (!data) return "Vehículo no encontrado";
  if (data.centro_operativo !== centro.codigo) return "Ese vehículo pertenece a otro centro operativo.";
  return null;
}
