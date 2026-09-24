/**
 * Reglas de integridad del ETL SISRES → SISMANTO que no dependen de la base
 * de datos, para poder probarlas sin Postgres. Las usa scripts/etl-sisres.ts.
 *
 * Motivo: en SISRES ni la placa de un equipo ni la cédula de un paciente son
 * únicas de verdad (no hay UNIQUE en MySQL; DB_MAP.md §3). SISMANTO sí las
 * exige únicas. Un `ON CONFLICT ... DO UPDATE` por esas columnas hace que la
 * segunda fila pise a la primera EN SILENCIO: se pierde un equipo o incluso a
 * otra persona. Acá la colisión se resuelve de forma explícita y queda escrita
 * en la bitácora del ETL (etl-avisos / etl-rechazos).
 */

export interface PlacaAsignada {
  placa: string;
  /** null si la placa original se conserva tal cual. */
  motivo: string | null;
}

/**
 * Da una placa única a cada equipo, sin perder ninguna fila.
 * - La primera fila (menor id) de una placa repetida conserva la placa original;
 *   las demás quedan como `<placa>-<id>` (el id de SISRES, estable y único).
 * - Sin placa → `SIN-PLACA-<id>`.
 * - Determinista: no depende del orden del CSV, así que re-ejecutar el ETL
 *   produce las mismas placas (idempotente).
 */
export function asignarPlacasUnicas(filas: { id: number; placa: string | null }[]): Map<number, PlacaAsignada> {
  const originales = new Set(filas.map((f) => f.placa).filter((p): p is string => Boolean(p)));
  const usadas = new Set<string>();
  const resultado = new Map<number, PlacaAsignada>();

  for (const f of [...filas].sort((a, b) => a.id - b.id)) {
    if (f.placa && !usadas.has(f.placa)) {
      usadas.add(f.placa);
      resultado.set(f.id, { placa: f.placa, motivo: null });
      continue;
    }
    const base = f.placa ? `${f.placa}-${f.id}` : `SIN-PLACA-${f.id}`;
    let candidata = base;
    // Que la placa generada no choque con una placa real de otro equipo ni con otra generada.
    for (let n = 2; usadas.has(candidata) || originales.has(candidata); n++) candidata = `${base}-${n}`;
    usadas.add(candidata);
    resultado.set(f.id, {
      placa: candidata,
      motivo: f.placa
        ? `placa "${f.placa}" repetida en SISRES (hay otro equipo con la misma placa): se cargó como "${candidata}"`
        : `equipo sin placa en SISRES: se cargó como "${candidata}"`,
    });
  }
  return resultado;
}

export interface CedulaDescartada<T> {
  fila: T;
  ganadora: T;
  /** true si parece la misma persona (mismo nombre y primer apellido); false = otra persona con la misma cédula. */
  mismaPersona: boolean;
}

/**
 * Una sola fila por cédula. Gana la más completa (regla de
 * sql/pacientes_duplicados_2_fusionar de SISRES); en empate, la de menor id.
 * Las filas sin cédula pasan sin tocar (el ETL las rechaza aparte).
 */
export function elegirPacientesUnicos<T>(
  filas: T[],
  opciones: {
    cedulaDe: (f: T) => string | null;
    idDe: (f: T) => number;
    completitud: (f: T) => number;
    mismaPersona: (a: T, b: T) => boolean;
  }
): { conservar: T[]; descartadas: CedulaDescartada<T>[] } {
  const grupos = new Map<string, T[]>();
  for (const f of filas) {
    const c = opciones.cedulaDe(f);
    if (!c) continue;
    const g = grupos.get(c);
    if (g) g.push(f);
    else grupos.set(c, [f]);
  }

  const descartadas: CedulaDescartada<T>[] = [];
  const descartadasSet = new Set<T>();
  for (const g of grupos.values()) {
    if (g.length < 2) continue;
    const ganadora = [...g].sort(
      (a, b) => opciones.completitud(b) - opciones.completitud(a) || opciones.idDe(a) - opciones.idDe(b)
    )[0];
    for (const f of g) {
      if (f === ganadora) continue;
      descartadasSet.add(f);
      descartadas.push({ fila: f, ganadora, mismaPersona: opciones.mismaPersona(f, ganadora) });
    }
  }
  return { conservar: filas.filter((f) => !descartadasSet.has(f)), descartadas };
}
