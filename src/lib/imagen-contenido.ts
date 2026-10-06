// Contenido real de una imagen a partir de sus primeros bytes (la "firma" del formato), no del nombre ni del
// `type` que declara el navegador al armar el FormData — ambos los controla quien sube el archivo. Mismo patrón
// que ya usan tickets.ts (JPG/PNG) y src/lib/biomedico-documentos.ts (PDF/JPG/PNG); este cubre además WEBP, que
// necesitan la boleta de salida y el logo de la empresa.

export type TipoImagenWeb = "jpg" | "png" | "webp";

export interface FirmaImagen {
  ext: TipoImagenWeb;
  mime: string;
}

/** Firma del formato a partir de los primeros bytes del archivo (al menos 12 para reconocer WEBP). */
export function tipoImagenPorContenido(cabecera: Uint8Array): FirmaImagen | null {
  const b = cabecera;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v)) {
    return { ext: "png", mime: "image/png" };
  }
  // WEBP: contenedor RIFF ("RIFF" + 4 bytes de tamaño + "WEBP").
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return { ext: "webp", mime: "image/webp" };
  }
  return null;
}
