// Todo lo que una prueba cree en staging lleva este prefijo, para poder encontrarlo y limpiarlo.
export const PREFIJO = "TEST-";

// Vehículos reservados para pruebas (decisión de Daniel, 2026-10-22). No usar otros vehículos de la flota.
export const VEHICULO_PRUEBA = {
  CRA_MEDELLIN: process.env.E2E_VEHICULO_MDE ?? "KQX040",
  CRA_BOGOTA: process.env.E2E_VEHICULO_BOG ?? "LHV349",
} as const;

export const centros = ["CRA_MEDELLIN", "CRA_BOGOTA", "AIRPLAN", "CTG"] as const;
