"use server";

import { createClient } from "@/lib/supabase/server";
import { palabrasBusqueda } from "@/lib/formatos-ti/comun";
import { errorSiNoEsTi } from "@/lib/formatos-ti/servidor";

export interface EquipoInventario {
  id: number;
  placa_equipo: string;
  equipo: string;
  marca: string | null;
  modelo: string | null;
  serie: string | null;
  ubicacion_interna: string | null;
  ciudad: string | null;
  area: string | null;
}

/**
 * "Buscar equipo en Inventario" de los formatos TI (buscarEquipoInventarioAjax.php de SISRES): por placa,
 * serie o nombre, para prellenar Nombre/Marca/Modelo/Serie/Sede sin volver a digitarlos. Mínimo 2 letras, 10 resultados.
 */
export async function buscarEquipoInventario(q: string): Promise<EquipoInventario[]> {
  if (await errorSiNoEsTi()) return [];
  const palabras = palabrasBusqueda(q ?? "");
  if (palabras.join(" ").length < 2) return [];

  const supabase = createClient();
  let query = supabase
    .from("biomedical_equipment")
    .select("id, placa_equipo, equipo, marca, modelo, serie, ubicacion_interna, ciudad, area")
    .eq("activo", true);
  for (const palabra of palabras) {
    query = query.or(["placa_equipo", "serie", "equipo", "marca", "modelo"].map((c) => `${c}.ilike.%${palabra}%`).join(","));
  }
  const { data } = await query.order("placa_equipo").limit(10);
  return (data ?? []) as EquipoInventario[];
}
