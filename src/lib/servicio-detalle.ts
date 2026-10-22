/** Textos del detalle de un servicio para la tripulación (OVEM, médico, auxiliar). Sin dependencias de servidor. */

/** «Cra 70 #44-30, Medellín»; solo la ciudad si no hay dirección, solo la dirección si no hay ciudad, vacío si no hay nada. */
export function textoParada(direccion: string | null | undefined, ciudad: string | null | undefined): string {
  return [direccion, ciudad]
    .map((x) => (x ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

/** «J441 — Neumonía…»; cae al motivo de consulta si el servicio no trae diagnóstico CIE. Vacío si no hay nada. */
export function textoDiagnostico(
  cieCodigo: string | null | undefined,
  cieDescripcion: string | null | undefined,
  motivoConsulta?: string | null
): string {
  const cie = [cieCodigo, cieDescripcion]
    .map((x) => (x ?? "").trim())
    .filter(Boolean)
    .join(" — ");
  return cie || (motivoConsulta ?? "").trim();
}

export type RolTripulacion = "OVEM" | "AUXILIAR_ENFERMERIA" | "MEDICO";

/** Tripulación de cada tipo: TAB = OVEM + auxiliar; TAM = OVEM + auxiliar + médico; medicina domiciliaria = OVEM + médico. El resto no fija una. */
export function rolesRequeridosPorTipo(tipoServicio: string | null | undefined): RolTripulacion[] {
  const tipo = (tipoServicio ?? "").trim().toUpperCase();
  if (tipo.startsWith("TAM")) return ["OVEM", "AUXILIAR_ENFERMERIA", "MEDICO"];
  if (tipo.startsWith("TAB")) return ["OVEM", "AUXILIAR_ENFERMERIA"];
  if (tipo === "MEDICINA DOMICILIARIA") return ["OVEM", "MEDICO"];
  return [];
}

/** Roles que exige el tipo y la tripulación del móvil no tiene. */
export function rolesFaltantes(
  tipoServicio: string | null | undefined,
  tripulacion: Partial<Record<"ovem" | "medico" | "auxiliar", unknown>> | undefined
): RolTripulacion[] {
  const presente = {
    OVEM: Boolean(tripulacion?.ovem),
    AUXILIAR_ENFERMERIA: Boolean(tripulacion?.auxiliar),
    MEDICO: Boolean(tripulacion?.medico),
  };
  return rolesRequeridosPorTipo(tipoServicio).filter((r) => !presente[r]);
}

export const ETIQUETA_ROL: Record<RolTripulacion, string> = {
  OVEM: "OVEM",
  AUXILIAR_ENFERMERIA: "auxiliar de enfermería",
  MEDICO: "médico",
};
