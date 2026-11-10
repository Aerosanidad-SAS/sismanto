/**
 * Estado de cada servicio en la tabla «Servicios del día» de la Sala de control, y sus filtros. Puro (sin base de datos)
 * para poder probarlo; lo pinta `components/regulacion/servicios-del-dia.tsx`.
 */
import { estadoOperativo, minutosDeRetraso, type ServicioParaEstado } from "@/lib/estado-servicio";

export type EstadoSala = "sinasignar" | "asignado" | "encurso" | "retrasado" | "finalizado" | "cancelado";
export type FiltroServicios = "abiertos" | EstadoSala | "todos";

export const FILTROS_SERVICIOS: { clave: FiltroServicios; etiqueta: string }[] = [
  { clave: "abiertos", etiqueta: "Abiertos" },
  { clave: "sinasignar", etiqueta: "Sin asignar" },
  { clave: "asignado", etiqueta: "Asignados" },
  { clave: "encurso", etiqueta: "En curso" },
  { clave: "retrasado", etiqueta: "Retrasados" },
  { clave: "finalizado", etiqueta: "Finalizados" },
  { clave: "cancelado", etiqueta: "Cancelados" },
  { clave: "todos", etiqueta: "Todos hoy" },
];

const ABIERTOS: readonly EstadoSala[] = ["sinasignar", "asignado", "encurso", "retrasado"];

export interface ClasificacionSala {
  estado: EstadoSala;
  /** Etiqueta operativa del paso («En sitio», «Cancelado», «Programado»…). */
  etiqueta: string;
  /** Minutos de retraso contra la hora de recogida; null si no hay. */
  retraso: number | null;
}

/**
 * Sin asignar y finalizado/cancelado mandan sobre el retraso: un servicio sin vehículo ya es la urgencia. «Retrasado» es
 * asignado o en curso que pasó su hora de recogida sin que la tripulación llegara al sitio.
 */
export function clasificarServicio(s: ServicioParaEstado, ahora: number = Date.now()): ClasificacionSala {
  const op = estadoOperativo(s);
  const retraso = minutosDeRetraso(s, ahora);
  let estado: EstadoSala;
  if (op.tono === "finalizado") estado = "finalizado";
  else if (op.tono === "cerrado") estado = "cancelado";
  else if (op.tono === "pendiente") estado = "sinasignar";
  else if (retraso !== null) estado = "retrasado";
  else estado = op.tono === "en_curso" ? "encurso" : "asignado";
  return { estado, etiqueta: op.etiqueta, retraso };
}

export function esAbierto(e: EstadoSala): boolean {
  return ABIERTOS.includes(e);
}

export function contarServicios(estados: readonly EstadoSala[]): Record<FiltroServicios, number> {
  const c: Record<FiltroServicios, number> = {
    abiertos: 0,
    sinasignar: 0,
    asignado: 0,
    encurso: 0,
    retrasado: 0,
    finalizado: 0,
    cancelado: 0,
    todos: estados.length,
  };
  for (const e of estados) {
    c[e]++;
    if (esAbierto(e)) c.abiertos++;
  }
  return c;
}

export function coincideFiltro(e: EstadoSala, filtro: FiltroServicios): boolean {
  if (filtro === "todos") return true;
  if (filtro === "abiertos") return esAbierto(e);
  return e === filtro;
}

/** «Sin asignar» y «Retrasados» arriba; el resto por hora de recogida (los sin hora, al final). */
export function ordenarServicios<T extends { estado: EstadoSala; programadoPara: string | null }>(filas: readonly T[]): T[] {
  const fijo = (e: EstadoSala) => (e === "sinasignar" || e === "retrasado" ? 0 : 1);
  const t = (f: T) => {
    const v = f.programadoPara ? new Date(f.programadoPara).getTime() : NaN;
    return Number.isNaN(v) ? Infinity : v;
  };
  return [...filas].sort((a, b) => fijo(a.estado) - fijo(b.estado) || t(a) - t(b));
}

const ORDINAL = (n: number) => `${n}.º`;

/**
 * «Cola del vehículo · 1.º de 3» para los servicios asignados (aún sin arrancar) de un mismo vehículo, por hora de recogida.
 * Solo se rotula cuando el vehículo tiene dos o más. Devuelve el rótulo por id de servicio.
 */
export function rotulosDeCola(
  filas: readonly { id: number; placa: string | null; estado: EstadoSala; programadoPara: string | null }[]
): Map<number, string> {
  const porPlaca = new Map<string, typeof filas[number][]>();
  for (const f of filas) {
    if (!f.placa || f.estado !== "asignado") continue;
    porPlaca.set(f.placa, [...(porPlaca.get(f.placa) ?? []), f]);
  }
  const rotulos = new Map<number, string>();
  for (const lista of porPlaca.values()) {
    if (lista.length < 2) continue;
    ordenarServicios(lista).forEach((f, i) => rotulos.set(f.id, `Cola del vehículo · ${ORDINAL(i + 1)} de ${lista.length}`));
  }
  return rotulos;
}
