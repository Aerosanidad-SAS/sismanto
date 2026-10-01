import { createHash } from "node:crypto";

// Cliente de la API de ProTrack365, portado de PHPMailer/token.php + apiProtrack.php de SISRES. Solo servidor.
//   1. /api/authorization?time=&account=&signature=md5(md5(llave) + time) → record.access_token (dura ~2 h)
//   2. /api/track?access_token=&imeis= → record[0] con latitude, longitude, speed…

const API = "https://api.protrack365.com";
const TIMEOUT_MS = 10_000;
/** El token dura ~2 h: se reutiliza 100 min por proceso y, si la API lo rechaza antes, se pide otro. */
const VIGENCIA_TOKEN_MS = 100 * 60_000;

const md5 = (s: string) => createHash("md5").update(s).digest("hex");

/** Firma de autorización de ProTrack365: md5(md5(llave) + marca de tiempo en segundos). */
export function firmaProtrack(apiKey: string, tiempoSeg: number): string {
  return md5(md5(apiKey) + String(tiempoSeg));
}

export interface PosicionGps {
  latitud: number;
  longitud: number;
  velocidadKmh: number | null;
  /** Instante de la última posición reportada por el GPS (ISO), si la API lo trae. */
  reportadaEn: string | null;
}

/** Convierte el registro de /api/track en una posición, o null si no trae coordenadas válidas. */
export function leerPosicion(registro: unknown): PosicionGps | null {
  if (!registro || typeof registro !== "object") return null;
  const r = registro as Record<string, unknown>;
  const lat = Number(r.latitude);
  const lon = Number(r.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || (lat === 0 && lon === 0) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return null;
  }
  const vel = Number(r.speed);
  // gpstime llega en segundos Unix.
  const t = Number(r.gpstime ?? r.systemtime);
  return {
    latitud: lat,
    longitud: lon,
    velocidadKmh: Number.isFinite(vel) ? vel : null,
    reportadaEn: Number.isFinite(t) && t > 0 ? new Date(t * 1000).toISOString() : null,
  };
}

async function pedirJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

let tokenEnMemoria: { clave: string; token: string; venceEn: number } | null = null;

/** access_token para la cuenta. Error con mensaje claro si la API rechaza la cuenta o la llave. */
export async function tokenProtrack(cuenta: string, apiKey: string, forzar = false): Promise<{ token: string } | { error: string }> {
  const clave = `${cuenta}:${md5(apiKey)}`;
  if (!forzar && tokenEnMemoria && tokenEnMemoria.clave === clave && tokenEnMemoria.venceEn > Date.now()) {
    return { token: tokenEnMemoria.token };
  }
  const t = Math.floor(Date.now() / 1000);
  const url = `${API}/api/authorization?time=${t}&account=${encodeURIComponent(cuenta)}&signature=${firmaProtrack(apiKey, t)}`;
  const data = await pedirJson(url);
  if (!data) return { error: "No se pudo conectar con ProTrack365" };
  const token = (data.record as Record<string, unknown> | undefined)?.access_token;
  if (typeof token !== "string" || !token) {
    return { error: `ProTrack365 rechazó la cuenta o la llave${data.message ? `: ${String(data.message)}` : ""}` };
  }
  tokenEnMemoria = { clave, token, venceEn: Date.now() + VIGENCIA_TOKEN_MS };
  return { token };
}

/** Última posición del GPS con ese IMEI. Si el token venció, pide otro una vez. */
export async function posicionProtrack(cuenta: string, apiKey: string, imei: string): Promise<{ posicion: PosicionGps } | { error: string }> {
  if (!/^\d{8,20}$/.test(imei)) return { error: "El vehículo no tiene un IMEI de GPS válido" };
  for (const forzar of [false, true]) {
    const t = await tokenProtrack(cuenta, apiKey, forzar);
    if ("error" in t) return t;
    const data = await pedirJson(`${API}/api/track?access_token=${encodeURIComponent(t.token)}&imeis=${imei}`);
    if (data && Number(data.code) === 0) {
      const posicion = leerPosicion((data.record as unknown[] | undefined)?.[0]);
      return posicion ? { posicion } : { error: "El GPS no ha reportado una posición válida" };
    }
  }
  return { error: "ProTrack365 no devolvió la posición del vehículo" };
}
