/**
 * Reglas de alerta a partir del GPS, como función pura: recibe lo que el GPS y el servicio dicen de un vehículo en un
 * instante y devuelve las alertas que Regulación debe ver en su tarjeta y los avisos que debe recibir el conductor (OVEM).
 * No sabe de qué proveedor viene el GPS ni envía nada: quien conecte la API (León y David) arma `EntradaReglas` con su
 * lectura y reparte las alertas que salgan. Todos los umbrales viven en `ConfigGps`.
 *
 * Regla 1 · INICIO_ATRASADO (Regulación). Un servicio asignado debe iniciar desplazamiento a los 10 min de asignado. Si
 * está programado para más tarde, el reloj no corre desde la asignación sino desde la hora en que debía salir (recogida
 * menos el viaje estimado). Si la tripulación está en almuerzo, el reloj arranca cuando termina.
 *
 * Regla 2 · ENCENDIDO_DETENIDO. Vehículo encendido y sin moverse:
 *   · a los 20 min: aviso a Regulación y mensaje amable al conductor ("¿hay alguna novedad que quieras reportar?");
 *   · a los 30 min, sin paciente a bordo y sin novedad reportada: alerta a Regulación y segundo recordatorio al conductor.
 *     Con paciente a bordo no escala: el aire acondicionado es una razón válida.
 *
 * `clave` identifica cada alerta dentro de su episodio (mismo vehículo, misma detención o mismo servicio): quien envía
 * guarda las claves ya notificadas y no repite un aviso por cada lectura del GPS.
 */

export interface ConfigGps {
  /** Minutos que tiene la tripulación para iniciar desplazamiento tras la asignación. */
  inicioDesplazamientoMin: number;
  /** Viaje estimado hasta el origen cuando no hay un cálculo de ruta (la llave de Maps está pendiente). */
  viajeEstimadoDefectoMin: number;
  /** Colchón entre llegar y la hora de recogida al calcular cuándo debe salir. */
  margenLlegadaMin: number;
  /** Minutos encendido y detenido para el primer aviso. */
  detenidoAvisoMin: number;
  /** Minutos encendido y detenido para escalar (cuenta desde que se detuvo, no desde el primer aviso). */
  detenidoEscalaMin: number;
}

export const CONFIG_GPS_DEFECTO: ConfigGps = {
  inicioDesplazamientoMin: 10,
  viajeEstimadoDefectoMin: 30,
  margenLlegadaMin: 0,
  detenidoAvisoMin: 20,
  detenidoEscalaMin: 30,
};

export interface EntradaReglas {
  now: Date;
  vehiculo: {
    encendido: boolean;
    /** Desde cuándo está sin moverse (el que conecta el GPS decide el umbral de velocidad); null si se mueve o no se sabe. */
    detenidoDesde: Date | null;
  };
  /** Servicio asignado que la tripulación debe atender; null si no tiene ninguno pendiente de iniciar. */
  servicio: {
    asignadoAt: Date;
    horaRecogida: Date | null;
    viajeEstimadoMin?: number | null;
    /** Marca de inicio de desplazamiento (del OVEM o del GPS); null si aún no sale. */
    iniciaDesplazamientoAt: Date | null;
    /** Ya salió con el paciente y todavía no lo entrega. */
    pacienteABordo: boolean;
  } | null;
  /** Almuerzo de la tripulación (estado explícito o ventana del turno); null si no aplica. */
  almuerzo?: { desde: Date; hasta: Date } | null;
  /** Cuándo el conductor reportó una novedad (responde al aviso); null si no lo ha hecho. */
  novedadReportadaAt?: Date | null;
}

export type CodigoAlerta = "INICIO_ATRASADO" | "ENCENDIDO_DETENIDO";
export type NivelAlerta = "aviso" | "alerta";

export interface AlertaGps {
  codigo: CodigoAlerta;
  nivel: NivelAlerta;
  /** Dedupe por episodio: no volver a notificar una clave ya notificada. */
  clave: string;
  /** Texto para la tarjeta de Regulación. */
  mensajeRegulacion: string;
  /** Aviso al conductor (OVEM); ausente si la alerta es solo para Regulación. */
  mensajeConductor?: string;
}

const MS_MIN = 60_000;
const minutosEntre = (a: Date, b: Date) => Math.floor((a.getTime() - b.getTime()) / MS_MIN);
const sumarMin = (d: Date, min: number) => new Date(d.getTime() + min * MS_MIN);
const mayor = (...ds: Date[]) => new Date(Math.max(...ds.map((d) => d.getTime())));

function inicioAtrasado(e: EntradaReglas, cfg: ConfigGps): AlertaGps | null {
  const s = e.servicio;
  if (!s || s.iniciaDesplazamientoAt) return null;
  const al = e.almuerzo;
  if (al && e.now >= al.desde && e.now < al.hasta) return null;

  const viaje = s.viajeEstimadoMin ?? cfg.viajeEstimadoDefectoMin;
  const salidaRequerida = s.horaRecogida ? sumarMin(s.horaRecogida, -(viaje + cfg.margenLlegadaMin)) : s.asignadoAt;
  // Asignado durante el almuerzo: el reloj arranca cuando termina.
  const asignadoEnAlmuerzo = al && s.asignadoAt >= al.desde && s.asignadoAt < al.hasta;
  const inicioDelReloj = mayor(s.asignadoAt, salidaRequerida, ...(asignadoEnAlmuerzo ? [al.hasta] : []));
  const limite = sumarMin(inicioDelReloj, cfg.inicioDesplazamientoMin);
  if (e.now <= limite) return null;

  const atraso = minutosEntre(e.now, limite);
  return {
    codigo: "INICIO_ATRASADO",
    nivel: "alerta",
    clave: `INICIO_ATRASADO:${s.asignadoAt.getTime()}`,
    mensajeRegulacion: `Inicio de desplazamiento atrasado: debía salir hace ${minutosEntre(e.now, inicioDelReloj)} min (límite ${cfg.inicioDesplazamientoMin} min, ${atraso} de atraso).`,
  };
}

function encendidoDetenido(e: EntradaReglas, cfg: ConfigGps): AlertaGps[] {
  const { encendido, detenidoDesde } = e.vehiculo;
  if (!encendido || !detenidoDesde) return [];
  const min = minutosEntre(e.now, detenidoDesde);
  if (min < cfg.detenidoAvisoMin) return [];

  const episodio = detenidoDesde.getTime();
  const conPaciente = e.servicio?.pacienteABordo === true;
  const novedadReportada = !!e.novedadReportadaAt && e.novedadReportadaAt >= detenidoDesde;
  const alertas: AlertaGps[] = [
    {
      codigo: "ENCENDIDO_DETENIDO",
      nivel: "aviso",
      clave: `ENCENDIDO_DETENIDO:${cfg.detenidoAvisoMin}:${episodio}`,
      mensajeRegulacion: `Vehículo encendido y detenido hace ${min} min${conPaciente ? " (con paciente a bordo)" : ""}.`,
      mensajeConductor: `Notamos que el vehículo lleva ${cfg.detenidoAvisoMin} minutos detenido y encendido. ¿Hay alguna novedad que quieras reportar?`,
    },
  ];
  if (min >= cfg.detenidoEscalaMin && !conPaciente && !novedadReportada) {
    alertas.push({
      codigo: "ENCENDIDO_DETENIDO",
      nivel: "alerta",
      clave: `ENCENDIDO_DETENIDO:${cfg.detenidoEscalaMin}:${episodio}`,
      mensajeRegulacion: `Vehículo encendido y detenido hace ${min} min, sin paciente a bordo ni novedad reportada.`,
      mensajeConductor: `El vehículo sigue detenido y encendido (${min} minutos). Si no hay un paciente que necesite el aire acondicionado, puedes apagarlo.`,
    });
  }
  return alertas;
}

/** Alertas vigentes de un vehículo en este instante, de menor a mayor gravedad. */
export function evaluarReglasGps(entrada: EntradaReglas, config: ConfigGps = CONFIG_GPS_DEFECTO): AlertaGps[] {
  const atraso = inicioAtrasado(entrada, config);
  return [...encendidoDetenido(entrada, config), ...(atraso ? [atraso] : [])].sort(
    (a, b) => Number(a.nivel === "alerta") - Number(b.nivel === "alerta")
  );
}

/** Gravedad de la tarjeta: la mayor de sus alertas. Regulación la ve como color del borde y de la franja. */
export function gravedadTarjeta(alertas: AlertaGps[]): "normal" | NivelAlerta {
  if (alertas.some((a) => a.nivel === "alerta")) return "alerta";
  return alertas.length > 0 ? "aviso" : "normal";
}
