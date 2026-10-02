import { alertasDeVehiculo, type TipoAlertaHojaDeVida, type VehiculoParaAlertas } from "@/lib/hoja-de-vida-alertas";
import type { Dia } from "@/lib/fechas";

// Cálculo puro de los indicadores de mantenimiento de /kpis: sin base de datos, para poder probarlo.

export interface PreoperacionalFila {
  vehicle_id: string;
  fecha: Dia;
  checklist_ok: boolean;
}

export interface CumplimientoPreoperacional {
  realizados: number;
  conFalla: number;
  porcentajeConFalla: number | null;
  /** Vehículos distintos con al menos un preoperacional en el periodo. */
  vehiculosConPreoperacional: number;
  /** Promedio diario de vehículos con preoperacional / flota operativa. null si no hay flota o días. */
  coberturaDiariaPromedio: number | null;
  diasConRegistro: number;
}

/**
 * Cumplimiento del preoperacional. "Esperados" aún no tiene programación diaria: se usa la flota OPERATIVA de hoy
 * como denominador, por eso la cobertura es una aproximación (se declara así en la pantalla).
 */
export function cumplimientoPreoperacional(filas: PreoperacionalFila[], flotaOperativa: number): CumplimientoPreoperacional {
  const porDia = new Map<Dia, Set<string>>();
  const vehiculos = new Set<string>();
  let conFalla = 0;
  for (const f of filas) {
    vehiculos.add(f.vehicle_id);
    if (!f.checklist_ok) conFalla++;
    const set = porDia.get(f.fecha) ?? new Set<string>();
    set.add(f.vehicle_id);
    porDia.set(f.fecha, set);
  }
  const dias = porDia.size;
  const sumaDiaria = Array.from(porDia.values()).reduce((s, set) => s + set.size, 0);
  return {
    realizados: filas.length,
    conFalla,
    porcentajeConFalla: filas.length > 0 ? (conFalla / filas.length) * 100 : null,
    vehiculosConPreoperacional: vehiculos.size,
    coberturaDiariaPromedio: flotaOperativa > 0 && dias > 0 ? Math.min(100, (sumaDiaria / dias / flotaOperativa) * 100) : null,
    diasConRegistro: dias,
  };
}

export interface CargaCombustible {
  galones: number;
  costo: number | null;
  km_sospechoso?: boolean | null;
}

export interface ResumenCombustible {
  cargas: number;
  galones: number;
  costo: number;
  /** Costo / galón sobre las cargas que traen costo. null si ninguna lo trae. */
  costoPorGalon: number | null;
  sospechosas: number;
}

export function resumenCombustible(cargas: CargaCombustible[]): ResumenCombustible {
  let galones = 0, costo = 0, galonesConCosto = 0, sospechosas = 0;
  for (const c of cargas) {
    const g = Number(c.galones) || 0;
    galones += g;
    if (c.costo != null && Number(c.costo) > 0) { costo += Number(c.costo); galonesConCosto += g; }
    if (c.km_sospechoso) sospechosas++;
  }
  return { cargas: cargas.length, galones, costo, costoPorGalon: galonesConCosto > 0 ? costo / galonesConCosto : null, sospechosas };
}

export interface ResumenHojasDeVida {
  flota: number;
  alDia: number;
  porcentajeAlDia: number | null;
  porTipo: Record<TipoAlertaHojaDeVida, number>;
  /** Placas con SOAT o RTM vencido o por vencer, ordenadas por urgencia (alta primero). */
  vencimientos: { placa: string; detalle: string; gravedad: "alta" | "media" }[];
}

/** Hojas de vida al día = sin ninguna alerta. Reutiliza el motor de alertas de Vehículos (una sola regla). */
export function resumenHojasDeVida(vehiculos: VehiculoParaAlertas[], hoy: Dia): ResumenHojasDeVida {
  const porTipo: Record<TipoAlertaHojaDeVida, number> = { FDS_SIN_FECHA: 0, FDS_LARGO: 0, SOAT: 0, RTM: 0, INCOMPLETA: 0 };
  const vencimientos: ResumenHojasDeVida["vencimientos"] = [];
  let alDia = 0;
  for (const v of vehiculos) {
    const alertas = alertasDeVehiculo(v, hoy);
    if (alertas.length === 0) alDia++;
    for (const a of alertas) {
      porTipo[a.tipo]++;
      if (a.tipo === "SOAT" || a.tipo === "RTM") vencimientos.push({ placa: v.placa, detalle: a.detalle, gravedad: a.gravedad });
    }
  }
  vencimientos.sort((a, b) => (a.gravedad === b.gravedad ? a.placa.localeCompare(b.placa) : a.gravedad === "alta" ? -1 : 1));
  return { flota: vehiculos.length, alDia, porcentajeAlDia: vehiculos.length > 0 ? (alDia / vehiculos.length) * 100 : null, porTipo, vencimientos };
}

export interface LecturaKm {
  vehicle_id: string;
  fecha: Dia;
  lectura_kilometraje: number;
}

/** Km recorridos por vehículo en el periodo = lectura más alta − más baja; con menos de 2 lecturas no hay dato. */
export function kmRecorridosPorVehiculo(lecturas: LecturaKm[]): Map<string, number> {
  const rango = new Map<string, { min: number; max: number; n: number }>();
  for (const l of lecturas) {
    const r = rango.get(l.vehicle_id) ?? { min: Infinity, max: -Infinity, n: 0 };
    r.min = Math.min(r.min, l.lectura_kilometraje);
    r.max = Math.max(r.max, l.lectura_kilometraje);
    r.n++;
    rango.set(l.vehicle_id, r);
  }
  const km = new Map<string, number>();
  rango.forEach((r, id) => { if (r.n >= 2 && r.max > r.min) km.set(id, r.max - r.min); });
  return km;
}

export interface CostoPorKmFila {
  vehicleId: string;
  placa: string;
  costoTotal: number;
  kmRecorridos: number;
  costoPorKm: number;
  kmActual: number | null;
}

export function costoPorKm(
  costos: { vehicleId: string; placa: string; costoTotal: number }[],
  km: Map<string, number>,
  kmActual: Map<string, number | null>,
): CostoPorKmFila[] {
  const filas: CostoPorKmFila[] = [];
  for (const c of costos) {
    const recorridos = km.get(c.vehicleId);
    if (!recorridos || c.costoTotal <= 0) continue;
    filas.push({ vehicleId: c.vehicleId, placa: c.placa, costoTotal: c.costoTotal, kmRecorridos: recorridos, costoPorKm: c.costoTotal / recorridos, kmActual: kmActual.get(c.vehicleId) ?? null });
  }
  return filas.sort((a, b) => b.costoPorKm - a.costoPorKm);
}
