/**
 * Reglas puras del «Tablero de vehículos» de Regulación: aptitud (¿puede operar?) y ocupación (¿está libre o en
 * servicio?) de cada vehículo programado hoy. Sin base de datos, para poder probarlas; las lee
 * `app/api/actions/tablero-vehiculos.ts` y las pinta `components/regulacion/tablero-vehiculos.tsx`.
 *
 * Aptitud y ocupación son dos ejes distintos: un vehículo puede ser APTO y estar EN_SERVICIO, o estar NO_APTO y
 * seguir con un servicio abierto. El tablero muestra los dos.
 */
import {
  estadoOperativo,
  minutosDeRetraso,
  pasosPorTipo,
  type ServicioParaEstado,
} from "@/lib/estado-servicio";

// ── Aptitud ─────────────────────────────────────────────────────────────────

export type Aptitud =
  | "NO_APTO"
  | "NO_APTO_PENDIENTE_AVAL"
  | "SIN_PREOPERACIONAL"
  | "APTO_CON_NOVEDADES"
  | "APTO";

export type SeveridadNovedad = "BAJA" | "MEDIA" | "ALTA";

const RANGO_SEVERIDAD: Record<SeveridadNovedad, number> = { BAJA: 1, MEDIA: 2, ALTA: 3 };

export interface EntradaAptitud {
  /** vehicles.estado_actual (OPERATIVO | FUERA_DE_SERVICIO | …). */
  estadoActual: string;
  /** Hay una solicitud PENDIENTE en vehicle_no_apto_solicitudes: bloqueo provisional hasta el aval. */
  solicitudPendiente: boolean;
  /** Existe un daily_checks de hoy para el vehículo. */
  tienePreoperacionalHoy: boolean;
  /** Novedades (incidents) en estado ABIERTO o EN_PROCESO. */
  novedadesAbiertas: number;
}

/**
 * Aptitud de un vehículo programado hoy. Precedencia (decidida por Daniel, 2026-10-02):
 * NO_APTO > NO_APTO_PENDIENTE_AVAL > SIN_PREOPERACIONAL > APTO_CON_NOVEDADES > APTO.
 */
export function estadoAptitud(e: EntradaAptitud): Aptitud {
  if (e.estadoActual === "FUERA_DE_SERVICIO") return "NO_APTO";
  if (e.solicitudPendiente) return "NO_APTO_PENDIENTE_AVAL";
  if (!e.tienePreoperacionalHoy) return "SIN_PREOPERACIONAL";
  if (e.novedadesAbiertas > 0) return "APTO_CON_NOVEDADES";
  return "APTO";
}

export const ETIQUETA_APTITUD: Record<Aptitud, string> = {
  NO_APTO: "No apto",
  NO_APTO_PENDIENTE_AVAL: "No apto: pendiente de aval",
  SIN_PREOPERACIONAL: "Sin preoperacional",
  APTO_CON_NOVEDADES: "Apto con novedades",
  APTO: "Apto",
};

/** Menor número = más urgente de atender. */
const RANGO_APTITUD: Record<Aptitud, number> = {
  NO_APTO: 0,
  NO_APTO_PENDIENTE_AVAL: 1,
  SIN_PREOPERACIONAL: 2,
  APTO_CON_NOVEDADES: 3,
  APTO: 4,
};

/** Aptitudes que piden atención de Regulación antes que la ocupación. */
export function requiereAtencion(a: Aptitud): boolean {
  return a === "NO_APTO" || a === "NO_APTO_PENDIENTE_AVAL" || a === "SIN_PREOPERACIONAL";
}

/** Puede recibir servicios: aprobó el preoperacional y no está bloqueado. */
export function esApto(a: Aptitud): boolean {
  return a === "APTO" || a === "APTO_CON_NOVEDADES";
}

export interface ResumenNovedades {
  cantidad: number;
  /** Mayor severidad entre las abiertas; null si no hay. */
  severidadMaxima: SeveridadNovedad | null;
}

export function resumirNovedades(severidades: readonly string[]): ResumenNovedades {
  let max: SeveridadNovedad | null = null;
  for (const s of severidades) {
    if (!(s in RANGO_SEVERIDAD)) continue;
    const sev = s as SeveridadNovedad;
    if (max === null || RANGO_SEVERIDAD[sev] > RANGO_SEVERIDAD[max]) max = sev;
  }
  // Una novedad sin severidad reconocida igual cuenta: la severidad máxima solo informa.
  return { cantidad: severidades.length, severidadMaxima: max };
}

export const ETIQUETA_SEVERIDAD: Record<SeveridadNovedad, string> = { BAJA: "baja", MEDIA: "media", ALTA: "alta" };

// ── Ocupación ───────────────────────────────────────────────────────────────

export type Ocupacion = "LIBRE" | "EN_SERVICIO";

/** Servicio de un vehículo con lo mínimo para derivar su estado (ver `estado-servicio.ts`). */
export type ServicioDelVehiculo = ServicioParaEstado & { id: number };

export interface ServicioEnCurso {
  id: number;
  tipoServicio: string;
  /** Último hito marcado por la tripulación («Llegada a sitio»); null si aún no marca ninguno. */
  hito: string | null;
  /** Instante (ISO) en que se marcó ese hito. */
  hitoAt: string | null;
  /** Estado que ve Regulación («En traslado»). */
  estado: string;
  /** Cuándo arrancó: inicio de desplazamiento o, en su defecto, el primer hito conocido; null si no hay marca. */
  desde: string | null;
  /** Minutos transcurridos desde `desde`; null si no hay marca de inicio. */
  minutosEnServicio: number | null;
}

export interface ServicioProximo {
  id: number;
  tipoServicio: string;
  /** fecha_hora_programacion (ISO). */
  programadoPara: string;
  /** Minutos de retraso si la hora ya pasó y la tripulación no ha llegado; null si no aplica. */
  minutosDeRetraso: number | null;
}

export interface OcupacionVehiculo {
  estado: Ocupacion;
  /** El servicio en curso más reciente; null si está libre. */
  servicioActual: ServicioEnCurso | null;
  /** Cuántos servicios en curso tiene a la vez (normalmente 1). */
  serviciosEnCurso: number;
  /** Próximo servicio programado que todavía no arranca. */
  proximo: ServicioProximo | null;
  /**
   * Instante (ISO) estimado en que el vehículo queda libre. SIEMPRE null por ahora: no hay una estimación fiable
   * (falta GPS y tiempos de respuesta); Daniel definirá el cálculo. No inventar un valor: el tablero muestra el
   * tiempo transcurrido.
   */
  estimadoLibre: string | null;
}

const ETAPAS_ACTIVAS = ["PROGRAMADO", "CURSO"];

function ms(iso: unknown): number | null {
  if (typeof iso !== "string") return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
}

function ultimoHito(s: ServicioDelVehiculo): { hito: string; at: string } | null {
  let ultimo: { hito: string; at: string } | null = null;
  for (const p of pasosPorTipo(s.tipo_servicio)) {
    const valor = s[p.campo];
    if (typeof valor === "string" && valor) ultimo = { hito: p.hito, at: valor };
  }
  return ultimo;
}

function aEnCurso(s: ServicioDelVehiculo, ahora: number): ServicioEnCurso {
  const hito = ultimoHito(s);
  const inicio = typeof s.fecha_hora_inicio_desplazamiento === "string" ? s.fecha_hora_inicio_desplazamiento : null;
  const desde = inicio ?? hito?.at ?? null;
  const desdeMs = ms(desde);
  return {
    id: s.id,
    tipoServicio: s.tipo_servicio,
    hito: hito?.hito ?? null,
    hitoAt: hito?.at ?? null,
    estado: estadoOperativo(s).etiqueta,
    desde,
    minutosEnServicio: desdeMs === null ? null : Math.max(0, Math.floor((ahora - desdeMs) / 60000)),
  };
}

/**
 * Ocupación a partir de los servicios activos (etapa PROGRAMADO o CURSO) de UN vehículo.
 * EN_SERVICIO = al menos uno ya arrancó (etapa CURSO o la tripulación marcó algún hito). Un servicio solo
 * PROGRAMADO/asignado no ocupa al vehículo: pasa a ser su «próximo servicio».
 */
export function ocupacionVehiculo(servicios: readonly ServicioDelVehiculo[], ahora: number = Date.now()): OcupacionVehiculo {
  const activos = servicios.filter((s) => ETAPAS_ACTIVAS.includes(s.etapa));
  const enCurso = activos.filter((s) => estadoOperativo(s).tono === "en_curso");
  const pendientes = activos.filter((s) => estadoOperativo(s).tono !== "en_curso");

  // Entre varios en curso, el de actividad más reciente (último hito; si no tiene, su inicio).
  const actuales = enCurso
    .map((s) => aEnCurso(s, ahora))
    .sort((a, b) => (ms(b.hitoAt ?? b.desde) ?? 0) - (ms(a.hitoAt ?? a.desde) ?? 0));

  const proximos = pendientes
    .map((s) => ({ s, t: ms(s.fecha_hora_programacion) }))
    .filter((x): x is { s: ServicioDelVehiculo; t: number } => x.t !== null)
    .sort((a, b) => a.t - b.t);
  const primero = proximos[0];

  return {
    estado: actuales.length > 0 ? "EN_SERVICIO" : "LIBRE",
    servicioActual: actuales[0] ?? null,
    serviciosEnCurso: actuales.length,
    proximo: primero
      ? {
          id: primero.s.id,
          tipoServicio: primero.s.tipo_servicio,
          programadoPara: primero.s.fecha_hora_programacion as string,
          minutosDeRetraso: minutosDeRetraso(primero.s, ahora),
        }
      : null,
    estimadoLibre: null,
  };
}

// ── Tablero ─────────────────────────────────────────────────────────────────

export interface FilaTablero {
  vehicleId: string;
  placa: string;
  /** Nombres de quienes operan el vehículo hoy (vehicle_operacion_diaria). */
  conductores: string[];
  aptitud: Aptitud;
  novedades: ResumenNovedades;
  /** Motivo de la solicitud de NO APTO pendiente, si la hay. */
  motivoSolicitud: string | null;
  ocupacion: OcupacionVehiculo;
}

export interface ContadoresTablero {
  /** Libres Y aptos: los que Regulación puede despachar ya. */
  libres: number;
  enServicio: number;
  conNovedades: number;
  /** NO_APTO + NO_APTO_PENDIENTE_AVAL. */
  noAptos: number;
  sinPreoperacional: number;
}

export function contarTablero(filas: readonly FilaTablero[]): ContadoresTablero {
  const c: ContadoresTablero = { libres: 0, enServicio: 0, conNovedades: 0, noAptos: 0, sinPreoperacional: 0 };
  for (const f of filas) {
    if (f.ocupacion.estado === "EN_SERVICIO") c.enServicio++;
    else if (esApto(f.aptitud)) c.libres++;
    if (f.aptitud === "APTO_CON_NOVEDADES") c.conNovedades++;
    if (f.aptitud === "NO_APTO" || f.aptitud === "NO_APTO_PENDIENTE_AVAL") c.noAptos++;
    if (f.aptitud === "SIN_PREOPERACIONAL") c.sinPreoperacional++;
  }
  return c;
}

function grupoOrden(f: FilaTablero): number {
  if (requiereAtencion(f.aptitud)) return 0;
  return f.ocupacion.estado === "EN_SERVICIO" ? 1 : 2;
}

/**
 * Orden del tablero: 1) los que requieren atención (más urgente primero), 2) en servicio, 3) libres. Dentro de
 * «en servicio» por placa (posiciones estables al refrescar); dentro de «libres», el que antes inicia servicio
 * primero (sin próximo servicio al final). No muta la lista recibida.
 */
export function ordenarTablero(filas: readonly FilaTablero[]): FilaTablero[] {
  return [...filas].sort((a, b) => {
    const g = grupoOrden(a) - grupoOrden(b);
    if (g !== 0) return g;
    if (grupoOrden(a) === 0) {
      const r = RANGO_APTITUD[a.aptitud] - RANGO_APTITUD[b.aptitud];
      if (r !== 0) return r;
    }
    if (grupoOrden(a) === 2) {
      const ta = ms(a.ocupacion.proximo?.programadoPara) ?? Infinity;
      const tb = ms(b.ocupacion.proximo?.programadoPara) ?? Infinity;
      if (ta !== tb) return ta < tb ? -1 : 1;
    }
    return a.placa.localeCompare(b.placa, "es", { numeric: true });
  });
}

export interface EntradaVehiculo {
  vehicleId: string;
  placa: string;
  estadoActual: string;
  conductores: string[];
  tienePreoperacionalHoy: boolean;
  /** Severidad de cada novedad ABIERTA o EN_PROCESO del vehículo. */
  severidadesNovedades: string[];
  /** Motivo de la solicitud de NO APTO pendiente; null si no hay. */
  motivoSolicitud: string | null;
  /** Servicios activos (PROGRAMADO/CURSO) del vehículo. */
  servicios: ServicioDelVehiculo[];
}

export function armarFila(v: EntradaVehiculo, ahora: number = Date.now()): FilaTablero {
  const novedades = resumirNovedades(v.severidadesNovedades);
  return {
    vehicleId: v.vehicleId,
    placa: v.placa,
    conductores: v.conductores,
    aptitud: estadoAptitud({
      estadoActual: v.estadoActual,
      solicitudPendiente: v.motivoSolicitud !== null,
      tienePreoperacionalHoy: v.tienePreoperacionalHoy,
      novedadesAbiertas: novedades.cantidad,
    }),
    novedades,
    motivoSolicitud: v.motivoSolicitud,
    ocupacion: ocupacionVehiculo(v.servicios, ahora),
  };
}

export function armarTablero(vehiculos: readonly EntradaVehiculo[], ahora: number = Date.now()): { filas: FilaTablero[]; contadores: ContadoresTablero } {
  const filas = ordenarTablero(vehiculos.map((v) => armarFila(v, ahora)));
  return { filas, contadores: contarTablero(filas) };
}

// ── Formato (hora de Colombia) ──────────────────────────────────────────────

/** "14:05" en hora de Colombia, 24 h; "—" si el valor falta o no es una fecha. */
export function horaCorta(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "America/Bogota" });
}

/** 45 → "45 min"; 135 → "2 h 15 min"; 120 → "2 h". */
export function formatearDuracion(minutos: number): string {
  const m = Math.max(0, Math.round(minutos));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const resto = m % 60;
  return resto === 0 ? `${h} h` : `${h} h ${resto} min`;
}
