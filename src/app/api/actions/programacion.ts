"use server";

import { revalidatePath } from "next/cache";
import { auditar } from "@/lib/auditoria";
import { esDia, hoyBogota, sumarDias, type Dia } from "@/lib/fechas";
import { centroVisible } from "@/lib/auth-utils";
import { createClient } from "@/lib/supabase/server";
import { resumenPorVehiculo, validarConductores, type FilaOperacion, type ResumenVehiculoDia, type TitularVigente } from "@/lib/programacion-diaria";
import {
  etiquetaRazon,
  filasDeCambio,
  planificarCambioDelDia,
  RAZONES_CON_NOVEDAD,
  validarFiltroCambios,
  validarRazon,
  vehiculosDeOrigen,
  type CambioVehiculo,
  type FiltroCambios,
  type RazonCambio,
  type RazonCodigo,
} from "@/lib/cambio-vehiculo";
import { getProfile, requireRole } from "./auth";
import { getUsuariosPorRol } from "./regulacion";

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este repo (ver CLAUDE.md).
type Fila = Record<string, any>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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
    // Un titular abierto hoy mismo no deja historial útil (cero días): se borra en vez de cerrarlo con hasta = hoy,
    // que lo seguiría contando como titular de hoy. Los demás se cierran ayer.
    const { error } = t.desde >= hoy
      ? await supabase.from("vehicle_titulares").delete().eq("id", t.id)
      : await supabase.from("vehicle_titulares").update({ hasta: ayer }).eq("id", t.id);
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

export interface TrasladoServicios {
  origenId: string;
  destinoId: string;
}

/**
 * Cambio del día: reemplaza lo registrado para ese vehículo en esa fecha (hoy o futuro). Los titulares no se tocan:
 * al día siguiente vuelven solos. Para HOY también deja a esos conductores como la tripulación OVEM vigente, que es
 * lo que usan «Mis servicios» y el preoperacional.
 *
 * Razón obligatoria (Daniel, 2026-10-02): si el cambio retira o reemplaza a un conductor ya programado ese día, o
 * trae a uno que operaba en otro vehículo, hay que decir por qué (`cambio`). Queda en `vehicle_operador_cambios`
 * (114), enlazable a una novedad. Traer a un conductor de otro vehículo es un MOVIMIENTO: sale del vehículo de origen.
 * Devuelve los traslados (origen → destino) para ofrecer mover los servicios sin iniciar.
 */
export async function cambiarOperadoresDelDia(vehicleId: string, fecha: string, userIds: string[], nota?: string, cambio?: RazonCambio) {
  const profile = await requireRole([...ROLES_PROGRAMACION]);
  const malo = validarConductores(userIds);
  if (malo) return { error: malo };
  const hoy = hoyBogota();
  if (!esDia(fecha) || fecha < hoy) return { error: "Solo se puede ajustar hoy o un día futuro; el pasado es historial." };

  const supabase = createClient() as any;
  const { data: prev } = await supabase.from("vehicle_operacion_diaria").select("user_id").eq("vehicle_id", vehicleId).eq("fecha", fecha);
  const previos = ((prev ?? []) as Fila[]).map((f) => f.user_id as string);

  const llegan = userIds.filter((id) => !previos.includes(id));
  const enOtroVehiculo = new Map<string, string>();
  if (llegan.length > 0) {
    const { data: otros } = await supabase.from("vehicle_operacion_diaria").select("user_id, vehicle_id").eq("fecha", fecha).in("user_id", llegan).neq("vehicle_id", vehicleId);
    for (const o of (otros ?? []) as Fila[]) if (!enOtroVehiculo.has(o.user_id)) enOtroVehiculo.set(o.user_id, o.vehicle_id);
  }
  const plan = planificarCambioDelDia(previos, userIds, enOtroVehiculo);

  let filasCambio: Fila[] = [];
  if (plan.requiereRazon) {
    const sinRazon = validarRazon(cambio);
    if (sinRazon) return { error: sinRazon };
    const razonCodigo = cambio!.razonCodigo as string;
    const razonTexto = (cambio!.razonTexto ?? "").trim();
    let incidentId: number | null = null;
    let vehiculoDeLaNovedad: string | null = null;
    if (cambio!.incidentId != null) {
      if (!Number.isInteger(cambio!.incidentId) || !RAZONES_CON_NOVEDAD.includes(razonCodigo as RazonCodigo)) return { error: "La novedad enlazada no es válida para esta razón." };
      const { data: inc } = await supabase.from("incidents").select("id, vehicle_id, estado").eq("id", cambio!.incidentId).maybeSingle();
      if (!inc || !["ABIERTO", "EN_PROCESO"].includes(inc.estado) || !vehiculosDeOrigen(vehicleId, plan).includes(inc.vehicle_id)) {
        return { error: "La novedad debe estar abierta y ser de un vehículo del que sale el conductor." };
      }
      incidentId = inc.id;
      vehiculoDeLaNovedad = inc.vehicle_id;
    }
    const { data: creadas, error: eCambio } = await supabase
      .from("vehicle_operador_cambios")
      .insert(
        filasDeCambio(vehicleId, plan).map((f) => ({
          ...f,
          fecha,
          razon_codigo: razonCodigo,
          razon_texto: razonTexto,
          incident_id: incidentId !== null && f.vehicle_origen === vehiculoDeLaNovedad ? incidentId : null,
          registrado_por: profile.user_id,
        })),
      )
      .select("id");
    if (eCambio) return { error: eCambio.message };
    filasCambio = (creadas ?? []) as Fila[];
  }
  // Si algo falla después, no debe quedar la razón de un cambio que no ocurrió.
  const deshacerRazon = async () => {
    if (filasCambio.length > 0) await supabase.from("vehicle_operador_cambios").delete().in("id", filasCambio.map((f) => f.id));
  };

  const { data: tit } = await supabase.from("vehicle_titulares").select("user_id").eq("vehicle_id", vehicleId).lte("desde", fecha).or("hasta.is.null,hasta.gte." + fecha);
  const titulares = new Set(((tit ?? []) as Fila[]).map((t) => t.user_id as string));
  const notaFinal = nota?.trim() || (plan.requiereRazon ? (cambio!.razonTexto ?? "").trim() : "") || null;

  const { error: eDel } = await supabase.from("vehicle_operacion_diaria").delete().eq("vehicle_id", vehicleId).eq("fecha", fecha);
  if (eDel) { await deshacerRazon(); return { error: eDel.message }; }
  const { error } = await supabase.from("vehicle_operacion_diaria").insert(
    userIds.map((user_id) => ({
      fecha,
      vehicle_id: vehicleId,
      user_id,
      origen: titulares.has(user_id) ? "TITULAR" : "CAMBIO_DEL_DIA",
      nota: notaFinal,
      registrado_por: profile.user_id,
    })),
  );
  if (error) { await deshacerRazon(); return { error: error.message }; }

  // Quien viene de otro vehículo sale de él (es un movimiento, no un doble puesto).
  const origenes = new Set<string>();
  for (const l of plan.llegadas) {
    if (!l.vehiculoOrigen) continue;
    origenes.add(l.vehiculoOrigen);
    await supabase.from("vehicle_operacion_diaria").delete().eq("fecha", fecha).eq("vehicle_id", l.vehiculoOrigen).eq("user_id", l.userId);
  }

  if (fecha === hoy) {
    await sincronizarTripulacionOVEM(vehicleId, userIds, hoy, profile.user_id);
    for (const origenId of Array.from(origenes)) {
      const { data: quedan } = await supabase.from("vehicle_operacion_diaria").select("user_id").eq("vehicle_id", origenId).eq("fecha", fecha);
      await sincronizarTripulacionOVEM(origenId, ((quedan ?? []) as Fila[]).map((f) => f.user_id as string), hoy, profile.user_id);
    }
  }

  await auditar(
    "MODIFICAR",
    "regulacion",
    vehicleId,
    "Operadores del " + fecha + " (" + userIds.length + ")" + (plan.requiereRazon ? ", razón " + cambio!.razonCodigo : ""),
  );
  revalidatePath("/regulacion");
  const traslados: TrasladoServicios[] = Array.from(origenes).map((origenId) => ({ origenId, destinoId: vehicleId }));
  return { success: true as const, traslados };
}

export interface NovedadAbierta {
  id: number;
  vehicleId: string;
  placa: string;
  descripcion: string;
  estado: string;
  fechaReporte: string | null;
}

/** Novedades abiertas (o en proceso) de los vehículos de origen, para enlazar la razón del cambio. */
export async function getNovedadesAbiertas(vehicleIds: string[]): Promise<NovedadAbierta[]> {
  await requireRole([...ROLES_PROGRAMACION]);
  const ids = vehicleIds.filter((id) => UUID.test(id)).slice(0, 10);
  if (ids.length === 0) return [];
  const supabase = createClient() as any;
  const { data } = await supabase
    .from("incidents")
    .select("id, vehicle_id, descripcion, estado, fecha_reporte, vehicles(placa)")
    .in("vehicle_id", ids)
    .in("estado", ["ABIERTO", "EN_PROCESO"])
    .order("fecha_reporte", { ascending: false })
    .limit(50);
  return ((data ?? []) as Fila[]).map((n) => ({
    id: n.id,
    vehicleId: n.vehicle_id,
    placa: n.vehicles?.placa ?? "",
    descripcion: String(n.descripcion ?? "").slice(0, 140),
    estado: n.estado,
    fechaReporte: n.fecha_reporte ?? null,
  }));
}

/** Historial de cambios de vehículo (con su razón) por vehículo (origen o destino) o por conductor, en un rango. */
export async function getCambiosDeVehiculo(filtro: FiltroCambios): Promise<CambioVehiculo[]> {
  await requireRole([...ROLES_LECTURA]);
  if (validarFiltroCambios(filtro)) return [];
  const supabase = createClient() as any;
  let q = supabase
    .from("vehicle_operador_cambios")
    .select("id, fecha, user_id, vehicle_origen, vehicle_destino, razon_codigo, razon_texto, incident_id, registrado_por")
    .gte("fecha", filtro.desde)
    .lte("fecha", filtro.hasta)
    .order("fecha", { ascending: false })
    .order("id", { ascending: false })
    .limit(2000);
  if (filtro.vehicleId) q = q.or("vehicle_origen.eq." + filtro.vehicleId + ",vehicle_destino.eq." + filtro.vehicleId);
  if (filtro.userId) q = q.eq("user_id", filtro.userId);
  const { data } = await q;
  const filas = (data ?? []) as Fila[];
  // Usuarios y placas se resuelven aparte: las FK apuntan a auth.users y a vehicles por dos columnas distintas.
  const personas = Array.from(new Set(filas.flatMap((f) => [f.user_id as string, f.registrado_por as string]).filter(Boolean)));
  const vehiculos = Array.from(new Set(filas.flatMap((f) => [f.vehicle_origen as string, f.vehicle_destino as string]).filter(Boolean)));
  const [{ data: perfiles }, { data: placas }] = await Promise.all([
    personas.length > 0 ? supabase.from("user_profiles").select("user_id, nombre_completo, email").in("user_id", personas) : { data: [] },
    vehiculos.length > 0 ? supabase.from("vehicles").select("id, placa").in("id", vehiculos) : { data: [] },
  ]);
  const nombre = new Map(((perfiles ?? []) as Fila[]).map((p) => [p.user_id as string, (p.nombre_completo || p.email || "") as string]));
  const placa = new Map(((placas ?? []) as Fila[]).map((v) => [v.id as string, v.placa as string]));
  return filas.map((f) => ({
    id: f.id,
    fecha: f.fecha,
    conductor: nombre.get(f.user_id) ?? "",
    placaOrigen: f.vehicle_origen ? placa.get(f.vehicle_origen) ?? null : null,
    placaDestino: f.vehicle_destino ? placa.get(f.vehicle_destino) ?? null : null,
    razonCodigo: f.razon_codigo,
    razonEtiqueta: etiquetaRazon(f.razon_codigo),
    razonTexto: f.razon_texto,
    incidentId: f.incident_id ?? null,
    registradoPor: nombre.get(f.registrado_por) ?? "",
  }));
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
