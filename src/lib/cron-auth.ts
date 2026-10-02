import { timingSafeEqual } from "node:crypto";

/**
 * Autoriza una petición de cron (Vercel manda `Authorization: Bearer $CRON_SECRET`). Comparación a prueba de
 * ataques de temporización: `!==` sobre strings revela, por cuánto tarda, hasta qué carácter coincidió — aquí no
 * importa (CRON_SECRET es largo y no viaja por la red más que entre Vercel y este mismo despliegue), pero es el
 * mismo cuidado que ya se usa para la cookie del selector de roles (`role-switcher.ts`) y cuesta lo mismo.
 */
export function cronAutorizado(authorizationHeader: string | null, cronSecret: string): boolean {
  const esperado = Buffer.from(`Bearer ${cronSecret}`);
  const recibido = Buffer.from(authorizationHeader ?? "");
  return esperado.length === recibido.length && timingSafeEqual(esperado, recibido);
}
