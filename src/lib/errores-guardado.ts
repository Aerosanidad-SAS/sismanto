/**
 * Traduce un error de la base (Postgres / PostgREST) a una frase que un conductor entienda. Nunca devuelve el texto
 * técnico: ese va al registro del servidor (console.error), no a la pantalla del celular.
 */
export interface ErrorBase {
  code?: string | null;
  message?: string | null;
}

export function mensajeErrorGuardado(error: ErrorBase | null | undefined, que = "los datos"): string {
  switch (error?.code) {
    case "42501": // RLS: la política no deja escribir
      return `No tienes permiso para guardar ${que} ahora. Recarga la página; si sigue igual, avisa a Regulación.`;
    case "23503": // llave foránea: el vehículo o el ítem ya no existe
      return `Algo del vehículo o de la lista cambió mientras llenabas ${que}. Recarga la página e inténtalo de nuevo.`;
    case "22003": // número fuera de rango
    case "22P02": // texto donde iba un número
      return "Revisa los números que escribiste (kilometraje, galones o costo): alguno no es válido.";
    case "23505": // duplicado
      return `Ya estaba guardado. Recarga la página para ver ${que} tal como quedó.`;
    case "57014": // cancelado por tiempo
      return "La conexión tardó demasiado. Revisa tu señal e inténtalo de nuevo; no se perdió nada de lo que escribiste.";
    default:
      return `No se pudo guardar ${que}. Revisa tu señal e inténtalo de nuevo; tus respuestas siguen en pantalla. Si se repite, avisa a Regulación.`;
  }
}
