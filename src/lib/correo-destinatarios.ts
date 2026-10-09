// Reglas de los avisos programados por correo (vencimientos de vehículos y de equipos). Puro, para probarlo.

/**
 * Correos que no son de una persona: cuentas de prueba o internas (`@sismanto.test`, `@sismanto.invalid`, `*.local`,
 * `@example.*`). Escribirles solo genera rebotes y ruido, y no deben contar como «destinatario».
 */
const NO_ENVIABLE = /@sismanto\.(test|invalid)$|\.local$|@example\.(com|org|net)$/i;
const FORMA_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function esCorreoEnviable(correo: string | null | undefined): boolean {
  const c = (correo ?? "").trim();
  return FORMA_CORREO.test(c) && !NO_ENVIABLE.test(c);
}

/** Correos enviables, en minúscula y sin repetir, conservando el orden. */
export function soloEnviables(correos: Iterable<string | null | undefined>): string[] {
  const salida: string[] = [];
  const vistos = new Set<string>();
  for (const c of correos) {
    if (!esCorreoEnviable(c)) continue;
    const limpio = (c as string).trim().toLowerCase();
    if (vistos.has(limpio)) continue;
    vistos.add(limpio);
    salida.push(limpio);
  }
  return salida;
}

export interface EnvioRealizado {
  /** Claves de los avisos que iban en este correo. */
  claves: string[];
  /** true si el servidor de correo aceptó el envío. */
  ok: boolean;
}

/**
 * Los avisos que NO llegaron a nadie: están en `todas` pero ningún envío exitoso los llevaba (porque el envío falló,
 * porque no había destinatarios, o porque no había correo configurado). Esos hitos NO deben quedar marcados como
 * «ya avisados»: se desmarcan para que la próxima corrida los vuelva a intentar. Antes se marcaban antes de enviar y
 * un fallo (o un entorno sin correo, donde el envío «sale» sin salir) los daba por avisados para siempre.
 */
export function clavesSinEntregar(todas: string[], envios: EnvioRealizado[]): string[] {
  const entregadas = new Set(envios.filter((e) => e.ok).flatMap((e) => e.claves));
  return todas.filter((k) => !entregadas.has(k));
}
