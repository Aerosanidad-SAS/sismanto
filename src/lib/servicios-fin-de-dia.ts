// Aviso de fin de día: los servicios que siguen abiertos (PROGRAMADO o CURSO) y hay que cerrar. Puro, para probarlo.
//
// Desde las 8 p. m. (hora de Colombia) y cada hora hasta las 11 p. m., mientras la pantalla de servicios o la sala de
// control esté abierta, suena una alerta y aparece un aviso con cuántos servicios siguen abiertos. Cada hora avisa una
// sola vez por sesión del navegador (ver `claveAvisoFinDeDia`), y no vuelve a consultar la base el resto de la hora.

import { hoyBogota } from "@/lib/fechas";

/** Primera hora (0–23, hora de Colombia) a la que empieza a avisar. Cambiar aquí si Regulación prefiere otra. */
export const HORA_INICIO_AVISO_FIN_DIA = 20;
/** Última hora en la que avisa (inclusive); a las 12 de la noche empieza otro día. */
export const HORA_FIN_AVISO_FIN_DIA = 23;

/** Hora (0–23) del reloj de Colombia. */
export function horaEnBogota(ahora: Date | number = new Date()): number {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(ahora);
  return Number(partes.find((p) => p.type === "hour")?.value ?? "0");
}

export function tocaAvisoFinDeDia(hora: number): boolean {
  return hora >= HORA_INICIO_AVISO_FIN_DIA && hora <= HORA_FIN_AVISO_FIN_DIA;
}

/** Una clave por día y por hora: el aviso sale una vez cada hora, no cada minuto. */
export function claveAvisoFinDeDia(ahora: Date | number = new Date()): string {
  return `aviso_fin_dia_${hoyBogota(ahora)}_${horaEnBogota(ahora)}`;
}

export interface ResumenAbiertos {
  programado: number;
  curso: number;
}

export interface TextoAvisoFinDeDia {
  titulo: string;
  detalle: string;
}

/** Texto del aviso, o null si no queda ningún servicio abierto. */
export function textoAvisoFinDeDia(r: ResumenAbiertos): TextoAvisoFinDeDia | null {
  const total = r.programado + r.curso;
  if (total <= 0) return null;
  const partes: string[] = [];
  if (r.programado > 0) partes.push(`${r.programado} en PROGRAMADO`);
  if (r.curso > 0) partes.push(`${r.curso} en CURSO`);
  return {
    titulo: total === 1 ? "🌙 Fin del día: 1 servicio sigue abierto" : `🌙 Fin del día: ${total} servicios siguen abiertos`,
    detalle: `${partes.join(" y ")}. Ciérralos o finalízalos antes de terminar el día.`,
  };
}
