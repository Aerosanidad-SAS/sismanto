/**
 * Estados de una campaña de WhatsApp y las acciones que los cambian (SISRES: includes/wa/estadoCampana.php).
 * Puro: lo usan la acción de servidor, el panel y las pruebas.
 *
 *   BORRADOR ─(se empieza a enviar)→ EN_PROCESO ⇄ PAUSADA
 *   EN_PROCESO ─(no quedan pendientes)→ COMPLETADA
 *   BORRADOR | EN_PROCESO | PAUSADA ─cancelar→ CANCELADA      (COMPLETADA y CANCELADA son finales)
 */

export const ESTADOS_CAMPANA = ["BORRADOR", "EN_PROCESO", "PAUSADA", "COMPLETADA", "CANCELADA"] as const;
export type EstadoCampana = (typeof ESTADOS_CAMPANA)[number];

export type AccionCampana = "pausar" | "reanudar" | "cancelar";

export const TRANSICIONES: Record<AccionCampana, { desde: readonly EstadoCampana[]; hacia: EstadoCampana }> = {
  pausar: { desde: ["EN_PROCESO"], hacia: "PAUSADA" },
  reanudar: { desde: ["PAUSADA"], hacia: "EN_PROCESO" },
  cancelar: { desde: ["BORRADOR", "EN_PROCESO", "PAUSADA"], hacia: "CANCELADA" },
};

/** Estados en los que el lote NO debe enviar nada. */
export const ESTADOS_SIN_ENVIO: readonly EstadoCampana[] = ["PAUSADA", "COMPLETADA", "CANCELADA"];

/** Minutos que un destinatario puede estar ENVIANDO antes de darlo por abandonado y devolverlo a PENDIENTE. */
export const MINUTOS_RECLAMO_VENCIDO = 5;

export function puedeTransicionar(estado: string, accion: AccionCampana): boolean {
  return (TRANSICIONES[accion].desde as readonly string[]).includes(estado);
}

const VERBO: Record<AccionCampana, string> = { pausar: "pausar", reanudar: "reanudar", cancelar: "cancelar" };

/** Mensaje para el usuario cuando la acción no aplica al estado actual (otra persona ya la cambió, por ejemplo). */
export function mensajeNoPermitido(estado: string, accion: AccionCampana): string {
  const ahora = estado.toLowerCase().replace("_", " ");
  if (estado === "COMPLETADA" || estado === "CANCELADA") return `La campaña ya está ${ahora}: no se puede ${VERBO[accion]}.`;
  if (accion === "reanudar") return `Solo se puede reanudar una campaña pausada (está ${ahora}).`;
  if (accion === "pausar") return `Solo se puede pausar una campaña en proceso (está ${ahora}).`;
  return `No se puede ${VERBO[accion]} una campaña que está ${ahora}.`;
}

export const ESTADO_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
  BORRADOR: "outline",
  EN_PROCESO: "default",
  PAUSADA: "secondary",
  COMPLETADA: "success",
  CANCELADA: "destructive",
};

/** Acciones que el panel ofrece según el estado. */
export function accionesDisponibles(estado: string): AccionCampana[] {
  return (["pausar", "reanudar", "cancelar"] as const).filter((a) => puedeTransicionar(estado, a));
}
