/**
 * Catálogos sugeridos para vehículos (combustible, refrigerante, aceite).
 * Ampliable sin migración: el valor guardado sigue siendo texto libre en BD.
 */
export const opcionesTipoCombustible: string[] = [
  "Gasolina corriente",
  "Gasolina extra",
  "Diésel (ACPM)",
  "Diésel EURO V",
  "GLP",
  "GNV",
  "Híbrido / eléctrico (N/A)",
];

export const opcionesTipoRefrigerante: string[] = [
  "Etilenglicol 50/50",
  "Etilenglicol concentrado",
  "Propilenglicol",
  "Refrigerante orgánico (OAT)",
  "Refrigerante híbrido (HOAT)",
  "Refrigerante inorgánico (IAT)",
];

export const opcionesAceite: string[] = [
  "15W-40 API CI-4 / SL",
  "10W-30 API SN / CF",
  "5W-30 API SN Plus",
  "5W-40 sintético",
  "75W-90 transmisión",
  "80W-90 diferencial",
  "ATF Dexron III",
  "ATF Dexron VI",
];
