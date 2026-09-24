// Cálculo de los indicadores de soporte técnico (portado de reportesTickets.php y
// horarioLaboralHelper.php de SISRES). Funciones puras: sin base de datos, para
// poder probarlas con datos inventados.
//
// Los tiempos se miden en HORAS LABORALES: solo cuentan los días y el rango de
// horas configurados en ticket_config, en hora de Colombia (UTC-5, sin horario
// de verano — mismo criterio que src/lib/hora-colombia.ts).

const MS_MINUTO = 60_000;
const MS_DIA = 24 * 60 * MS_MINUTO;
const DESPLAZAMIENTO_MS = -5 * 60 * MS_MINUTO;

export interface HorarioLaboral {
  /** Días ISO: 1 = lunes … 7 = domingo. */
  dias: number[];
  /** "HH:MM" o "HH:MM:SS". */
  inicio: string;
  fin: string;
}

function minutosDelDia(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Minutos laborales transcurridos entre dos instantes. 0 si fin <= inicio. */
export function minutosLaboralesEntre(desde: Date, hasta: Date, horario: HorarioLaboral): number {
  const a = desde.getTime() + DESPLAZAMIENTO_MS; // "reloj de pared" de Bogotá guardado como UTC
  const b = hasta.getTime() + DESPLAZAMIENTO_MS;
  if (!(b > a)) return 0;

  const iniMin = minutosDelDia(horario.inicio);
  const finMin = minutosDelDia(horario.fin);
  if (finMin <= iniMin) return 0;

  let total = 0;
  for (let dia = Math.floor(a / MS_DIA) * MS_DIA; dia <= b; dia += MS_DIA) {
    const jsDia = new Date(dia).getUTCDay(); // 0 = domingo
    const isoDia = jsDia === 0 ? 7 : jsDia;
    if (!horario.dias.includes(isoDia)) continue;
    const ventanaIni = Math.max(dia + iniMin * MS_MINUTO, a);
    const ventanaFin = Math.min(dia + finMin * MS_MINUTO, b);
    if (ventanaFin > ventanaIni) total += (ventanaFin - ventanaIni) / MS_MINUTO;
  }
  return total;
}

export interface TicketParaIndicadores {
  id: number;
  categoria: string;
  area: string;
  prioridad: string;
  estado: string;
  nombre_tecnico: string | null;
  created_at: string;
  fecha_primer_contacto: string | null;
  fecha_cierre: string | null;
}

export interface ConfigSla {
  sla_baja_horas: number;
  sla_media_horas: number;
  sla_alta_horas: number;
  sla_urgente_horas: number;
}

export interface DisponibilidadMes {
  anio: number;
  mes: number;
  porcentaje: number;
}

export interface Indicadores {
  totalTickets: number;
  cerrados: number;
  /** Promedio de minutos laborales entre la creación y el primer contacto. */
  respuestaPromedioMin: number | null;
  /** % de tickets cerrados que no se reabrieron nunca (resueltos a la primera). */
  fcrPorcentaje: number | null;
  /** % de tickets con primer contacto dentro del SLA de su prioridad. */
  slaPorcentaje: number | null;
  slaEvaluados: number;
  /** Promedio de minutos laborales entre la creación y el cierre. */
  mttrPromedioMin: number | null;
  disponibilidadPromedio: number | null;
  disponibilidadMeses: number;
  /** Aproximación: días promedio entre tickets consecutivos de la misma categoría y área. */
  mtbf: { categoria: string; area: string; tickets: number; diasPromedio: number }[];
  cerradosPorTecnico: { tecnico: string; cerrados: number }[];
}

const promedio = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);

function horasSla(prioridad: string, sla: ConfigSla): number | null {
  switch (prioridad) {
    case "BAJA": return sla.sla_baja_horas;
    case "MEDIA": return sla.sla_media_horas;
    case "ALTA": return sla.sla_alta_horas;
    case "URGENTE": return sla.sla_urgente_horas;
    default: return null;
  }
}

export function calcularIndicadores(
  tickets: TicketParaIndicadores[],
  idsReabiertos: ReadonlySet<number>,
  horario: HorarioLaboral,
  sla: ConfigSla,
  disponibilidad: DisponibilidadMes[],
): Indicadores {
  const respuestas: number[] = [];
  const dentroSla: boolean[] = [];
  const resolucion: number[] = [];
  const porTecnico = new Map<string, number>();
  const cerrados = tickets.filter((t) => t.estado === "CERRADO" && t.fecha_cierre);

  for (const t of tickets) {
    if (t.fecha_primer_contacto) {
      const min = minutosLaboralesEntre(new Date(t.created_at), new Date(t.fecha_primer_contacto), horario);
      respuestas.push(min);
      const limite = horasSla(t.prioridad, sla);
      if (limite !== null) dentroSla.push(min <= limite * 60);
    }
  }
  for (const t of cerrados) {
    resolucion.push(minutosLaboralesEntre(new Date(t.created_at), new Date(t.fecha_cierre as string), horario));
    const tec = t.nombre_tecnico ?? "Sin técnico";
    porTecnico.set(tec, (porTecnico.get(tec) ?? 0) + 1);
  }

  // MTBF aproximado: separación entre las fechas de creación de tickets consecutivos del mismo par.
  const grupos = new Map<string, { categoria: string; area: string; fechas: number[] }>();
  for (const t of tickets) {
    const clave = `${t.categoria}\u0000${t.area}`;
    const g = grupos.get(clave) ?? { categoria: t.categoria, area: t.area, fechas: [] };
    g.fechas.push(new Date(t.created_at).getTime());
    grupos.set(clave, g);
  }
  const mtbf = [...grupos.values()]
    .filter((g) => g.fechas.length >= 2)
    .map((g) => {
      const f = [...g.fechas].sort((x, y) => x - y);
      const huecos = f.slice(1).map((x, i) => (x - f[i]) / MS_DIA);
      return { categoria: g.categoria, area: g.area, tickets: f.length, diasPromedio: promedio(huecos) as number };
    })
    .sort((x, y) => x.diasPromedio - y.diasPromedio);

  const pctDentro = dentroSla.length ? (dentroSla.filter(Boolean).length / dentroSla.length) * 100 : null;
  const fcr = cerrados.length ? (cerrados.filter((t) => !idsReabiertos.has(t.id)).length / cerrados.length) * 100 : null;

  return {
    totalTickets: tickets.length,
    cerrados: cerrados.length,
    respuestaPromedioMin: promedio(respuestas),
    fcrPorcentaje: fcr,
    slaPorcentaje: pctDentro,
    slaEvaluados: dentroSla.length,
    mttrPromedioMin: promedio(resolucion),
    disponibilidadPromedio: promedio(disponibilidad.map((d) => d.porcentaje)),
    disponibilidadMeses: disponibilidad.length,
    mtbf,
    cerradosPorTecnico: [...porTecnico.entries()].map(([tecnico, n]) => ({ tecnico, cerrados: n })).sort((x, y) => y.cerrados - x.cerrados),
  };
}

/** "3 h 20 min" / "45 min" / "—". */
export function formatoDuracion(min: number | null): string {
  if (min === null) return "—";
  const total = Math.round(min);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
