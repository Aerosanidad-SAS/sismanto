// Reglas puras de las fotos de un siniestro (bucket privado `siniestros`, migración 112): tipo, tamaño, recorte y rutas.

export const TIPOS_FOTO_SINIESTRO = ["HECHOS", "DOCUMENTOS"] as const;
export type TipoFotoSiniestro = (typeof TIPOS_FOTO_SINIESTRO)[number];

export const BUCKET_SINIESTROS = "siniestros";
/** Lado mayor de la foto comprimida: suficiente para leer una placa o un IPAT y liviana para datos móviles. */
export const LADO_MAXIMO_FOTO = 1600;
export const CALIDAD_JPEG = 0.8;
/** Límite de la foto original que se acepta leer (el bucket limita la comprimida a 8 MB). */
export const TAMANO_MAXIMO_ORIGINAL = 25 * 1024 * 1024;
export const TAMANO_MAXIMO_SUBIDA = 8 * 1024 * 1024;
export const MAX_FOTOS_POR_TIPO = 12;

export function esTipoFoto(valor: unknown): valor is TipoFotoSiniestro {
  return typeof valor === "string" && (TIPOS_FOTO_SINIESTRO as readonly string[]).includes(valor);
}

/** null = aceptada; si no, el motivo en lenguaje claro. */
export function validarArchivoFoto(archivo: { type: string; size: number }): string | null {
  if (!archivo.type.startsWith("image/")) return "Solo se aceptan fotos (JPG, PNG o WEBP).";
  if (archivo.size <= 0) return "La foto está vacía.";
  if (archivo.size > TAMANO_MAXIMO_ORIGINAL) return "La foto pesa más de 25 MB. Toma otra con menos resolución.";
  return null;
}

/** Dimensiones destino: el lado mayor no pasa de `maximo`, se conserva la proporción y nunca se agranda. */
export function calcularDimensiones(ancho: number, alto: number, maximo = LADO_MAXIMO_FOTO): { ancho: number; alto: number } {
  if (!(ancho > 0) || !(alto > 0)) return { ancho: 0, alto: 0 };
  const mayor = Math.max(ancho, alto);
  if (mayor <= maximo) return { ancho: Math.round(ancho), alto: Math.round(alto) };
  const factor = maximo / mayor;
  return { ancho: Math.max(1, Math.round(ancho * factor)), alto: Math.max(1, Math.round(alto * factor)) };
}

/** Ruta dentro del bucket: <accident_id>/<tipo>/<uuid>.jpg (la primera carpeta es la que usan las políticas de Storage). */
export function rutaFotoSiniestro(accidentId: number, tipo: TipoFotoSiniestro, uuid: string): string {
  return `${accidentId}/${tipo}/${uuid}.jpg`;
}

/** ¿Esta ruta pertenece a este siniestro y a este tipo, con la forma exacta que genera `rutaFotoSiniestro`? */
export function rutaPerteneceASiniestro(ruta: string, accidentId: number, tipo: TipoFotoSiniestro): boolean {
  const partes = ruta.split("/");
  return (
    partes.length === 3 &&
    partes[0] === String(accidentId) &&
    partes[1] === tipo &&
    /^[0-9a-fA-F-]{8,40}\.jpg$/.test(partes[2])
  );
}
