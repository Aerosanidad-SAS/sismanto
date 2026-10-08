/**
 * Regla del preoperacional, compartida por la pantalla del OVEM y la acción del servidor: el registro del día tiene
 * que traer un resultado por CADA ítem activo del catálogo (los que la pantalla oculta van como NO_APLICA), y una
 * falla tiene que decir qué falla (en SISRES: "Agregue observaciones SI incumple").
 *
 * Antes solo se guardaban los ítems que el OVEM tocaba: un preoperacional con 1 de 96 ítems quedaba como "OK".
 */

import type { ItemEvaluado, SeveridadFalla } from "@/lib/preoperacional-alertas";

export type EstadoItemPreoperacional = "OK" | "FALLA" | "NO_APLICA";

export interface ResultadoItemPreoperacional {
  checklistItemId: number;
  estado: EstadoItemPreoperacional;
  observacion?: string;
}

export interface ItemCatalogo {
  id: number;
  descripcion: string;
  /** Gravedad si el ítem falla (checklist_items.severidad_falla). Sin ella toda falla cuenta como MEDIA. */
  severidad_falla?: SeveridadFalla | null;
}

/** Devuelve el primer problema del registro, o null si está completo. */
export function validarPreoperacional(
  catalogo: ItemCatalogo[],
  resultados: ResultadoItemPreoperacional[]
): string | null {
  const porId = new Map<number, ResultadoItemPreoperacional>();
  for (const r of resultados) {
    if (porId.has(r.checklistItemId)) return "El preoperacional trae un ítem repetido.";
    porId.set(r.checklistItemId, r);
  }

  const idsCatalogo = new Set(catalogo.map((it) => it.id));
  if (resultados.some((r) => !idsCatalogo.has(r.checklistItemId))) {
    return "El preoperacional trae un ítem que no está en el catálogo activo. Recarga la página.";
  }

  const faltantes = catalogo.filter((it) => !porId.has(it.id));
  if (faltantes.length > 0) {
    return `Faltan ${faltantes.length} ítem(s) por revisar, por ejemplo: ${faltantes[0].descripcion}.`;
  }

  const fallaSinObservacion = catalogo.find((it) => {
    const r = porId.get(it.id);
    return r?.estado === "FALLA" && !r.observacion?.trim();
  });
  if (fallaSinObservacion) {
    return `Describe la falla en "${fallaSinObservacion.descripcion}".`;
  }

  return null;
}

/**
 * Une cada resultado con su ítem del catálogo para el motor de alertas. La severidad sale del catálogo: si la consulta
 * del catálogo no trae `severidad_falla`, ninguna falla llega a CRÍTICA y el vehículo nunca pasa a NO APTO (bug que
 * existió: la consulta no pedía la columna). Por eso `catalogoSinSeveridad` permite avisar de ese caso en el servidor.
 */
export function itemsEvaluados(catalogo: ItemCatalogo[], resultados: ResultadoItemPreoperacional[]): ItemEvaluado[] {
  const porId = new Map(catalogo.map((c) => [c.id, c]));
  return resultados.map((r) => {
    const c = porId.get(r.checklistItemId);
    return {
      descripcion: c?.descripcion ?? `Ítem ${r.checklistItemId}`,
      estado: r.estado,
      observacion: r.observacion,
      severidadFalla: c?.severidad_falla ?? null,
    };
  });
}

/** True si el catálogo no trae la columna de severidad en ningún ítem (consulta sin la columna o migración 094 sin aplicar). */
export function catalogoSinSeveridad(catalogo: ItemCatalogo[]): boolean {
  return catalogo.length > 0 && catalogo.every((c) => c.severidad_falla === undefined);
}
