"use server";

import { hoyBogota, limitesInstante } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { getFleetWithAssignments } from "@/app/api/actions/regulacion";
import { centroVisible } from "@/lib/auth-utils";

export interface ServicioDelDia {
  id: number;
  hora: string;
  tipo: string;
  etapa: string;
  paciente: string;
}

export interface VehiculoDelDia {
  id: string;
  placa: string;
  ovem: string | null;
  medico: string | null;
  auxiliar: string | null;
  servicios: ServicioDelDia[];
}

const nombreDe = (d: { nombre_completo?: string | null; email?: string | null } | undefined) =>
  d?.nombre_completo || d?.email || null;

/**
 * Vehículos operativos hoy en el centro de la persona (todos si no tiene centro), con la tripulación asignada
 * y los servicios que Regulación les va asignando. Mientras no exista la programación diaria de Regulación,
 * "operan hoy" = OPERATIVO con tripulación activa hoy.
 */
export async function getFlotaDelDia(): Promise<VehiculoDelDia[]> {
  const profile = await getProfile();
  if (profile?.role_codigo !== "COORDINACION" && profile?.role_codigo !== "ADMIN" && profile?.role_codigo !== "ANALISTA") return [];

  const flota = await getFleetWithAssignments();
  const operativos = flota.filter((v) => v.estado_actual === "OPERATIVO" && v.assignments.length > 0);
  if (operativos.length === 0) return [];

  const supabase = createClient();
  const hoy = hoyBogota();
  const { desde, hastaExclusivo } = limitesInstante(hoy, hoy);
  const { data } = await supabase
    .from("medical_services")
    .select("id, vehicle_id, tipo_servicio, etapa, nombre_completo, fecha_hora_programacion, fecha_hora_registro")
    .in("vehicle_id", operativos.map((v) => v.id))
    .gte("fecha_hora_registro", desde)
    .lt("fecha_hora_registro", hastaExclusivo)
    .not("etapa", "in", '("DUPLICADO","NO EFECTIVO")')
    .order("fecha_hora_registro", { ascending: true });

  const porVehiculo = new Map<string, ServicioDelDia[]>();
  for (const s of (data ?? []) as any[]) {
    const lista = porVehiculo.get(s.vehicle_id) ?? [];
    lista.push({
      id: s.id,
      hora: s.fecha_hora_programacion ?? s.fecha_hora_registro,
      tipo: s.tipo_servicio,
      etapa: s.etapa,
      paciente: s.nombre_completo,
    });
    porVehiculo.set(s.vehicle_id, lista);
  }

  return operativos.map((v) => {
    const de = (rol: string) => nombreDe(v.assignments.find((a: any) => a.rol_en_turno === rol)?.driver);
    return {
      id: v.id,
      placa: v.placa,
      ovem: de("OVEM"),
      medico: de("MEDICO"),
      auxiliar: de("AUXILIAR_ENFERMERIA"),
      servicios: porVehiculo.get(v.id) ?? [],
    };
  });
}

/** Clave de ciudad ("bogota" | "medellin") del centro de la persona; "" si ve todos. */
export async function ciudadDelCentro(): Promise<string> {
  const centro = centroVisible(await getProfile());
  if (centro?.codigo === "CRA_BOGOTA") return "bogota";
  if (centro?.codigo === "CRA_MEDELLIN") return "medellin";
  return "";
}
