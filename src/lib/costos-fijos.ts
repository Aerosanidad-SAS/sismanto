import { diasDelRango, esDia, solapeDias, type Dia } from "./fechas";

/**
 * Referencia en TypeScript del criterio de costos anuales (SOAT, póliza y RTM). El cálculo que usa la aplicación vive en
 * la base (`costo_devengado` y `costos_por_vehiculo`, migración 089); esta es su gemela pura, sin zona horaria, y sirve
 * para probar el criterio y para comprobar que la función SQL da lo mismo (`scripts/verify-costos-sql.ts`).
 *
 * Criterio (devengo): el valor de un costo anual se reparte en partes iguales por cada día de su vigencia; el costo de un
 * periodo es la parte que cae dentro de él. Renovar es agregar otra vigencia: el pasado no cambia.
 */

export interface CostoAnual {
  valor: number | null | undefined;
  vigenciaDesde: Dia;
  vigenciaHasta: Dia;
}

/** Parte de `valor` que cae en el periodo `desde..hasta` (ambos incluidos). Gemela de `costo_devengado` en SQL. */
export function costoDevengado(
  valor: number | null | undefined,
  vigenciaDesde: Dia,
  vigenciaHasta: Dia,
  desde: Dia,
  hasta: Dia
): number {
  if (valor == null || !esDia(vigenciaDesde) || !esDia(vigenciaHasta) || vigenciaHasta < vigenciaDesde) return 0;
  const diasEnElPeriodo = solapeDias(desde, hasta, vigenciaDesde, vigenciaHasta);
  return (Number(valor) * diasEnElPeriodo) / diasDelRango(vigenciaDesde, vigenciaHasta);
}

/** Suma de lo devengado por varias vigencias en el periodo. */
export function costoAnualDelPeriodo(filas: CostoAnual[], desde: Dia, hasta: Dia): number {
  return filas.reduce((s, f) => s + costoDevengado(f.valor, f.vigenciaDesde, f.vigenciaHasta, desde, hasta), 0);
}
