/**
 * Motor de firmas compartido por los 4 Formatos TI: estado de integridad para el listado, guardado de las
 * firmas dibujadas (crear/editar) y armado de las firmas para el PDF. Cada formato solo declara sus
 * `lados` (qué columnas guarda cada firma y qué campos clave cubre) y las funciones que arman esos campos clave.
 * Server-only (usa node:crypto y Storage).
 */
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { EstadoFirma, FirmaPdf } from "./comun";
import { calcularHashRegistro, integridadOk } from "./firma";
import { descargarFirma, guardarFirma } from "./storage-firmas";

/** Un lado de firma de un formato: clave corta, columnas de ruta y hash, y qué juego de campos clave lo cubre. */
export interface LadoDef {
  lado: string;
  ruta: string;
  hash: string;
  /** Nombre del juego de campos clave en el mapa `claves` (p. ej. "entrega" o "devolucion"). */
  clave: string;
}

/** Cualquier fila de formato: se lee por nombre de columna (las interfaces no tienen firma de índice). */
type Fila = { created_at: string; firmas_png?: Record<string, string> | null };
type Claves = Record<string, Record<string, unknown>>;

const texto = (v: unknown): string => (typeof v === "string" ? v : "");
const col = (fila: Fila, nombre: string): string => texto((fila as unknown as Record<string, unknown>)[nombre]);

/** Estado de integridad de cada firma con lo guardado (sin descargar los PNG): para las insignias del listado. */
export function estadoFirmas(fila: Fila, lados: readonly LadoDef[], claves: Claves): Record<string, EstadoFirma> {
  const out: Record<string, EstadoFirma> = {};
  for (const l of lados) {
    if (!col(fila, l.ruta)) out[l.lado] = "sin_firma";
    else out[l.lado] = integridadOk(claves[l.clave], fila.firmas_png?.[l.lado], fila.created_at, col(fila, l.hash)) ? "ok" : "modificada";
  }
  return out;
}

export interface FirmasResueltas {
  /** Columnas de ruta y hash a escribir. */
  cambios: Record<string, string>;
  /** `firmas_png` completo (los hashes de imagen anteriores más los nuevos). */
  png: Record<string, string>;
  /** Rutas de las firmas reemplazadas, para borrarlas de Storage cuando el UPDATE haya salido bien. */
  viejas: string[];
  avisos: string[];
}

/**
 * Sube las firmas dibujadas que llegaron del formulario (data URI por lado) y calcula sus hashes con los campos
 * clave ACTUALES del registro. Los lados sin firma nueva no se tocan: conservan ruta/hash, así que si sus campos
 * cambiaron quedan "modificados" (la huella ya no coincide) hasta que se vuelva a firmar.
 */
export async function resolverFirmas(
  supabase: SupabaseClient<Database>,
  formato: string,
  id: number,
  fila: Fila,
  firmas: Record<string, string | null | undefined>,
  lados: readonly LadoDef[],
  claves: Claves,
  omitir: (l: LadoDef) => boolean = () => false
): Promise<FirmasResueltas> {
  const cambios: Record<string, string> = {};
  const png: Record<string, string> = { ...(fila.firmas_png ?? {}) };
  const viejas: string[] = [];
  const avisos: string[] = [];
  for (const l of lados) {
    if (omitir(l)) continue;
    const dataUri = firmas[l.lado];
    if (!dataUri) continue;
    try {
      const g = await guardarFirma(supabase, formato, id, l.lado, dataUri, claves[l.clave], fila.created_at);
      if (!g) continue;
      const anterior = col(fila, l.ruta);
      if (anterior) viejas.push(anterior);
      cambios[l.ruta] = g.ruta;
      cambios[l.hash] = g.hash;
      png[l.lado] = g.hashPng;
    } catch (e) {
      avisos.push(e instanceof Error ? e.message : "No se pudo guardar una firma");
    }
  }
  return { cambios, png, viejas, avisos };
}

/**
 * Firmas listas para el PDF: descarga cada PNG, recalcula su hash y lo compara con el guardado (imagen y
 * campos clave). Una firma cuyos datos cambiaron después de firmar sale marcada como modificada.
 */
export async function firmasParaPdf(
  supabase: SupabaseClient<Database>,
  fila: Fila,
  lados: readonly LadoDef[],
  claves: Claves
): Promise<Record<string, FirmaPdf>> {
  const out: Record<string, FirmaPdf> = {};
  for (const l of lados) {
    const ruta = col(fila, l.ruta);
    if (!ruta) continue;
    const bytes = await descargarFirma(supabase, ruta);
    if (!bytes) {
      out[l.lado] = { imagen: null, modificada: false, faltante: true };
      continue;
    }
    const hashPng = createHash("sha256").update(bytes).digest("hex");
    const coincideImagen = !fila.firmas_png?.[l.lado] || fila.firmas_png[l.lado] === hashPng;
    const coincideRegistro = calcularHashRegistro(claves[l.clave], hashPng, fila.created_at) === col(fila, l.hash);
    out[l.lado] = { imagen: bytes, modificada: !(coincideImagen && coincideRegistro), faltante: false };
  }
  return out;
}
