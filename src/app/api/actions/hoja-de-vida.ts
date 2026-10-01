"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import {
  claveTexto,
  faltantesHojaDeVida,
  validarDocumento,
  validarUltimoMantenimiento,
  validarVehiculo,
  type DocumentoFila,
  type ErrorFila,
  type FilaCruda,
  type UltimoMantenimientoFila,
  type VehiculoFila,
} from "@/lib/hoja-de-vida";
import { createClient } from "@/lib/supabase/server";

export interface HojaDeVidaPayload {
  vehiculos: FilaCruda[];
  documentos: FilaCruda[];
  mantenimientos: FilaCruda[];
}

export interface ResumenHoja {
  nuevos: number;
  actualizados: number;
  sinCambios: number;
}

export interface ReporteHojaDeVida {
  aplicado: boolean;
  vehiculos: ResumenHoja;
  documentos: ResumenHoja;
  mantenimientos: ResumenHoja;
  /** Lecturas de km que entraron por mileage_logs (el trigger actualiza vehicles.km_actual). */
  lecturasKm: number;
  /** Vencimientos de SOAT / técnico-mecánica actualizados en la ficha del vehículo (alimentan las alertas). */
  vencimientos: number;
  /** Filas sin valor: aportaron solo el vencimiento. Útil para saber qué costos faltan por cargar. */
  sinValor: number;
  errores: ErrorFila[];
  /** Hojas de vida que quedan incompletas tras la carga, con lo que falta. */
  incompletos: { placa: string; faltantes: string[] }[];
  /** Placas nuevas o con cambio de estado, para que se vea qué tocó la carga. */
  cambiosDeEstado: { placa: string; de: string | null; a: string }[];
}

const ROLES = ["ADMIN", "ANALISTA"] as const;
const vacio = (): ResumenHoja => ({ nuevos: 0, actualizados: 0, sinCambios: 0 });

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este repo (ver CLAUDE.md).
type Fila = Record<string, any>;

/** Columnas de `vehicles` que la carga escribe (km y fecha de km van a mileage_logs). */
const COLUMNAS_VEHICULO = [
  "centro_operativo", "estado_actual", "fds_desde", "tipo_vehiculo", "marca", "linea", "modelo", "color", "combustible",
  "tipo_combustible", "cilindraje", "pasajeros", "carroceria", "numero_motor", "numero_chasis", "ciudad_placa",
  "propietario", "fecha_matricula", "imei_gps", "fecha_pase_aeroportuario", "multas", "obs_multas", "tipo_llantas",
  "tipo_bombillos", "bombilleria_farolas", "bombilleria_stops", "bombilleria_direccionales", "tipo_refrigerante",
  "aceite_usado", "ref_filtro_aceite", "ref_filtro_aire_motor", "ref_filtro_combustible", "bateria_principal",
  "bateria_auxiliar", "notas",
] as const;

const igual = (a: unknown, b: unknown) => String(a ?? "") === String(b ?? "");

/**
 * Carga de la hoja de vida (plantilla de 3 hojas). Con `confirmar = false` solo calcula qué haría (vista previa);
 * con `true` lo aplica. Idempotente: vehículos por placa, documentos por placa + tipo + vigencia_desde, último
 * mantenimiento por placa + tarea + fecha. Una celda vacía nunca borra un dato ya cargado.
 */
export async function cargarHojaDeVida(payload: HojaDeVidaPayload, confirmar: boolean): Promise<ReporteHojaDeVida | { error: string }> {
  const profile = await requireRole([...ROLES]);
  const supabase = createClient() as any;

  const reporte: ReporteHojaDeVida = {
    aplicado: confirmar,
    vehiculos: vacio(),
    documentos: vacio(),
    mantenimientos: vacio(),
    lecturasKm: 0,
    vencimientos: 0,
    sinValor: 0,
    errores: [],
    incompletos: [],
    cambiosDeEstado: [],
  };
  const error = (hoja: string, fila: number, columna: string | undefined, mensaje: string) =>
    reporte.errores.push({ hoja, fila, columna, mensaje });

  // ── Validación de filas (sin tocar la base) ───────────────────────────────
  const vehiculos: { fila: number; v: VehiculoFila }[] = [];
  const vistas = new Map<string, number>();
  for (const { fila, datos } of payload.vehiculos) {
    const r = validarVehiculo(datos);
    if (!r.ok) {
      r.errores.forEach((e) => error("1_VEHICULOS", fila, e.columna, e.mensaje));
      continue;
    }
    if (vistas.has(r.valor.placa)) {
      error("1_VEHICULOS", fila, "placa", `La placa ${r.valor.placa} ya aparece en la fila ${vistas.get(r.valor.placa)}.`);
      continue;
    }
    vistas.set(r.valor.placa, fila);
    vehiculos.push({ fila, v: r.valor });
  }

  const documentos: { fila: number; d: DocumentoFila }[] = [];
  for (const { fila, datos } of payload.documentos) {
    const r = validarDocumento(datos);
    if (!r.ok) r.errores.forEach((e) => error("2_DOCUMENTOS_Y_COSTOS", fila, e.columna, e.mensaje));
    else documentos.push({ fila, d: r.valor });
  }

  const mantenimientos: { fila: number; m: UltimoMantenimientoFila }[] = [];
  for (const { fila, datos } of payload.mantenimientos) {
    const r = validarUltimoMantenimiento(datos);
    if (!r.ok) r.errores.forEach((e) => error("3_ULTIMO_MANTENIMIENTO", fila, e.columna, e.mensaje));
    else mantenimientos.push({ fila, m: r.valor });
  }

  // ── Lo que ya existe en la base ───────────────────────────────────────────
  const placas = Array.from(new Set([...vehiculos.map((x) => x.v.placa), ...documentos.map((x) => x.d.placa), ...mantenimientos.map((x) => x.m.placa)]));
  const { data: existentes, error: errVeh } = await supabase.from("vehicles").select("*").in("placa", placas);
  if (errVeh) return { error: errVeh.message };
  const porPlaca = new Map<string, Fila>((existentes ?? []).map((v: Fila) => [v.placa, v]));

  // ── Vehículos ─────────────────────────────────────────────────────────────
  const idNuevo = new Map<string, string>(); // placa → id, para los vehículos creados en esta carga
  for (const { fila, v } of vehiculos) {
    const actual = porPlaca.get(v.placa);
    const valores: Fila = {};
    for (const c of COLUMNAS_VEHICULO) {
      const nuevoValor = c === "tipo_combustible" ? v.combustible : (v as unknown as Fila)[c];
      if (nuevoValor !== null && nuevoValor !== undefined) valores[c] = nuevoValor;
    }

    if (!actual) {
      if (!v.centro_operativo) { error("1_VEHICULOS", fila, "centro_operativo", "Vehículo nuevo: falta el centro de operación."); continue; }
      // Decisión de Daniel (2026-09-30): un vehículo nuevo sin estado en la plantilla entra OPERATIVO; queda visible
      // en «cambios de estado» del reporte.
      const estadoInicial = v.estado_actual ?? "OPERATIVO";
      valores.estado_actual = estadoInicial;
      reporte.vehiculos.nuevos++;
      reporte.cambiosDeEstado.push({ placa: v.placa, de: null, a: estadoInicial });
      if (confirmar) {
        const { data, error: e } = await supabase.from("vehicles").insert({ placa: v.placa, ...valores }).select("id").single();
        if (e) { reporte.vehiculos.nuevos--; error("1_VEHICULOS", fila, undefined, e.message); continue; }
        idNuevo.set(v.placa, data.id);
        porPlaca.set(v.placa, { id: data.id, placa: v.placa, ...valores });
      }
    } else {
      const cambios: Fila = {};
      for (const [c, nuevoValor] of Object.entries(valores)) if (!igual(actual[c], nuevoValor)) cambios[c] = nuevoValor;
      if (cambios.estado_actual) reporte.cambiosDeEstado.push({ placa: v.placa, de: actual.estado_actual ?? null, a: cambios.estado_actual });
      if (Object.keys(cambios).length === 0) reporte.vehiculos.sinCambios++;
      else {
        reporte.vehiculos.actualizados++;
        if (confirmar) {
          const { error: e } = await supabase.from("vehicles").update({ ...cambios, updated_at: new Date().toISOString() }).eq("id", actual.id);
          if (e) { reporte.vehiculos.actualizados--; error("1_VEHICULOS", fila, undefined, e.message); continue; }
          Object.assign(actual, cambios);
        }
      }
    }

    // Historial de estado (solo cuando cambia de verdad).
    const estadoAnterior = actual?.estado_actual ?? null;
    const estadoFinal = v.estado_actual ?? (actual ? null : "OPERATIVO");
    if (confirmar && estadoFinal && estadoFinal !== estadoAnterior) {
      const id = actual?.id ?? idNuevo.get(v.placa);
      if (id) {
        await supabase.from("vehicle_status_history").insert({
          vehicle_id: id,
          estado_nuevo: estadoFinal,
          estado_anterior: estadoAnterior,
          registrado_por: profile.user_id,
          notas: "Carga de hoja de vida",
        });
      }
    }

    // Kilometraje: entra por mileage_logs; el trigger (092) mantiene vehicles.km_actual (solo avanza).
    if (v.km_actual !== null && v.fecha_km_actual) {
      reporte.lecturasKm++;
      const id = actual?.id ?? idNuevo.get(v.placa);
      if (confirmar && id) {
        const { error: e } = await supabase
          .from("mileage_logs")
          .upsert({ vehicle_id: id, fecha: v.fecha_km_actual, lectura_kilometraje: v.km_actual }, { onConflict: "vehicle_id,fecha" });
        if (e) { reporte.lecturasKm--; error("1_VEHICULOS", fila, "km_actual", e.message); }
      }
    }

    // Faltantes: lo que dice la plantilla + lo que ya tenía el vehículo en la base.
    const consolidado = { ...(actual ?? {}), ...Object.fromEntries(Object.entries(v).filter(([, val]) => val !== null)) } as Fila;
    if (v.km_actual === null && actual?.km_actual != null) consolidado.km_actual = actual.km_actual;
    if (v.fecha_km_actual === null && actual?.fecha_km_actual) consolidado.fecha_km_actual = actual.fecha_km_actual;
    const faltantes = faltantesHojaDeVida(consolidado);
    if (faltantes.length > 0) reporte.incompletos.push({ placa: v.placa, faltantes });
  }

  // ── Documentos y costos ───────────────────────────────────────────────────
  const idDe = (placa: string): string | null => porPlaca.get(placa)?.id ?? null;
  const idsConocidos = Array.from(new Set(documentos.map((x) => idDe(x.d.placa)).filter(Boolean))) as string[];
  const { data: costosExistentes } = idsConocidos.length
    ? await supabase.from("vehicle_annual_costs").select("*").in("vehicle_id", idsConocidos)
    : { data: [] as Fila[] };
  const clave = (vehicleId: string, tipo: string, desde: string) => `${vehicleId}|${tipo}|${desde}`;
  const costos = new Map<string, Fila>((costosExistentes ?? []).map((c: Fila) => [clave(c.vehicle_id, c.tipo, c.vigencia_desde), c]));

  // Vencimiento más lejano por placa y tipo (SOAT / RTM): es el que se guarda en la ficha del vehículo.
  const vencimientos = new Map<string, { soat?: string; rtm?: string }>();
  for (const { d } of documentos) {
    if (d.tipo !== "SOAT" && d.tipo !== "RTM") continue;
    const v = vencimientos.get(d.placa) ?? {};
    const k = d.tipo === "SOAT" ? "soat" : "rtm";
    if (!v[k] || d.vigencia_hasta > (v[k] as string)) v[k] = d.vigencia_hasta;
    vencimientos.set(d.placa, v);
  }

  for (const { fila, d } of documentos) {
    if (d.valor === null || d.vigencia_desde === null) {
      // Valor pendiente: no se inventa un costo. El vencimiento ya quedó en `vencimientos` si es SOAT o RTM.
      reporte.sinValor++;
      if (!vistas.has(d.placa) && !porPlaca.has(d.placa)) error("2_DOCUMENTOS_Y_COSTOS", fila, "placa", `La placa ${d.placa} no existe ni está en la hoja 1_VEHICULOS.`);
      continue;
    }
    const vehicleId = idDe(d.placa);
    if (!vehicleId) {
      // En vista previa un vehículo nuevo aún no tiene id: se acepta si está en la hoja 1 de esta misma carga.
      if (!confirmar && vistas.has(d.placa)) { reporte.documentos.nuevos++; continue; }
      error("2_DOCUMENTOS_Y_COSTOS", fila, "placa", `La placa ${d.placa} no existe ni está en la hoja 1_VEHICULOS.`);
      continue;
    }
    const fila_db = { vehicle_id: vehicleId, tipo: d.tipo, vigencia_desde: d.vigencia_desde, vigencia_hasta: d.vigencia_hasta, valor: d.valor, fecha_pago: d.fecha_pago, proveedor: d.proveedor, numero_documento: d.numero_documento, estimado: d.estimado, notas: d.notas };
    const previo = costos.get(clave(vehicleId, d.tipo, d.vigencia_desde as string));
    if (previo) {
      const cambia = (["vigencia_hasta", "valor", "fecha_pago", "proveedor", "numero_documento", "estimado", "notas"] as const).some((c) => !igual(previo[c], (fila_db as Fila)[c]));
      if (!cambia) { reporte.documentos.sinCambios++; continue; }
      reporte.documentos.actualizados++;
      if (confirmar) {
        const { error: e } = await supabase.from("vehicle_annual_costs").update(fila_db).eq("id", previo.id);
        if (e) { reporte.documentos.actualizados--; error("2_DOCUMENTOS_Y_COSTOS", fila, undefined, traducirCosto(e)); }
      }
    } else {
      reporte.documentos.nuevos++;
      if (confirmar) {
        const { error: e } = await supabase.from("vehicle_annual_costs").insert({ ...fila_db, created_by: profile.user_id });
        if (e) { reporte.documentos.nuevos--; error("2_DOCUMENTOS_Y_COSTOS", fila, undefined, traducirCosto(e)); }
      }
    }
  }

  for (const [placa, v] of Array.from(vencimientos)) {
    const actual = porPlaca.get(placa);
    if (!actual) continue;
    const cambios: Fila = {};
    if (v.soat && (!actual.vencimiento_soat || v.soat > actual.vencimiento_soat)) cambios.vencimiento_soat = v.soat;
    if (v.rtm && (!actual.vencimiento_tecnicomecanica || v.rtm > actual.vencimiento_tecnicomecanica)) cambios.vencimiento_tecnicomecanica = v.rtm;
    if (Object.keys(cambios).length === 0) continue;
    reporte.vencimientos++;
    if (confirmar) {
      const { error: e } = await supabase.from("vehicles").update(cambios).eq("id", actual.id);
      if (e) { reporte.vencimientos--; error("2_DOCUMENTOS_Y_COSTOS", 0, undefined, `${placa}: ${e.message}`); }
    }
  }

  // ── Último mantenimiento por tarea del plan ───────────────────────────────
  const { data: plan } = await supabase.from("maintenance_plan_items").select("id, descripcion");
  const itemPorNombre = new Map<string, number>((plan ?? []).map((p: Fila) => [claveTexto(p.descripcion), p.id]));
  const idsMant = Array.from(new Set(mantenimientos.map((x) => idDe(x.m.placa)).filter(Boolean))) as string[];
  const { data: logsExistentes } = idsMant.length
    ? await supabase.from("vehicle_maintenance_log").select("vehicle_id, plan_item_id, fecha_realizado, km_realizado, notas").in("vehicle_id", idsMant)
    : { data: [] as Fila[] };
  const logs = new Map<string, Fila>((logsExistentes ?? []).map((l: Fila) => [`${l.vehicle_id}|${l.plan_item_id}|${l.fecha_realizado}`, l]));

  for (const { fila, m } of mantenimientos) {
    const vehicleId = idDe(m.placa);
    const itemId = itemPorNombre.get(claveTexto(m.item_plan));
    if (!vehicleId && !(!confirmar && vistas.has(m.placa))) { error("3_ULTIMO_MANTENIMIENTO", fila, "placa", `La placa ${m.placa} no existe ni está en la hoja 1_VEHICULOS.`); continue; }
    if (!itemId) { error("3_ULTIMO_MANTENIMIENTO", fila, "item_plan", `La tarea «${m.item_plan}» no existe en el plan de mantenimiento.`); continue; }
    if (!vehicleId) { reporte.mantenimientos.nuevos++; continue; }
    const previo = logs.get(`${vehicleId}|${itemId}|${m.fecha_realizado}`);
    if (previo && igual(previo.km_realizado, m.km_realizado) && igual(previo.notas, m.notas)) { reporte.mantenimientos.sinCambios++; continue; }
    if (previo) {
      reporte.mantenimientos.actualizados++;
      if (confirmar) {
        const { error: e } = await supabase.from("vehicle_maintenance_log").update({ km_realizado: m.km_realizado, notas: m.notas }).eq("vehicle_id", vehicleId).eq("plan_item_id", itemId).eq("fecha_realizado", m.fecha_realizado);
        if (e) { reporte.mantenimientos.actualizados--; error("3_ULTIMO_MANTENIMIENTO", fila, undefined, e.message); }
      }
    } else {
      reporte.mantenimientos.nuevos++;
      if (confirmar) {
        const { error: e } = await supabase.from("vehicle_maintenance_log").insert({ vehicle_id: vehicleId, plan_item_id: itemId, fecha_realizado: m.fecha_realizado, km_realizado: m.km_realizado, notas: m.notas, registrado_por: profile.user_id });
        if (e) { reporte.mantenimientos.nuevos--; error("3_ULTIMO_MANTENIMIENTO", fila, undefined, e.message); }
      }
    }
  }

  if (confirmar) {
    await auditar(
      "INSERTAR",
      "carga_masiva",
      "",
      `Carga de hoja de vida: vehículos ${reporte.vehiculos.nuevos} nuevos / ${reporte.vehiculos.actualizados} actualizados; documentos ${reporte.documentos.nuevos} / ${reporte.documentos.actualizados}; mantenimientos ${reporte.mantenimientos.nuevos} / ${reporte.mantenimientos.actualizados}; ${reporte.errores.length} con error`
    );
    revalidatePath("/vehiculos");
    revalidatePath("/configuracion");
  }
  return reporte;
}

/** Traduce el choque de vigencias (EXCLUDE de la 089) a un mensaje que se pueda corregir en el Excel. */
function traducirCosto(e: { code?: string; message: string }): string {
  if (e.code === "23P01") return "La vigencia se solapa con otra ya registrada del mismo vehículo y tipo (ajusta las fechas).";
  return e.message;
}
