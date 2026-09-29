/**
 * Regla del preoperacional, compartida por la pantalla del OVEM y la acción del servidor: el registro del día tiene
 * que traer un resultado por CADA ítem activo del catálogo (los que la pantalla oculta van como NO_APLICA), y una
 * falla tiene que decir qué falla (en SISRES: "Agregue observaciones SI incumple").
 *
 * Antes solo se guardaban los ítems que el OVEM tocaba: un preoperacional con 1 de 96 ítems quedaba como "OK".
 */

export type EstadoItemPreoperacional = "OK" | "FALLA" | "NO_APLICA";

export interface ResultadoItemPreoperacional {
  checklistItemId: number;
  estado: EstadoItemPreoperacional;
  observacion?: string;
}

export interface ItemCatalogo {
  id: number;
  descripcion: string;
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
