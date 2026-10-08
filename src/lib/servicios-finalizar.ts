// Qué fechas y horas debe tener un servicio para poder pasar a FINALIZADO. Puro, para probarlo sin base de datos.
//
// Parte de la regla de editarServicio.php de SISRES (validación al guardar con etapa FINALIZADO), según el tipo:
//  · TAB/TAM simple (y el histórico TAB SENCILLO): origen y destino (llegada y salida de cada uno).
//  · TAB/TAM doble y traslado aéreo: origen, intermedia y destino.
//  · Medicina domiciliaria: la visita completa. SISRES la pedía «en el origen»; en SISMANTO la tripulación la graba en
//    el destino (la domiciliaria no tiene origen: va directo al domicilio, ver PASOS_DOMICILIARIA en
//    estado-servicio.ts), así que se acepta en cualquiera de los dos para no obligar a inventar horas.
// SISRES también la aplicaba a TELEMEDICINA, pero ese tipo no tiene sección de ruta en SISMANTO (no hay dónde escribir
// esas fechas): exigirlas bloquearía finalizarlo sin remedio, así que se deja fuera.
// Los tipos de traslado coinciden con los pasos que marca la tripulación, por lo que su flujo normal ya cumple la regla.

export interface FechasServicio {
  fecha_hora_llegada_origen?: string | null;
  fecha_hora_salida_origen?: string | null;
  fecha_hora_llegada_intermedia?: string | null;
  fecha_hora_salida_intermedia?: string | null;
  fecha_hora_llegada_destino?: string | null;
  fecha_hora_salida_destino?: string | null;
}

type Tramo = "origen" | "intermedia" | "destino";

/** Cada elemento es un requisito: basta con que UNO de sus tramos esté completo (llegada y salida). */
const REQUISITOS_POR_TIPO: Record<string, readonly (readonly Tramo[])[]> = {
  "MEDICINA DOMICILIARIA": [["origen", "destino"]],
  "TAB SIMPLE": [["origen"], ["destino"]],
  "TAB SENCILLO": [["origen"], ["destino"]],
  "TAM SIMPLE": [["origen"], ["destino"]],
  "TAB DOBLE": [["origen"], ["intermedia"], ["destino"]],
  "TAM DOBLE": [["origen"], ["intermedia"], ["destino"]],
  "TRASLADO AEREO": [["origen"], ["intermedia"], ["destino"]],
};

const ETIQUETA_TRAMO: Record<Tramo, string> = { origen: "origen", intermedia: "punto intermedio", destino: "destino" };

const tiene = (v: string | null | undefined) => typeof v === "string" && v.trim() !== "";

const tramoCompleto = (t: Tramo, fechas: FechasServicio) =>
  tiene(fechas[`fecha_hora_llegada_${t}`]) && tiene(fechas[`fecha_hora_salida_${t}`]);

/** Requisitos sin cumplir, escritos para el usuario («origen», «origen o destino»…). Vacío = se puede finalizar. */
export function tramosFaltantesParaFinalizar(tipoServicio: string | null | undefined, fechas: FechasServicio): string[] {
  const requisitos = REQUISITOS_POR_TIPO[(tipoServicio ?? "").trim().toUpperCase()] ?? [];
  return requisitos
    .filter((alternativas) => !alternativas.some((t) => tramoCompleto(t, fechas)))
    .map((alternativas) => alternativas.map((t) => ETIQUETA_TRAMO[t]).join(" o "));
}

/** Mensaje para el usuario, o null si no falta nada. */
export function mensajeFaltantesParaFinalizar(tipoServicio: string | null | undefined, fechas: FechasServicio): string | null {
  const faltan = tramosFaltantesParaFinalizar(tipoServicio, fechas);
  if (faltan.length === 0) return null;
  return `Para finalizar un servicio ${tipoServicio} hay que registrar la llegada y la salida en: ${faltan.join(", ")}. Edita el servicio, completa esas fechas y luego finalízalo.`;
}
