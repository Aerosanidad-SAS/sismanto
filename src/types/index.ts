// Tipos TypeScript basados en el esquema de Supabase

export type VehicleStatus = 'OPERATIVO' | 'FUERA_DE_SERVICIO';
export type MaintenanceType = 'PREVENTIVO' | 'CORRECTIVO';
export type SeverityLevel = 'BAJA' | 'MEDIA' | 'ALTA';
export type IncidentStatus = 'ABIERTO' | 'EN_PROCESO' | 'CERRADO';

export interface OperationalCenter {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
  created_at: string;
}

export interface Supplier {
  id: number;
  nombre: string;
  nit?: string | null;
  contacto?: string | null;
  telefono?: string | null;
  ciudad?: string | null;
  servicio?: string | null;
  direccion?: string | null;
  activo: boolean;
  created_at: string;
}

export interface FuelLog {
  id: number;
  vehicle_id: string;
  fecha: string;
  kilometraje: number;
  galones: number;
  costo?: number | null;
  notas?: string | null;
  created_at: string;
}

export interface Vehicle {
  id: string;
  placa: string;
  marca?: string | null;
  modelo?: string | null;
  linea?: string | null;
  tipo_llantas?: string | null;
  combustible?: string | null;
  tipo_combustible?: string | null;
  tipo_bombillos?: string | null;
  bombilleria_farolas?: string | null;
  bombilleria_stops?: string | null;
  bombilleria_direccionales?: string | null;
  tipo_refrigerante?: string | null;
  aceite_usado?: string | null;
  ref_filtro_aire_motor?: string | null;
  ref_filtro_aceite?: string | null;
  ref_filtro_combustible?: string | null;
  bateria_principal?: string | null;
  bateria_auxiliar?: string | null;
  notas?: string | null;
  vencimiento_rtm?: string | null;
  vencimiento_soat?: string | null;
  vencimiento_tecnicomecanica?: string | null;
  /** Costos anuales estimados / administrativos (migración 006) */
  costo_soat_anual?: number | null;
  costo_tecnomecanica_anual?: number | null;
  costo_poliza_anual?: number | null;
  estado_actual: VehicleStatus;
  centro_operativo: string;
  centro_operativo_id?: number | null;
  /** Fecha desde la cual la unidad queda fuera de servicio operativo (migración 009). */
  fds_desde?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceCategory {
  id: number;
  nombre: string;
  grupo_padre?: string | null;
  tipo_default?: MaintenanceType | null;
  activo: boolean;
}

export interface MaintenanceRecord {
  id_manto: number;
  vehicle_id: string;
  fecha: string;
  kilometraje_actual: number;
  tipo: MaintenanceType;
  categoria_id?: number | null;
  descripcion_trabajo?: string | null;
  proveedor?: string | null;
  supplier_id?: number | null;
  valor?: number | null;
  numero_factura?: string | null;
  tiempo_fuera_servicio_horas?: number | null;
  notas_adicionales?: string | null;
  incident_id?: number | null;
  created_at: string;
  created_by?: string | null;
}

export interface Incident {
  id: number;
  vehicle_id: string;
  fecha_reporte: string;
  descripcion: string;
  severidad: SeverityLevel;
  /** Prioridad operativa definida solo por administración */
  prioridad?: SeverityLevel | null;
  reportado_por: string;
  afecta_operatividad: boolean;
  estado: IncidentStatus;
  fecha_cierre?: string | null;
  mantenimiento_cierre_id?: number | null;
  tiempo_resolucion_horas?: number | null;
  created_at: string;
}

export interface MileageLog {
  id: number;
  vehicle_id: string;
  fecha: string;
  lectura_kilometraje: number;
  created_at: string;
}

export interface MaintenanceSchedule {
  id: number;
  nombre_tarea: string;
  categoria_id?: number | null;
  frecuencia_km?: number | null;
  frecuencia_meses?: number | null;
  descripcion?: string | null;
  activo: boolean;
}

// Tipos para formularios
export interface MaintenanceFormData {
  vehicleId: string;
  fecha: Date;
  kilometrajeActual: number;
  tipo: MaintenanceType;
  categoriaId: number;
  descripcionTrabajo: string;
  proveedor: string;
  supplierId?: number;
  valor: number;
  numeroFactura?: string;
  tiempoFueraServicioHoras?: number;
  notasAdicionales?: string;
  incidentId?: number;
}

export interface IncidentFormData {
  vehicleId: string;
  descripcion: string;
  severidad: SeverityLevel;
  reportadoPor: string;
  afectaOperatividad: boolean;
}

// Tipos para KPIs
export interface UptimeKPI {
  vehicleId: string;
  placa: string;
  centroOperativo: string;
  horasTotales: number;
  horasFueraServicio: number;
  porcentajeDisponibilidad: number;
  cumpleMeta: boolean;
}

export interface TCOKPI {
  placa?: string | null;
  centroOperativo?: string | null;
  costoPreventivo: number;
  costoCorrectivo: number;
  costoCombustible?: number;
  costoFijoAnual?: number;
  costoTotal: number;
  cantidadMantenimientos: number;
}

export interface RatioPCKPI {
  costoPreventivo: number;
  costoCorrectivo: number;
  ratio: number;
  cantidadPreventivo: number;
  cantidadCorrectivo: number;
}

export interface ResolutionTimeKPI {
  severidad: SeverityLevel;
  promedioHoras: number;
  cantidadCerradas: number;
  cantidadAbiertas: number;
}

export interface CostoPorVehiculoKPI {
  vehicleId: string;
  placa: string;
  marca?: string | null;
  costoPreventivo: number;
  costoCorrectivo: number;
  costoCombustible: number;
  costoFijoAnual: number;
  costoMantenimientoTotal: number;
  costoTotal: number;
  cantidadMantenimientos: number;
}

export interface DisponibilidadVehiculo {
  vehicleId: string;
  placa: string;
  marca?: string | null;
  /** DISP = operativo, FDS = fuera de servicio */
  estadoOperativo?: "DISP" | "FDS";
  horasTotales: number;
  tfdsHoras: number;
  disponibilidadPct: number;
  cumpleMeta: boolean;
}

/** Punto mensual para gráfica de rendimiento combustible (km/gal). */
export interface RendimientoCombustibleMes {
  mes: string;
  rendimientoKmGal: number | null;
}

export interface ConsumoVehiculo {
  vehicleId: string;
  placa: string;
  marca?: string | null;
  kmRecorridos: number;
  consumoPromedioKmGal: number | null;
  totalGalones: number;
  cantidadCargas: number;
}

// Tipos para el dashboard
export interface DashboardSummary {
  totalOperativos: number;
  totalFueraServicio: number;
  costoMesActual: number;
  novedadesAbiertas: number;
  proximosVencimientos: number;
}

export interface MaintenanceAlert {
  placa: string;
  nombreTarea: string;
  kmProximoManto: number;
  kmActual: number;
  kmFaltantes: number;
}

// ── Migración 005 ──────────────────────────────────────────

export type ChecklistItemEstado = 'OK' | 'FALLA' | 'NO_APLICA';

export type ChecklistCategoria =
  | 'GENERAL'
  | 'LUCES'
  | 'CABINA'
  | 'EQUIPO_BASICO'
  | 'EQUIPO_CARRETERA';

export interface ChecklistItem {
  id: number;
  categoria: ChecklistCategoria;
  descripcion: string;
  cantidad_esperada: string | null;
  orden: number;
  activo: boolean;
  created_at: string;
}

export interface DailyCheckItem {
  id: number;
  daily_check_id: number;
  checklist_item_id: number;
  estado: ChecklistItemEstado;
  observacion: string | null;
  created_at: string;
}

export interface MaintenanceItem {
  id: number;
  maintenance_record_id: number;
  descripcion: string;
  cantidad: number;
  valor_unitario: number;
  created_at: string;
}

// Form types

export interface MaintenanceItemInput {
  descripcion: string;
  cantidad: number;
  valor_unitario: number;
}

export interface DailyCheckItemInput {
  checklist_item_id: number;
  estado: ChecklistItemEstado;
  observacion?: string;
}

// Tipo extendido con ítems para el formulario de mantenimiento
export interface MaintenanceRecordWithItems extends MaintenanceRecord {
  items: MaintenanceItem[];
}

// Tipo extendido del daily_check con resultados por ítem
export interface DailyCheckWithItems {
  id: number;
  user_id: string;
  vehicle_id: string;
  fecha: string;
  kilometraje_inicial: number | null;
  kilometraje_final: number | null;
  checklist_ok: boolean;
  observaciones: string | null;
  is_assignment: boolean;
  created_at: string;
  items: DailyCheckItem[];
}

// Para la vista admin del Portal OVEM
export interface PreoperacionalResumen {
  vehicle_id: string;
  placa: string;
  conductor: string | null;
  fecha: string;
  estado: 'COMPLETADO' | 'PENDIENTE';
  hayFallas: boolean;
  cantidadFallas: number;
}

// Plan de mantenimiento preventivo
export interface MaintenancePlanItem {
  id: number;
  descripcion: string;
  categoria: string;
  intervalo_km: number;
  intervalo_dias: number;
  aplica_a: string;
  alerta_naranja_km: number;
  alerta_roja_km: number;
  alerta_naranja_dias: number;
  alerta_roja_dias: number;
  activo: boolean;
}

export interface VehicleMaintenanceLog {
  id: number;
  vehicle_id: string;
  plan_item_id: number;
  fecha_realizado: string;
  km_realizado: number | null;
  maintenance_record_id: number | null;
  registrado_por: string | null;
  notas: string | null;
  created_at: string;
}

export type AlertLevel = 'ROJA' | 'NARANJA' | 'OK';

export interface MaintenanceAlert {
  vehicle_id: string;
  placa: string;
  centro_operativo: string | null;
  plan_item_id: number;
  descripcion: string;
  categoria: string;
  intervalo_km: number;
  intervalo_dias: number;
  aplica_a: string;
  ultimo_mantenimiento: string;
  km_ultimo: number | null;
  km_restantes: number | null;
  dias_restantes: number | null;
  nivel_alerta: AlertLevel;
}
