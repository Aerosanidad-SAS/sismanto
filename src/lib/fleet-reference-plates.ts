const REFERENCE_SPARK_COMBUSTION_PLACAS_RAW = ["KOS929", "KYV199", "KYV219", "KZO779"] as const;

export const normalizePlaca = (placa: string | null | undefined): string =>
  String(placa || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

export const placaFleetKey = (placa: string | null | undefined): string =>
  normalizePlaca(placa)
    .normalize("NFC")
    .replace(/[^A-Z0-9]/g, "");

export const REFERENCE_SPARK_COMBUSTION_PLACAS = new Set<string>(
  REFERENCE_SPARK_COMBUSTION_PLACAS_RAW.map((placa) => placaFleetKey(placa))
);

export const isReferenceSparkCombustionPlaca = (
  placa: string | null | undefined
): boolean => REFERENCE_SPARK_COMBUSTION_PLACAS.has(placaFleetKey(placa));
