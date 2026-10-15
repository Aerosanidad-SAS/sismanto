// Turno de un servicio según su hora de programación: de 6:00 a 17:59 es diurno y el resto nocturno (revisión inicial,
// 2026-10-15). Puro y sin zona horaria: la hora es la que escribió quien programa, en hora de Colombia.

/** `valor` es el de DateTimeField: `yyyy-MM-ddTHH:mm`. null si todavía no es una fecha con hora completa. */
export function turnoPorFechaHora(valor: string | null | undefined): "DIA" | "NOCHE" | null {
  const m = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.exec((valor ?? "").trim());
  if (!m) return null;
  const hora = Number(m[1]);
  return hora >= 6 && hora < 18 ? "DIA" : "NOCHE";
}

/**
 * Ordena los móviles con los libres primero y, dentro de cada grupo, por placa. Un móvil está ocupado si tiene un servicio
 * en curso. No modifica la lista recibida.
 */
export function movilesPorDisponibilidad<T extends { id: string; placa: string }>(
  moviles: readonly T[],
  ocupados: ReadonlySet<string>
): T[] {
  return [...moviles].sort(
    (a, b) => Number(ocupados.has(a.id)) - Number(ocupados.has(b.id)) || a.placa.localeCompare(b.placa, "es")
  );
}
