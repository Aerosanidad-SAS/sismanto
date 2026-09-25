import { aniosDelRango, diasDelAnio, diasDelRango, solapeDias, type Dia } from "./fechas";

/**
 * Costos fijos de un vehículo en un periodo (SOAT, póliza y técnico-mecánica). Es la ÚNICA implementación: el dashboard
 * y los KPIs la usan, así que ya no pueden divergir. Es pura y no depende de la zona horaria (solo aritmética de días,
 * ver `fechas.ts`), de modo que da lo mismo en local, en Vercel y en las pruebas.
 *
 * Criterio (devengo): un costo anual se reparte en partes iguales por día de su año. El costo del periodo es la parte que
 * cae dentro de él.
 *  - SOAT y póliza: `valor anual × días del periodo / 365`.
 *  - RTM (tarifa regulada por año, `rtm_historico`): por cada año calendario que toca el periodo,
 *    `tarifa del año × días del periodo dentro de ese año / días de ese año`. Antes se sumaba el año COMPLETO aunque el
 *    periodo fuera de un día.
 */

/** Tarifa de RTM por año calendario (`rtm_historico`). */
export type TarifasRtm = Record<number, number>;

/**
 * Tarifa que aplica a un año. Si el año no tiene dato: uno posterior al último conocido usa la última tarifa (aún no se
 * publica la del año en curso); uno intermedio usa la del año conocido anterior; uno anterior al primer dato cuesta 0
 * (no hay información, y no se inventa una tarifa de otro año).
 */
export function tarifaRtmDelAnio(anio: number, tarifas: TarifasRtm): number {
  const propia = tarifas[anio];
  if (propia !== undefined) return propia;
  const previos = Object.keys(tarifas)
    .map(Number)
    .filter((a) => a < anio)
    .sort((a, b) => a - b);
  return previos.length ? tarifas[previos[previos.length - 1]] : 0;
}

/** RTM que corresponde a un periodo, repartida por días dentro de cada año. */
export function rtmDelPeriodo(desde: Dia, hasta: Dia, tarifas: TarifasRtm): number {
  let total = 0;
  for (const anio of aniosDelRango(desde, hasta)) {
    const diasEnElAnio = solapeDias(desde, hasta, `${anio}-01-01`, `${anio}-12-31`);
    total += (tarifaRtmDelAnio(anio, tarifas) * diasEnElAnio) / diasDelAnio(anio);
  }
  return total;
}

export interface CostosAnualesVehiculo {
  soatAnual: number | null | undefined;
  polizaAnual: number | null | undefined;
}

/** Costo fijo de un vehículo en `desde..hasta` (ambos incluidos). */
export function costoFijoDelPeriodo(
  v: CostosAnualesVehiculo,
  desde: Dia,
  hasta: Dia,
  tarifasRtm: TarifasRtm
): number {
  const factorSoatPoliza = diasDelRango(desde, hasta) / 365;
  return (
    (Number(v.soatAnual || 0) + Number(v.polizaAnual || 0)) * factorSoatPoliza + rtmDelPeriodo(desde, hasta, tarifasRtm)
  );
}
