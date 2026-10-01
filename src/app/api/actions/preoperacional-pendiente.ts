"use server";

import { hoyBogota } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { getFleetWithAssignments } from "@/app/api/actions/regulacion";
import { HORA_LIMITE_PREOPERACIONAL, horaBogota } from "@/lib/preoperacional-estado";

export interface VehiculoPreoperacional {
  placa: string;
  ovem: string | null;
}

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

/**
 * Estado del preoperacional de hoy en el centro de quien consulta (todos los centros si no tiene uno).
 * "Se espera que opere" = OPERATIVO con tripulación activa hoy; cuando exista la programación diaria de
 * Regulación, esa lista pasa a ser la fuente. Lo leen Regulación, Coordinación, Analista y Admin (RLS de daily_checks).
 */
export async function getPreoperacionalHoy(): Promise<PreoperacionalHoy> {
  const flota = await getFleetWithAssignments();
  const esperados = flota.filter((v) => v.estado_actual === "OPERATIVO" && v.assignments.length > 0);
  const vencido = horaBogota() >= HORA_LIMITE_PREOPERACIONAL;
  const base = { esperados: esperados.length, realizados: 0, pendientes: [], conFalla: [], vencido, horaLimite: HORA_LIMITE_PREOPERACIONAL };
  if (esperados.length === 0) return base;

  const supabase = createClient();
  const { data } = await supabase
    .from("daily_checks")
    .select("vehicle_id, checklist_ok")
    .eq("fecha", hoyBogota())
    .in("vehicle_id", esperados.map((v) => v.id));

  // Varios OVEM pueden hacerlo el mismo día (turnos): el vehículo cuenta con falla si CUALQUIERA trae falla.
  const porVehiculo = new Map<string, boolean>();
  for (const c of (data ?? []) as { vehicle_id: string; checklist_ok: boolean }[]) {
    porVehiculo.set(c.vehicle_id, (porVehiculo.get(c.vehicle_id) ?? true) && c.checklist_ok);
  }

  const pendientes: VehiculoPreoperacional[] = [];
  const conFalla: VehiculoPreoperacional[] = [];
  for (const v of esperados) {
    const ovem = v.assignments.find((a: any) => a.rol_en_turno === "OVEM")?.driver;
    const fila = { placa: v.placa, ovem: ovem?.nombre_completo ?? ovem?.email ?? null };
    if (!porVehiculo.has(v.id)) pendientes.push(fila);
    else if (porVehiculo.get(v.id) === false) conFalla.push(fila);
  }

  return { ...base, realizados: esperados.length - pendientes.length, pendientes, conFalla };
}
