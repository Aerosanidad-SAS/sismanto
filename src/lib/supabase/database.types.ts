// Tipos para Supabase JS v2 (compatible con v2.93+)
// Actualizado con las nuevas tablas de la Iteración 2

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
        Row: { id: number; user_id: string; role_id: number; nombre_completo: string | null; email: string | null; activo: boolean; operational_center_id: number | null; created_at: string; updated_at: string }
        Insert: { id?: number; user_id: string; role_id: number; nombre_completo?: string | null; email?: string | null; activo?: boolean; operational_center_id?: number | null; created_at?: string; updated_at?: string }
        Update: { id?: number; user_id?: string; role_id?: number; nombre_completo?: string | null; email?: string | null; activo?: boolean; operational_center_id?: number | null; created_at?: string; updated_at?: string }
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
        Row: { id: number; user_id: string; vehicle_id: string; fecha_inicio: string; fecha_fin: string | null; activo: boolean; asignado_por: string | null; created_at: string }
        Insert: { id?: number; user_id: string; vehicle_id: string; fecha_inicio: string; fecha_fin?: string | null; activo?: boolean; asignado_por?: string | null; created_at?: string }
        Update: { id?: number; user_id?: string; vehicle_id?: string; fecha_inicio?: string; fecha_fin?: string | null; activo?: boolean; asignado_por?: string | null; created_at?: string }
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
      operational_center: 'CRA_MEDELLIN' | 'CRA_BOGOTA' | 'AIRPLAN' | 'CTG'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
