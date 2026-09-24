"use server";

import { createClient } from "@/lib/supabase/server";
import {
  AEROPUERTOS_MIN_CARACTERES,
  AEROPUERTOS_POR_PAGINA,
  AEROPUERTOS_TYPEAHEAD,
  COLUMNAS_BUSQUEDA_AEROPUERTOS,
  palabrasBusquedaAeropuertos,
  type AeropuertoLista,
} from "@/lib/aeropuertos";

const COLUMNAS = "id, ident, tipo, nombre, municipio, pais, region, iata_code, icao_code, servicio_regular";

/**
 * Buscador incremental (buscarAeropuertoAjax.php de SISRES): mínimo 2 letras, 20 resultados, los de servicio
 * regular primero. Cada palabra debe aparecer en alguna columna (varios `.or()` encadenados = AND).
 */
export async function buscarAeropuertosTypeahead(q: string): Promise<AeropuertoLista[]> {
  const palabras = palabrasBusquedaAeropuertos(q ?? "");
  if (palabras.join(" ").length < AEROPUERTOS_MIN_CARACTERES) return [];
  const supabase = createClient();
  let query = supabase.from("airports").select(COLUMNAS);
  for (const palabra of palabras) {
    query = query.or(COLUMNAS_BUSQUEDA_AEROPUERTOS.map((c) => `${c}.ilike.%${palabra}%`).join(","));
  }
  const { data } = await query
    .order("servicio_regular", { ascending: false })
    .order("nombre", { ascending: true })
    .limit(AEROPUERTOS_TYPEAHEAD);
  return (data ?? []) as AeropuertoLista[];
}

/** Una página del catálogo (mostrarAeropuertos.php): búsqueda en el servidor y filtro por país (código ISO). */
export async function listarAeropuertos(q: string, pais: string, pagina: number) {
  const supabase = createClient();
  const desde = (Math.max(1, pagina) - 1) * AEROPUERTOS_POR_PAGINA;
  let query = supabase
    .from("airports")
    .select(COLUMNAS, { count: "exact" })
    .order("nombre", { ascending: true })
    .order("id", { ascending: true })
    .range(desde, desde + AEROPUERTOS_POR_PAGINA - 1);
  if (pais) query = query.eq("pais", pais);
  for (const palabra of palabrasBusquedaAeropuertos(q)) {
    query = query.or(COLUMNAS_BUSQUEDA_AEROPUERTOS.map((c) => `${c}.ilike.%${palabra}%`).join(","));
  }
  const { data, count, error } = await query;
  if (error) return { aeropuertos: [] as AeropuertoLista[], total: 0, error: error.message as string };
  return { aeropuertos: (data ?? []) as AeropuertoLista[], total: count ?? 0 };
}
