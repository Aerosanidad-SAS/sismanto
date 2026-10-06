/**
 * Clasificación del preoperacional de hoy para Regulación/Coordinación (lógica pura, sin base de datos).
 *
 * Reglas:
 *  - «Se espera que opere» = OPERATIVO y programado hoy; en un centro sin programación, OPERATIVO con tripulación.
 *  - Un vehículo que hizo el preoperacional hoy y por eso quedó FUERA DE SERVICIO (falla crítica) SIGUE contando: antes
 *    salía de «esperados» y la tarjeta decía «todos hechos y sin fallas» justo cuando había un crítico.
 *  - El conductor que se muestra en «pendientes» sale de la programación del día (migración 108) y, si no hay,
 *    de la tripulación asignada (vehicle_assignments).
 */

export interface VehiculoFlota {
  id: string;
  placa: string;
  estado_actual: string;
  centro_operativo: string | null;
  /** Nombre del OVEM según vehicle_assignments (respaldo). */
  ovemAsignado: string | null;
  /** Tiene tripulación en vehicle_assignments (criterio del centro que aún no programa). */
  tieneTripulacion: boolean;
}

export interface CheckHoy {
  vehicle_id: string;
  checklist_ok: boolean;
}

export interface FilaPreoperacionalHoy {
  placa: string;
  ovem: string | null;
  /** Quedó FUERA DE SERVICIO (p. ej. por una falla crítica de este mismo preoperacional). */
  fueraDeServicio: boolean;
}

export interface ClasificacionPreoperacional {
  esperados: number;
  realizados: number;
  pendientes: FilaPreoperacionalHoy[];
  conFalla: FilaPreoperacionalHoy[];
}

/** Vehículos que podrían operar hoy según programación o tripulación, sin mirar todavía su estado. */
export function candidatosDeHoy(flota: VehiculoFlota[], idsProgramados: Set<string>): VehiculoFlota[] {
  // El respaldo se decide POR CENTRO: un centro que ya programó hoy usa solo su programación.
  const centrosConProgramacion = new Set(flota.filter((v) => idsProgramados.has(v.id)).map((v) => v.centro_operativo));
  return flota.filter((v) => (centrosConProgramacion.has(v.centro_operativo) ? idsProgramados.has(v.id) : v.tieneTripulacion));
}

export function clasificarPreoperacionalHoy(
  candidatos: VehiculoFlota[],
  checks: CheckHoy[],
  conductoresProgramados: Map<string, string[]>
): ClasificacionPreoperacional {
  // Varios OVEM pueden hacerlo el mismo día (turnos): el vehículo cuenta con falla si CUALQUIERA trae falla.
  const porVehiculo = new Map<string, boolean>();
  for (const c of checks) porVehiculo.set(c.vehicle_id, (porVehiculo.get(c.vehicle_id) ?? true) && c.checklist_ok);

  const esperados = candidatos.filter((v) => v.estado_actual === "OPERATIVO" || porVehiculo.has(v.id));

  const pendientes: FilaPreoperacionalHoy[] = [];
  const conFalla: FilaPreoperacionalHoy[] = [];
  for (const v of esperados) {
    const programados = conductoresProgramados.get(v.id) ?? [];
    const ovem = programados.length > 0 ? programados.join(" / ") : v.ovemAsignado;
    const fila = { placa: v.placa, ovem, fueraDeServicio: v.estado_actual !== "OPERATIVO" };
    if (!porVehiculo.has(v.id)) pendientes.push(fila);
    else if (porVehiculo.get(v.id) === false) conFalla.push(fila);
  }
  return { esperados: esperados.length, realizados: esperados.length - pendientes.length, pendientes, conFalla };
}
