import { sumarDias, type Dia } from "@/lib/fechas";

/**
 * La sala de control muestra los servicios abiertos de hoy y de los últimos días. Lo que lleva más días abierto casi
 * siempre es un servicio que se hizo y nunca se finalizó (o un dato del traspaso desde SISRES), no una operación en
 * curso: se cuenta aparte y se revisa en Servicios, en vez de inundar la pantalla con retrasos de meses o de años.
 */
export const VENTANA_ABIERTOS_DIAS = 3;

/** Primer día (inclusive) cuyos servicios abiertos entran en la sala de control. */
export function inicioVentanaAbiertos(hoy: Dia): Dia {
  return sumarDias(hoy, -VENTANA_ABIERTOS_DIAS);
}

const UN_DIA_EN_MINUTOS = 24 * 60;

/** «+45 min», «+3 h 20 min» o «más de 1 día»: un retraso de miles de minutos no se escribe en minutos. */
export function textoRetraso(minutos: number): string {
  if (minutos > UN_DIA_EN_MINUTOS) return "más de 1 día";
  if (minutos >= 60) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return "+" + h + " h" + (m > 0 ? " " + m + " min" : "");
  }
  return "+" + minutos + " min";
}
