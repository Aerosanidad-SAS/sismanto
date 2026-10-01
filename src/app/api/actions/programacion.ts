"use server";

import { revalidatePath } from "next/cache";
import { auditar } from "@/lib/auditoria";
import { esDia, hoyBogota, sumarDias, type Dia } from "@/lib/fechas";
import { centroVisible } from "@/lib/auth-utils";
import { createClient } from "@/lib/supabase/server";
import { resumenPorVehiculo, validarConductores, type FilaOperacion, type ResumenVehiculoDia, type TitularVigente } from "@/lib/programacion-diaria";
import { getProfile, requireRole } from "./auth";
import { getUsuariosPorRol } from "./regulacion";

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este repo (ver CLAUDE.md).
type Fila = Record<string, any>;

const ROLES_PROGRAMACION = ["ADMIN", "REGULACION"] as const;
const ROLES_LECTURA = ["ADMIN", "REGULACION", "ANALISTA", "COORDINACION", "GERENCIAL", "MANTENIMIENTO"] as const;

export interface VehiculoProgramado extends ResumenVehiculoDia {
  placa: string;
  estado_actual: string;
}

export interface ProgramacionDelDia {
  fecha: Dia;
  /** Hoy o futuro: Regulación puede ajustarlo. Un día pasado es historial de solo lectura. */
  editable: boolean;
  vehiculos: VehiculoProgramado[];
  conductores: { user_id: string; nombre: string }[];
}

async function conductoresOVEM(): Promise<{ user_id: string; nombre: string }[]> {
  const usuarios = (await getUsuariosPorRol("OVEM")) as Fila[];
  return usuarios.map((u) => ({ user_id: u.user_id, nombre: u.nombre_completo || u.email }));
}

/** Programación de un día: titulares + quién opera cada vehículo. Hoy y futuro se materializan desde los titulares. */
export async function getProgramacionDelDia(fecha: string): Promise<ProgramacionDelDia> {
  await requireRole([...ROLES_LECTURA]);
  const hoy = hoyBogota();
  const dia = esDia(fecha) ? fecha : hoy;
  const editable = dia >= hoy;
  const supabase = createClient() as any;

  if (editable) {
    // Idempotente: solo completa a los vehículos que aún no tienen operación ese día.
    const { error } = await supabase.rpc("materializar_operacion_dia", { p_fecha: dia });
    if (error) console.error("materializar_operacion_dia falló:", error.message);
  }

  const centro = centroVisible(await getProfile());
  let vq = supabase.from("vehicles").select("id, placa, estado_actual, centro_operativo").order("placa");
  if (centro) vq = vq.eq("centro_operativo", centro.codigo);
  const { data: vehiculos } = await vq;
  const lista = (vehiculos ?? []) as Fila[];

  const [{ data: titulares }, { data: operacion }, conductores] = await Promise.all([
    supabase.from("vehicle_titulares").select("vehicle_id, user_id, posicion").lte("desde", dia).or("hasta.is.null,hasta.gte." + dia),
    supabase.from("vehicle_operacion_diaria").select("fecha, vehicle_id, user_id, origen").eq("fecha", dia),
    conductoresOVEM(),
  ]);

  const resumen = resumenPorVehiculo(lista.map((v) => v.id), (titulares ?? []) as TitularVigente[], (operacion ?? []) as FilaOperacion[]);
  const porId = new Map(lista.map((v) => [v.id as string, v]));
  return {
    fecha: dia,
    editable,
    conductores,
    vehiculos: resumen.map((r) => ({ ...r, placa: porId.get(r.vehicleId)?.placa ?? "", estado_actual: porId.get(r.vehicleId)?.estado_actual ?? "" })),
  };
}

/**
 * Fija los conductores titulares de un vehículo (1 o 2). Cierra los vigentes y abre los nuevos desde hoy: el
 * historial de titulares queda en la tabla y los días ya registrados no cambian.
 */
export async function setTitulares(vehicleId: string, userIds: string[]) {
  const profile = await requireRole([...ROLES_PROGRAMACION]);
  const malo = validarConductores(userIds);
  if (malo) return { error: malo };

  const supabase = createClient() as any;
  const hoy = hoyBogota();
  const ayer = sumarDias(hoy, -1);

  // Se cierran los vigentes (solo si cambian) y se abren los nuevos en la posición que les toca.
  const { data: vigentes } = await supabase.from("vehicle_titulares").select("id, user_id, posicion, desde").eq("vehicle_id", vehicleId).is("hasta", null);
  const actuales = (vigentes ?? []) as Fila[];
  const igual = actuales.length === userIds.length && actuales.sort((a, b) => a.posicion - b.posicion).every((t, i) => t.user_id === userIds[i]);
  if (igual) return { success: true };

  for (const t of actuales) {
    // Si se abrió hoy mismo y ahora se cambia, no queda historial útil de un titular de cero días: se cierra con hasta = desde.
    const hasta = t.desde > ayer ? t.desde : ayer;
    const { error } = await supabase.from("vehicle_titulares").update({ hasta }).eq("id", t.id);
    if (error) return { error: error.message };
  }
  const { error } = await supabase.from("vehicle_titulares").insert(
    userIds.map((user_id, i) => ({ vehicle_id: vehicleId, user_id, posicion: i + 1, desde: hoy, asignado_por: profile.user_id })),
  );
  if (error) return { error: error.message };

  await auditar("MODIFICAR", "regulacion", vehicleId, "Conductores titulares: " + userIds.length);
  revalidatePath("/regulacion");
  return { success: true };
}

/**
 * Cambio del día: reemplaza lo registrado para ese vehículo en esa fecha (hoy o futuro). Los titulares no se tocan:
 * al día siguiente vuelven solos. Para HOY también deja a esos conductores como la tripulación OVEM vigente, que es
 * lo que usan «Mis servicios» y el preoperacional.
 */
export async function cambiarOperadoresDelDia(vehicleId: string, fecha: string, userIds: string[], nota?: string) {
  const profile = await requireRole([...ROLES_PROGRAMACION]);
  const malo = validarConductores(userIds);
  if (malo) return { error: malo };
  const hoy = hoyBogota();
  if (!esDia(fecha) || fecha < hoy) return { error: "Solo se puede ajustar hoy o un día futuro; el pasado es historial." };

  const supabase = createClient() as any;
  const { data: tit } = await supabase.from("vehicle_titulares").select("user_id").eq("vehicle_id", vehicleId).lte("desde", fecha).or("hasta.is.null,hasta.gte." + fecha);
  const titulares = new Set(((tit ?? []) as Fila[]).map((t) => t.user_id as string));

  const { error: eDel } = await supabase.from("vehicle_operacion_diaria").delete().eq("vehicle_id", vehicleId).eq("fecha", fecha);
  if (eDel) return { error: eDel.message };
  const { error } = await supabase.from("vehicle_operacion_diaria").insert(
    userIds.map((user_id) => ({
      fecha,
      vehicle_id: vehicleId,
      user_id,
      origen: titulares.has(user_id) ? "TITULAR" : "CAMBIO_DEL_DIA",
      nota: nota?.trim() || null,
      registrado_por: profile.user_id,
    })),
  );
  if (error) return { error: error.message };

  if (fecha === hoy) await sincronizarTripulacionOVEM(vehicleId, userIds, hoy, profile.user_id);

  await auditar("MODIFICAR", "regulacion", vehicleId, "Operadores del " + fecha + " (" + userIds.length + ")");
  revalidatePath("/regulacion");
  return { success: true };
}

/** Deja como OVEM vigentes del vehículo exactamente a quienes operan hoy (lo que leen «Mis servicios» y el preoperacional). */
async function sincronizarTripulacionOVEM(vehicleId: string, userIds: string[], hoy: Dia, asignadoPor: string) {
  const supabase = createClient() as any;
  const { data } = await supabase.from("vehicle_assignments").select("id, user_id").eq("vehicle_id", vehicleId).eq("rol_en_turno", "OVEM").eq("activo", true);
  const vigentes = (data ?? []) as Fila[];
  for (const a of vigentes) {
    if (!userIds.includes(a.user_id)) await supabase.from("vehicle_assignments").update({ activo: false }).eq("id", a.id);
  }
  const yaEstan = new Set(vigentes.map((a) => a.user_id as string));
  for (const user_id of userIds) {
    if (yaEstan.has(user_id)) continue;
    await supabase.from("vehicle_assignments").upsert(
      { user_id, vehicle_id: vehicleId, rol_en_turno: "OVEM", fecha_inicio: hoy, fecha_fin: null, activo: true, asignado_por: asignadoPor },
      { onConflict: "user_id,vehicle_id,fecha_inicio" },
    );
  }
}

export interface HistorialOperacion {
  fecha: Dia;
  placa: string;
  conductor: string;
  origen: string;
}

/** Historial para cruzar con novedades y daños: por vehículo o por conductor, en un rango (máx. 366 días). */
export async function getHistorialOperacion(filtro: { vehicleId?: string; userId?: string; desde: string; hasta: string }): Promise<HistorialOperacion[]> {
  await requireRole([...ROLES_LECTURA]);
  if (!esDia(filtro.desde) || !esDia(filtro.hasta) || filtro.hasta < filtro.desde) return [];
  const supabase = createClient() as any;
  let q = supabase
    .from("vehicle_operacion_diaria")
    .select("fecha, origen, vehicle_id, user_id, vehicles(placa)")
    .gte("fecha", filtro.desde)
    .lte("fecha", filtro.hasta)
    .order("fecha", { ascending: false })
    .limit(5000);
  if (filtro.vehicleId) q = q.eq("vehicle_id", filtro.vehicleId);
  if (filtro.userId) q = q.eq("user_id", filtro.userId);
  const { data } = await q;
  const filas = (data ?? []) as Fila[];
  // vehicle_operacion_diaria apunta a auth.users, no a user_profiles: los nombres se resuelven aparte.
  const ids = Array.from(new Set(filas.map((f) => f.user_id as string)));
  const { data: perfiles } = ids.length > 0 ? await supabase.from("user_profiles").select("user_id, nombre_completo, email").in("user_id", ids) : { data: [] };
  const nombre = new Map(((perfiles ?? []) as Fila[]).map((p) => [p.user_id as string, (p.nombre_completo || p.email || "") as string]));
  return filas.map((f) => ({ fecha: f.fecha, placa: f.vehicles?.placa ?? "", conductor: nombre.get(f.user_id) ?? "", origen: f.origen }));
}
