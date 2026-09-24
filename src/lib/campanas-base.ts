/**
 * Lee de la base los destinatarios de una campaña (pacientes o clientes activos, con filtro de ciudad opcional).
 * Recibe el cliente por parámetro para probarlo con una base de mentira; la RLS del usuario que llama sigue mandando
 * (solo ADMIN y COORDINACION —los roles de campañas— ven pacientes y clientes).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  FUENTES_BASE,
  MAX_DESTINATARIOS,
  MAX_REGISTROS_BASE,
  filaADestinatario,
  normalizarDestinatarios,
  textoCiudad,
  validarMapeoBase,
  type DestinatarioNormalizado,
  type FuenteBase,
  type Omitidos,
} from "@/lib/campanas-destinatarios";

export interface EntradaBase {
  fuente: FuenteBase;
  ciudad: string;
  mapeo: string[];
}

export type ResultadoBase =
  | { error: string }
  | { destinatarios: DestinatarioNormalizado[]; omitidos: Omitidos; registros: number };

const POR_PAGINA = 1000;

export async function leerDestinatariosDeBase(db: SupabaseClient<Database>, entrada: EntradaBase): Promise<ResultadoBase> {
  const cfg = FUENTES_BASE[entrada.fuente];
  const mapeo = validarMapeoBase(entrada.fuente, entrada.mapeo);
  if (!mapeo.ok) return { error: mapeo.error };

  // Teléfono, nombre y las variables: solo columnas de la lista blanca (nunca texto del cliente dentro del SELECT).
  const columnas = Array.from(new Set([cfg.columnaTelefono, ...Object.keys(cfg.columnas), ...mapeo.columnas]));
  const ciudad = textoCiudad(entrada.ciudad);

  const filas: Record<string, unknown>[] = [];
  for (let desde = 0; desde < MAX_REGISTROS_BASE + POR_PAGINA; desde += POR_PAGINA) {
    let q = db.from(cfg.tabla).select(columnas.join(", ")).eq("activo", true);
    if (ciudad) q = q.ilike(cfg.columnaCiudad, `%${ciudad}%`);
    const { data, error } = await q.order("id").range(desde, desde + POR_PAGINA - 1);
    if (error) return { error: error.message };
    const pagina = (data ?? []) as unknown as Record<string, unknown>[];
    filas.push(...pagina);
    if (filas.length > MAX_REGISTROS_BASE) return { error: `Hay más de ${MAX_REGISTROS_BASE} registros con ese criterio. Filtra por ciudad para reducirlos.` };
    if (pagina.length < POR_PAGINA) break;
  }

  const { destinatarios, omitidos } = normalizarDestinatarios(filas.map((f) => filaADestinatario(entrada.fuente, f, mapeo.columnas)));
  if (destinatarios.length === 0) return { error: "No se encontraron destinatarios con teléfono válido para ese criterio." };
  if (destinatarios.length > MAX_DESTINATARIOS) {
    return { error: `Son ${destinatarios.length} destinatarios y el máximo por campaña es ${MAX_DESTINATARIOS}. Filtra por ciudad para reducirlos.` };
  }
  return { destinatarios, omitidos, registros: filas.length };
}
