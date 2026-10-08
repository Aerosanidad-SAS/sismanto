// Orden cronológico de las fechas y horas de un servicio. Puro, para probarlo sin base de datos.
//
// Las horas del recorrido deben ir en el orden en que ocurren: inicio de desplazamiento ≤ llegada a origen ≤ salida de
// origen ≤ llegada intermedia ≤ salida intermedia ≤ llegada a destino ≤ salida de destino. Solo se comparan las que
// están escritas (una intermedia vacía no estorba), y la misma hora en dos pasos seguidos vale. Además, la última hora
// registrada no puede ser anterior a la programación; una llegada ANTES de la programación sí vale (la tripulación puede
// llegar temprano). SISRES no lo validaba: aquí evita guardar un recorrido imposible, que dejaba el tiempo calculado en
// blanco sin avisar (calcularTiempos devuelve null cuando la resta es negativa).
//
// Acepta las horas como las manda el formulario («2026-10-07T08:00», hora de Colombia) o como salen de la base
// (con zona), con la misma regla de hora-colombia.ts.

import { aTimestamptzColombia } from "@/lib/hora-colombia";

export interface TiemposServicio {
  fecha_hora_programacion?: string | null;
  fecha_hora_inicio_desplazamiento?: string | null;
  fecha_hora_llegada_origen?: string | null;
  fecha_hora_salida_origen?: string | null;
  fecha_hora_llegada_intermedia?: string | null;
  fecha_hora_salida_intermedia?: string | null;
  fecha_hora_llegada_destino?: string | null;
  fecha_hora_salida_destino?: string | null;
}

const RECORRIDO = [
  ["fecha_hora_inicio_desplazamiento", "Inicio de desplazamiento"],
  ["fecha_hora_llegada_origen", "Llegada a origen"],
  ["fecha_hora_salida_origen", "Salida de origen"],
  ["fecha_hora_llegada_intermedia", "Llegada intermedia"],
  ["fecha_hora_salida_intermedia", "Salida intermedia"],
  ["fecha_hora_llegada_destino", "Llegada a destino"],
  ["fecha_hora_salida_destino", "Salida de destino"],
] as const;

/** Milisegundos del instante, o null si está vacío o no es una fecha válida. */
export function instanteDe(valor: string | null | undefined): number | null {
  const normalizado = aTimestamptzColombia(valor);
  if (!normalizado) return null;
  const ms = Date.parse(normalizado);
  return Number.isNaN(ms) ? null : ms;
}

/** Mensaje del primer desorden que encuentre, o null si el orden es correcto. */
export function errorDeCronologia(t: TiemposServicio): string | null {
  const puestos: { etiqueta: string; ms: number }[] = [];
  for (const [campo, etiqueta] of RECORRIDO) {
    const ms = instanteDe(t[campo]);
    if (ms !== null) puestos.push({ etiqueta, ms });
  }

  for (let i = 1; i < puestos.length; i++) {
    if (puestos[i].ms < puestos[i - 1].ms) {
      return `Las horas no están en orden: «${puestos[i].etiqueta}» no puede ser anterior a «${puestos[i - 1].etiqueta}».`;
    }
  }

  const programacion = instanteDe(t.fecha_hora_programacion);
  const ultima = puestos[puestos.length - 1];
  if (programacion !== null && ultima && ultima.ms < programacion) {
    return `«${ultima.etiqueta}» no puede ser anterior a la fecha y hora de programación.`;
  }
  return null;
}
