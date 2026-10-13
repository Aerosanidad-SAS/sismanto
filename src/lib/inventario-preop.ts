/**
 * Inventario del preoperacional: los ítems de equipo (extintor, chalecos, herramientas, balas de oxígeno…) se CUENTAN.
 * Que falte una unidad es un faltante, no una falla: no saca el vehículo de servicio ni dice que algo esté dañado.
 * Los ítems de funcionamiento con cantidad (luces, direccionales) siguen siendo fallas si no están todos.
 */

/** Categorías del catálogo que son inventario de equipo. El resto (LUCES, CABINA, GENERAL) es funcionamiento. */
export const CATEGORIAS_INVENTARIO: readonly string[] = ["EQUIPO_CARRETERA", "EQUIPO_BASICO"];

export interface ItemContable {
  categoria: string;
  cantidad_esperada: string | null;
}

/** Cantidad esperada numérica (> 0), o null si el ítem es de estado (OK / Falla) y no de conteo. */
export function cantidadEsperada(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function esItemDeInventario(it: ItemContable): boolean {
  return CATEGORIAS_INVENTARIO.includes(it.categoria) && cantidadEsperada(it.cantidad_esperada) !== null;
}

/** Cuántas unidades faltan (0 si está completo, no es inventario o no hay respuesta). */
export function unidadesFaltantes(it: ItemContable, cantidadOk: number | undefined): number {
  const esperada = cantidadEsperada(it.cantidad_esperada);
  if (!esItemDeInventario(it) || esperada === null || cantidadOk === undefined) return 0;
  return Math.max(0, esperada - cantidadOk);
}
