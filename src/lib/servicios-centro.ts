/**
 * Qué servicios ve quien está limitado a su centro (Regulación, Coordinación, Médico, Auxiliar, OVEM con centro asignado).
 * Sin dependencias de servidor: lo usan las acciones y las páginas.
 *
 * Antes se mostraban los de su centro MÁS todos los que no tienen centro (el histórico de SISRES: 41.514 de 41.523). Con
 * eso Regulación Medellín veía servicios de Bogotá. Ahora, de los que no tienen centro, solo se ven los de su ciudad de
 * registro (`ciudad_registro`: la del CRA que recibió la solicitud). Los que no traen ciudad de registro tampoco se ven:
 * no se puede saber de quién son y, en la práctica, son registros antiguos de Bogotá (QA-REG3, A1 y A3).
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
 *
 * `placasDeOtroCentro`: móviles de la otra CRA. Un servicio histórico sin centro lo atendió un móvil de una sola ciudad, aunque
 * su `ciudad_registro` diga otra (48 servicios de TRG540, TRG549, LTN715… con origen en Soacha o Girardot figuraban como de
 * Medellín): esos no se muestran. Sin móvil, manda la ciudad de registro.
 */
export function condicionServiciosDeCentro(centro: { id: number; codigo: string }, placasDeOtroCentro: string[] = []): string {
  const ciudad = ciudadDeCentro(centro.codigo);
  if (!ciudad) return `operational_center_id.eq.${centro.id},operational_center_id.is.null`;
  // Solo placas con forma de placa: el valor entra tal cual en el filtro y `,` `(` `)` serían sintaxis de PostgREST.
  const placas = placasDeOtroCentro.filter((p) => /^[A-Z0-9]{3,10}$/i.test(p));
  const sinMovilAjeno = placas.length > 0 ? `,or(movil_placa.is.null,movil_placa.not.in.(${placas.join(",")}))` : "";
  return `operational_center_id.eq.${centro.id},and(operational_center_id.is.null,ciudad_registro.ilike.${ciudad.prefijo}*${sinMovilAjeno})`;
}
