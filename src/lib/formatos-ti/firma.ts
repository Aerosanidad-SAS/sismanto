/**
 * Firma digital de los Formatos TI (SISRES: includes/firmaHelper.php). Sin dependencias de React ni de
 * Supabase: la usan las acciones de servidor de los 4 formatos y sus pruebas.
 *
 * Una firma es un PNG dibujado a mano en un <canvas>. Se guarda en Storage y, aparte, un **hash de
 * integridad** que combina el hash de la imagen con los campos clave del registro al momento de firmar.
 * No es cifrado: es una huella. Si alguien edita después un campo cubierto por la firma sin volver a
 * firmar, el hash guardado deja de coincidir y el listado/PDF muestran "Modificado".
 */
import { createHash, randomBytes } from "node:crypto";

/** Una firma nunca debería pesar más que esto (igual que SISRES): evita abuso del endpoint. */
export const FIRMA_MAX_BYTES = 3 * 1024 * 1024;

const PREFIJO_DATA_URI = "data:image/png;base64,";
const CABECERA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export interface FirmaValidada {
  bytes: Buffer;
  /** SHA-256 (hex) de la imagen. */
  hashPng: string;
}

/**
 * Valida el data URI que manda el canvas y devuelve los bytes reales. Como guardarFirmaSegura() de SISRES,
 * nunca confía en el prefijo que dice el cliente: decodifica y comprueba la cabecera PNG de verdad.
 * null si no es una firma válida.
 */
export function validarFirmaPng(dataUri: string | null | undefined): FirmaValidada | null {
  if (!dataUri || !dataUri.startsWith(PREFIJO_DATA_URI)) return null;
  const b64 = dataUri.slice(PREFIJO_DATA_URI.length);
  // Base64 estricto: el decodificador de Node ignora caracteres inválidos en silencio, y aquí se rechazan.
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) return null;
  const bytes = Buffer.from(b64, "base64");
  if (bytes.length === 0 || bytes.length > FIRMA_MAX_BYTES) return null;
  if (bytes.length < CABECERA_PNG.length || !bytes.subarray(0, CABECERA_PNG.length).equals(CABECERA_PNG)) return null;
  return { bytes, hashPng: createHash("sha256").update(bytes).digest("hex") };
}

/** JSON con las llaves ordenadas (ksort de SISRES): el mismo objeto da siempre el mismo texto. */
export function jsonEstable(valor: unknown): string {
  if (Array.isArray(valor)) return `[${valor.map(jsonEstable).join(",")}]`;
  if (valor !== null && typeof valor === "object") {
    const o = valor as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${jsonEstable(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(valor) ?? "null";
}

/** Fecha de creación del registro en ISO UTC con milisegundos: el ancla del hash, igual al firmar y al verificar. */
export function anclaFecha(fecha: string | Date): string {
  return new Date(fecha).toISOString();
}

/** Combina el hash de la imagen con los campos clave y la fecha de creación (firmaCalcularHashRegistro). */
export function calcularHashRegistro(camposClave: Record<string, unknown>, hashPng: string, fecha: string | Date): string {
  return createHash("sha256")
    .update(`${hashPng}|${jsonEstable(camposClave)}|${anclaFecha(fecha)}`)
    .digest("hex");
}

/**
 * Comprueba que los campos actuales siguen coincidiendo con lo que había al firmar. Se le pasa el hash de la
 * imagen y el hash guardado; sin firma que verificar, devuelve true (igual que firmaIntegridadOk).
 */
export function integridadOk(
  camposActuales: Record<string, unknown>,
  hashPng: string | null | undefined,
  fecha: string | Date,
  hashGuardado: string | null | undefined
): boolean {
  if (!hashPng || !hashGuardado) return true;
  return calcularHashRegistro(camposActuales, hashPng, fecha) === hashGuardado;
}

/** Ruta dentro del bucket `formatos-firmas`: `<formato>/<id>/<lado>-<aleatorio>.png`. Nombre no adivinable. */
export function rutaFirma(formato: string, registroId: number, lado: string): string {
  return `${formato}/${registroId}/${lado}-${randomBytes(12).toString("hex")}.png`;
}
