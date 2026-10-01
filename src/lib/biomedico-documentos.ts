// Documentos del equipo biomédico (migración 099), portado de includes/documentosEquipoConfig.php de SISRES.
// Puro: lo usan las acciones y el componente.

export const BUCKET_DOCUMENTOS_EQUIPO = "equipos-documentos";
export const MAX_MB_DOCUMENTO = 15;
export const MAX_BYTES_DOCUMENTO = MAX_MB_DOCUMENTO * 1024 * 1024;

export const TIPOS_DOCUMENTO_EQUIPO = [
  { tipo: "REGISTRO_INVIMA", etiqueta: "Registro INVIMA" },
  { tipo: "MANUAL", etiqueta: "Manual" },
  { tipo: "GUIA", etiqueta: "Guía de uso / rápida" },
  { tipo: "FICHA_TECNICA", etiqueta: "Ficha técnica" },
  { tipo: "CERTIFICADO", etiqueta: "Certificado (calibración, garantía…)" },
  { tipo: "OTRO", etiqueta: "Otro" },
] as const;
export type TipoDocumentoEquipo = (typeof TIPOS_DOCUMENTO_EQUIPO)[number]["tipo"];

export function esTipoDocumento(v: string): v is TipoDocumentoEquipo {
  return TIPOS_DOCUMENTO_EQUIPO.some((t) => t.tipo === v);
}

export function etiquetaTipoDocumento(tipo: string): string {
  return TIPOS_DOCUMENTO_EQUIPO.find((t) => t.tipo === tipo)?.etiqueta ?? tipo;
}

/** Extensiones permitidas por tipo MIME declarado (el bucket solo acepta estos tres). */
export const EXTENSION_POR_MIME: Record<string, "pdf" | "jpg" | "png"> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

/**
 * Extensión que corresponde al CONTENIDO real (firma de los primeros bytes), no a lo que dice el navegador: como
 * SISRES (guardarPdfSeguro / getimagesize). null si no es PDF, JPG ni PNG.
 */
export function extensionPorContenido(inicio: Uint8Array): "pdf" | "jpg" | "png" | null {
  const b = inicio;
  if (b.length >= 5 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2d) return "pdf"; // %PDF-
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v)) return "png";
  return null;
}

/** Ruta del archivo dentro del bucket: equipo-<id>/<uuid>.<ext>. El nombre original solo se guarda como dato. */
export function rutaDocumento(equipmentId: number, uuid: string, ext: string): string {
  return `equipo-${equipmentId}/${uuid}.${ext}`;
}

const RUTA = /^equipo-(\d+)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|png)$/;

/** Valida que una ruta tenga el formato esperado y pertenezca al equipo indicado; devuelve su extensión. */
export function validarRutaDocumento(ruta: string, equipmentId: number): "pdf" | "jpg" | "png" | null {
  const m = RUTA.exec(ruta);
  if (!m || Number(m[1]) !== equipmentId) return null;
  return m[2] as "pdf" | "jpg" | "png";
}

export function formatoTamano(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
