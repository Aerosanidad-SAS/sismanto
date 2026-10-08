import { esDia, sumarDias, type Dia } from "@/lib/fechas";
import { normalizarPlaca, numero, texto } from "@/lib/hoja-de-vida";

/**
 * Archivo semanal del proveedor de combustible (hoja `Tabla_Combustibles`): se sube TAL CUAL. Las columnas se
 * detectan por NOMBRE de encabezado (sin tildes, mayúsculas ni puntos), no por posición, y se ignoran las que no se
 * conocen. Todo aquí es puro (sin base de datos): la web y `npm run fuel:load` usan esta misma implementación.
 */

// ─── Encabezados ────────────────────────────────────────────────────────────

export function normalizarEncabezado(h: unknown): string {
  return String(h ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const ALIAS = {
  numero_venta: ["no venta", "nro venta", "numero venta", "n venta", "no  venta"],
  fecha: ["fecha"],
  placa: ["placa"],
  cantidad: ["cantidad"],
  total_venta: ["total venta", "total"],
  kilometraje: ["kilometraje", "km"],
  combustible: ["combustible"],
  estacion: ["estacion"],
} as const;

type Campo = keyof typeof ALIAS;
export const CAMPOS_OBLIGATORIOS: Campo[] = ["numero_venta", "fecha", "placa", "cantidad", "total_venta", "kilometraje"];
const NOMBRE_DE_CAMPO: Record<Campo, string> = {
  numero_venta: "No. Venta",
  fecha: "Fecha",
  placa: "Placa",
  cantidad: "Cantidad",
  total_venta: "Total Venta",
  kilometraje: "Kilometraje",
  combustible: "Combustible",
  estacion: "Estación",
};

export interface Encabezados {
  /** Índice (0-based) de la fila de encabezados dentro de la hoja. */
  indiceFila: number;
  columnas: Partial<Record<Campo, number>>;
}

/** Busca la fila de encabezados entre las primeras 30 (hay archivos con filas previas). */
export function localizarEncabezados(filas: unknown[][]): Encabezados | { error: string } {
  let mejor: { indiceFila: number; columnas: Partial<Record<Campo, number>>; faltan: Campo[] } | null = null;
  for (let i = 0; i < Math.min(filas.length, 30); i++) {
    const norm = (filas[i] ?? []).map(normalizarEncabezado);
    const columnas: Partial<Record<Campo, number>> = {};
    for (const campo of Object.keys(ALIAS) as Campo[]) {
      const idx = norm.findIndex((h) => (ALIAS[campo] as readonly string[]).includes(h));
      if (idx >= 0) columnas[campo] = idx;
    }
    const faltan = CAMPOS_OBLIGATORIOS.filter((c) => columnas[c] === undefined);
    if (columnas.placa !== undefined && (!mejor || faltan.length < mejor.faltan.length)) mejor = { indiceFila: i, columnas, faltan };
    if (faltan.length === 0) break;
  }
  if (!mejor) return { error: "No encontré la fila de encabezados (busqué «Placa», «No. Venta», «Fecha»…). ¿Es el archivo del proveedor de combustible?" };
  if (mejor.faltan.length > 0) {
    return { error: `Al archivo le falta la columna: ${mejor.faltan.map((c) => `«${NOMBRE_DE_CAMPO[c]}»`).join(", ")}.` };
  }
  return { indiceFila: mejor.indiceFila, columnas: mejor.columnas };
}

// ─── Fechas ─────────────────────────────────────────────────────────────────

/** Serial de Excel (días desde 1899-12-30, la parte decimal es la hora) → día y hora «HH:MM», sin zonas horarias. */
export function fechaDeSerial(serial: number): { dia: Dia; hora: string | null } {
  const dias = Math.floor(serial);
  const minutos = Math.round((serial - dias) * 1440);
  const dia = sumarDias("1899-12-30", dias);
  if (minutos === 0) return { dia, hora: null };
  const hh = Math.floor(minutos / 60) % 24;
  const mm = minutos % 60;
  return { dia, hora: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}` };
}

/** Acepta serial de Excel, «AAAA-MM-DD [HH:MM[:SS]]» y «DD/MM/AAAA [HH:MM[:SS]]». */
export function leerFecha(v: unknown): { dia: Dia; hora: string | null } | null {
  if (typeof v === "number") return Number.isFinite(v) && v > 20000 && v < 80000 ? fechaDeSerial(v) : null;
  const s = texto(v);
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/) ?? null;
  if (m && esDia(`${m[1]}-${m[2]}-${m[3]}`)) return { dia: `${m[1]}-${m[2]}-${m[3]}`, hora: m[4] ? `${m[4]}:${m[5]}` : null };
  const c = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (c) {
    const dia = `${c[3]}-${c[2].padStart(2, "0")}-${c[1].padStart(2, "0")}`;
    if (esDia(dia)) return { dia, hora: c[4] ? `${c[4].padStart(2, "0")}:${c[5]}` : null };
  }
  return null;
}

// ─── Filas ──────────────────────────────────────────────────────────────────

export interface VentaCombustible {
  /** Número de fila en Excel (1-based), para reportar errores. */
  fila: number;
  numeroVenta: string;
  placa: string;
  dia: Dia;
  hora: string | null;
  galones: number;
  costo: number;
  /** 0 si el archivo no trae kilometraje (la tabla exige un entero ≥ 0; ese 0 no cuenta como lectura). */
  km: number;
  combustible: string | null;
  estacion: string | null;
}

export interface ErrorVenta {
  fila: number;
  placa: string;
  mensaje: string;
}

export function leerVentas(filas: unknown[][], enc: Encabezados): { ventas: VentaCombustible[]; errores: ErrorVenta[] } {
  const ventas: VentaCombustible[] = [];
  const errores: ErrorVenta[] = [];
  const c = enc.columnas;
  const celda = (fila: unknown[], campo: Campo) => (c[campo] === undefined ? undefined : fila[c[campo] as number]);

  for (let i = enc.indiceFila + 1; i < filas.length; i++) {
    const fila = filas[i] ?? [];
    if (fila.every((x) => texto(x) === null)) continue;
    const nFila = i + 1;
    const placa = normalizarPlaca(celda(fila, "placa"));
    const fallo = (mensaje: string) => errores.push({ fila: nFila, placa: placa ?? "", mensaje });
    if (!placa) { fallo("Falta la placa."); continue; }

    const numeroVenta = texto(celda(fila, "numero_venta"));
    if (!numeroVenta) { fallo("Falta el No. Venta (sin él no se puede evitar duplicados)."); continue; }

    const f = leerFecha(celda(fila, "fecha"));
    if (!f) { fallo(`Fecha no reconocida: «${texto(celda(fila, "fecha")) ?? ""}».`); continue; }

    const galones = numero(celda(fila, "cantidad"));
    if (galones === null || galones <= 0) { fallo(`Cantidad (galones) vacía o menor o igual a 0: «${texto(celda(fila, "cantidad")) ?? ""}».`); continue; }
    const costo = numero(celda(fila, "total_venta"));
    if (costo === null || costo <= 0) { fallo(`Total Venta vacío o menor o igual a 0: «${texto(celda(fila, "total_venta")) ?? ""}».`); continue; }
    const km = numero(celda(fila, "kilometraje"));

    ventas.push({
      fila: nFila,
      numeroVenta,
      placa,
      dia: f.dia,
      hora: f.hora,
      galones,
      costo: Math.round(costo),
      km: km !== null && km > 0 ? Math.round(km) : 0,
      combustible: texto(celda(fila, "combustible")),
      estacion: texto(celda(fila, "estacion")),
    });
  }
  return { ventas, errores };
}

// ─── Análisis contra la flota y lo ya cargado ───────────────────────────────

export interface VehiculoCombustible {
  id: string;
  /** DIESEL, GASOLINA… (puede no estar definido en la ficha). */
  combustible: string | null;
  /** Lectura de odómetro vigente (la más alta registrada). */
  kmActual: number | null;
}

export interface VentaAnalizada extends VentaCombustible {
  vehicleId: string;
  kmSospechoso: boolean;
}

export interface AdvertenciaVenta {
  fila: number;
  placa: string;
  tipo: "KM_SOSPECHOSO" | "PRECIO_ATIPICO" | "COMBUSTIBLE_DISTINTO";
  mensaje: string;
}

export interface AnalisisCarga {
  nuevas: VentaAnalizada[];
  duplicadas: number;
  errores: ErrorVenta[];
  /** Placas que no existen en la flota, con cuántas filas traen (no se cargan; el resto sí). */
  placasDesconocidas: { placa: string; filas: number }[];
  advertencias: AdvertenciaVenta[];
  /** Mejor lectura válida por vehículo (alimenta `km_actual` vía mileage_logs). */
  lecturasValidas: { vehicleId: string; placa: string; dia: Dia; km: number }[];
  rango: { desde: Dia; hasta: Dia } | null;
}

/** Salto máximo creíble entre dos lecturas consecutivas de un vehículo (una semana de trabajo duro son ~2.000 km). */
export const SALTO_MAXIMO_KM = 10_000;
const FACTOR_PRECIO = 2;

function tipoDeCombustible(s: string | null): "DIESEL" | "GASOLINA" | null {
  const t = (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (/diesel|acpm|biodiesel/.test(t)) return "DIESEL";
  if (/gasolina/.test(t)) return "GASOLINA";
  return null;
}

export function analizarCarga(
  ventas: VentaCombustible[],
  erroresLectura: ErrorVenta[],
  vehiculos: Map<string, VehiculoCombustible>,
  ventasExistentes: Set<string>
): AnalisisCarga {
  const errores = [...erroresLectura];
  const advertencias: AdvertenciaVenta[] = [];
  const desconocidas = new Map<string, number>();
  let duplicadas = 0;

  // Mediana de precio por galón del archivo (las filas válidas), para detectar precios fuera de rango.
  const precios = ventas.map((v) => v.costo / v.galones).sort((a, b) => a - b);
  const mediana = precios.length ? precios[Math.floor(precios.length / 2)] : 0;

  const enArchivo = new Set<string>();
  const candidatas: (VentaCombustible & { vehiculo: VehiculoCombustible })[] = [];
  for (const v of ventas) {
    if (enArchivo.has(v.numeroVenta)) { duplicadas++; continue; }
    enArchivo.add(v.numeroVenta);
    if (ventasExistentes.has(v.numeroVenta)) { duplicadas++; continue; }
    const vehiculo = vehiculos.get(v.placa);
    if (!vehiculo) { desconocidas.set(v.placa, (desconocidas.get(v.placa) ?? 0) + 1); continue; }
    candidatas.push({ ...v, vehiculo });
  }

  // Km sospechoso: se evalúa en orden cronológico por vehículo, contra la última lectura válida.
  const orden = [...candidatas].sort((a, b) => `${a.dia} ${a.hora ?? ""}`.localeCompare(`${b.dia} ${b.hora ?? ""}`) || a.fila - b.fila);
  const ultimoValido = new Map<string, number | null>();
  const sospechosa = new Set<number>();
  const mejorPorVehiculo = new Map<string, { vehicleId: string; placa: string; dia: Dia; km: number }>();
  for (const v of orden) {
    if (v.km <= 0) continue;
    const base = ultimoValido.has(v.placa) ? ultimoValido.get(v.placa)! : v.vehiculo.kmActual;
    let motivo: string | null = null;
    if (base !== null && v.km < base) motivo = `retrocede: ${v.km} km, cuando ya estaba en ${base}`;
    else if (base !== null && v.km - base > SALTO_MAXIMO_KM) motivo = `salto de ${v.km - base} km desde ${base}`;
    if (motivo) {
      sospechosa.add(v.fila);
      advertencias.push({ fila: v.fila, placa: v.placa, tipo: "KM_SOSPECHOSO", mensaje: `Kilometraje ${motivo}. Se carga, pero no actualiza el km del vehículo.` });
    } else {
      ultimoValido.set(v.placa, v.km);
      const previo = mejorPorVehiculo.get(v.placa);
      if (!previo || v.km > previo.km) mejorPorVehiculo.set(v.placa, { vehicleId: v.vehiculo.id, placa: v.placa, dia: v.dia, km: v.km });
    }
  }

  for (const v of candidatas) {
    const precio = v.costo / v.galones;
    if (mediana > 0 && (precio > mediana * FACTOR_PRECIO || precio < mediana / FACTOR_PRECIO)) {
      advertencias.push({ fila: v.fila, placa: v.placa, tipo: "PRECIO_ATIPICO", mensaje: `Precio por galón atípico: $${Math.round(precio)} (mediana del archivo $${Math.round(mediana)}).` });
    }
    const delArchivo = tipoDeCombustible(v.combustible);
    const delVehiculo = tipoDeCombustible(v.vehiculo.combustible);
    if (delArchivo && delVehiculo && delArchivo !== delVehiculo) {
      advertencias.push({ fila: v.fila, placa: v.placa, tipo: "COMBUSTIBLE_DISTINTO", mensaje: `Cargó ${v.combustible} y la ficha dice ${v.vehiculo.combustible}.` });
    }
  }

  const fechas = candidatas.map((v) => v.dia).sort();
  return {
    nuevas: candidatas.map(({ vehiculo, ...v }) => ({ ...v, vehicleId: vehiculo.id, kmSospechoso: sospechosa.has(v.fila) })),
    duplicadas,
    errores,
    placasDesconocidas: Array.from(desconocidas, ([placa, filas]) => ({ placa, filas })).sort((a, b) => b.filas - a.filas),
    advertencias,
    lecturasValidas: Array.from(mejorPorVehiculo.values()),
    rango: fechas.length ? { desde: fechas[0], hasta: fechas[fechas.length - 1] } : null,
  };
}

/** Texto corto para `fuel_logs.notas`, p. ej. «Diesel | EDS LA 33». */
export function notasDeVenta(v: Pick<VentaCombustible, "combustible" | "estacion">): string | null {
  return [v.combustible, v.estacion].filter(Boolean).join(" | ") || null;
}
