"use server";

import { centroVisible } from "@/lib/auth-utils";
import { hoyBogota, sumarDias } from "@/lib/fechas";
import { armarTablero, type ContadoresTablero, type EntradaVehiculo, type FilaTablero, type ServicioDelVehiculo } from "@/lib/aptitud-vehiculo";
import { createClient } from "@/lib/supabase/server";
import { getProfile, requireRole } from "./auth";

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este repo (ver CLAUDE.md).
type Fila = Record<string, any>;

export interface TableroVehiculos {
  /** Día mostrado (hoy, hora de Colombia). */
  fecha: string;
  filas: FilaTablero[];
  contadores: ContadoresTablero;
}

/**
 * Tablero de vehículos de Regulación: los vehículos programados hoy (vehicle_operacion_diaria) del centro de quien
 * consulta, con su aptitud y ocupación. Solo lectura; la derivación vive en `lib/aptitud-vehiculo.ts`.
 * No materializa la programación: eso ya lo hace `getProgramacionDelDia` al abrir la sala de control.
 */
export async function getTableroVehiculos(): Promise<TableroVehiculos> {
  await requireRole(["ADMIN", "ANALISTA", "REGULACION"]);
  const supabase = createClient() as any;
  const hoy = hoyBogota();
  const ahora = Date.now();
  const vacio: TableroVehiculos = { fecha: hoy, filas: [], contadores: { libres: 0, enServicio: 0, conNovedades: 0, noAptos: 0, sinPreoperacional: 0 } };

  const { data: operacion } = await supabase.from("vehicle_operacion_diaria").select("vehicle_id, user_id").eq("fecha", hoy);
  const programados = (operacion ?? []) as Fila[];
  if (programados.length === 0) return vacio;

  const centro = centroVisible(await getProfile());
  let vq = supabase
    .from("vehicles")
    .select("id, placa, estado_actual")
    .in("id", Array.from(new Set(programados.map((o) => o.vehicle_id as string))))
    .order("placa");
  if (centro) vq = vq.eq("centro_operativo", centro.codigo);
  const { data: vehiculosData } = await vq;
  const vehiculos = (vehiculosData ?? []) as Fila[];
  if (vehiculos.length === 0) return vacio;
  const ids = vehiculos.map((v) => v.id as string);

  // Servicios activos: los que están en curso (de cualquier día) y los programados para hoy.
  const desde = `${hoy}T00:00:00-05:00`;
  const hasta = `${sumarDias(hoy, 1)}T00:00:00-05:00`;
  const userIds = Array.from(new Set(programados.map((o) => o.user_id as string)));

  const [{ data: checks }, { data: novedades }, { data: solicitudes }, { data: servicios }, { data: perfiles }] = await Promise.all([
    supabase.from("daily_checks").select("vehicle_id").eq("fecha", hoy).in("vehicle_id", ids),
    supabase.from("incidents").select("vehicle_id, severidad").in("estado", ["ABIERTO", "EN_PROCESO"]).in("vehicle_id", ids),
    supabase.from("vehicle_no_apto_solicitudes").select("vehicle_id, motivo").eq("estado", "PENDIENTE").in("vehicle_id", ids),
    supabase
      .from("medical_services")
      .select("*")
      .in("vehicle_id", ids)
      .or(`etapa.eq.CURSO,and(etapa.eq.PROGRAMADO,fecha_hora_programacion.gte.${desde},fecha_hora_programacion.lt.${hasta})`)
      .limit(500),
    supabase.from("user_profiles").select("user_id, nombre_completo, email").in("user_id", userIds),
  ]);

  const nombre = new Map(((perfiles ?? []) as Fila[]).map((p) => [p.user_id as string, (p.nombre_completo || p.email || "Sin nombre") as string]));
  const conPreoperacional = new Set(((checks ?? []) as Fila[]).map((c) => c.vehicle_id as string));
  const motivoPorVehiculo = new Map(((solicitudes ?? []) as Fila[]).map((s) => [s.vehicle_id as string, s.motivo as string]));

  const entradas: EntradaVehiculo[] = vehiculos.map((v) => ({
    vehicleId: v.id,
    placa: v.placa,
    estadoActual: v.estado_actual,
    conductores: programados.filter((o) => o.vehicle_id === v.id).map((o) => nombre.get(o.user_id as string) ?? "Sin nombre"),
    tienePreoperacionalHoy: conPreoperacional.has(v.id),
    severidadesNovedades: ((novedades ?? []) as Fila[]).filter((n) => n.vehicle_id === v.id).map((n) => String(n.severidad ?? "")),
    motivoSolicitud: motivoPorVehiculo.get(v.id) ?? null,
    servicios: ((servicios ?? []) as Fila[]).filter((s) => s.vehicle_id === v.id) as ServicioDelVehiculo[],
  }));

  const { filas, contadores } = armarTablero(entradas, ahora);
  return { fecha: hoy, filas, contadores };
}
