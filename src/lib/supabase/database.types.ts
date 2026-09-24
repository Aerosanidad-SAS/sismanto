// Tipos para Supabase JS v2 (compatible con v2.93+)
// Actualizado con las nuevas tablas de la Iteración 2

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Formatos TI (migración 070): las columnas de firma llevan ruta+hash; `numero_orden` es generada por la base.
type TiActaEntregaRow = {
  id: number; numero_orden: string; tipo_equipo: string;
  func_nombre: string; func_cedula: string; func_cargo: string; func_sede: string; func_correo: string;
  equipo_referencia: string; equipo_marca: string; equipo_modelo: string; equipo_placa: string;
  equipo_imei: string; equipo_sim: string; equipo_activo: string; equipo_tarjeta_sd: string; equipo_operador: string;
  checklist: Json; fecha_entrega: string; lugar_entrega: string;
  entrega_nombre: string; firma_entrega_ruta: string; firma_entrega_hash: string;
  recibe_nombre: string; firma_recibe_ruta: string; firma_recibe_hash: string;
  fecha_devolucion: string | null; lugar_devolucion: string | null;
  devolucion_entrega_nombre: string | null; firma_devolucion_entrega_ruta: string | null; firma_devolucion_entrega_hash: string | null;
  devolucion_recibe_nombre: string | null; firma_devolucion_recibe_ruta: string | null; firma_devolucion_recibe_hash: string | null;
  observaciones: string; firmas_png: Json; sisres_id: number | null;
  created_by: string | null; created_at: string; updated_at: string
}

type TiDiagnosticoRow = {
  id: number; numero_orden: string; fecha_diagnostico: string; equipo: string; marca: string; modelo: string;
  usuario_equipo: string; serial: string; ubicacion: string; responsable_equipo: string; fecha_orden: string | null;
  sede: string; placa: string; codigo_institucional: string; tipo_mtto: string;
  diagnostico: Json; descripcion_falla: string; checklist: Json;
  equipo_apto_uso: boolean; equipo_averiado: boolean; requirio_reparacion: boolean; partes_buen_estado: boolean;
  observaciones: string; realizo_nombre: string; realizo_cargo: string; firma_realizo_ruta: string; firma_realizo_hash: string;
  reviso_nombre: string; reviso_cargo: string; firma_reviso_ruta: string; firma_reviso_hash: string;
  firmas_png: Json; sisres_id: number | null; created_by: string | null; created_at: string; updated_at: string
}
type TiDiagnosticoRepuestoRow = { id: number; diagnostico_id: number; repuesto: string; referencia_serial: string; cantidad: number }

type TiBajaEquipoRow = {
  id: number; numero_orden: string; tipo_equipo: string;
  fecha_ingreso_reporte: string | null; numero_inventario: string | null; sede: string | null; ubicacion_sanidad: string | null;
  mayor_dos_anios: boolean; nombre_equipo: string; marca: string; modelo: string; serie: string;
  causa_baja: string; causa_baja_detalle: string; concepto_tecnico_radicado: string; proveedor_garantia: string;
  denuncio: string; costo_historico: string; fecha_compra: string | null;
  telecom_tipo: string; telecom_marca: string; telecom_modelo: string; telecom_imei: string; telecom_operador: string;
  accesorios: Json; observaciones: string; responsable_nombre: string; firma_responsable_ruta: string; firma_responsable_hash: string;
  firmas_png: Json; sisres_id: number | null; created_by: string | null; created_at: string; updated_at: string
}

type TiPrestamoEquipoRow = {
  id: number; numero_orden: string; fecha_entrega: string; equipo_descripcion: string; equipo_placa: string; equipo_incluye: string;
  usuario_recibe_nombre: string; usuario_recibe_cargo: string; firma_usuario_recibe_ruta: string; firma_usuario_recibe_hash: string;
  func_entrega_nombre: string; func_entrega_cargo: string; firma_func_entrega_ruta: string; firma_func_entrega_hash: string;
  fecha_devolucion: string | null; gestion_recibe_nombre: string | null; gestion_recibe_cargo: string | null;
  firma_gestion_recibe_ruta: string | null; firma_gestion_recibe_hash: string | null;
  usuario_entrega_dev_nombre: string | null; usuario_entrega_dev_cargo: string | null;
  firma_usuario_entrega_dev_ruta: string | null; firma_usuario_entrega_dev_hash: string | null;
  observaciones: string; firmas_png: Json; sisres_id: number | null; created_by: string | null; created_at: string; updated_at: string
}

export type Database = {
  public: {
    Tables: {
      operational_centers: {
        Row: {
          id: number
          codigo: string
          nombre: string
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: number
          codigo: string
          nombre: string
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          codigo?: string
          nombre?: string
          activo?: boolean
          created_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          id: number
          nombre: string
          nit: string | null
          contacto: string | null
          telefono: string | null
          ciudad: string | null
          servicio: string | null
          direccion: string | null
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: number
          nombre: string
          nit?: string | null
          contacto?: string | null
          telefono?: string | null
          ciudad?: string | null
          servicio?: string | null
          direccion?: string | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          nombre?: string
          nit?: string | null
          contacto?: string | null
          telefono?: string | null
          ciudad?: string | null
          servicio?: string | null
          direccion?: string | null
          activo?: boolean
          created_at?: string
        }
        Relationships: []
      }
      fuel_logs: {
        Row: {
          id: number
          vehicle_id: string
          fecha: string
          kilometraje: number
          galones: number
          costo: number | null
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: number
          vehicle_id: string
          fecha: string
          kilometraje: number
          galones: number
          costo?: number | null
          notas?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          vehicle_id?: string
          fecha?: string
          kilometraje?: number
          galones?: number
          costo?: number | null
          notas?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          }
        ]
      }
      vehicles: {
        Row: {
          id: string
          placa: string
          marca: string | null
          modelo: string | null
          linea: string | null
          tipo_llantas: string | null
          combustible: string | null
          tipo_combustible: string | null
          tipo_bombillos: string | null
          bombilleria_farolas: string | null
          bombilleria_stops: string | null
          bombilleria_direccionales: string | null
          tipo_refrigerante: string | null
          aceite_usado: string | null
          ref_filtro_aire_motor: string | null
          ref_filtro_aceite: string | null
          ref_filtro_combustible: string | null
          bateria_principal: string | null
          bateria_auxiliar: string | null
          notas: string | null
          vencimiento_rtm: string | null
          vencimiento_soat: string | null
          vencimiento_tecnicomecanica: string | null
          costo_soat_anual: number | null
          costo_tecnomecanica_anual: number | null
          costo_poliza_anual: number | null
          estado_actual: 'OPERATIVO' | 'FUERA_DE_SERVICIO'
          centro_operativo: string
          centro_operativo_id: number | null
          /** Inicio operativo fuera de servicio (negocio); ver migración 009. */
          fds_desde: string | null
          onedrive_folder_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          placa: string
          marca?: string | null
          modelo?: string | null
          linea?: string | null
          tipo_llantas?: string | null
          combustible?: string | null
          tipo_combustible?: string | null
          tipo_bombillos?: string | null
          bombilleria_farolas?: string | null
          bombilleria_stops?: string | null
          bombilleria_direccionales?: string | null
          tipo_refrigerante?: string | null
          aceite_usado?: string | null
          ref_filtro_aire_motor?: string | null
          ref_filtro_aceite?: string | null
          ref_filtro_combustible?: string | null
          bateria_principal?: string | null
          bateria_auxiliar?: string | null
          notas?: string | null
          vencimiento_rtm?: string | null
          vencimiento_soat?: string | null
          vencimiento_tecnicomecanica?: string | null
          costo_soat_anual?: number | null
          costo_tecnomecanica_anual?: number | null
          costo_poliza_anual?: number | null
          estado_actual?: 'OPERATIVO' | 'FUERA_DE_SERVICIO'
          centro_operativo: string
          centro_operativo_id?: number | null
          fds_desde?: string | null
          onedrive_folder_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          placa?: string
          marca?: string | null
          modelo?: string | null
          linea?: string | null
          tipo_llantas?: string | null
          combustible?: string | null
          tipo_combustible?: string | null
          tipo_bombillos?: string | null
          bombilleria_farolas?: string | null
          bombilleria_stops?: string | null
          bombilleria_direccionales?: string | null
          tipo_refrigerante?: string | null
          aceite_usado?: string | null
          ref_filtro_aire_motor?: string | null
          ref_filtro_aceite?: string | null
          ref_filtro_combustible?: string | null
          bateria_principal?: string | null
          bateria_auxiliar?: string | null
          notas?: string | null
          vencimiento_rtm?: string | null
          vencimiento_soat?: string | null
          vencimiento_tecnicomecanica?: string | null
          costo_soat_anual?: number | null
          costo_tecnomecanica_anual?: number | null
          costo_poliza_anual?: number | null
          estado_actual?: 'OPERATIVO' | 'FUERA_DE_SERVICIO'
          centro_operativo?: string
          centro_operativo_id?: number | null
          fds_desde?: string | null
          onedrive_folder_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_centro_operativo_id_fkey"
            columns: ["centro_operativo_id"]
            isOneToOne: false
            referencedRelation: "operational_centers"
            referencedColumns: ["id"]
          }
        ]
      }
      vehicle_status_history: {
        Row: {
          id: number
          vehicle_id: string
          estado_nuevo: 'OPERATIVO' | 'FUERA_DE_SERVICIO'
          estado_anterior: 'OPERATIVO' | 'FUERA_DE_SERVICIO' | null
          fecha_cambio: string
          registrado_por: string | null
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: number
          vehicle_id: string
          estado_nuevo: 'OPERATIVO' | 'FUERA_DE_SERVICIO'
          estado_anterior?: 'OPERATIVO' | 'FUERA_DE_SERVICIO' | null
          fecha_cambio?: string
          registrado_por?: string | null
          notas?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          vehicle_id?: string
          estado_nuevo?: 'OPERATIVO' | 'FUERA_DE_SERVICIO'
          estado_anterior?: 'OPERATIVO' | 'FUERA_DE_SERVICIO' | null
          fecha_cambio?: string
          registrado_por?: string | null
          notas?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_status_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          }
        ]
      }
      maintenance_categories: {
        Row: {
          id: number
          nombre: string
          grupo_padre: string | null
          tipo_default: 'PREVENTIVO' | 'CORRECTIVO' | null
          activo: boolean
        }
        Insert: {
          id?: number
          nombre: string
          grupo_padre?: string | null
          tipo_default?: 'PREVENTIVO' | 'CORRECTIVO' | null
          activo?: boolean
        }
        Update: {
          id?: number
          nombre?: string
          grupo_padre?: string | null
          tipo_default?: 'PREVENTIVO' | 'CORRECTIVO' | null
          activo?: boolean
        }
        Relationships: []
      }
      maintenance_records: {
        Row: {
          id_manto: number
          vehicle_id: string
          fecha: string
          kilometraje_actual: number
          tipo: 'PREVENTIVO' | 'CORRECTIVO'
          categoria_id: number | null
          descripcion_trabajo: string | null
          proveedor: string | null
          supplier_id: number | null
          valor: number | null
          numero_factura: string | null
          tiempo_fuera_servicio_horas: number | null
          notas_adicionales: string | null
          incident_id: number | null
          invoice_job_id: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id_manto?: number
          vehicle_id: string
          fecha: string
          kilometraje_actual: number
          tipo: 'PREVENTIVO' | 'CORRECTIVO'
          categoria_id?: number | null
          descripcion_trabajo?: string | null
          proveedor?: string | null
          supplier_id?: number | null
          valor?: number | null
          numero_factura?: string | null
          tiempo_fuera_servicio_horas?: number | null
          notas_adicionales?: string | null
          incident_id?: number | null
          invoice_job_id?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id_manto?: number
          vehicle_id?: string
          fecha?: string
          kilometraje_actual?: number
          tipo?: 'PREVENTIVO' | 'CORRECTIVO'
          categoria_id?: number | null
          descripcion_trabajo?: string | null
          proveedor?: string | null
          supplier_id?: number | null
          valor?: number | null
          numero_factura?: string | null
          tiempo_fuera_servicio_horas?: number | null
          notas_adicionales?: string | null
          incident_id?: number | null
          invoice_job_id?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      incidents: {
        Row: {
          id: number
          vehicle_id: string
          fecha_reporte: string
          descripcion: string
          severidad: 'BAJA' | 'MEDIA' | 'ALTA'
          prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | null
          reportado_por: string
          afecta_operatividad: boolean
          estado: 'ABIERTO' | 'EN_PROCESO' | 'CERRADO'
          fecha_cierre: string | null
          mantenimiento_cierre_id: number | null
          tiempo_resolucion_horas: number | null
          created_at: string
        }
        Insert: {
          id?: number
          vehicle_id: string
          fecha_reporte?: string
          descripcion: string
          severidad: 'BAJA' | 'MEDIA' | 'ALTA'
          prioridad?: 'BAJA' | 'MEDIA' | 'ALTA' | null
          reportado_por: string
          afecta_operatividad?: boolean
          fecha_cierre?: string | null
          mantenimiento_cierre_id?: number | null
          tiempo_resolucion_horas?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          vehicle_id?: string
          fecha_reporte?: string
          descripcion?: string
          severidad?: 'BAJA' | 'MEDIA' | 'ALTA'
          prioridad?: 'BAJA' | 'MEDIA' | 'ALTA' | null
          reportado_por?: string
          afecta_operatividad?: boolean
          estado?: 'ABIERTO' | 'EN_PROCESO' | 'CERRADO'
          fecha_cierre?: string | null
          mantenimiento_cierre_id?: number | null
          tiempo_resolucion_horas?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          }
        ]
      }
      mileage_logs: {
        Row: {
          id: number
          vehicle_id: string
          fecha: string
          lectura_kilometraje: number
          created_at: string
        }
        Insert: {
          id?: number
          vehicle_id: string
          fecha: string
          lectura_kilometraje: number
          created_at?: string
        }
        Update: {
          id?: number
          vehicle_id?: string
          fecha?: string
          lectura_kilometraje?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mileage_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          }
        ]
      }
      roles: {
        Row: { id: number; codigo: string; nombre: string; descripcion: string | null; created_at: string }
        Insert: { id?: number; codigo: string; nombre: string; descripcion?: string | null; created_at?: string }
        Update: { id?: number; codigo?: string; nombre?: string; descripcion?: string | null; created_at?: string }
        Relationships: []
      }
      service_types: {
        Row: {
          id: number
          codigo: string
          nombre: string
          activo: boolean
          orden: number
          created_at: string
        }
        Insert: {
          id?: number
          codigo: string
          nombre: string
          activo?: boolean
          orden?: number
          created_at?: string
        }
        Update: {
          id?: number
          codigo?: string
          nombre?: string
          activo?: boolean
          orden?: number
          created_at?: string
        }
        Relationships: []
      }
      vehicle_service_revenue: {
        Row: {
          id: number
          vehicle_id: string
          service_type_id: number
          periodo: string
          monto: number
          notas: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: number
          vehicle_id: string
          service_type_id: number
          periodo: string
          monto: number
          notas?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: number
          vehicle_id?: string
          service_type_id?: number
          periodo?: string
          monto?: number
          notas?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_service_revenue_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_service_revenue_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: { id: number; user_id: string; role_id: number; nombre_completo: string | null; email: string | null; cedula: string | null; ciudad: string | null; activo: boolean; operational_center_id: number | null; created_at: string; updated_at: string }
        Insert: { id?: number; user_id: string; role_id: number; nombre_completo?: string | null; email?: string | null; cedula?: string | null; ciudad?: string | null; activo?: boolean; operational_center_id?: number | null; created_at?: string; updated_at?: string }
        Update: { id?: number; user_id?: string; role_id?: number; nombre_completo?: string | null; email?: string | null; cedula?: string | null; ciudad?: string | null; activo?: boolean; operational_center_id?: number | null; created_at?: string; updated_at?: string }
        Relationships: [
          {
            foreignKeyName: "user_profiles_operational_center_id_fkey"
            columns: ["operational_center_id"]
            isOneToOne: false
            referencedRelation: "operational_centers"
            referencedColumns: ["id"]
          }
        ]
      }
      vehicle_assignments: {
        Row: { id: number; user_id: string; vehicle_id: string; fecha_inicio: string; fecha_fin: string | null; activo: boolean; rol_en_turno: string; asignado_por: string | null; created_at: string }
        Insert: { id?: number; user_id: string; vehicle_id: string; fecha_inicio: string; fecha_fin?: string | null; activo?: boolean; rol_en_turno?: string; asignado_por?: string | null; created_at?: string }
        Update: { id?: number; user_id?: string; vehicle_id?: string; fecha_inicio?: string; fecha_fin?: string | null; activo?: boolean; rol_en_turno?: string; asignado_por?: string | null; created_at?: string }
        Relationships: []
      }
      daily_checks: {
        Row: { id: number; user_id: string; vehicle_id: string; fecha: string; kilometraje_inicial: number | null; kilometraje_final: number | null; checklist_ok: boolean; observaciones: string | null; is_assignment: boolean; created_at: string }
        Insert: { id?: number; user_id: string; vehicle_id: string; fecha: string; kilometraje_inicial?: number | null; kilometraje_final?: number | null; checklist_ok: boolean; observaciones?: string | null; is_assignment?: boolean; created_at?: string }
        Update: { id?: number; user_id?: string; vehicle_id?: string; fecha?: string; kilometraje_inicial?: number | null; kilometraje_final?: number | null; checklist_ok?: boolean; observaciones?: string | null; is_assignment?: boolean; created_at?: string }
        Relationships: []
      }
      maintenance_schedule: {
        Row: {
          id: number
          nombre_tarea: string
          categoria_id: number | null
          frecuencia_km: number | null
          frecuencia_meses: number | null
          descripcion: string | null
          activo: boolean
        }
        Insert: {
          id?: number
          nombre_tarea: string
          categoria_id?: number | null
          frecuencia_km?: number | null
          frecuencia_meses?: number | null
          descripcion?: string | null
          activo?: boolean
        }
        Update: {
          id?: number
          nombre_tarea?: string
          categoria_id?: number | null
          frecuencia_km?: number | null
          frecuencia_meses?: number | null
          descripcion?: string | null
          activo?: boolean
        }
        Relationships: []
      }
      maintenance_items: {
        Row: {
          id: number
          maintenance_record_id: number
          descripcion: string
          cantidad: number
          valor_unitario: number
          created_at: string
        }
        Insert: {
          id?: number
          maintenance_record_id: number
          descripcion: string
          cantidad?: number
          valor_unitario: number
          created_at?: string
        }
        Update: {
          id?: number
          maintenance_record_id?: number
          descripcion?: string
          cantidad?: number
          valor_unitario?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_items_maintenance_record_id_fkey"
            columns: ["maintenance_record_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id_manto"]
          }
        ]
      }
      checklist_items: {
        Row: {
          id: number
          categoria: string
          descripcion: string
          cantidad_esperada: string | null
          orden: number
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: number
          categoria: string
          descripcion: string
          cantidad_esperada?: string | null
          orden?: number
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          categoria?: string
          descripcion?: string
          cantidad_esperada?: string | null
          orden?: number
          activo?: boolean
          created_at?: string
        }
        Relationships: []
      }
      daily_check_items: {
        Row: {
          id: number
          daily_check_id: number
          checklist_item_id: number
          estado: 'OK' | 'FALLA' | 'NO_APLICA'
          cantidad_ok: number | null
          observacion: string | null
          created_at: string
        }
        Insert: {
          id?: number
          daily_check_id: number
          checklist_item_id: number
          estado: 'OK' | 'FALLA' | 'NO_APLICA'
          cantidad_ok?: number | null
          observacion?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          daily_check_id?: number
          checklist_item_id?: number
          estado?: 'OK' | 'FALLA' | 'NO_APLICA'
          cantidad_ok?: number | null
          observacion?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_check_items_daily_check_id_fkey"
            columns: ["daily_check_id"]
            isOneToOne: false
            referencedRelation: "daily_checks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_check_items_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          }
        ]
      }
      maintenance_plan_items: {
        Row: {
          id: number
          descripcion: string
          categoria: string
          intervalo_km: number
          intervalo_dias: number
          aplica_a: string
          alerta_naranja_km: number
          alerta_roja_km: number
          alerta_naranja_dias: number
          alerta_roja_dias: number
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: number
          descripcion: string
          categoria: string
          intervalo_km?: number
          intervalo_dias?: number
          aplica_a?: string
          alerta_naranja_km?: number
          alerta_roja_km?: number
          alerta_naranja_dias?: number
          alerta_roja_dias?: number
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          descripcion?: string
          categoria?: string
          intervalo_km?: number
          intervalo_dias?: number
          aplica_a?: string
          alerta_naranja_km?: number
          alerta_roja_km?: number
          alerta_naranja_dias?: number
          alerta_roja_dias?: number
          activo?: boolean
          created_at?: string
        }
        Relationships: []
      }
      vehicle_maintenance_log: {
        Row: {
          id: number
          vehicle_id: string
          plan_item_id: number
          fecha_realizado: string
          km_realizado: number | null
          maintenance_record_id: number | null
          registrado_por: string | null
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: number
          vehicle_id: string
          plan_item_id: number
          fecha_realizado: string
          km_realizado?: number | null
          maintenance_record_id?: number | null
          registrado_por?: string | null
          notas?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          vehicle_id?: string
          plan_item_id?: number
          fecha_realizado?: string
          km_realizado?: number | null
          maintenance_record_id?: number | null
          registrado_por?: string | null
          notas?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_log_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_maintenance_log_plan_item_id_fkey"
            columns: ["plan_item_id"]
            isOneToOne: false
            referencedRelation: "maintenance_plan_items"
            referencedColumns: ["id"]
          }
        ]
      }
      trainings: {
        Row: {
          id: number
          titulo: string
          descripcion: string | null
          contenido_texto: string | null
          video_url: string | null
          duracion_estimada_minutos: number | null
          mes_ciclo: number | null
          tiempo_limite_minutos: number
          activo: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          titulo: string
          descripcion?: string | null
          contenido_texto?: string | null
          video_url?: string | null
          duracion_estimada_minutos?: number | null
          mes_ciclo?: number | null
          tiempo_limite_minutos?: number
          activo?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          titulo?: string
          descripcion?: string | null
          contenido_texto?: string | null
          video_url?: string | null
          duracion_estimada_minutos?: number | null
          mes_ciclo?: number | null
          tiempo_limite_minutos?: number
          activo?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_questions: {
        Row: {
          id: number
          training_id: number
          orden: number
          tipo: 'SELECCION_MULTIPLE' | 'RESPUESTA_ABIERTA' | 'JUSTIFICACION'
          pregunta: string
          puntaje: number
          activo: boolean
        }
        Insert: {
          id?: number
          training_id: number
          orden: number
          tipo: 'SELECCION_MULTIPLE' | 'RESPUESTA_ABIERTA' | 'JUSTIFICACION'
          pregunta: string
          puntaje?: number
          activo?: boolean
        }
        Update: {
          id?: number
          training_id?: number
          orden?: number
          tipo?: 'SELECCION_MULTIPLE' | 'RESPUESTA_ABIERTA' | 'JUSTIFICACION'
          pregunta?: string
          puntaje?: number
          activo?: boolean
        }
        Relationships: []
      }
      training_question_options: {
        Row: {
          id: number
          question_id: number
          orden: number
          texto: string
          es_correcta: boolean
        }
        Insert: {
          id?: number
          question_id: number
          orden: number
          texto: string
          es_correcta?: boolean
        }
        Update: {
          id?: number
          question_id?: number
          orden?: number
          texto?: string
          es_correcta?: boolean
        }
        Relationships: []
      }
      training_assignments: {
        Row: {
          id: number
          training_id: number
          user_id: string
          fecha_asignacion: string
          fecha_limite: string | null
          completado: boolean
          asignado_por: string | null
          created_at: string
        }
        Insert: {
          id?: number
          training_id: number
          user_id: string
          fecha_asignacion?: string
          fecha_limite?: string | null
          completado?: boolean
          asignado_por?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          training_id?: number
          user_id?: string
          fecha_asignacion?: string
          fecha_limite?: string | null
          completado?: boolean
          asignado_por?: string | null
          created_at?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          id: number
          assignment_id: number
          fecha_inicio: string
          fecha_fin: string | null
          estado: 'EN_CURSO' | 'COMPLETADA' | 'CALIFICADA'
          puntaje_mc: number | null
          puntaje_final: number | null
          calificado_por: string | null
          fecha_calificacion: string | null
          observaciones: string | null
        }
        Insert: {
          id?: number
          assignment_id: number
          fecha_inicio?: string
          fecha_fin?: string | null
          estado?: 'EN_CURSO' | 'COMPLETADA' | 'CALIFICADA'
          puntaje_mc?: number | null
          puntaje_final?: number | null
          calificado_por?: string | null
          fecha_calificacion?: string | null
          observaciones?: string | null
        }
        Update: {
          id?: number
          assignment_id?: number
          fecha_inicio?: string
          fecha_fin?: string | null
          estado?: 'EN_CURSO' | 'COMPLETADA' | 'CALIFICADA'
          puntaje_mc?: number | null
          puntaje_final?: number | null
          calificado_por?: string | null
          fecha_calificacion?: string | null
          observaciones?: string | null
        }
        Relationships: []
      }
      training_responses: {
        Row: {
          id: number
          session_id: number
          question_id: number
          opcion_id: number | null
          respuesta_texto: string | null
          es_correcta: boolean | null
        }
        Insert: {
          id?: number
          session_id: number
          question_id: number
          opcion_id?: number | null
          respuesta_texto?: string | null
          es_correcta?: boolean | null
        }
        Update: {
          id?: number
          session_id?: number
          question_id?: number
          opcion_id?: number | null
          respuesta_texto?: string | null
          es_correcta?: boolean | null
        }
        Relationships: []
      }
      ai_usage_log: {
        Row: {
          id: number
          created_at: string
          feature: string
          modelo: string
          tokens_in: number
          tokens_out: number
          cost_usd: number
          usuario_id: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          feature: string
          modelo: string
          tokens_in?: number
          tokens_out?: number
          cost_usd?: number
          usuario_id?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          feature?: string
          modelo?: string
          tokens_in?: number
          tokens_out?: number
          cost_usd?: number
          usuario_id?: string | null
        }
        Relationships: []
      }
      onedrive_subscriptions: {
        Row: {
          id: string
          resource: string
          notification_url: string
          expiration_datetime: string
          created_at: string
        }
        Insert: {
          id: string
          resource: string
          notification_url: string
          expiration_datetime: string
          created_at?: string
        }
        Update: {
          id?: string
          resource?: string
          notification_url?: string
          expiration_datetime?: string
          created_at?: string
        }
        Relationships: []
      }
      invoice_jobs: {
        Row: {
          id: string
          created_at: string
          status: 'pending' | 'processing' | 'completed' | 'needs_review' | 'error'
          source_file_name: string | null
          source_file_path: string | null
          onedrive_item_id: string | null
          extracted_data: Json | null
          vehicle_plate: string | null
          vehicle_id: string | null
          error_message: string | null
          processed_at: string | null
          reviewed_by: string | null
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          status?: 'pending' | 'processing' | 'completed' | 'needs_review' | 'error'
          source_file_name?: string | null
          source_file_path?: string | null
          onedrive_item_id?: string | null
          extracted_data?: Json | null
          vehicle_plate?: string | null
          vehicle_id?: string | null
          error_message?: string | null
          processed_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          status?: 'pending' | 'processing' | 'completed' | 'needs_review' | 'error'
          source_file_name?: string | null
          source_file_path?: string | null
          onedrive_item_id?: string | null
          extracted_data?: Json | null
          vehicle_plate?: string | null
          vehicle_id?: string | null
          error_message?: string | null
          processed_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_jobs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          }
        ]
      }
      rtm_historico: {
        Row: {
          anio: number
          valor: number
        }
        Insert: {
          anio: number
          valor: number
        }
        Update: {
          anio?: number
          valor?: number
        }
        Relationships: []
      }
      clients: {
        Row: { id: number; tipo_documento: string; numero: string; digito_verificacion: string | null; nombre: string; sector: string | null; direccion: string | null; departamento: string | null; ciudad: string | null; telefono1: string | null; telefono2: string | null; telefono3: string | null; correo: string | null; activo: boolean; created_at: string; updated_at: string }
        Insert: { id?: number; tipo_documento?: string; numero: string; digito_verificacion?: string | null; nombre: string; sector?: string | null; direccion?: string | null; departamento?: string | null; ciudad?: string | null; telefono1?: string | null; telefono2?: string | null; telefono3?: string | null; correo?: string | null; activo?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: number; tipo_documento?: string; numero?: string; digito_verificacion?: string | null; nombre?: string; sector?: string | null; direccion?: string | null; departamento?: string | null; ciudad?: string | null; telefono1?: string | null; telefono2?: string | null; telefono3?: string | null; correo?: string | null; activo?: boolean; created_at?: string; updated_at?: string }
        Relationships: []
      }
      cie10: {
        Row: { id: number; codigo: string; descripcion: string }
        Insert: { id?: number; codigo: string; descripcion: string }
        Update: { id?: number; codigo?: string; descripcion?: string }
        Relationships: []
      }
      patients: {
        Row: { id: number; cedula: string; tipo_documento: string; nombre1: string; nombre2: string | null; apellido1: string; apellido2: string | null; fecha_nacimiento: string | null; direccion: string | null; barrio: string | null; localidad: string | null; departamento: string | null; ciudad: string | null; rh: string | null; sexo: string | null; estatura: string | null; eps: string | null; celular: string | null; correo: string | null; activo: boolean; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: number; cedula: string; tipo_documento?: string; nombre1: string; nombre2?: string | null; apellido1: string; apellido2?: string | null; fecha_nacimiento?: string | null; direccion?: string | null; barrio?: string | null; localidad?: string | null; departamento?: string | null; ciudad?: string | null; rh?: string | null; sexo?: string | null; estatura?: string | null; eps?: string | null; celular?: string | null; correo?: string | null; activo?: boolean; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: number; cedula?: string; tipo_documento?: string; nombre1?: string; nombre2?: string | null; apellido1?: string; apellido2?: string | null; fecha_nacimiento?: string | null; direccion?: string | null; barrio?: string | null; localidad?: string | null; departamento?: string | null; ciudad?: string | null; rh?: string | null; sexo?: string | null; estatura?: string | null; eps?: string | null; celular?: string | null; correo?: string | null; activo?: boolean; created_by?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      medical_services: {
        Row: { id: number; patient_id: number | null; nombre_completo: string; fecha_hora_registro: string; tipo_servicio: string; vehicle_id: string | null; operational_center_id: number | null; movil_placa: string | null; ovem_user_id: string | null; medico_user_id: string | null; auxiliar_user_id: string | null; fecha_hora_inicio_desplazamiento: string | null; fecha_hora_programacion: string | null; oportunidad_atencion: number | null; turno_programacion: string | null; autorizacion: string | null; asesor: string | null; prestador: string | null; cie_codigo: string | null; requiere_aislamiento: string | null; soporte: string | null; departamento_origen: string | null; ciudad_origen: string | null; departamento_destino: string | null; ciudad_destino: string | null; perimetro: string | null; direccion_origen: string | null; fecha_hora_llegada_origen: string | null; fecha_hora_salida_origen: string | null; tiempo_total_origen: number | null; direccion_intermedia: string | null; fecha_hora_llegada_intermedia: string | null; fecha_hora_salida_intermedia: string | null; tiempo_espera_intermedia: number | null; direccion_destino: string | null; fecha_hora_llegada_destino: string | null; fecha_hora_salida_destino: string | null; tiempo_espera_destino: number | null; tiempo_total: number | null; finalidad_traslado: string | null; acepta_ips: string | null; valor_servicio: number | null; metodo_pago: string | null; cliente: string | null; proveedor: string | null; medico: string | null; auxiliar: string | null; ovem: string | null; usuario_recibe: string | null; usuario_despacha: string | null; novedad_servicio: string | null; observaciones: string | null; motivo_externo: string | null; motivo_interno: string | null; etapa: string; estado_servicio: string | null; ciudad_registro: string | null; imagen_boleta_salida: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: number; patient_id?: number | null; nombre_completo: string; fecha_hora_registro?: string; tipo_servicio: string; vehicle_id?: string | null; operational_center_id?: number | null; movil_placa?: string | null; ovem_user_id?: string | null; medico_user_id?: string | null; auxiliar_user_id?: string | null; fecha_hora_inicio_desplazamiento?: string | null; fecha_hora_programacion?: string | null; oportunidad_atencion?: number | null; turno_programacion?: string | null; autorizacion?: string | null; asesor?: string | null; prestador?: string | null; cie_codigo?: string | null; requiere_aislamiento?: string | null; soporte?: string | null; departamento_origen?: string | null; ciudad_origen?: string | null; departamento_destino?: string | null; ciudad_destino?: string | null; perimetro?: string | null; direccion_origen?: string | null; fecha_hora_llegada_origen?: string | null; fecha_hora_salida_origen?: string | null; tiempo_total_origen?: number | null; direccion_intermedia?: string | null; fecha_hora_llegada_intermedia?: string | null; fecha_hora_salida_intermedia?: string | null; tiempo_espera_intermedia?: number | null; direccion_destino?: string | null; fecha_hora_llegada_destino?: string | null; fecha_hora_salida_destino?: string | null; tiempo_espera_destino?: number | null; tiempo_total?: number | null; finalidad_traslado?: string | null; acepta_ips?: string | null; valor_servicio?: number | null; metodo_pago?: string | null; cliente?: string | null; proveedor?: string | null; medico?: string | null; auxiliar?: string | null; ovem?: string | null; usuario_recibe?: string | null; usuario_despacha?: string | null; novedad_servicio?: string | null; observaciones?: string | null; motivo_externo?: string | null; motivo_interno?: string | null; etapa?: string; estado_servicio?: string | null; ciudad_registro?: string | null; imagen_boleta_salida?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: number; patient_id?: number | null; nombre_completo?: string; fecha_hora_registro?: string; tipo_servicio?: string; vehicle_id?: string | null; operational_center_id?: number | null; movil_placa?: string | null; ovem_user_id?: string | null; medico_user_id?: string | null; auxiliar_user_id?: string | null; fecha_hora_inicio_desplazamiento?: string | null; fecha_hora_programacion?: string | null; oportunidad_atencion?: number | null; turno_programacion?: string | null; autorizacion?: string | null; asesor?: string | null; prestador?: string | null; cie_codigo?: string | null; requiere_aislamiento?: string | null; soporte?: string | null; departamento_origen?: string | null; ciudad_origen?: string | null; departamento_destino?: string | null; ciudad_destino?: string | null; perimetro?: string | null; direccion_origen?: string | null; fecha_hora_llegada_origen?: string | null; fecha_hora_salida_origen?: string | null; tiempo_total_origen?: number | null; direccion_intermedia?: string | null; fecha_hora_llegada_intermedia?: string | null; fecha_hora_salida_intermedia?: string | null; tiempo_espera_intermedia?: number | null; direccion_destino?: string | null; fecha_hora_llegada_destino?: string | null; fecha_hora_salida_destino?: string | null; tiempo_espera_destino?: number | null; tiempo_total?: number | null; finalidad_traslado?: string | null; acepta_ips?: string | null; valor_servicio?: number | null; metodo_pago?: string | null; cliente?: string | null; proveedor?: string | null; medico?: string | null; auxiliar?: string | null; ovem?: string | null; usuario_recibe?: string | null; usuario_despacha?: string | null; novedad_servicio?: string | null; observaciones?: string | null; motivo_externo?: string | null; motivo_interno?: string | null; etapa?: string; estado_servicio?: string | null; ciudad_registro?: string | null; imagen_boleta_salida?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
        Relationships: [
          {
            foreignKeyName: "medical_services_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_services_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          }
        ]
      }
      medical_assessments: {
        Row: { id: number; patient_id: number | null; cedula: string; nombre_completo: string; fecha_nacimiento: string | null; genero: string | null; aerolinea: string | null; fecha_hora_vuelo: string | null; acompanante: string | null; origen: string | null; destino: string | null; hc: string | null; concepto_medico: string | null; tiempo_estimado: string | null; recomendaciones: string | null; valoracion: string | null; medico: string | null; pasajero: string | null; estado: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: number; patient_id?: number | null; cedula: string; nombre_completo: string; fecha_nacimiento?: string | null; genero?: string | null; aerolinea?: string | null; fecha_hora_vuelo?: string | null; acompanante?: string | null; origen?: string | null; destino?: string | null; hc?: string | null; concepto_medico?: string | null; tiempo_estimado?: string | null; recomendaciones?: string | null; valoracion?: string | null; medico?: string | null; pasajero?: string | null; estado?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: number; patient_id?: number | null; cedula?: string; nombre_completo?: string; fecha_nacimiento?: string | null; genero?: string | null; aerolinea?: string | null; fecha_hora_vuelo?: string | null; acompanante?: string | null; origen?: string | null; destino?: string | null; hc?: string | null; concepto_medico?: string | null; tiempo_estimado?: string | null; recomendaciones?: string | null; valoracion?: string | null; medico?: string | null; pasajero?: string | null; estado?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
        Relationships: [
          {
            foreignKeyName: "medical_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      biomedical_equipment: {
        Row: { id: number; placa_equipo: string; equipo: string; marca: string | null; modelo: string | null; serie: string | null; registro_invima: string | null; riesgo: string | null; ultimo_mantenimiento: string | null; proximo_mantenimiento: string | null; ultima_calibracion: string | null; proxima_calibracion: string | null; frec_mantenimiento: string | null; frec_calibracion: string | null; ubicacion_interna: string | null; aeropuerto: string | null; departamento: string | null; ciudad: string | null; adquisicion: string | null; area: string | null; observaciones: string | null; imagen_url: string | null; voltaje: string | null; corriente: string | null; potencia: string | null; frecuencia: string | null; humedad: string | null; dimensiones: string | null; peso: string | null; temperatura: string | null; fecha_compra: string | null; proveedor_nombre: string | null; proveedor_contacto: string | null; operador: string | null; activo: boolean; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: number; placa_equipo: string; equipo: string; marca?: string | null; modelo?: string | null; serie?: string | null; registro_invima?: string | null; riesgo?: string | null; ultimo_mantenimiento?: string | null; proximo_mantenimiento?: string | null; ultima_calibracion?: string | null; proxima_calibracion?: string | null; frec_mantenimiento?: string | null; frec_calibracion?: string | null; ubicacion_interna?: string | null; aeropuerto?: string | null; departamento?: string | null; ciudad?: string | null; adquisicion?: string | null; area?: string | null; observaciones?: string | null; imagen_url?: string | null; voltaje?: string | null; corriente?: string | null; potencia?: string | null; frecuencia?: string | null; humedad?: string | null; dimensiones?: string | null; peso?: string | null; temperatura?: string | null; fecha_compra?: string | null; proveedor_nombre?: string | null; proveedor_contacto?: string | null; operador?: string | null; activo?: boolean; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: number; placa_equipo?: string; equipo?: string; marca?: string | null; modelo?: string | null; serie?: string | null; registro_invima?: string | null; riesgo?: string | null; ultimo_mantenimiento?: string | null; proximo_mantenimiento?: string | null; ultima_calibracion?: string | null; proxima_calibracion?: string | null; frec_mantenimiento?: string | null; frec_calibracion?: string | null; ubicacion_interna?: string | null; aeropuerto?: string | null; departamento?: string | null; ciudad?: string | null; adquisicion?: string | null; area?: string | null; observaciones?: string | null; imagen_url?: string | null; voltaje?: string | null; corriente?: string | null; potencia?: string | null; frecuencia?: string | null; humedad?: string | null; dimensiones?: string | null; peso?: string | null; temperatura?: string | null; fecha_compra?: string | null; proveedor_nombre?: string | null; proveedor_contacto?: string | null; operador?: string | null; activo?: boolean; created_by?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      biomedical_maintenance: {
        Row: { id: number; equipment_id: number; orden_numero: string | null; fecha_mantenimiento: string; tipo_mantenimiento: string | null; codigo_institucional: string | null; ubicacion: string | null; sanidad: string | null; chk_items: Json | null; chk_total: number | null; chk_marcados: number | null; descripcion_falla: string | null; obs_apto: boolean; obs_averiado: boolean; obs_reparacion: boolean; obs_baja: boolean; obs_partes: boolean; observaciones: string | null; repuesto: string | null; referencia_serial: string | null; cantidad: number | null; obs_reparaciones: string | null; realizo_nombre: string; realizo_cargo: string | null; reviso_nombre: string | null; reviso_cargo: string | null; created_by: string | null; created_at: string }
        Insert: { id?: number; equipment_id: number; orden_numero?: string | null; fecha_mantenimiento: string; tipo_mantenimiento?: string | null; codigo_institucional?: string | null; ubicacion?: string | null; sanidad?: string | null; chk_items?: Json | null; chk_total?: number | null; chk_marcados?: number | null; descripcion_falla?: string | null; obs_apto?: boolean; obs_averiado?: boolean; obs_reparacion?: boolean; obs_baja?: boolean; obs_partes?: boolean; observaciones?: string | null; repuesto?: string | null; referencia_serial?: string | null; cantidad?: number | null; obs_reparaciones?: string | null; realizo_nombre: string; realizo_cargo?: string | null; reviso_nombre?: string | null; reviso_cargo?: string | null; created_by?: string | null; created_at?: string }
        Update: { id?: number; equipment_id?: number; orden_numero?: string | null; fecha_mantenimiento?: string; tipo_mantenimiento?: string | null; codigo_institucional?: string | null; ubicacion?: string | null; sanidad?: string | null; chk_items?: Json | null; chk_total?: number | null; chk_marcados?: number | null; descripcion_falla?: string | null; obs_apto?: boolean; obs_averiado?: boolean; obs_reparacion?: boolean; obs_baja?: boolean; obs_partes?: boolean; observaciones?: string | null; repuesto?: string | null; referencia_serial?: string | null; cantidad?: number | null; obs_reparaciones?: string | null; realizo_nombre?: string; realizo_cargo?: string | null; reviso_nombre?: string | null; reviso_cargo?: string | null; created_by?: string | null; created_at?: string }
        Relationships: [
          {
            foreignKeyName: "biomedical_maintenance_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "biomedical_equipment"
            referencedColumns: ["id"]
          }
        ]
      }
      ti_acta_entrega: {
        Row: TiActaEntregaRow
        Insert: Partial<Omit<TiActaEntregaRow, "numero_orden">>
        Update: Partial<Omit<TiActaEntregaRow, "numero_orden">>
        Relationships: []
      }
      ti_diagnostico: {
        Row: TiDiagnosticoRow
        Insert: Partial<Omit<TiDiagnosticoRow, "numero_orden">>
        Update: Partial<Omit<TiDiagnosticoRow, "numero_orden">>
        Relationships: []
      }
      ti_diagnostico_repuestos: {
        Row: TiDiagnosticoRepuestoRow
        Insert: Partial<TiDiagnosticoRepuestoRow>
        Update: Partial<TiDiagnosticoRepuestoRow>
        Relationships: []
      }
      ti_baja_equipo: {
        Row: TiBajaEquipoRow
        Insert: Partial<Omit<TiBajaEquipoRow, "numero_orden">>
        Update: Partial<Omit<TiBajaEquipoRow, "numero_orden">>
        Relationships: []
      }
      ti_prestamo_equipo: {
        Row: TiPrestamoEquipoRow
        Insert: Partial<Omit<TiPrestamoEquipoRow, "numero_orden">>
        Update: Partial<Omit<TiPrestamoEquipoRow, "numero_orden">>
        Relationships: []
      }
      wa_campaigns: {
        Row: { id: number; nombre: string; plantilla: string; idioma: string; estado: string; media_tipo: string | null; media_id: string | null; media_nombre: string | null; total_destinatarios: number; total_enviados: number; total_fallidos: number; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: number; nombre: string; plantilla: string; idioma?: string; estado?: string; media_tipo?: string | null; media_id?: string | null; media_nombre?: string | null; total_destinatarios?: number; total_enviados?: number; total_fallidos?: number; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: number; nombre?: string; plantilla?: string; idioma?: string; estado?: string; media_tipo?: string | null; media_id?: string | null; media_nombre?: string | null; total_destinatarios?: number; total_enviados?: number; total_fallidos?: number; created_by?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      wa_campaign_recipients: {
        Row: { id: number; campaign_id: number; telefono: string; nombre: string | null; parametros: Json | null; estado: string; wamid: string | null; error: string | null; sent_at: string | null; created_at: string }
        Insert: { id?: number; campaign_id: number; telefono: string; nombre?: string | null; parametros?: Json | null; estado?: string; wamid?: string | null; error?: string | null; sent_at?: string | null; created_at?: string }
        Update: { id?: number; campaign_id?: number; telefono?: string; nombre?: string | null; parametros?: Json | null; estado?: string; wamid?: string | null; error?: string | null; sent_at?: string | null; created_at?: string }
        Relationships: [
          {
            foreignKeyName: "wa_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "wa_campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_log: {
        Row: { id: number; canal: string; destinatario: string; asunto: string | null; plantilla: string | null; referencia: string | null; ok: boolean; error: string | null; created_by: string | null; created_at: string }
        Insert: { id?: number; canal: string; destinatario: string; asunto?: string | null; plantilla?: string | null; referencia?: string | null; ok: boolean; error?: string | null; created_by?: string | null; created_at?: string }
        Update: { id?: number; canal?: string; destinatario?: string; asunto?: string | null; plantilla?: string | null; referencia?: string | null; ok?: boolean; error?: string | null; created_by?: string | null; created_at?: string }
        Relationships: []
      }
      company_settings: {
        Row: { id: number; logo_url: string | null; updated_at: string; updated_by: string | null }
        Insert: { id?: number; logo_url?: string | null; updated_at?: string; updated_by?: string | null }
        Update: { id?: number; logo_url?: string | null; updated_at?: string; updated_by?: string | null }
        Relationships: []
      }
      medical_services_audit_log: {
        Row: { id: number; medical_service_id: number; changed_by: string | null; changed_by_role: string | null; changed_at: string; valores_anteriores: Json; valores_nuevos: Json }
        Insert: { id?: number; medical_service_id: number; changed_by?: string | null; changed_by_role?: string | null; changed_at?: string; valores_anteriores: Json; valores_nuevos: Json }
        Update: { id?: number; medical_service_id?: number; changed_by?: string | null; changed_by_role?: string | null; changed_at?: string; valores_anteriores?: Json; valores_nuevos?: Json }
        Relationships: []
      }
    }
    Views: {
      vehicle_maintenance_alerts: {
        Row: {
          vehicle_id: string
          placa: string
          centro_operativo: string | null
          plan_item_id: number
          descripcion: string
          categoria: string
          intervalo_km: number
          intervalo_dias: number
          aplica_a: string
          ultimo_mantenimiento: string
          km_ultimo: number | null
          km_restantes: number | null
          dias_restantes: number | null
          nivel_alerta: 'ROJA' | 'NARANJA' | 'OK'
        }
      }
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_center: {
        Args: { p_user_id?: string }
        Returns: number | null
      }
    }
    Enums: {
      vehicle_status: 'OPERATIVO' | 'FUERA_DE_SERVICIO'
      maintenance_type: 'PREVENTIVO' | 'CORRECTIVO'
      severity_level: 'BAJA' | 'MEDIA' | 'ALTA'
      incident_status: 'ABIERTO' | 'EN_PROCESO' | 'CERRADO'
      operational_center: 'CRA_MEDELLIN' | 'CRA_BOGOTA' | 'AIRPLAN' | 'CTG' | 'ADO'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
