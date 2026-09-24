/**
 * Media del encabezado de una campaña de WhatsApp (SISRES: waTipoMedia, waSubirMedia). Funciones puras.
 * Meta admite imagen (JPG/PNG), video (MP4) y documento (PDF, Word, Excel).
 */

export type TipoMedia = "image" | "video" | "document";

export interface InfoMedia {
  tipo: TipoMedia;
  mime: string;
}

/** Tope general de SISRES (16 MB) y el más bajo que impone Meta a las imágenes (5 MB). */
export const MEDIA_MAX_BYTES = 16 * 1024 * 1024;
export const IMAGEN_MAX_BYTES = 5 * 1024 * 1024;
/** Un `media_id` de Meta vale ~30 días: pasados 25 se vuelve a subir el archivo. */
export const DIAS_MEDIA_VIGENTE = 25;

const POR_EXTENSION: Record<string, InfoMedia> = {
  jpg: { tipo: "image", mime: "image/jpeg" },
  jpeg: { tipo: "image", mime: "image/jpeg" },
  png: { tipo: "image", mime: "image/png" },
  mp4: { tipo: "video", mime: "video/mp4" },
  pdf: { tipo: "document", mime: "application/pdf" },
  doc: { tipo: "document", mime: "application/msword" },
  docx: { tipo: "document", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  xlsx: { tipo: "document", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
};

export function extensionDe(nombre: string): string {
  const m = nombre.toLowerCase().match(/\.([a-z0-9]{1,5})$/);
  return m ? m[1] : "";
}

const empieza = (b: Uint8Array, firma: number[], desde = 0) => firma.every((x, i) => b[desde + i] === x);

/** ¿Los primeros bytes corresponden al formato que dice la extensión? (una `.png` que en realidad es un ejecutable no pasa). */
function firmaCoincide(ext: string, b: Uint8Array): boolean {
  switch (ext) {
    case "jpg":
    case "jpeg":
      return empieza(b, [0xff, 0xd8, 0xff]);
    case "png":
      return empieza(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "pdf":
      return empieza(b, [0x25, 0x50, 0x44, 0x46]); // %PDF
    case "mp4":
      return empieza(b, [0x66, 0x74, 0x79, 0x70], 4); // "ftyp" a partir del byte 4
    case "docx":
    case "xlsx":
      return empieza(b, [0x50, 0x4b, 0x03, 0x04]); // ZIP
    case "doc":
      return empieza(b, [0xd0, 0xcf, 0x11, 0xe0]); // OLE2
    default:
      return false;
  }
}

/** Valida nombre, tamaño y firma real del archivo. Devuelve el tipo y el MIME o un mensaje para el usuario. */
export function validarMedia(nombre: string, bytes: Uint8Array): { ok: true; info: InfoMedia } | { ok: false; error: string } {
  const ext = extensionDe(nombre);
  const info = POR_EXTENSION[ext];
  if (!info) return { ok: false, error: "Tipo no soportado. Usa imagen (jpg/png), PDF, video (mp4) o documento (doc/docx/xlsx)." };
  if (bytes.length === 0) return { ok: false, error: "El archivo está vacío." };
  if (bytes.length > MEDIA_MAX_BYTES) return { ok: false, error: "El archivo supera el límite de 16 MB." };
  if (info.tipo === "image" && bytes.length > IMAGEN_MAX_BYTES) return { ok: false, error: "Las imágenes no pueden pesar más de 5 MB (límite de WhatsApp)." };
  if (!firmaCoincide(ext, bytes)) return { ok: false, error: `El contenido no corresponde a un archivo .${ext} válido.` };
  return { ok: true, info };
}

/** Nombre apto para una ruta de Storage: sin carpetas, sin caracteres raros, con la extensión original. */
export function nombreSeguro(nombre: string): string {
  const ext = extensionDe(nombre);
  const base = nombre
    .replace(/\.[a-z0-9]{1,5}$/i, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
  return `${base || "archivo"}${ext ? `.${ext}` : ""}`;
}

/**
 * La ruta que manda el navegador debe estar dentro de la carpeta del propio usuario (`<user_id>/<archivo>`), sin
 * subcarpetas ni `..`: el servidor nunca debe bajar un archivo ajeno porque alguien cambió la ruta en la petición.
 */
export function rutaMediaValida(ruta: string, userId: string): boolean {
  if (!userId || typeof ruta !== "string") return false;
  const partes = ruta.split("/");
  return partes.length === 2 && partes[0] === userId && /^[a-zA-Z0-9_.-]+$/.test(partes[1]) && !partes[1].startsWith(".") && !ruta.includes("..");
}

/** ¿Ya conviene volver a subir el archivo a Meta? Sin fecha de subida se considera vencido. */
export function mediaVencida(subidoAt: string | null | undefined, ahora: Date = new Date()): boolean {
  if (!subidoAt) return true;
  const t = new Date(subidoAt).getTime();
  return Number.isNaN(t) || ahora.getTime() - t > DIAS_MEDIA_VIGENTE * 86400000;
}
