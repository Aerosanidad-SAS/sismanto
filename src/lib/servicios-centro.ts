/**
 * Qué servicios ve quien está limitado a su centro (Regulación, Coordinación, Médico, Auxiliar, OVEM con centro asignado).
 * Sin dependencias de servidor: lo usan las acciones y las páginas.
 *
 * Antes se mostraban los de su centro MÁS todos los que no tienen centro (el histórico de SISRES: 41.514 de 41.523). Con
 * eso Regulación Medellín veía servicios de Bogotá. Ahora, de los que no tienen centro, solo se ven los de su ciudad de
 * registro (`ciudad_registro`: la del CRA que recibió la solicitud) o los que no la traen (no se sabe de quién son).
 * QA 2026-10-10, hallazgo R1b.
 */

const CIUDAD_POR_CENTRO = {
  CRA_BOGOTA: { clave: "bogota", prefijo: "bogot" },
  CRA_MEDELLIN: { clave: "medellin", prefijo: "medell" },
} as const;

type CentroCodigo = keyof typeof CIUDAD_POR_CENTRO;

/** Ciudad de un centro (clave del filtro de ciudad y prefijo de `ciudad_registro`); null si el centro no es de ninguna de las dos. */
export function ciudadDeCentro(codigo: string | null | undefined): { clave: "bogota" | "medellin"; prefijo: string } | null {
  return codigo && codigo in CIUDAD_POR_CENTRO ? CIUDAD_POR_CENTRO[codigo as CentroCodigo] : null;
}

/**
 * Condición `or(...)` de PostgREST para los servicios visibles de un centro: los de ese centro, más los sin centro que no
 * son de otra ciudad. Un centro que no es de Bogotá ni de Medellín conserva la regla anterior (los sin centro, todos).
 */
export function condicionServiciosDeCentro(centro: { id: number; codigo: string }): string {
  const ciudad = ciudadDeCentro(centro.codigo);
  if (!ciudad) return `operational_center_id.eq.${centro.id},operational_center_id.is.null`;
  return `operational_center_id.eq.${centro.id},and(operational_center_id.is.null,or(ciudad_registro.is.null,ciudad_registro.ilike.${ciudad.prefijo}*))`;
}

/** ¿Este servicio sin centro corresponde a otra ciudad que la del centro? (misma regla, para filtrar en memoria). */
export function esDeOtraCiudad(ciudadRegistro: string | null | undefined, centroCodigo: string | null | undefined): boolean {
  const ciudad = ciudadDeCentro(centroCodigo);
  if (!ciudad || !ciudadRegistro) return false;
  const texto = ciudadRegistro.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  return !texto.startsWith(ciudad.prefijo);
}
