/**
 * Hallazgos que el SISTEMA reconoce como críticos (lista cerrada, definida por Mantenimiento): un vehículo con uno de
 * ellos no debe operar. El OVEM no decide a criterio sacar un vehículo de servicio: o el hallazgo está en esta lista
 * (y el sistema avisa de inmediato a Regulación, Coordinación y Mantenimiento), o queda como novedad para que
 * Regulación o Mantenimiento decidan.
 */
export const HALLAZGOS_CRITICOS = [
  "Sin aceite de motor",
  "Fuga excesiva de líquido en el piso",
  "Falla de frenos",
  "Falla de dirección o suspensión",
  "Sobrecalentamiento del motor",
  "Humo excesivo",
  "Sin SOAT o SOAT vencido",
  "Sin revisión técnico-mecánica vigente",
] as const;

export const PREFIJO_CRITICO = "CRÍTICO: ";

/** true si la descripción es la de un hallazgo crítico de la lista cerrada («CRÍTICO: Falla de frenos. …»). */
export function esDescripcionCritica(descripcion: string): boolean {
  const d = descripcion.trim();
  return HALLAZGOS_CRITICOS.some((h) => d.startsWith(PREFIJO_CRITICO + h));
}

export interface DatosAlertaNoApto {
  placa: string;
  centro: string | null;
  /** Qué encontró el sistema o reportó el OVEM. */
  hallazgos: string[];
  reportadoPor: string;
  /** Texto ya formateado en hora de Colombia. */
  cuando: string;
  /** NO_APTO: el sistema lo dejó fuera de servicio. SOLICITUD: el OVEM pide el NO APTO y alguien superior debe avalarlo. */
  tipo?: "NO_APTO" | "SOLICITUD";
}

/** Asunto y cuerpo del aviso inmediato de «vehículo NO APTO» o de solicitud de NO APTO. Puro, para poder probarlo. */
export function armarAlertaNoApto(d: DatosAlertaNoApto): { asunto: string; html: string } {
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lista = d.hallazgos.map((h) => `<li>${esc(h)}</li>`).join("");
  const sitio = `${esc(d.placa)}${d.centro ? ` (${esc(d.centro)})` : ""}`;
  if (d.tipo === "SOLICITUD") {
    return {
      asunto: `SOLICITUD DE NO APTO — ${d.placa}: requiere tu aval`,
      html:
        `<p><strong>${esc(d.reportadoPor)} solicita que el vehículo ${sitio} quede NO APTO y necesita tu aval.</strong></p>` +
        `<p>Motivo:</p><ul>${lista}</ul>` +
        `<p>Enviada el ${esc(d.cuando)} (hora de Colombia). Mientras se resuelve, el vehículo está en bloqueo provisional: no debe operar ni recibir servicios.</p>` +
        `<p>Coordinación del CRA o el administrador: avala o rechaza la solicitud en SISMANTO.</p>`,
    };
  }
  return {
    asunto: `VEHÍCULO NO APTO — ${d.placa}: no debe operar`,
    html:
      `<p><strong>El vehículo ${sitio} quedó NO APTO y no debe operar.</strong></p>` +
      `<p>Hallazgos:</p><ul>${lista}</ul>` +
      `<p>Reportado por ${esc(d.reportadoPor)} el ${esc(d.cuando)} (hora de Colombia).</p>` +
      `<p>Regulación: no asignes servicios a este vehículo. Mantenimiento: se requiere revisión inmediata.</p>`,
  };
}
