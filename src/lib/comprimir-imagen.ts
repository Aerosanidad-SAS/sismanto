// Compresión de fotos en el navegador con canvas nativo (sin dependencias): lado mayor <= LADO_MAXIMO_FOTO, JPEG.
// Solo corre en el cliente. La lógica de tamaños está en siniestro-fotos.ts (con prueba).

import { CALIDAD_JPEG, LADO_MAXIMO_FOTO, calcularDimensiones, validarArchivoFoto } from "@/lib/siniestro-fotos";

async function cargarBitmap(archivo: File): Promise<{ fuente: CanvasImageSource; ancho: number; alto: number; liberar: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      // "from-image" aplica la orientación EXIF: las fotos del celular en vertical no salen giradas.
      const bmp = await createImageBitmap(archivo, { imageOrientation: "from-image" });
      return { fuente: bmp, ancho: bmp.width, alto: bmp.height, liberar: () => bmp.close() };
    } catch {
      /* se intenta con <img> */
    }
  }
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo leer la foto"));
      el.src = url;
    });
    return { fuente: img, ancho: img.naturalWidth, alto: img.naturalHeight, liberar: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

/** Devuelve un JPEG de máximo 1600 px de lado y calidad 0.8. Lanza Error con un mensaje en español si no se puede. */
export async function comprimirFoto(archivo: File): Promise<File> {
  const motivo = validarArchivoFoto(archivo);
  if (motivo) throw new Error(motivo);

  const { fuente, ancho, alto, liberar } = await cargarBitmap(archivo);
  try {
    const destino = calcularDimensiones(ancho, alto, LADO_MAXIMO_FOTO);
    if (destino.ancho === 0) throw new Error("La foto no tiene dimensiones válidas");
    const canvas = document.createElement("canvas");
    canvas.width = destino.ancho;
    canvas.height = destino.alto;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Tu navegador no puede procesar la foto");
    ctx.drawImage(fuente, 0, 0, destino.ancho, destino.alto);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", CALIDAD_JPEG));
    if (!blob) throw new Error("No se pudo comprimir la foto");
    const nombre = archivo.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([blob], `${nombre}.jpg`, { type: "image/jpeg" });
  } finally {
    liberar();
  }
}
