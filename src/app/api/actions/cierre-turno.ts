"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auditar } from "@/lib/auditoria";
import {
  bloqueoCierre,
  cruzarCierres,
  debeAbrirNovedad,
  descripcionNovedadDeCierre,
  estadoEntregaDe,
  validarCierre,
  type CierreRegistrado,
  type CierresDeHoy,
  type NivelCombustible,
  type VehiculoProgramadoCierre,
} from "@/lib/cierre-turno";
import { hoyBogota, sumarDias } from "@/lib/fechas";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "./auth";
import { createIncident } from "./incidents";
import { getFleetWithAssignments } from "./regulacion";

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este repo (ver CLAUDE.md).
type Fila = Record<string, any>;

const ROLES_LECTURA_CIERRES = ["ADMIN", "ANALISTA", "REGULACION", "COORDINACION"] as const;

export interface ConductorSiguiente {
  user_id: string;
  nombre: string;
}

export interface ContextoCierre {
  /** Km inicial del preoperacional de hoy (null si aún no lo hizo). */
  kmInicialHoy: number | null;
  /** Última lectura de odómetro conocida del vehículo. */
  ultimoKm: number | null;
  /** Instante del cierre de hoy en este vehículo (ISO, puesto por el servidor); null si aún no cierra. */
  cerradoAt: string | null;
  /** Motivo por el que hoy no puede cerrar (sin preoperacional, servicio en curso); null si puede. */
  bloqueo: string | null;
  /** Conductores programados mañana en este vehículo (para entregarle el vehículo). */
  siguientes: ConductorSiguiente[];
  /** Instante actual del servidor (ISO): el portal muestra la hora a partir de él, no del reloj del teléfono. */
  ahora: string;
}

const idSchema = z.string().uuid("Vehículo inválido");

/** Estado del cierre de hoy del OVEM en un vehículo: km inicial, bloqueos, cierre ya hecho y siguiente conductor. */
export async function getContextoCierre(vehicleId: string): Promise<ContextoCierre | { error: string }> {
  const profile = await requireRole(["OVEM"]);
  const id = idSchema.safeParse(vehicleId);
  if (!id.success) return { error: id.error.issues[0]?.message ?? "Vehículo inválido" };

  const supabase = createClient() as any;
  const hoy = hoyBogota();
  const estado = await leerEstado(supabase, profile.user_id, id.data, hoy);
  return {
    kmInicialHoy: estado.kmInicialHoy,
    ultimoKm: estado.ultimoKm,
    cerradoAt: estado.cerradoAt,
    bloqueo: estado.cerradoAt ? null : bloqueoCierre(estado.bloqueoEstado),
    siguientes: await siguientesConductores(id.data, profile.user_id, hoy),
    ahora: new Date().toISOString(),
  };
}

async function leerEstado(supabase: any, userId: string, vehicleId: string, hoy: string) {
  const [preop, cierre, enCurso, ultimoLog, vehiculo] = await Promise.all([
    supabase.from("daily_checks").select("id, kilometraje_inicial").eq("user_id", userId).eq("vehicle_id", vehicleId).eq("fecha", hoy).maybeSingle(),
    supabase.from("ovem_cierres_turno").select("id, cerrado_at").eq("user_id", userId).eq("vehicle_id", vehicleId).eq("fecha", hoy).maybeSingle(),
    supabase.from("medical_services").select("id", { count: "exact", head: true }).eq("vehicle_id", vehicleId).eq("etapa", "CURSO"),
    supabase.from("mileage_logs").select("lectura_kilometraje").eq("vehicle_id", vehicleId).order("lectura_kilometraje", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("vehicles").select("km_actual").eq("id", vehicleId).maybeSingle(),
  ]);
  const kmInicial = preop.data?.kilometraje_inicial;
  const candidatos = [ultimoLog.data?.lectura_kilometraje, vehiculo.data?.km_actual]
    .map((n) => (n === null || n === undefined ? NaN : Number(n)))
    .filter((n) => Number.isFinite(n));
  return {
    kmInicialHoy: kmInicial === null || kmInicial === undefined ? null : Number(kmInicial),
    ultimoKm: candidatos.length > 0 ? Math.max(...candidatos) : null,
    cerradoAt: (cierre.data?.cerrado_at as string | undefined) ?? null,
    bloqueoEstado: {
      tienePreoperacionalHoy: Boolean(preop.data),
      yaCerrado: Boolean(cierre.data),
      serviciosEnCurso: enCurso.count ?? 0,
    },
  };
}

/**
 * Conductores programados mañana en el vehículo, sin contar a quien cierra. El OVEM solo ve sus propias filas de la
 * programación (RLS), así que esto se lee con la clave de servicio y solo devuelve nombres de quienes van a recibir
 * ese vehículo. Si la programación de mañana no existe todavía, no hay a quién entregar y la lista va vacía.
 */
async function siguientesConductores(vehicleId: string, quienCierra: string, hoy: string): Promise<ConductorSiguiente[]> {
  try {
    const admin = createAdminClient() as any;
    const { data: operacion } = await admin
      .from("vehicle_operacion_diaria")
      .select("user_id")
      .eq("fecha", sumarDias(hoy, 1))
      .eq("vehicle_id", vehicleId);
    const ids = [...new Set(((operacion ?? []) as Fila[]).map((o) => String(o.user_id)))].filter((u) => u !== quienCierra);
    if (ids.length === 0) return [];
    const { data: perfiles } = await admin.from("user_profiles").select("user_id, nombre_completo, email").in("user_id", ids);
    return ((perfiles ?? []) as Fila[]).map((p) => ({ user_id: String(p.user_id), nombre: p.nombre_completo || p.email || "Conductor" }));
  } catch (e) {
    console.error("[cierre-turno] no se pudo leer el siguiente conductor:", e instanceof Error ? e.message : e);
    return [];
  }
}

export interface DatosCierreTurno {
  vehicleId: string;
  kmFinal: number;
  huboNovedades: boolean;
  novedadesNota?: string;
  nivelCombustible: NivelCombustible;
  limpiezaOk: boolean;
  entregadoA?: string | null;
}

/**
 * Cierra el turno del OVEM en un vehículo. El día (`hoyBogota()`) y la hora (`cerrado_at`, de la base) los pone el
 * servidor: aquí no se acepta ninguna fecha del cliente. Escribe el km final en el preoperacional de hoy y en la
 * lectura de odómetro del vehículo, abre la novedad si el OVEM reportó una y el vehículo no tiene ninguna abierta, y
 * deja el registro inmutable del cierre.
 */
export async function cerrarTurno(data: DatosCierreTurno) {
  const profile = await requireRole(["OVEM"]);
  const id = idSchema.safeParse(data?.vehicleId);
  if (!id.success) return { error: id.error.issues[0]?.message ?? "Vehículo inválido" };
  const vehicleId = id.data;
  const entregadoA = data.entregadoA ? z.string().uuid().safeParse(data.entregadoA) : null;
  if (entregadoA && !entregadoA.success) return { error: "El conductor al que entregas no es válido." };

  const supabase = createClient() as any;
  const hoy = hoyBogota();
  const estado = await leerEstado(supabase, profile.user_id, vehicleId, hoy);

  const bloqueo = bloqueoCierre(estado.bloqueoEstado);
  if (bloqueo) return { error: bloqueo };

  const errorEntrada = validarCierre(
    {
      kmFinal: typeof data.kmFinal === "number" ? data.kmFinal : undefined,
      huboNovedades: typeof data.huboNovedades === "boolean" ? data.huboNovedades : undefined,
      novedadesNota: data.novedadesNota,
      nivelCombustible: data.nivelCombustible,
      limpiezaOk: typeof data.limpiezaOk === "boolean" ? data.limpiezaOk : undefined,
    },
    { kmInicialHoy: estado.kmInicialHoy, ultimoKm: estado.ultimoKm },
  );
  if (errorEntrada) return { error: errorEntrada };

  // Solo se entrega a quien Regulación programó mañana en este vehículo.
  if (entregadoA?.success) {
    const validos = await siguientesConductores(vehicleId, profile.user_id, hoy);
    if (!validos.some((c) => c.user_id === entregadoA.data)) {
      return { error: "Ese conductor no está programado mañana en este vehículo." };
    }
  }

  const nota = data.huboNovedades ? (data.novedadesNota ?? "").trim() : null;

  // 1) Km final: lectura de odómetro (la función solo avanza) y preoperacional de hoy. Ambas escrituras se pueden repetir
  //    sin efecto, así que si algo falla más abajo el OVEM puede reintentar el cierre.
  const { error: kmError } = await supabase.rpc("registrar_km_cierre_turno", { p_vehicle_id: vehicleId, p_km: data.kmFinal });
  if (kmError) return { error: kmError.message };
  const { error: checkError } = await supabase
    .from("daily_checks")
    .update({ kilometraje_final: data.kmFinal })
    .eq("user_id", profile.user_id)
    .eq("vehicle_id", vehicleId)
    .eq("fecha", hoy);
  if (checkError) return { error: checkError.message };

  // 2) Novedad: si dijo que sí y el vehículo no tiene ninguna abierta, se abre con lo que contó. El OVEM no saca el
  //    vehículo de servicio a criterio (createIncident lo fuerza), así que queda como novedad para Regulación/Mantenimiento.
  let novedadCreada = false;
  if (nota) {
    const { count: abiertas } = await supabase.from("incidents").select("id", { count: "exact", head: true }).eq("vehicle_id", vehicleId).eq("estado", "ABIERTO");
    if (debeAbrirNovedad(true, abiertas ?? 0)) {
      const res = await createIncident({
        vehicleId,
        descripcion: descripcionNovedadDeCierre(nota),
        reportadoPor: profile.nombre_completo || profile.email || "OVEM",
        afectaOperatividad: false,
      });
      if ("error" in res && res.error) return { error: `No se pudo abrir la novedad: ${res.error}. El turno sigue abierto; inténtalo de nuevo.` };
      novedadCreada = true;
    }
  }

  // 3) Registro del cierre. `fecha` y `cerrado_at` no se envían: los pone la base (y la política RLS lo exige).
  const { data: fila, error } = await supabase
    .from("ovem_cierres_turno")
    .insert({
      user_id: profile.user_id,
      vehicle_id: vehicleId,
      km_final: data.kmFinal,
      hubo_novedades: data.huboNovedades,
      novedades_nota: nota,
      estado_entrega: estadoEntregaDe(data.huboNovedades),
      nivel_combustible: data.nivelCombustible,
      limpieza_ok: data.limpiezaOk,
      entregado_a: entregadoA?.success ? entregadoA.data : null,
    })
    .select("id, cerrado_at")
    .single();
  if (error) {
    if (error.code === "23505") return { error: "Ya cerraste el turno de este vehículo hoy." };
    return { error: error.message };
  }

  await auditar("INSERTAR", "vehiculos", vehicleId, `Cierre de turno del OVEM (km final ${data.kmFinal}, ${data.huboNovedades ? "con" : "sin"} novedades)`);
  revalidatePath("/ovem");
  revalidatePath("/regulacion");
  revalidatePath("/");
  return { success: true as const, cerradoAt: fila.cerrado_at as string, novedadCreada };
}

/**
 * Cierres de turno de hoy en el centro de quien consulta (todos si no tiene uno): los que ya cerraron y los
 * programados que faltan. «Programados» sigue la misma regla que el preoperacional de hoy: OPERATIVO y programado hoy
 * (vehicle_operacion_diaria); un centro sin programación hoy usa su tripulación asignada.
 */
export async function getCierresDeTurnoHoy(): Promise<CierresDeHoy> {
  await requireRole([...ROLES_LECTURA_CIERRES]);
  const supabase = createClient() as any;
  const hoy = hoyBogota();

  const flota = (await getFleetWithAssignments()) as Fila[];
  const operativos = flota.filter((v) => v.estado_actual === "OPERATIVO");
  const { data: operacion } = await supabase.from("vehicle_operacion_diaria").select("vehicle_id, user_id").eq("fecha", hoy);
  const filasOperacion = (operacion ?? []) as Fila[];
  const idsProgramados = new Set(filasOperacion.map((o) => String(o.vehicle_id)));
  const centrosConProgramacion = new Set(flota.filter((v) => idsProgramados.has(v.id)).map((v) => v.centro_operativo));
  const esperados = operativos.filter((v) => (centrosConProgramacion.has(v.centro_operativo) ? idsProgramados.has(v.id) : v.assignments.length > 0));

  // Cierres de hoy de los vehículos de este centro (aunque el vehículo ya no esté operativo: el cierre existe).
  const placaDe = new Map(flota.map((v) => [String(v.id), String(v.placa)]));
  const { data: cierresDb } = await supabase
    .from("ovem_cierres_turno")
    .select("vehicle_id, user_id, km_final, estado_entrega, cerrado_at")
    .eq("fecha", hoy)
    .in("vehicle_id", flota.map((v) => v.id));
  const cierres = ((cierresDb ?? []) as Fila[]).filter((c) => placaDe.has(String(c.vehicle_id)));

  const userIds = [...new Set([...cierres.map((c) => String(c.user_id)), ...filasOperacion.map((o) => String(o.user_id))])];
  const { data: perfiles } = userIds.length > 0 ? await supabase.from("user_profiles").select("user_id, nombre_completo, email").in("user_id", userIds) : { data: [] };
  const nombreDe = new Map(((perfiles ?? []) as Fila[]).map((p) => [String(p.user_id), String(p.nombre_completo || p.email || "")]));

  const programados: VehiculoProgramadoCierre[] = esperados.map((v) => {
    const delDia = filasOperacion.filter((o) => String(o.vehicle_id) === v.id).map((o) => nombreDe.get(String(o.user_id)) || "");
    const tripulacion = v.assignments.filter((a: Fila) => a.rol_en_turno === "OVEM").map((a: Fila) => a.driver?.nombre_completo || a.driver?.email || "");
    return { vehicleId: String(v.id), placa: String(v.placa), operadores: (delDia.length > 0 ? delDia : tripulacion).filter(Boolean) };
  });

  const registrados: CierreRegistrado[] = cierres.map((c) => ({
    vehicleId: String(c.vehicle_id),
    placa: placaDe.get(String(c.vehicle_id)) ?? "",
    ovem: nombreDe.get(String(c.user_id)) || null,
    cerradoAt: String(c.cerrado_at),
    estadoEntrega: c.estado_entrega,
    kmFinal: Number(c.km_final),
  }));

  return cruzarCierres(programados, registrados);
}
