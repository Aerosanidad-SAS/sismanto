const ZONA_BOGOTA = "America/Bogota";

/** Fecha YYYY-MM-DD en hora de Colombia (el servidor corre en UTC). */
export function fechaBogota(fecha: Date | string): string {
  return new Date(fecha).toLocaleDateString("en-CA", { timeZone: ZONA_BOGOTA });
}

/** Días calendario entre hoy y la fecha (negativo si ya pasó). Ambas en YYYY-MM-DD. */
export function diasHasta(fecha: string, hoy: string): number {
  return Math.round((Date.parse(`${fecha.slice(0, 10)}T00:00:00Z`) - Date.parse(`${hoy}T00:00:00Z`)) / 86400000);
}

export type DocumentoVehiculo = "SOAT" | "Técnico-mecánica" | "Pase aeroportuario";

export interface VehiculoConDocumentos {
  vencimiento_soat?: string | null;
  vencimiento_rtm?: string | null;
  vencimiento_tecnicomecanica?: string | null;
  fecha_pase_aeroportuario?: string | null;
}

/** Los tres documentos que se vigilan, con la misma precedencia que el tablero de Regulación. */
export function documentosVehiculo(v: VehiculoConDocumentos): [DocumentoVehiculo, string | null][] {
  return [
    ["SOAT", v.vencimiento_soat ?? null],
    ["Técnico-mecánica", v.vencimiento_tecnicomecanica || v.vencimiento_rtm || null],
    ["Pase aeroportuario", v.fecha_pase_aeroportuario ?? null],
  ];
}
