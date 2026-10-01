import { diasEntre, esDia, type Dia } from "@/lib/fechas";
import { faltantesHojaDeVida } from "@/lib/hoja-de-vida";

/** Días de fuera de servicio a partir de los cuales se alerta. */
export const DIAS_FDS_ALERTA = 7;
/** Ventana en la que un SOAT o una RTM se considera «por vencer». */
export const DIAS_POR_VENCER = 30;

export type TipoAlertaHojaDeVida = "FDS_SIN_FECHA" | "FDS_LARGO" | "SOAT" | "RTM" | "INCOMPLETA";

export interface AlertaHojaDeVida {
  tipo: TipoAlertaHojaDeVida;
  /** Texto corto para mostrar: «Sin fecha de inicio», «12 días», «vencido hace 3 d»… */
  detalle: string;
  gravedad: "alta" | "media";
}

export interface VehiculoParaAlertas {
  placa: string;
  estado_actual?: string | null;
  fds_desde?: string | null;
  vencimiento_soat?: string | null;
  vencimiento_tecnicomecanica?: string | null;
  vencimiento_rtm?: string | null;
  [campo: string]: unknown;
}

function alertaVencimiento(tipo: "SOAT" | "RTM", fecha: string | null | undefined, hoy: Dia): AlertaHojaDeVida | null {
  if (!fecha || !esDia(fecha.slice(0, 10))) return null;
  const dias = diasEntre(hoy, fecha.slice(0, 10));
  const nombre = tipo === "SOAT" ? "SOAT" : "Técnico-mecánica";
  if (dias < 0) return { tipo, gravedad: "alta", detalle: `${nombre} vencido hace ${Math.abs(dias)} d` };
  if (dias <= DIAS_POR_VENCER) return { tipo, gravedad: "media", detalle: `${nombre} vence en ${dias} d` };
  return null;
}

/**
 * Alertas de la hoja de vida de un vehículo (spec de hoja de vida, 2.6): fuera de servicio sin fecha de inicio o por
 * más de 7 días, SOAT / técnico-mecánica vencidos o por vencer, y hoja de vida incompleta. Sin fecha de inicio NO se
 * cuentan días de FDS: no se inventa una fecha.
 */
export function alertasDeVehiculo(v: VehiculoParaAlertas, hoy: Dia): AlertaHojaDeVida[] {
  const alertas: AlertaHojaDeVida[] = [];

  if (v.estado_actual === "FUERA_DE_SERVICIO") {
    const desde = v.fds_desde?.slice(0, 10);
    if (!desde || !esDia(desde)) {
      alertas.push({ tipo: "FDS_SIN_FECHA", gravedad: "media", detalle: "Fuera de servicio sin fecha de inicio" });
    } else {
      const dias = diasEntre(desde, hoy);
      if (dias > DIAS_FDS_ALERTA) alertas.push({ tipo: "FDS_LARGO", gravedad: "alta", detalle: `Fuera de servicio hace ${dias} días` });
    }
  }

  const soat = alertaVencimiento("SOAT", v.vencimiento_soat, hoy);
  if (soat) alertas.push(soat);
  const rtm = alertaVencimiento("RTM", v.vencimiento_tecnicomecanica || v.vencimiento_rtm, hoy);
  if (rtm) alertas.push(rtm);

  const faltantes = faltantesHojaDeVida(v);
  if (faltantes.length > 0) alertas.push({ tipo: "INCOMPLETA", gravedad: "media", detalle: `Faltan: ${faltantes.join(", ")}` });

  return alertas;
}
