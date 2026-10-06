// 4 fotos del vehículo por costado (migración 111), port de SISRES (9cac9aa, 2026-10-05). Puro: lo usan las
// acciones de servidor y los componentes, en los dos lugares donde se toman: el registro del vehículo
// (`vehicles`) y cada preoperacional puntual (`daily_checks`) — mismas 4 columnas en ambas tablas.

export const BUCKET_FOTOS_VEHICULO = "vehiculos-fotos";
export const MAX_MB_FOTO_VEHICULO = 8;
export const MAX_BYTES_FOTO_VEHICULO = MAX_MB_FOTO_VEHICULO * 1024 * 1024;

export const LADOS_VEHICULO = [
  { lado: "frente", columna: "foto_frente", etiqueta: "Frente" },
  { lado: "lateral_derecho", columna: "foto_lateral_derecho", etiqueta: "Lateral derecho" },
  { lado: "trasera", columna: "foto_trasera", etiqueta: "Trasera" },
  { lado: "lateral_izquierdo", columna: "foto_lateral_izquierdo", etiqueta: "Lateral izquierdo" },
] as const;

export type LadoVehiculo = (typeof LADOS_VEHICULO)[number]["lado"];
export type ColumnaFotoVehiculo = (typeof LADOS_VEHICULO)[number]["columna"];

export function esLadoVehiculo(v: string): v is LadoVehiculo {
  return LADOS_VEHICULO.some((l) => l.lado === v);
}

export function columnaDeLado(lado: LadoVehiculo): ColumnaFotoVehiculo {
  return LADOS_VEHICULO.find((l) => l.lado === lado)!.columna;
}

/** Fotos de un vehículo o de un preoperacional, por columna. */
export type FotosVehiculo = Partial<Record<ColumnaFotoVehiculo, string | null>>;

/**
 * Ruta dentro del bucket: una por entidad (vehículo o preoperacional) y lado, con nombre al azar — igual que
 * `fotosVehiculoHelper.php` de SISRES, pero en un bucket privado en vez de un archivo público en disco.
 */
export function rutaFotoVehiculo(prefijo: "vehiculo" | "preoperacional", entidadId: string | number, lado: LadoVehiculo, ext: string, azar: string): string {
  return `${prefijo}-${entidadId}/${lado}-${azar}.${ext}`;
}
