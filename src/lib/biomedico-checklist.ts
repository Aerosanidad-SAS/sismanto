// Listas de chequeo del mantenimiento biomédico (migración 092), portado de SISRES:
// includes/normalizarEquipo.php + includes/mantenimientoChecklistHelper.php + el armado del formulario de
// registroMantenimientoBiomedica.php. Puro (sin base de datos): lo usan las acciones, la configuración y el formulario.

/** Clave de la lista que se usa para los equipos que no tienen una propia. */
export const CHECKLIST_GENERAL = "GENERAL";
export const MAX_ITEMS_CHECKLIST = 60;
export const MAX_LARGO_ITEM = 200;

export type CatalogoChecklists = Record<string, string[]>;

/**
 * Clave de catálogo para el nombre de un equipo: mayúsculas, sin tildes, espacios → «_» y solo A-Z, 0-9 y «_».
 * Debe dar lo mismo que normalizarEquipoPHP() de SISRES para que las listas sembradas desde allá coincidan.
 */
export function normalizarEquipo(nombre: string): string {
  return nombre
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

/** Ítems limpios: sin espacios sobrantes, sin vacíos ni repetidos (sin distinguir mayúsculas), en el mismo orden. */
export function limpiarItems(items: readonly unknown[]): string[] {
  const vistos = new Set<string>();
  const out: string[] = [];
  for (const i of items) {
    const v = String(i ?? "").trim().replace(/\s+/g, " ");
    const clave = v.toLocaleUpperCase("es");
    if (!v || vistos.has(clave)) continue;
    vistos.add(clave);
    out.push(v);
  }
  return out;
}

/** Lista que corresponde a un equipo: la de su tipo si existe; si no, la GENERAL; si tampoco, ninguna. */
export function checklistParaEquipo(
  nombreEquipo: string,
  catalogo: CatalogoChecklists
): { clave: string; items: string[]; esGeneral: boolean } | null {
  const clave = normalizarEquipo(nombreEquipo);
  if (clave && catalogo[clave]?.length) return { clave, items: catalogo[clave], esGeneral: false };
  if (catalogo[CHECKLIST_GENERAL]?.length) return { clave: CHECKLIST_GENERAL, items: catalogo[CHECKLIST_GENERAL], esGeneral: true };
  return null;
}

export interface ChecklistGuardado {
  /** {"ítem": 1 cumple | 0 no cumple}, el formato de SISRES (así lo trae también el ETL). */
  chk_items: Record<string, 0 | 1>;
  chk_total: number;
  chk_marcados: number;
}

/**
 * Checklist a guardar a partir de TODOS los ítems mostrados y los que se marcaron como «cumple». Los desmarcados
 * quedan en 0: antes de la corrección de SISRES (commit 1c93eb9) se perdían y todo quedaba «10 de 10».
 * Un ítem marcado que no está en la lista se ignora.
 */
export function armarChecklist(todos: readonly string[], marcados: readonly string[]): ChecklistGuardado | null {
  const lista = limpiarItems(todos);
  if (lista.length === 0) return null;
  const cumple = new Set(marcados.map((m) => m.trim()));
  const chk_items: Record<string, 0 | 1> = {};
  for (const item of lista) chk_items[item] = cumple.has(item) ? 1 : 0;
  const chk_marcados = Object.values(chk_items).filter((v) => v === 1).length;
  return { chk_items, chk_total: lista.length, chk_marcados };
}

/** Lee un chk_items guardado (o importado de SISRES) como pares [ítem, cumple], tolerando valores "1"/"0"/true. */
export function leerChecklistGuardado(chk: unknown): [string, boolean][] {
  if (!chk || typeof chk !== "object" || Array.isArray(chk)) return [];
  return Object.entries(chk as Record<string, unknown>).map(([item, v]) => [item, v === 1 || v === "1" || v === true]);
}
