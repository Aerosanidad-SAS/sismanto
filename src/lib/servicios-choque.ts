/**
 * Aviso de choque de horarios al programar un servicio: el mismo vehículo o la misma persona de la tripulación
 * con otro servicio abierto a la misma hora. Es un aviso que Regulación puede confirmar, no un bloqueo (SISRES no
 * bloqueaba): a veces el mismo carro hace dos servicios seguidos o la hora real se acomoda después.
 */

/** Dos servicios con menos de esta diferencia entre sus horas de programación se consideran en choque. */
export const VENTANA_CHOQUE_MIN = 60;

/** Solo chocan con servicios que aún no terminaron. */
export const ETAPAS_QUE_CHOCAN = ["PROGRAMADO", "CURSO"] as const;

export type RecursosServicio = {
  vehicle_id?: string | null;
  ovem_user_id?: string | null;
  medico_user_id?: string | null;
  auxiliar_user_id?: string | null;
};

export type ServicioEnChoque = {
  id: number;
  nombre_completo: string;
  fecha_hora_programacion: string;
  motivos: string[];
};

const ETIQUETAS: [keyof RecursosServicio, string][] = [
  ["vehicle_id", "el mismo vehículo"],
  ["ovem_user_id", "el mismo conductor"],
  ["medico_user_id", "el mismo médico"],
  ["auxiliar_user_id", "el mismo auxiliar"],
];

/** Intervalo [desde, hasta] (ISO) dentro del cual otro servicio choca con uno programado en `fechaIso`. */
export function ventanaChoque(fechaIso: string): { desde: string; hasta: string } | null {
  const t = Date.parse(fechaIso);
  if (Number.isNaN(t)) return null;
  const ms = VENTANA_CHOQUE_MIN * 60_000;
  return { desde: new Date(t - ms).toISOString(), hasta: new Date(t + ms).toISOString() };
}

/** Qué recursos comparten dos servicios (vacío si ninguno). Un recurso sin asignar nunca choca. */
export function motivosDeChoque(nuevo: RecursosServicio, otro: RecursosServicio): string[] {
  return ETIQUETAS.filter(([k]) => Boolean(nuevo[k]) && nuevo[k] === otro[k]).map(([, texto]) => texto);
}

/** Filtro `.or()` de PostgREST con los recursos asignados; null si no hay ninguno (no hay con qué chocar). */
export function filtroRecursos(r: RecursosServicio): string | null {
  const partes = ETIQUETAS.filter(([k]) => Boolean(r[k])).map(([k]) => `${k}.eq.${r[k]}`);
  return partes.length > 0 ? partes.join(",") : null;
}

/** Texto para el aviso: una línea por servicio en choque. */
export function textoChoque(lista: ServicioEnChoque[], aHora: (iso: string) => string): string[] {
  return lista.map((c) => `#${c.id} ${c.nombre_completo} · ${aHora(c.fecha_hora_programacion)} · comparte ${c.motivos.join(" y ")}`);
}
