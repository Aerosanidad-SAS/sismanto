/**
 * Límite de intentos en memoria, por proceso. Pensado para endpoints públicos sin sesión (la firma remota de
 * Formatos TI: el enlace del correo ES la credencial, así que no hay usuario al que bloquear).
 *
 * Los tokens de la firma remota son de 256 bits — adivinarlos no es viable — así que esto no defiende contra fuerza
 * bruta. Defiende contra lo más simple: un script golpeando el endpoint una y otra vez (gasta lecturas/escrituras
 * de la base y cuota de la clave de servicio sin necesidad).
 *
 * Limitación conocida y aceptada: es memoria del proceso, no una base compartida. En Vercel con varias instancias
 * corriendo a la vez el límite real puede ser más alto que `maximo` (cada instancia cuenta aparte), y se reinicia
 * si la instancia se recicla. Para esto es suficiente; si algún día hace falta un límite exacto, se mueve a una
 * tabla o a un almacén compartido (Redis / Upstash).
 */
const intentos = new Map<string, { cuenta: number; venceEn: number }>();

/** Evita que el mapa crezca sin límite si entran muchas IPs distintas. Se poda cuando ya pesa demasiado. */
const MAX_ENTRADAS = 5000;

/** true si `clave` puede intentarlo una vez más dentro de la ventana; false si ya se pasó del límite. */
export function permitirIntento(clave: string, maximo: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  const actual = intentos.get(clave);

  if (!actual || actual.venceEn <= ahora) {
    intentos.set(clave, { cuenta: 1, venceEn: ahora + ventanaMs });
  } else {
    if (actual.cuenta >= maximo) return false;
    actual.cuenta += 1;
  }

  if (intentos.size > MAX_ENTRADAS) {
    for (const [k, v] of intentos) {
      if (v.venceEn <= ahora) intentos.delete(k);
    }
  }
  return true;
}
