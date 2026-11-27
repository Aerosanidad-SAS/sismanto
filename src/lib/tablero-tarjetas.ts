/**
 * Lógica de las tarjetas de flota de la Sala de control (filtros, conteos, tono y avatares). Sin dependencias de React:
 * se prueba aparte. Los datos son las `FilaTablero` que ya arma el tablero de vehículos.
 */
import { esApto, requiereAtencion, type FilaTablero } from "@/lib/aptitud-vehiculo";

export type FiltroFlota = "todos" | "servicio" | "libres" | "alertas";

export const FILTROS_FLOTA: { clave: FiltroFlota; etiqueta: string }[] = [
  { clave: "todos", etiqueta: "Todos" },
  { clave: "servicio", etiqueta: "En servicio" },
  { clave: "libres", etiqueta: "Libres" },
  { clave: "alertas", etiqueta: "Con alertas" },
];

const enServicio = (f: FilaTablero) => f.ocupacion.estado === "EN_SERVICIO";
// «Libres» cuenta solo los libres y aptos (los que Regulación puede despachar ya), igual que el tablero de siempre.
const libreYApto = (f: FilaTablero) => !enServicio(f) && esApto(f.aptitud);
// Alerta = cualquier cosa distinta de «apto»: no apto, sin preoperacional hoy o con novedades abiertas.
const conAlerta = (f: FilaTablero) => f.aptitud !== "APTO";

export function filtrarFlota(filas: readonly FilaTablero[], filtro: FiltroFlota): FilaTablero[] {
  switch (filtro) {
    case "servicio":
      return filas.filter(enServicio);
    case "libres":
      return filas.filter(libreYApto);
    case "alertas":
      return filas.filter(conAlerta);
    default:
      return [...filas];
  }
}

export function contarFlota(filas: readonly FilaTablero[]): Record<FiltroFlota, number> {
  return {
    todos: filas.length,
    servicio: filas.filter(enServicio).length,
    libres: filas.filter(libreYApto).length,
    alertas: filas.filter(conAlerta).length,
  };
}

export type TonoTarjeta = "alerta" | "aviso" | "servicio" | "libre";

/** Color de la cabecera de la tarjeta: lo que necesita atención manda sobre si el vehículo está libre o en servicio. */
export function tonoTarjeta(f: FilaTablero): TonoTarjeta {
  if (f.aptitud === "NO_APTO" || f.aptitud === "NO_APTO_PENDIENTE_AVAL") return "alerta";
  if (requiereAtencion(f.aptitud) || f.aptitud === "APTO_CON_NOVEDADES") return "aviso";
  return enServicio(f) ? "servicio" : "libre";
}

/** Iniciales para el avatar: «Dra. Natalia Cano» → «NC». */
export function iniciales(nombre: string): string {
  return nombre
    .replace(/^(Dr\.|Dra\.)\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
