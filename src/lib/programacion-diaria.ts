// Reglas puras de la programación diaria (migración 108): sin base de datos, para poder probarlas.

/** Cada vehículo tiene 1 o máximo 2 conductores titulares. */
export const MAX_CONDUCTORES_POR_VEHICULO = 2;

/** Mensaje de error si la lista de conductores no es válida para un vehículo; null si lo es. */
export function validarConductores(userIds: string[]): string | null {
  if (userIds.length === 0) return "Un vehículo necesita al menos un conductor.";
  if (userIds.length > MAX_CONDUCTORES_POR_VEHICULO) return "Un vehículo admite máximo " + MAX_CONDUCTORES_POR_VEHICULO + " conductores.";
  if (new Set(userIds).size !== userIds.length) return "El mismo conductor no puede repetirse en el vehículo.";
  return null;
}

export interface FilaOperacion {
  fecha: string;
  vehicle_id: string;
  user_id: string;
  origen: "TITULAR" | "CAMBIO_DEL_DIA";
}

export interface TitularVigente {
  vehicle_id: string;
  user_id: string;
  posicion: number;
}

export interface ResumenVehiculoDia {
  vehicleId: string;
  /** Quién opera ese día (lo registrado). */
  operadores: string[];
  /** Titulares vigentes, en orden de posición. */
  titulares: string[];
  /** true si lo registrado no coincide con los titulares: hubo un cambio del día. */
  difiereDeTitulares: boolean;
}

/** Une titulares y lo registrado del día por vehículo (vista por vehículo). */
export function resumenPorVehiculo(vehicleIds: string[], titulares: TitularVigente[], operacion: FilaOperacion[]): ResumenVehiculoDia[] {
  return vehicleIds.map((vehicleId) => {
    const tit = titulares.filter((t) => t.vehicle_id === vehicleId).sort((a, b) => a.posicion - b.posicion).map((t) => t.user_id);
    const ops = operacion.filter((o) => o.vehicle_id === vehicleId).map((o) => o.user_id);
    const igual = tit.length === ops.length && tit.every((id) => ops.includes(id));
    return { vehicleId, operadores: ops, titulares: tit, difiereDeTitulares: ops.length > 0 && !igual };
  });
}

/** Vehículos por conductor en el día (vista por conductor: la otra dirección de la misma información). */
export function vehiculosPorConductor(operacion: FilaOperacion[]): Map<string, string[]> {
  const mapa = new Map<string, string[]>();
  for (const o of operacion) {
    const lista = mapa.get(o.user_id) ?? [];
    if (!lista.includes(o.vehicle_id)) lista.push(o.vehicle_id);
    mapa.set(o.user_id, lista);
  }
  return mapa;
}

/** Conductores asignados a más de un vehículo el mismo día: se avisa, no se bloquea (la operación manda). */
export function conductoresEnVariosVehiculos(operacion: FilaOperacion[]): string[] {
  const out: string[] = [];
  vehiculosPorConductor(operacion).forEach((vehiculos, userId) => { if (vehiculos.length > 1) out.push(userId); });
  return out;
}
