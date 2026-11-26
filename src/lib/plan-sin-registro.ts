// Ítems del plan de mantenimiento que le aplican a un vehículo pero aún no tienen un «último mantenimiento» registrado.
// La vista `vehicle_maintenance_alerts` (migración 012) solo da fila cuando existe ese registro, así que sin esto un
// vehículo nuevo nunca muestra su plan ni dispara avisos: no habría desde dónde registrar el primero.

export interface ItemPlanMinimo {
  id: number;
  aplica_a: string;
}

/** Misma regla de aplicabilidad de la vista: TODOS, el centro operativo del vehículo o su placa. */
export function itemsSinPrimerRegistro<T extends ItemPlanMinimo>(
  items: T[],
  vehiculo: { placa: string; centro_operativo: string | null },
  idsConAlerta: number[]
): T[] {
  const conAlerta = new Set(idsConAlerta);
  return items.filter(
    (it) =>
      !conAlerta.has(it.id) &&
      (it.aplica_a === "TODOS" || it.aplica_a === vehiculo.centro_operativo || it.aplica_a === vehiculo.placa)
  );
}

/**
 * Mensaje de error si a un cumplimiento le falta el kilometraje; null si está completo. En un ítem por kilómetros la
 * vista deja «al día» para siempre un registro sin km: nunca avisaría.
 */
export function errorKmCumplimiento(intervaloKm: number, kmRealizado: number | null | undefined): string | null {
  return intervaloKm > 0 && kmRealizado == null
    ? "Escribe el kilometraje con el que se hizo: sin él este ítem nunca avisaría."
    : null;
}
