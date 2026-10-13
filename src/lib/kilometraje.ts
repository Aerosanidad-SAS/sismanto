/**
 * Regla única del kilometraje de un vehículo: en el tiempo solo se queda igual o aumenta. Lógica pura (sin base de
 * datos) para que el navegador y el servidor apliquen exactamente lo mismo y se pueda probar sin red.
 */

export type OrigenLectura = "odómetro" | "tanqueo" | "preoperacional";

export interface LecturaKm {
  /** Día de la lectura, YYYY-MM-DD (hora de Colombia). */
  fecha: string;
  km: number;
  origen: OrigenLectura;
}

const fmtKm = (n: number) => n.toLocaleString("es-CO");

function fmtFecha(f: string): string {
  const [a, m, d] = f.split("-");
  return a && m && d ? `${d}/${m}/${a}` : f;
}

const AYUDA_CORRECCION =
  "El kilometraje solo se queda igual o aumenta. Si la lectura anterior fue un error de digitación, pide a Coordinación o al Administrador que la corrija.";

/**
 * Error si `km` en `fecha` rompe el orden de las lecturas conocidas, o null si encaja.
 * - No puede ser menor que la mayor lectura de ese día o de días anteriores (`mismoDiaCuenta: false` ignora las del mismo
 *   día: se usa para un tanqueo con fecha pasada y para el km inicial del preoperacional).
 * - No puede ser mayor que la menor lectura de días posteriores (un tanqueo con fecha pasada).
 * Igual al anterior es válido: el vehículo no se movió.
 */
export function validarKmEnLinea(
  km: number,
  fecha: string,
  lecturas: readonly LecturaKm[],
  opciones: { mismoDiaCuenta?: boolean } = {}
): string | null {
  const mismoDiaCuenta = opciones.mismoDiaCuenta ?? true;
  let previa: LecturaKm | null = null;
  let posterior: LecturaKm | null = null;
  for (const l of lecturas) {
    if (!Number.isFinite(l.km)) continue;
    // Sin hora, las lecturas del mismo día no se pueden ordenar entre sí: solo cuentan cuando se registra en vivo (hoy).
    if (l.fecha === fecha && !mismoDiaCuenta) continue;
    if (l.fecha <= fecha) {
      if (previa === null || l.km > previa.km) previa = l;
    } else if (posterior === null || l.km < posterior.km) {
      posterior = l;
    }
  }
  if (previa && km < previa.km) {
    return `No puede ser menor al último registrado (${fmtKm(previa.km)} km, ${previa.origen} del ${fmtFecha(previa.fecha)}). ${AYUDA_CORRECCION}`;
  }
  if (posterior && km > posterior.km) {
    return `Ya hay una lectura posterior de ${fmtKm(posterior.km)} km (${posterior.origen} del ${fmtFecha(posterior.fecha)}): este km no puede superarla. ${AYUDA_CORRECCION}`;
  }
  return null;
}

/** Mayor lectura de las dadas, o null si no hay ninguna. */
export function mayorLectura(lecturas: readonly LecturaKm[]): LecturaKm | null {
  let mayor: LecturaKm | null = null;
  for (const l of lecturas) {
    if (Number.isFinite(l.km) && (mayor === null || l.km > mayor.km)) mayor = l;
  }
  return mayor;
}
