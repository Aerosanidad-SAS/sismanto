/**
 * Referencias técnicas representativas (fichas/fabricante y homologación tipo)
 * para Changan BenBen / E-Star ~2021 vs Kia Picanto 2022 — fines de estimación UI.
 */

export const ELECTRIC_VEHICLE_PLACAS = new Set(["JQS366", "JRN202", "JQS239", "JQS528"]);

/** Consumo oficial homologación representativo Changan BenBen E-Star (≈10 kWh/100 km) */
export const CHANGAN_ESTAR_KWH_PER_100KM = 10;

/** Batería útil típica versión ~32 kWh */
export const CHANGAN_ESTAR_BATTERY_KWH = 32;

/** Motor eléctrico síncrono imanes permanentes, potencia pico orientativa */
export const CHANGAN_ESTAR_MOTOR_KW = 55;

/** Autonomía NEDC orientativa (km) */
export const CHANGAN_ESTAR_RANGE_NEDC_KM = 301;

/** Kia Picanto 2022: consumo mixto orientativo (L/100 km) — varía por conducción */
export const KIA_PICANTO_L_PER_100KM = 6.5;

/** 1 galón USA ≈ 3.785 L */
export const GAL_US_TO_L = 3.785;

/** km por galón estimado Picanto desde L/100 km */
export const kiaPicantoKmPerGalApprox = (): number =>
  (100 / KIA_PICANTO_L_PER_100KM) * GAL_US_TO_L;
