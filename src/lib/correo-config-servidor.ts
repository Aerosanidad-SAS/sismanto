import { leerIntegracionesGuardadas } from "@/lib/integraciones-servidor";
import { mezclarCorreo, type CorreoEfectivo } from "@/lib/correo-config";

// Lee la configuración de correo vigente: lo escrito en Administración → Configuración general pisa a las variables de
// entorno (ver correo-config.ts). SOLO en el servidor (usa la clave de servicio). Se guarda en memoria unos segundos
// para no consultar la base en cada correo; al guardar un cambio se invalida en esa instancia, y las demás lo ven en
// menos de TTL_MS.

const TTL_MS = 30_000;
let cache: { en: number; valor: CorreoEfectivo } | null = null;

export function invalidarCorreoEfectivo(): void {
  cache = null;
}

export async function correoEfectivo(): Promise<CorreoEfectivo> {
  if (cache && Date.now() - cache.en < TTL_MS) return cache.valor;
  // Si la tabla no existe todavía o no hay clave de servicio, leerIntegracionesGuardadas devuelve {}: queda el entorno.
  const guardados = await leerIntegracionesGuardadas();
  const valor = mezclarCorreo(process.env, guardados);
  cache = { en: Date.now(), valor };
  return valor;
}
