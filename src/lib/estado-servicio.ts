/**
 * Estados operativos de un servicio médico: los pasos que marca la
 * tripulación desde "Mis servicios" y el estado que ve Regulación en su
 * tablero. Una sola fuente para las dos pantallas.
 *
 * Cada paso graba un timestamp que ya existe en medical_services (y que
 * calcularTiempos() usa para facturar): el estado se deriva de cuáles están
 * marcados, sin columna de estado propia. La etapa de SISRES (PROGRAMADO /
 * CURSO / FINALIZADO / cierres) sigue por debajo porque de ella dependen las
 * plantillas de WhatsApp y los datos migrados.
 *
 * Flujos confirmados por Daniel (2026-09-21):
 *   Ambulancia sencillo  A → B
 *   Ambulancia doble     A → B (punto intermedio) → A
 *   Traslado aéreo       A → aeropuerto (punto intermedio) → B
 *   Domiciliaria         el médico o auxiliar va al domicilio y atiende
 *   Telemedicina         sin desplazamiento: solo cambio de etapa
 */
import { perfilFormularioServicio } from "@/lib/validations";

export const CAMPOS_PASO_SERVICIO = [
  "fecha_hora_inicio_desplazamiento",
  "fecha_hora_llegada_origen",
  "fecha_hora_salida_origen",
  "fecha_hora_llegada_intermedia",
  "fecha_hora_salida_intermedia",
  "fecha_hora_llegada_destino",
  "fecha_hora_salida_destino",
] as const;
export type CampoPasoServicio = (typeof CAMPOS_PASO_SERVICIO)[number];

export interface PasoServicio {
  campo: CampoPasoServicio;
  /** Nombre corto del hito, para la línea de tiempo. */
  hito: string;
  /** Texto del botón con el que la tripulación marca el paso. */
  accion: string;
  /** Estado del servicio una vez marcado el paso. */
  estado: string;
  etapaDestino?: "CURSO" | "FINALIZADO";
}

export type ModalidadTraslado = "SENCILLO" | "DOBLE" | "AEREO";

const TIPOS_DOBLE = ["TAB DOBLE", "TAM DOBLE"];
const TIPOS_AEREO = ["TRASLADO AEREO"];

export function modalidadTraslado(tipoServicio: string): ModalidadTraslado | null {
  if (perfilFormularioServicio(tipoServicio) !== "TRASLADO") return null;
  if (TIPOS_DOBLE.includes(tipoServicio)) return "DOBLE";
  if (TIPOS_AEREO.includes(tipoServicio)) return "AEREO";
  return "SENCILLO";
}

const INICIO: PasoServicio = {
  campo: "fecha_hora_inicio_desplazamiento",
  hito: "Inicio de desplazamiento",
  accion: "Inicio de desplazamiento",
  estado: "En desplazamiento",
  etapaDestino: "CURSO",
};

const RECOGIDA: PasoServicio[] = [
  { campo: "fecha_hora_llegada_origen", hito: "Llegada a sitio", accion: "Llegada a sitio", estado: "En sitio" },
  { campo: "fecha_hora_salida_origen", hito: "Salida con paciente", accion: "Salida con paciente", estado: "En traslado" },
];

const FIN_TRASLADO: PasoServicio = {
  campo: "fecha_hora_salida_destino",
  hito: "Paciente entregado",
  accion: "Paciente entregado",
  estado: "Finalizado",
  etapaDestino: "FINALIZADO",
};

const PASOS_SENCILLO: PasoServicio[] = [
  INICIO,
  ...RECOGIDA,
  { campo: "fecha_hora_llegada_destino", hito: "Llegada a destino", accion: "Llegada a destino", estado: "En destino" },
  FIN_TRASLADO,
];

const PASOS_DOBLE: PasoServicio[] = [
  INICIO,
  ...RECOGIDA,
  { campo: "fecha_hora_llegada_intermedia", hito: "Llegada a punto intermedio", accion: "Llegada a punto intermedio", estado: "En punto intermedio" },
  { campo: "fecha_hora_salida_intermedia", hito: "Salida de regreso", accion: "Salida de regreso", estado: "Retorno a origen" },
  { campo: "fecha_hora_llegada_destino", hito: "Llegada a origen", accion: "Llegada a origen", estado: "De vuelta en origen" },
  FIN_TRASLADO,
];

const PASOS_AEREO: PasoServicio[] = [
  INICIO,
  ...RECOGIDA,
  { campo: "fecha_hora_llegada_intermedia", hito: "Llegada a aeropuerto", accion: "Llegada a aeropuerto", estado: "En aeropuerto" },
  { campo: "fecha_hora_salida_intermedia", hito: "Salida de aeropuerto", accion: "Salida de aeropuerto", estado: "En traslado a destino" },
  { campo: "fecha_hora_llegada_destino", hito: "Llegada a destino", accion: "Llegada a destino", estado: "En destino" },
  FIN_TRASLADO,
];

// Domiciliaria no tiene "origen": la tripulación va directo al domicilio, y
// llegada + inicio de atención son un solo paso (una sola "HORA ATENCIÓN" en
// el listado real de Regulación).
const PASOS_DOMICILIARIA: PasoServicio[] = [
  INICIO,
  { campo: "fecha_hora_llegada_destino", hito: "Inicio de atención", accion: "Inicio de atención", estado: "En atención" },
  {
    campo: "fecha_hora_salida_destino",
    hito: "Fin de atención",
    accion: "Fin de atención",
    estado: "Finalizado",
    etapaDestino: "FINALIZADO",
  },
];

/** Pasos que marca la tripulación según el tipo de servicio; vacío en telemedicina. */
export function pasosPorTipo(tipoServicio: string): PasoServicio[] {
  const modalidad = modalidadTraslado(tipoServicio);
  if (modalidad === "DOBLE") return PASOS_DOBLE;
  if (modalidad === "AEREO") return PASOS_AEREO;
  if (modalidad === "SENCILLO") return PASOS_SENCILLO;
  if (perfilFormularioServicio(tipoServicio) === "MEDICINA_DOMICILIARIA") return PASOS_DOMICILIARIA;
  return [];
}

// ── Estado que ve Regulación ───────────────────────────────────────────────

export type TonoEstado = "pendiente" | "asignado" | "en_curso" | "finalizado" | "cerrado";

export interface EstadoOperativo {
  etiqueta: string;
  tono: TonoEstado;
  /** true mientras el servicio sigue abierto (ni finalizado ni cerrado). */
  activo: boolean;
}

export interface ServicioParaEstado {
  etapa: string;
  tipo_servicio: string;
  vehicle_id?: string | null;
  ovem_user_id?: string | null;
  medico_user_id?: string | null;
  auxiliar_user_id?: string | null;
  fecha_hora_programacion?: string | null;
  [campo: string]: unknown;
}

const ETIQUETA_CIERRE: Record<string, string> = {
  CANCELADO: "Cancelado",
  FALLIDO: "Fallido",
  "NO EFECTIVO": "No efectivo",
  DUPLICADO: "Duplicado",
};

/** Tiene vehículo o alguien de la tripulación asignado. */
export function tieneAsignacion(s: ServicioParaEstado): boolean {
  return Boolean(s.vehicle_id || s.ovem_user_id || s.medico_user_id || s.auxiliar_user_id);
}

export function estadoOperativo(s: ServicioParaEstado): EstadoOperativo {
  if (s.etapa === "FINALIZADO") return { etiqueta: "Finalizado", tono: "finalizado", activo: false };
  if (ETIQUETA_CIERRE[s.etapa]) return { etiqueta: ETIQUETA_CIERRE[s.etapa], tono: "cerrado", activo: false };

  const pasos = pasosPorTipo(s.tipo_servicio);
  let ultimo: PasoServicio | undefined;
  for (const p of pasos) if (s[p.campo]) ultimo = p;

  if (ultimo) {
    // Último paso marcado pero la etapa no se movió (edición manual, dato
    // migrado): Regulación debe cerrarlo, no darlo por finalizado.
    if (ultimo.etapaDestino === "FINALIZADO") return { etiqueta: "Pendiente de cierre", tono: "en_curso", activo: true };
    return { etiqueta: ultimo.estado, tono: "en_curso", activo: true };
  }
  if (s.etapa === "CURSO") {
    return { etiqueta: pasos.length === 0 ? "En atención" : "En curso", tono: "en_curso", activo: true };
  }
  return tieneAsignacion(s)
    ? { etiqueta: "Asignado", tono: "asignado", activo: true }
    : { etiqueta: "Programado", tono: "pendiente", activo: true };
}

/**
 * Minutos de retraso para llegar a recoger: la hora programada ya pasó y la
 * tripulación todavía no marca la llegada (al sitio en ambulancia, al
 * domicilio en domiciliaria). null si no aplica o no hay retraso.
 */
export function minutosDeRetraso(s: ServicioParaEstado, ahora: number = Date.now()): number | null {
  if (!s.fecha_hora_programacion || !estadoOperativo(s).activo) return null;
  const pasos = pasosPorTipo(s.tipo_servicio);
  const llegada =
    pasos.find((p) => p.campo === "fecha_hora_llegada_origen") ??
    pasos.find((p) => p.campo === "fecha_hora_llegada_destino");
  if (!llegada || s[llegada.campo]) return null;
  const programada = new Date(s.fecha_hora_programacion).getTime();
  if (Number.isNaN(programada)) return null;
  const minutos = Math.floor((ahora - programada) / 60000);
  return minutos > 0 ? minutos : null;
}
