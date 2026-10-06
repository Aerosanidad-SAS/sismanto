// Reglas puras del cambio de vehículo del OVEM y de la reasignación de servicios (migración 110): sin base de datos,
// para poder probarlas. Regla de negocio (Daniel, 2026-10-02): el servicio pertenece al VEHÍCULO, no a la persona.

import { diasEntre, esDia } from "./fechas";

export const RAZONES_CAMBIO = [
  { codigo: "REPARACION", etiqueta: "Vehículo a reparación" },
  { codigo: "MANTENIMIENTO", etiqueta: "Vehículo a mantenimiento" },
  { codigo: "SINIESTRO", etiqueta: "Siniestro" },
  { codigo: "FALLA", etiqueta: "Falla del vehículo" },
  { codigo: "AJUSTE_OPERATIVO", etiqueta: "Ajuste de la operación" },
  { codigo: "OTRA", etiqueta: "Otra razón" },
] as const;

export type RazonCodigo = (typeof RAZONES_CAMBIO)[number]["codigo"];

/** Razones que suelen tener una novedad detrás: ahí se ofrece enlazarla. */
export const RAZONES_CON_NOVEDAD: readonly RazonCodigo[] = ["REPARACION", "MANTENIMIENTO", "FALLA", "SINIESTRO"];

/** Mismo mínimo que el CHECK de la migración 110. */
export const MIN_CARACTERES_RAZON = 5;

export function esRazonCodigo(valor: unknown): valor is RazonCodigo {
  return RAZONES_CAMBIO.some((r) => r.codigo === valor);
}

export interface RazonCambio {
  razonCodigo?: string | null;
  razonTexto?: string | null;
  /** Novedad que motivó el cambio (opcional; solo tiene sentido con las razones de RAZONES_CON_NOVEDAD). */
  incidentId?: number | null;
}

/** Mensaje de error si la razón no es válida; null si lo es. Con OTRA el texto es la razón. */
export function validarRazon(razon: RazonCambio | null | undefined): string | null {
  if (!razon || !esRazonCodigo(razon.razonCodigo)) return "Elige la razón del cambio de vehículo.";
  if ((razon.razonTexto ?? "").trim().length < MIN_CARACTERES_RAZON) {
    return "Escribe la razón del cambio (mínimo " + MIN_CARACTERES_RAZON + " caracteres).";
  }
  return null;
}

export interface Llegada {
  userId: string;
  /** Vehículo donde ese conductor operaba el mismo día; null si no tenía. */
  vehiculoOrigen: string | null;
}

export interface PlanCambioDelDia {
  /** Operaban en este vehículo ese día y ya no. */
  retirados: string[];
  /** Pasan a operar este vehículo y antes no lo hacían ese día. */
  llegadas: Llegada[];
  /** true si el cambio retira o reemplaza a alguien ya programado, o mueve a alguien desde otro vehículo. */
  requiereRazon: boolean;
}

/**
 * Qué implica dejar `nuevos` en un vehículo cuyos operadores del día eran `previos`. `enOtroVehiculo` dice, por
 * conductor, en qué otro vehículo operaba ese mismo día (los que no estén en el mapa no tenían).
 * Llenar un puesto vacío no necesita razón; retirar a alguien o traer a alguien de otro vehículo, sí.
 */
export function planificarCambioDelDia(previos: string[], nuevos: string[], enOtroVehiculo: Map<string, string>): PlanCambioDelDia {
  const retirados = previos.filter((id) => !nuevos.includes(id));
  const llegadas = nuevos.filter((id) => !previos.includes(id)).map((userId) => ({ userId, vehiculoOrigen: enOtroVehiculo.get(userId) ?? null }));
  return { retirados, llegadas, requiereRazon: retirados.length > 0 || llegadas.some((l) => l.vehiculoOrigen !== null) };
}

export interface FilaCambio {
  user_id: string;
  vehicle_origen: string | null;
  vehicle_destino: string | null;
}

/**
 * Filas de `vehicle_operador_cambios`: una por conductor afectado. Las llegadas llevan su origen real; los retirados
 * quedan sin destino (sin vehículo ese día), salvo que otra acción los vuelva a poner en uno.
 */
export function filasDeCambio(vehicleId: string, plan: PlanCambioDelDia): FilaCambio[] {
  const llegadas = plan.llegadas.map((l) => ({ user_id: l.userId, vehicle_origen: l.vehiculoOrigen, vehicle_destino: vehicleId }));
  const retirados = plan.retirados.map((user_id) => ({ user_id, vehicle_origen: vehicleId, vehicle_destino: null }));
  return [...llegadas, ...retirados];
}

/** Vehículos de donde salen conductores en este cambio: este (por los retirados) y los de origen de las llegadas. */
export function vehiculosDeOrigen(vehicleId: string, plan: PlanCambioDelDia): string[] {
  const out = new Set<string>();
  if (plan.retirados.length > 0) out.add(vehicleId);
  for (const l of plan.llegadas) if (l.vehiculoOrigen) out.add(l.vehiculoOrigen);
  return Array.from(out);
}

/** Estado mínimo de un servicio para decidir si se puede mover. */
export interface ServicioMovible {
  id: number;
  vehicle_id: string | null;
  etapa: string;
  fecha_hora_inicio_desplazamiento: string | null;
}

/** Un servicio solo se mueve si sigue sin iniciar: PROGRAMADO y sin desplazamiento. Los iniciados nunca se mueven. */
export function esMovible(s: Pick<ServicioMovible, "etapa" | "fecha_hora_inicio_desplazamiento">): boolean {
  return s.etapa === "PROGRAMADO" && !s.fecha_hora_inicio_desplazamiento;
}

/** Ids de los servicios del origen que se pueden mover; con `soloIds`, solo entre esos (los demás se ignoran). */
export function serviciosMovibles(servicios: ServicioMovible[], vehiculoOrigen: string, soloIds?: number[]): number[] {
  return servicios
    .filter((s) => s.vehicle_id === vehiculoOrigen && esMovible(s) && (!soloIds || soloIds.includes(s.id)))
    .map((s) => s.id);
}

export interface AsignacionVigente {
  id: number;
  user_id: string;
  rol_en_turno: string;
  fecha_inicio: string;
}

export interface TripulacionVehiculo {
  ovem: string | null;
  medico: string | null;
  auxiliar: string | null;
}

/** Tripulación vigente por rol: la asignación más reciente de cada rol (por fecha de inicio y luego por id). */
export function tripulacionVigente(asignaciones: AsignacionVigente[]): TripulacionVehiculo {
  const mejor = (rol: string) =>
    asignaciones
      .filter((a) => a.rol_en_turno === rol)
      .sort((a, b) => (a.fecha_inicio === b.fecha_inicio ? b.id - a.id : a.fecha_inicio < b.fecha_inicio ? 1 : -1))[0]?.user_id ?? null;
  return { ovem: mejor("OVEM"), medico: mejor("MEDICO"), auxiliar: mejor("AUXILIAR_ENFERMERIA") };
}

/** Campos de tripulación que se reescriben en un servicio al pasar al vehículo destino. */
export function camposTripulacionDestino(tripulacion: TripulacionVehiculo, medicoDelVehiculo: boolean) {
  return {
    ovem_user_id: tripulacion.ovem,
    auxiliar_user_id: tripulacion.auxiliar,
    // En Medicina Domiciliaria el médico se elige aparte (puede ser un prestador externo): no se pisa.
    ...(medicoDelVehiculo ? { medico_user_id: tripulacion.medico } : {}),
  };
}

// ─── Historial de cambios (lectura) ──────────────────────────────────────────────────────────────────────────────

export const MAX_DIAS_HISTORIAL_CAMBIOS = 366;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface FiltroCambios {
  vehicleId?: string;
  userId?: string;
  desde: string;
  hasta: string;
}

/**
 * Valida el filtro del historial: fechas válidas, rango de máximo 366 días e ids con forma de UUID (el id se
 * interpola en un filtro `.or(...)` de PostgREST, así que nada que no sea un UUID debe llegar ahí).
 */
export function validarFiltroCambios(filtro: FiltroCambios): string | null {
  if (!esDia(filtro.desde) || !esDia(filtro.hasta)) return "Fechas inválidas.";
  if (filtro.hasta < filtro.desde) return "La fecha final es anterior a la inicial.";
  if (diasEntre(filtro.desde, filtro.hasta) > MAX_DIAS_HISTORIAL_CAMBIOS) return "El rango máximo es de " + MAX_DIAS_HISTORIAL_CAMBIOS + " días.";
  if (filtro.vehicleId !== undefined && !UUID.test(filtro.vehicleId)) return "Vehículo inválido.";
  if (filtro.userId !== undefined && !UUID.test(filtro.userId)) return "Conductor inválido.";
  return null;
}

export interface CambioVehiculo {
  id: number;
  fecha: string;
  conductor: string;
  placaOrigen: string | null;
  placaDestino: string | null;
  razonCodigo: string;
  razonEtiqueta: string;
  razonTexto: string;
  incidentId: number | null;
  registradoPor: string;
}

/** Etiqueta en español de un código de razón; si no se reconoce (dato antiguo), el código tal cual. */
export function etiquetaRazon(codigo: string): string {
  return RAZONES_CAMBIO.find((r) => r.codigo === codigo)?.etiqueta ?? codigo;
}
