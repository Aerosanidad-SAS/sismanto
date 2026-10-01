// Plantillas de texto del mantenimiento biomédico (migración 098), portado de includes/plantillasMantenimientoConfig.php
// de SISRES. Puro: lo usan las acciones, la configuración y el formulario.

export const CAMPOS_PLANTILLA = [
  { campo: "descripcion_falla", etiqueta: "Descripción de la falla / actividad realizada" },
  { campo: "observaciones", etiqueta: "Observaciones" },
  { campo: "obs_reparaciones", etiqueta: "Observaciones de reparación" },
] as const;

export type CampoPlantilla = (typeof CAMPOS_PLANTILLA)[number]["campo"];
export const MAX_NOMBRE_PLANTILLA = 120;
export const MAX_TEXTO_PLANTILLA = 4000;

export interface PlantillaTexto {
  id: number;
  campo: CampoPlantilla;
  nombre: string;
  texto: string;
}

export function esCampoPlantilla(v: string): v is CampoPlantilla {
  return CAMPOS_PLANTILLA.some((c) => c.campo === v);
}

/** Plantillas de un campo, por nombre (como SISRES: ORDER BY nombre). */
export function plantillasDelCampo(plantillas: readonly PlantillaTexto[], campo: CampoPlantilla): PlantillaTexto[] {
  return plantillas.filter((p) => p.campo === campo).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

/**
 * Texto resultante de aplicar una plantilla. Campo vacío → el texto de la plantilla; con texto → según `modo`
 * (SISRES pregunta «Reemplazar / Agregar al final / Cancelar»). Agregar deja un salto de línea entre ambos.
 */
export function aplicarPlantilla(actual: string | null | undefined, texto: string, modo: "reemplazar" | "agregar"): string {
  const previo = (actual ?? "").trimEnd();
  if (!previo || modo === "reemplazar") return texto;
  return `${previo}\n${texto}`;
}
