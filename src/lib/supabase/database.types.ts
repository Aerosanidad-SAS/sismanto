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
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: number
          nombre: string
          nit?: string | null
          contacto?: string | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          nombre?: string
          nit?: string | null
          contacto?: string | null
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
          tipo_refrigerante: string | null
          aceite_usado: string | null
          ref_filtro_aire_motor: string | null
          ref_filtro_aceite: string | null
          ref_filtro_combustible: string | null
          notas: string | null
          vencimiento_rtm: string | null
          vencimiento_soat: string | null
          vencimiento_tecnicomecanica: string | null
          estado_actual: 'OPERATIVO' | 'FUERA_DE_SERVICIO'
          centro_operativo: string
          centro_operativo_id: number | null
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
          tipo_refrigerante?: string | null
          aceite_usado?: string | null
          ref_filtro_aire_motor?: string | null
          ref_filtro_aceite?: string | null
          ref_filtro_combustible?: string | null
          notas?: string | null
          vencimiento_rtm?: string | null
          vencimiento_soat?: string | null
          vencimiento_tecnicomecanica?: string | null
          estado_actual?: 'OPERATIVO' | 'FUERA_DE_SERVICIO'
          centro_operativo: string
          centro_operativo_id?: number | null
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
          tipo_refrigerante?: string | null
          aceite_usado?: string | null
          ref_filtro_aire_motor?: string | null
          ref_filtro_aceite?: string | null
          ref_filtro_combustible?: string | null
          notas?: string | null
          vencimiento_rtm?: string | null
          vencimiento_soat?: string | null
          vencimiento_tecnicomecanica?: string | null
          estado_actual?: 'OPERATIVO' | 'FUERA_DE_SERVICIO'
          centro_operativo?: string
          centro_operativo_id?: number | null
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
    }
    Views: {
      [_ in never]: never
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaOrName extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaOrName extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaOrName["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaOrName extends { schema: keyof Database }
  ? Database[DefaultSchemaOrName["schema"]]["Tables"][TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaOrName extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaOrName]["Row"]
    : never
