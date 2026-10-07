"use server";

import { hoyBogota } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { getFleetWithAssignments } from "@/app/api/actions/regulacion";
import { HORA_LIMITE_PREOPERACIONAL, horaBogota } from "@/lib/preoperacional-estado";
import {
  candidatosDeHoy,
  clasificarPreoperacionalHoy,
  type CheckHoy,
  type FilaPreoperacionalHoy,
  type VehiculoFlota,
} from "@/lib/preoperacional-hoy";

export type VehiculoPreoperacional = FilaPreoperacionalHoy;

export interface PreoperacionalHoy {
  /** Vehículos operativos con tripulación asignada hoy: los que se espera que operen. */
  esperados: number;
  realizados: number;
  /** Sin preoperacional de hoy. */
  pendientes: VehiculoPreoperacional[];
  /** Preoperacional hecho pero con al menos un ítem en FALLA. */
  conFalla: VehiculoPreoperacional[];
  /** Ya pasó la hora límite: los pendientes son un incumplimiento, no solo algo por hacer. */
  vencido: boolean;
  horaLimite: number;
}

type Perfil = { user_id: string; nombre_completo: string | null; email: string | null };

/**
 * Estado del preoperacional de hoy en el centro de quien consulta (todos los centros si no tiene uno).
 * "Se espera que opere" = OPERATIVO y programado hoy (vehicle_operacion_diaria); sin programación en su centro, OPERATIVO con tripulación.
 * Un vehículo que quedó fuera de servicio por su propio preoperacional de hoy sigue contando (ver `lib/preoperacional-hoy.ts`).
 * Lo leen Regulación, Coordinación, Analista y Admin (RLS de daily_checks).
 */
export async function getPreoperacionalHoy(): Promise<PreoperacionalHoy> {
  const flota = await getFleetWithAssignments();
  const supabase = createClient();
  const hoy = hoyBogota();
  const vencido = horaBogota() >= HORA_LIMITE_PREOPERACIONAL;
  const vacio = { esperados: 0, realizados: 0, pendientes: [], conFalla: [], vencido, horaLimite: HORA_LIMITE_PREOPERACIONAL };

  // Fuente preferida: la programación del día (migración 108). El respaldo (operativo con tripulación) se decide POR CENTRO.
  const { data: programados } = await supabase.from("vehicle_operacion_diaria" as never).select("vehicle_id, user_id").eq("fecha", hoy);
  const filasProgramadas = (programados ?? []) as { vehicle_id: string; user_id: string }[];
  const idsProgramados = new Set(filasProgramadas.map((p) => p.vehicle_id));

  const candidatos = candidatosDeHoy(flota.map(aVehiculoFlota), idsProgramados);
  if (candidatos.length === 0) return vacio;

  const [{ data: checks }, { data: perfiles }] = await Promise.all([
    supabase
      .from("daily_checks")
      .select("vehicle_id, checklist_ok")
      .eq("fecha", hoy)
      .in("vehicle_id", candidatos.map((v) => v.id)),
    filasProgramadas.length > 0
      ? supabase
          .from("user_profiles")
          .select("user_id, nombre_completo, email")
          .in("user_id", [...new Set(filasProgramadas.map((p) => p.user_id))])
      : Promise.resolve({ data: [] as Perfil[] }),
  ]);

  const nombre = new Map(((perfiles ?? []) as Perfil[]).map((p) => [p.user_id, p.nombre_completo || p.email || "Sin nombre"]));
  const conductores = new Map<string, string[]>();
  for (const p of filasProgramadas) {
    conductores.set(p.vehicle_id, [...(conductores.get(p.vehicle_id) ?? []), nombre.get(p.user_id) ?? "Sin nombre"]);
  }

  const r = clasificarPreoperacionalHoy(candidatos, (checks ?? []) as CheckHoy[], conductores);
  return { ...r, vencido, horaLimite: HORA_LIMITE_PREOPERACIONAL };
}

function aVehiculoFlota(v: Awaited<ReturnType<typeof getFleetWithAssignments>>[number]): VehiculoFlota {
  const asignaciones = v.assignments as Array<{ rol_en_turno?: string; driver?: { nombre_completo?: string | null; email?: string | null } }>;
  const ovem = asignaciones.find((a) => a.rol_en_turno === "OVEM")?.driver;
  return {
    id: v.id,
    placa: v.placa,
    estado_actual: String(v.estado_actual),
    centro_operativo: v.centro_operativo ? String(v.centro_operativo) : null,
    ovemAsignado: ovem?.nombre_completo ?? ovem?.email ?? null,
    tieneTripulacion: asignaciones.length > 0,
  };
}
