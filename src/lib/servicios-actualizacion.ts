import { medicalServiceSchema } from "./validations";

/**
 * Campos que Médico y Auxiliar de Enfermería SÍ pueden tocar al editar un servicio: el «desenlace clínico».
 * Todo lo demás (fecha, móvil, tripulación, ruta, facturación…) es logística de Regulación (SISRES: `$esMedicoAux`).
 */
export const CAMPOS_CLINICOS_MEDICO_AUX = [
  "cie_codigo",
  "requiere_aislamiento",
  "finalidad_traslado",
  "acepta_ips",
  "novedad_servicio",
  "observaciones",
  "motivo_externo",
  "motivo_interno",
  "estado_servicio",
] as const;

const OBLIGATORIOS = new Set(["nombre_completo", "tipo_servicio"]);

/** Campos del formulario de servicio que se pueden dejar vacíos. */
export function camposVaciables(): string[] {
  return Object.keys(medicalServiceSchema.shape).filter((k) => !OBLIGATORIOS.has(k));
}

/**
 * Fila del UPDATE al editar un servicio.
 *
 * El formulario envía todos los campos; el esquema convierte el vacío en `undefined` y el UPDATE de Supabase omite las
 * claves `undefined`, así que borrar un campo (autorización, asesor, observaciones…) no se guardaba y volvía el valor
 * anterior. Aquí cada campo vaciable ausente pasa a `null`.
 *
 * Médico y Auxiliar tienen la logística bloqueada en el formulario (esos campos llegan `undefined`): para ellos solo se
 * escriben los campos clínicos, así no se borra lo que despachó Regulación, ni siquiera llamando a la acción a mano.
 */
export function filaDeActualizacion(fila: Record<string, unknown>, esMedicoAux: boolean): Record<string, unknown> {
  if (esMedicoAux) {
    return Object.fromEntries(CAMPOS_CLINICOS_MEDICO_AUX.map((k) => [k, fila[k] ?? null]));
  }
  // `undefined` cuenta como ausente: Zod deja la clave presente con ese valor, y el UPDATE la omitiría.
  const resultado = { ...fila };
  for (const k of camposVaciables()) resultado[k] = fila[k] ?? null;
  return resultado;
}
