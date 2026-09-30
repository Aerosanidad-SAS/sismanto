import { z } from "zod";

// Cotización de ruta (migración 101), a partir de la calculadora de segumientoAmbulanciasMaps.php de SISRES.
// Puro: lo usan el navegador (cálculo en pantalla), la acción (recalcula y guarda) y el PDF.

export const ROLES_COTIZACION = ["ADMIN", "REGULACION", "ANALISTA"] as const;

export interface TramoRuta {
  desde: string;
  hasta: string;
  distancia_m: number;
  duracion_s: number;
  duracion_trafico_s: number | null;
}

/** Estado del tráfico de un tramo, con los mismos cortes de SISRES: +5 min moderado, +15 min congestionado. */
export function estadoTrafico(t: Pick<TramoRuta, "duracion_s" | "duracion_trafico_s">): "Fluido" | "Moderado" | "Congestionado" {
  const retraso = t.duracion_trafico_s === null ? 0 : t.duracion_trafico_s - t.duracion_s;
  if (retraso >= 900) return "Congestionado";
  if (retraso >= 300) return "Moderado";
  return "Fluido";
}

export function totalesRuta(tramos: readonly TramoRuta[]) {
  const distancia_m = tramos.reduce((a, t) => a + t.distancia_m, 0);
  const duracion_s = tramos.reduce((a, t) => a + t.duracion_s, 0);
  const conTrafico = tramos.every((t) => t.duracion_trafico_s !== null);
  const duracion_trafico_s = conTrafico ? tramos.reduce((a, t) => a + (t.duracion_trafico_s ?? 0), 0) : null;
  return { distancia_m, duracion_s, duracion_trafico_s };
}

/** Total de la cotización: km × valor por km + valor adicional, redondeado a pesos (SISRES: Math.round(km × valor)). */
export function totalCotizacion(distancia_m: number, valorKm: number, valorAdicional = 0): number {
  return Math.round((distancia_m / 1000) * valorKm + valorAdicional);
}

/** Índice de la ruta más rápida (con tráfico si lo hay), la «recomendada» de SISRES. */
export function rutaRecomendada(rutas: readonly (readonly TramoRuta[])[]): number {
  let mejor = 0;
  let mejorTiempo = Infinity;
  rutas.forEach((tramos, i) => {
    const t = tramos.reduce((a, x) => a + (x.duracion_trafico_s ?? x.duracion_s), 0);
    if (t < mejorTiempo) {
      mejorTiempo = t;
      mejor = i;
    }
  });
  return mejor;
}

export function formatoCOP(valor: number): string {
  return `$ ${Math.round(valor).toLocaleString("es-CO")}`;
}

export function formatoKm(distancia_m: number): string {
  return `${(distancia_m / 1000).toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}

export function formatoDuracion(segundos: number | null): string {
  if (segundos === null) return "—";
  const min = Math.round(segundos / 60);
  const h = Math.floor(min / 60);
  return h > 0 ? `${h} h ${min % 60} min` : `${min} min`;
}

const tramoSchema = z.object({
  desde: z.string().max(300),
  hasta: z.string().max(300),
  distancia_m: z.number().int().nonnegative(),
  duracion_s: z.number().int().nonnegative(),
  duracion_trafico_s: z.number().int().nonnegative().nullable(),
});

const opcional = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : null));

export const cotizacionSchema = z.object({
  cliente_nombre: opcional(200),
  cliente_correo: z.string().trim().max(200).email("Correo inválido").optional().or(z.literal("")).transform((v) => (v ? v : null)),
  origen: z.string().trim().min(3, "Origen requerido").max(300),
  intermedio: opcional(300),
  destino: z.string().trim().min(3, "Destino requerido").max(300),
  valor_km: z.number().positive("Valor por km inválido").max(10_000_000),
  valor_adicional: z.number().nonnegative().max(1_000_000_000).default(0),
  polilinea: z.string().min(2, "Falta el trazo de la ruta").max(100_000),
  tramos: z.array(tramoSchema).min(1, "Falta calcular la ruta").max(10),
  notas: opcional(1000),
});
export type CotizacionEntrada = z.input<typeof cotizacionSchema>;

/** Decodifica una polilínea codificada de Google (algoritmo público de Google) en puntos [lat, lon]. */
export function decodificarPolilinea(codificada: string): [number, number][] {
  const puntos: [number, number][] = [];
  let i = 0;
  let lat = 0;
  let lon = 0;
  while (i < codificada.length) {
    for (const eje of [0, 1]) {
      let resultado = 0;
      let desplazamiento = 0;
      let b: number;
      do {
        b = codificada.charCodeAt(i++) - 63;
        resultado |= (b & 0x1f) << desplazamiento;
        desplazamiento += 5;
      } while (b >= 0x20 && i < codificada.length);
      const delta = resultado & 1 ? ~(resultado >> 1) : resultado >> 1;
      if (eje === 0) lat += delta;
      else lon += delta;
    }
    puntos.push([lat / 1e5, lon / 1e5]);
  }
  return puntos;
}

/**
 * URL de Google Static Maps con el trazo y marcadores A (origen) y B (destino), para el PDF. null si la polilínea es
 * tan larga que la URL pasaría el límite de Google (8192 caracteres).
 */
export function urlMapaEstatico(polilinea: string, llave: string): string | null {
  const puntos = decodificarPolilinea(polilinea);
  if (puntos.length < 2) return null;
  const [a, b] = [puntos[0], puntos[puntos.length - 1]];
  const params = [
    "size=640x360",
    "scale=2",
    "maptype=roadmap",
    `path=weight:5%7Ccolor:0x0f766eff%7Cenc:${encodeURIComponent(polilinea)}`,
    `markers=color:green%7Clabel:A%7C${a[0]},${a[1]}`,
    `markers=color:red%7Clabel:B%7C${b[0]},${b[1]}`,
    `key=${encodeURIComponent(llave)}`,
  ];
  const url = `https://maps.googleapis.com/maps/api/staticmap?${params.join("&")}`;
  return url.length <= 8000 ? url : null;
}
