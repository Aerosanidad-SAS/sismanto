/**
 * Soporte (factura, orden de trabajo o foto) de un mantenimiento correctivo. Regla de Airplan: el costo de un correctivo
 * solo se recupera con su soporte. Decisión (#345): el correctivo se puede guardar sin soporte, pero queda MARCADO
 * («sin soporte») en el historial y se puede filtrar; bloquearlo frenaría al técnico en campo.
 * Sin dependencias de servidor: lo usan la acción, el formulario y la tabla.
 */
import { tipoImagenPorContenido } from "@/lib/imagen-contenido";

export const SOPORTE_TAMANO_MAXIMO = 8 * 1024 * 1024;
export const SOPORTE_BUCKET = "mantenimiento-soportes";
export const SOPORTE_FORMATOS = "PDF, JPG, PNG o WEBP";

export type TipoSoporte = { ext: "pdf" | "jpg" | "png" | "webp"; mime: string };

/** Tipo real del archivo a partir de sus primeros bytes (≥12): lo que declara el navegador o la extensión no se cree. */
export function tipoSoportePorContenido(cabecera: Uint8Array): TipoSoporte | null {
  // PDF: «%PDF-».
  if (cabecera.length >= 5 && [0x25, 0x50, 0x44, 0x46, 0x2d].every((v, i) => cabecera[i] === v)) {
    return { ext: "pdf", mime: "application/pdf" };
  }
  return tipoImagenPorContenido(cabecera);
}

/** Ruta del archivo en el bucket: `<uid de quien sube>/<id>.<ext>`; el nombre nunca lo elige el usuario. */
export function rutaSoporte(userId: string, id: string, tipo: TipoSoporte): string {
  return `${userId}/${id}.${tipo.ext}`;
}

/** Solo se acepta como `soportePath` una ruta del propio usuario con la forma que genera `rutaSoporte`. */
export function esRutaSoporteDe(userId: string, ruta: string): boolean {
  return ruta.startsWith(`${userId}/`) && /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(pdf|jpg|png|webp)$/i.test(ruta);
}

export type EstadoSoporte = "con_soporte" | "sin_soporte" | "no_aplica";

/** Un correctivo registrado con la regla nueva (`requiere_soporte`) sin archivo está «sin soporte»; lo histórico no aplica. */
export function estadoSoporte(m: { requiere_soporte?: boolean | null; soporte_path?: string | null }): EstadoSoporte {
  if (m.soporte_path) return "con_soporte";
  return m.requiere_soporte ? "sin_soporte" : "no_aplica";
}
