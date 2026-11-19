/**
 * Avisos de la Sala de control: compara los servicios entre un refresco y el siguiente y dice qué cambió (toast + sonido).
 * Puro, para poder probarlo; lo usa `components/servicios/avisos-servicios.tsx`. Cada refresco ya trae los datos
 * (BarraTablero refresca cada 30 s), así que no hay otra consulta.
 */
import { pasosPorTipo, type ServicioParaEstado } from "@/lib/estado-servicio";
import { clasificarServicio, type EstadoSala } from "@/lib/servicios-sala";

/** Lo mínimo de cada servicio visible que viaja al cliente para compararlo. */
export interface EstadoParaAvisos {
  /** Etiqueta operativa («En sitio», «Asignado»…). */
  etiqueta: string;
  clase: EstadoSala;
  placa: string | null;
  /** Instante (ISO) del último paso marcado por la tripulación; null si no hay. */
  hitoAt: string | null;
}

export type SonidoSala = "estado" | "nuevo" | "retraso";

export interface EventoSala {
  id: string;
  titulo: string;
  detalle: string;
  tono: "info" | "warning";
  sonido: SonidoSala;
}

export function estadoParaAvisos(s: ServicioParaEstado & { placa?: string | null }, ahora: number = Date.now()): EstadoParaAvisos {
  const c = clasificarServicio(s, ahora);
  let hitoAt: string | null = null;
  for (const p of pasosPorTipo(s.tipo_servicio)) {
    const v = s[p.campo];
    if (typeof v === "string" && v) hitoAt = v;
  }
  return { etiqueta: c.etiqueta, clase: c.estado, placa: s.placa ?? null, hitoAt };
}

/** Prioridad al elegir un solo sonido cuando llegan varios eventos juntos. */
const PRIORIDAD: Record<SonidoSala, number> = { retraso: 3, nuevo: 2, estado: 1 };

export function sonidoMasUrgente(eventos: readonly EventoSala[]): SonidoSala | null {
  return eventos.reduce<SonidoSala | null>((m, e) => (m === null || PRIORIDAD[e.sonido] > PRIORIDAD[m] ? e.sonido : m), null);
}

const CIERRES: readonly EstadoSala[] = ["finalizado", "cancelado"];

/**
 * Eventos entre dos fotos de los servicios (id → estado). `hora` formatea un ISO a «hh:mm» (inyectada para probar sin zona).
 * - Servicio que aparece: «Servicio nuevo» (si llega sin asignar, lo dice).
 * - Servicio que cambia de estado: «#id pasó a "X"» con la placa y la hora a la que se marcó.
 * - Servicio que queda sin asignar o que pasa a retrasado: aviso de advertencia.
 */
export function detectarEventos(
  previos: Record<number, EstadoParaAvisos>,
  actuales: Record<number, EstadoParaAvisos>,
  hora: (iso: string | null) => string
): EventoSala[] {
  const eventos: EventoSala[] = [];
  for (const [clave, ahora] of Object.entries(actuales)) {
    const id = Number(clave);
    const antes = previos[id];
    const quien = ahora.placa ?? "Sin vehículo";
    if (!antes) {
      // Un servicio que aparece ya cerrado (se cargó y se cerró entre refrescos) no es una novedad para el despacho.
      if (CIERRES.includes(ahora.clase)) continue;
      eventos.push({
        id: `nuevo_${id}`,
        titulo: ahora.clase === "sinasignar" ? `Servicio nuevo sin asignar #${id}` : `Servicio nuevo #${id}`,
        detalle: ahora.clase === "sinasignar" ? "Necesita vehículo" : `${quien} · ${ahora.etiqueta}`,
        tono: ahora.clase === "sinasignar" ? "warning" : "info",
        sonido: "nuevo",
      });
      continue;
    }
    if (antes.clase !== "sinasignar" && ahora.clase === "sinasignar") {
      eventos.push({ id: `sinasignar_${id}`, titulo: `#${id} quedó sin vehículo`, detalle: "Necesita asignación", tono: "warning", sonido: "nuevo" });
    } else if (antes.etiqueta !== ahora.etiqueta) {
      eventos.push({
        id: `estado_${id}_${ahora.etiqueta}`,
        titulo: `#${id} pasó a «${ahora.etiqueta}»`,
        detalle: `${quien} · actualizado a las ${hora(ahora.hitoAt)}`,
        tono: "info",
        sonido: "estado",
      });
    }
    if (antes.clase !== "retrasado" && ahora.clase === "retrasado") {
      eventos.push({
        id: `retraso_${id}`,
        titulo: `#${id} pasó su hora de recogida`,
        detalle: `${quien} sigue en «${ahora.etiqueta}» sin llegar al sitio`,
        tono: "warning",
        sonido: "retraso",
      });
    }
  }
  return eventos;
}
