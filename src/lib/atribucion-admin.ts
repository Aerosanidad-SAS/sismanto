/**
 * Atribución de lo que el ADMIN hace en lugar de una persona operativa.
 *
 * El ADMIN puede marcar los hitos de un servicio (llegada al origen, salida, etc.) igual que la tripulación. Esos
 * registros no pueden parecer hechos por el médico o el conductor: el actor de la bitácora ya es el ADMIN (lo pone
 * `auditar()` desde la sesión); aquí se deja además el texto del detalle explícito para quien lea el listado.
 */
export const TEXTO_ATRIBUCION_ADMIN = "registrado por el Administrador, no por la tripulación";

export function detalleConAtribucion(rol: string | null | undefined, detalle: string): string {
  return rol === "ADMIN" ? `${detalle} · ${TEXTO_ATRIBUCION_ADMIN}` : detalle;
}
