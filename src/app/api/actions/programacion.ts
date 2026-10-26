"use server";

import { revalidatePath } from "next/cache";
import { auditar } from "@/lib/auditoria";
import { esDia, hoyBogota, limitesInstante, sumarDias, type Dia } from "@/lib/fechas";
import { centroVisible } from "@/lib/auth-utils";
import { createClient } from "@/lib/supabase/server";
import { resumenPorVehiculo, validarConductores, type FilaOperacion, type ResumenVehiculoDia, type TitularVigente } from "@/lib/programacion-diaria";
import {
  etiquetaRazon,
  filasDeCambio,
  planificarCambioDelDia,
  RAZONES_CON_NOVEDAD,
  reasignacionOvemDelDia,
  validarFiltroCambios,
  validarRazon,
  vehiculosDeOrigen,
  type CambioVehiculo,
  type ServicioDelDia,
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
  // Una persona es titular de un solo vehículo (QA-REG5, B2): si alguno de estos conductores ya es titular de OTRO, se le
  // retira de ahí, igual que el cambio del día ya lo mueve. El vehículo de origen conserva a su otro titular, si lo tiene.
  const { data: enOtros } = await supabase
    .from("vehicle_titulares")
    .select("id, user_id, desde, vehicle_id")
    .in("user_id", userIds)
    .neq("vehicle_id", vehicleId)
    .is("hasta", null);
  for (const t of (enOtros ?? []) as Fila[]) {
    const { error: errMovido } = t.desde >= hoy
      ? await supabase.from("vehicle_titulares").delete().eq("id", t.id)
      : await supabase.from("vehicle_titulares").update({ hasta: ayer }).eq("id", t.id);
    if (errMovido) return { error: errMovido.message };
  }

  const { error } = await supabase.from("vehicle_titulares").insert(
    userIds.map((user_id, i) => ({ vehicle_id: vehicleId, user_id, posicion: i + 1, desde: hoy, asignado_por: profile.user_id })),
  );
  if (error) return { error: error.message };

  const movidos = (enOtros ?? []).length;
  await auditar("MODIFICAR", "regulacion", vehicleId, "Conductores titulares: " + userIds.length + (movidos > 0 ? ` (${movidos} movido(s) desde otro vehículo)` : ""));
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

  // Vehículos afectados ese día con los conductores que les quedan: el destino y aquellos de los que salió alguien.
  const afectados: { vehiculoId: string; conductores: string[] }[] = [{ vehiculoId: vehicleId, conductores: userIds }];
  for (const origenId of Array.from(origenes)) {
    const { data: quedan } = await supabase.from("vehicle_operacion_diaria").select("user_id").eq("vehicle_id", origenId).eq("fecha", fecha);
    afectados.push({ vehiculoId: origenId, conductores: ((quedan ?? []) as Fila[]).map((f) => f.user_id as string) });
  }

  const advertencias: string[] = [];
  let serviciosReasignados = 0;
  let serviciosSinOvem = 0;
  for (const { vehiculoId, conductores } of afectados) {
    let orden = conductores;
    // La tripulación por rol es la de HOY; los días futuros no se sincronizan con ella, pero sus servicios sí siguen al vehículo.
    if (fecha === hoy) {
      const sync = await sincronizarTripulacionOVEM(vehiculoId, conductores, hoy, profile.user_id);
      advertencias.push(...sync.avisos);
      // Quien quedó como OVEM va primero: a él pasan los servicios que se quedaron sin dueño.
      if (sync.principal) orden = [sync.principal, ...conductores.filter((u) => u !== sync.principal)];
    }
    const movidos = await moverServiciosAlOvemDelDia(vehiculoId, fecha, orden);
    serviciosReasignados += movidos.reasignados - movidos.sinOvem;
    serviciosSinOvem += movidos.sinOvem;
    if (movidos.sinOvem > 0) {
      // Sin conductor ese día, sus servicios no los ve ningún OVEM: Regulación tiene que moverlos o armar la tripulación.
      const { data: veh } = await supabase.from("vehicles").select("placa").eq("id", vehiculoId).maybeSingle();
      advertencias.push(
        movidos.sinOvem + " servicio" + (movidos.sinOvem === 1 ? "" : "s") + " de " + (veh?.placa ?? "un vehículo") +
          " quedaron sin OVEM porque ya no tiene conductor ese día: asígnales conductor o muévelos a otro vehículo.",
      );
    }
    if (movidos.fallo) advertencias.push("No se pudieron pasar todos los servicios sin iniciar del vehículo al OVEM del día. Revísalos en Servicios.");
  }

  await auditar(
    "MODIFICAR",
    "regulacion",
    vehicleId,
    "Operadores del " + fecha + " (" + userIds.length + ")" + (plan.requiereRazon ? ", razón " + cambio!.razonCodigo : "") + "; servicios reasignados: " + serviciosReasignados + ", sin OVEM: " + serviciosSinOvem,
  );
  revalidatePath("/regulacion");
  revalidatePath("/servicios");
  revalidatePath("/ovem");
  const traslados: TrasladoServicios[] = Array.from(origenes).map((origenId) => ({ origenId, destinoId: vehicleId }));
  return { success: true as const, traslados, serviciosReasignados, serviciosSinOvem, advertencias: Array.from(new Set(advertencias)) };
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

/**
 * Deja como OVEM vigente del vehículo (lo que leen el formulario de servicios y «Tripulaciones de hoy») a uno de los que
 * operan hoy. Un vehículo solo puede tener UN OVEM activo en `vehicle_assignments` (índice único de la migración 051):
 * con dos conductores queda el que ya estaba vigente, o el primero de la lista. Antes se intentaba insertar a los dos y
 * el segundo fallaba sin que nadie se enterara. Devuelve quién quedó como principal y los avisos de lo que no se pudo.
 */
async function sincronizarTripulacionOVEM(vehicleId: string, userIds: string[], hoy: Dia, asignadoPor: string): Promise<{ principal: string | null; avisos: string[] }> {
  const supabase = createClient() as any;
  const avisos: string[] = [];
  const { data, error: eLeer } = await supabase.from("vehicle_assignments").select("id, user_id, fecha_fin").eq("vehicle_id", vehicleId).eq("rol_en_turno", "OVEM").eq("activo", true);
  if (eLeer) {
    console.error("[programacion] no se pudo leer la tripulación OVEM del vehículo:", vehicleId, eLeer.code, eLeer.message);
    return { principal: userIds[0] ?? null, avisos: ["No se pudo actualizar la tripulación del vehículo (OVEM). Revísala en «Tripulaciones de hoy»."] };
  }
  const vigentes = (data ?? []) as Fila[];
  // Una asignación «activa» con fecha_fin ya vencida no es vigente: no cuenta como que el conductor ya está.
  const vencida = (a: Fila) => Boolean(a.fecha_fin) && String(a.fecha_fin).slice(0, 10) < hoy;
  const principal = userIds.find((id) => vigentes.some((a) => a.user_id === id)) ?? userIds[0] ?? null;
  let cambioLaTripulacion = false;

  for (const a of vigentes) {
    if (a.user_id === principal) continue; // si la del principal está vencida se reabre más abajo, no se desactiva
    const { error } = await supabase.from("vehicle_assignments").update({ activo: false }).eq("id", a.id);
    if (error) {
      console.error("[programacion] no se pudo desactivar al OVEM anterior:", vehicleId, error.code, error.message);
      avisos.push("No se pudo quitar al OVEM anterior de la tripulación del vehículo. Revísala en «Tripulaciones de hoy».");
    } else cambioLaTripulacion = true;
  }
  const yaVigente = vigentes.find((a) => a.user_id === principal);
  if (principal && yaVigente && vencida(yaVigente)) {
    const { error } = await supabase.from("vehicle_assignments").update({ fecha_fin: null }).eq("id", yaVigente.id);
    if (error) {
      console.error("[programacion] no se pudo reabrir la asignación del OVEM:", vehicleId, error.code, error.message);
      avisos.push("No se pudo dejar al conductor como OVEM de la tripulación del vehículo. Revísala en «Tripulaciones de hoy».");
    } else cambioLaTripulacion = true;
  } else if (principal && !yaVigente) {
    const { error } = await supabase.from("vehicle_assignments").upsert(
      { user_id: principal, vehicle_id: vehicleId, rol_en_turno: "OVEM", fecha_inicio: hoy, fecha_fin: null, activo: true, asignado_por: asignadoPor },
      { onConflict: "user_id,vehicle_id,fecha_inicio" },
    );
    if (error) {
      console.error("[programacion] no se pudo asignar al OVEM a la tripulación del vehículo:", vehicleId, error.code, error.message);
      avisos.push("No se pudo dejar al conductor como OVEM de la tripulación del vehículo. Revísala en «Tripulaciones de hoy».");
    } else cambioLaTripulacion = true;
  }
  // Solo se avisa cuando la tripulación cambió: si no, sería el mismo aviso en cada guardado (por ejemplo al editar la nota).
  if (userIds.length > 1 && cambioLaTripulacion) {
    avisos.push("El vehículo tiene dos conductores: en «Tripulaciones de hoy» solo figura uno como OVEM y los servicios sin iniciar quedan a su nombre (un OVEM por vehículo).");
  }
  return { principal, avisos };
}

/**
 * Los servicios sin iniciar de ese vehículo y de ese día siguen a los conductores del día: el servicio pertenece al
 * vehículo (regla de Daniel, 2026-10-02), no a la persona. Solo toca los programados para `fecha`: los de otros días los
 * decide la programación de esos días, y los viejos sin cerrar no se reasignan a quien opera hoy. Tampoco toca los que no
 * tienen fecha de programación: no se pueden ubicar en un día y, en la práctica, son legado sin cerrar (11 en staging el
 * 2026-10-26), que no deben pasar a quien opera hoy.
 * `sinOvem` cuenta los que quedaron sin OVEM (cuando al vehículo no le queda ningún conductor ese día).
 */
async function moverServiciosAlOvemDelDia(
  vehicleId: string,
  fecha: Dia,
  conductores: string[],
): Promise<{ reasignados: number; sinOvem: number; fallo: boolean }> {
  const supabase = createClient() as any;
  const { desde, hastaExclusivo } = limitesInstante(fecha, fecha);
  const { data, error } = await supabase
    .from("medical_services")
    .select("id, etapa, fecha_hora_inicio_desplazamiento, ovem_user_id")
    .eq("vehicle_id", vehicleId)
    .eq("etapa", "PROGRAMADO")
    .is("fecha_hora_inicio_desplazamiento", null)
    .gte("fecha_hora_programacion", desde)
    .lt("fecha_hora_programacion", hastaExclusivo);
  if (error) {
    console.error("[programacion] no se pudieron leer los servicios del vehículo:", vehicleId, error.code, error.message);
    return { reasignados: 0, sinOvem: 0, fallo: true };
  }
  const cambios = reasignacionOvemDelDia((data ?? []) as ServicioDelDia[], conductores);
  if (cambios.length === 0) return { reasignados: 0, sinOvem: 0, fallo: false };

  // Un UPDATE por destino (los que van a la misma persona, juntos). La condición se repite (también el vehículo) por si
  // alguno inició o lo movió otro regulador entre la lectura y la escritura.
  const porDestino = new Map<string | null, number[]>();
  for (const c of cambios) porDestino.set(c.ovem, [...(porDestino.get(c.ovem) ?? []), c.id]);
  let reasignados = 0;
  let sinOvem = 0;
  for (const [ovem, ids] of Array.from(porDestino.entries())) {
    const { data: hechos, error: eMover } = await supabase
      .from("medical_services")
      .update({ ovem_user_id: ovem, updated_at: new Date().toISOString() })
      .in("id", ids)
      .eq("vehicle_id", vehicleId)
      .eq("etapa", "PROGRAMADO")
      .is("fecha_hora_inicio_desplazamiento", null)
      .select("id");
    if (eMover) console.error("[programacion] no se pudieron reasignar los servicios:", vehicleId, eMover.code, eMover.message);
    const n = (hechos ?? []).length;
    reasignados += n;
    if (ovem === null) sinOvem += n;
  }
  // Si se movió menos de lo previsto (falló un update, o un servicio inició o cambió de vehículo entre la lectura y la
  // escritura) hay que decirlo: lo leído ya viene recortado por la RLS, así que esto no es por servicios de otro centro.
  return { reasignados, sinOvem, fallo: reasignados < cambios.length };
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
