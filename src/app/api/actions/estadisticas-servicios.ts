"use server";

import { diaEnBogota, hoyBogota, limitesInstante, sumarDias, sumarMeses } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { centroVisible } from "@/lib/auth-utils";
import { leerTodo } from "@/lib/leer-todo";
import { prefijoCiudad } from "@/lib/servicios-lista";

export interface EstadisticasServicios {
  total: number;
  porEtapa: { etapa: string; cantidad: number }[];
  porTipo: { tipo: string; cantidad: number }[];
  porMes: { mes: string; cantidad: number; finalizados: number }[];
  tiemposPromedio: { concepto: string; minutos: number }[];
  topCiudadesOrigen: { ciudad: string; cantidad: number }[];
}

/**
 * Estadísticas de servicios de los últimos 12 meses — port del dashboard
 * embebido de SISRES (includes/estadisticasServicios.php) a agregación
 * sobre medical_services.
 */
export async function getEstadisticasServicios(ciudad?: string): Promise<EstadisticasServicios> {
  const prefijo = prefijoCiudad(ciudad);
  const supabase = createClient();
  const hoy = hoyBogota();
  const desdeIso = limitesInstante(sumarMeses(hoy, -12), hoy).desde;

  // Por páginas: un solo .limit(20000) devuelve 1000 filas y las estadísticas salían incompletas.
  const filas = await leerTodo((d, h) => {
    const base = supabase
      .from("medical_services")
      .select(
        "etapa, tipo_servicio, fecha_hora_registro, ciudad_origen, oportunidad_atencion, tiempo_total_origen, tiempo_espera_destino, tiempo_total"
      )
      .gte("fecha_hora_registro", desdeIso);
    return (prefijo ? base.ilike("ciudad_registro", `${prefijo}%`) : base).order("id").range(d, h);
  });

  const porEtapaMap = new Map<string, number>();
  const porTipoMap = new Map<string, number>();
  const porMesMap = new Map<string, { cantidad: number; finalizados: number }>();
  const porCiudadMap = new Map<string, number>();
  const sumas = { oportunidad: 0, nOportunidad: 0, origen: 0, nOrigen: 0, destino: 0, nDestino: 0, total: 0, nTotal: 0 };

  for (const s of filas) {
    porEtapaMap.set(s.etapa, (porEtapaMap.get(s.etapa) ?? 0) + 1);
    porTipoMap.set(s.tipo_servicio, (porTipoMap.get(s.tipo_servicio) ?? 0) + 1);

    const registro = (s as { fecha_hora_registro: string | null }).fecha_hora_registro;
      const mes = registro ? diaEnBogota(registro).slice(0, 7) : "s/f";
    const m = porMesMap.get(mes) ?? { cantidad: 0, finalizados: 0 };
    m.cantidad++;
    if (s.etapa === "FINALIZADO") m.finalizados++;
    porMesMap.set(mes, m);

    if (s.ciudad_origen) porCiudadMap.set(s.ciudad_origen, (porCiudadMap.get(s.ciudad_origen) ?? 0) + 1);

    if (s.oportunidad_atencion != null) { sumas.oportunidad += Number(s.oportunidad_atencion); sumas.nOportunidad++; }
    if (s.tiempo_total_origen != null) { sumas.origen += Number(s.tiempo_total_origen); sumas.nOrigen++; }
    if (s.tiempo_espera_destino != null) { sumas.destino += Number(s.tiempo_espera_destino); sumas.nDestino++; }
    if (s.tiempo_total != null) { sumas.total += Number(s.tiempo_total); sumas.nTotal++; }
  }

  const prom = (suma: number, n: number) => (n > 0 ? Math.round((suma / n) * 10) / 10 : 0);

  return {
    total: filas.length,
    porEtapa: Array.from(porEtapaMap, ([etapa, cantidad]) => ({ etapa, cantidad })).sort((a, b) => b.cantidad - a.cantidad),
    porTipo: Array.from(porTipoMap, ([tipo, cantidad]) => ({ tipo, cantidad })).sort((a, b) => b.cantidad - a.cantidad),
    porMes: Array.from(porMesMap, ([mes, v]) => ({ mes, ...v })).sort((a, b) => a.mes.localeCompare(b.mes)),
    tiemposPromedio: [
      { concepto: "Oportunidad de atención", minutos: prom(sumas.oportunidad, sumas.nOportunidad) },
      { concepto: "Tiempo en origen", minutos: prom(sumas.origen, sumas.nOrigen) },
      { concepto: "Espera en destino", minutos: prom(sumas.destino, sumas.nDestino) },
      { concepto: "Tiempo total del servicio", minutos: prom(sumas.total, sumas.nTotal) },
    ],
    topCiudadesOrigen: Array.from(porCiudadMap, ([ciudad, cantidad]) => ({ ciudad, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10),
  };
}

export interface EstadisticasPorCiudad {
  ciudad: string;
  total30dias: number;
  pctFinalizados: number;
  tiempoTotalPromedio: number;
  serieMensual: { mes: string; cantidad: number }[];
}

// Bogotá/Medellín por CIUDAD DE REGISTRO (`ciudad_registro`): la del CRA al que está
// asignado el usuario de Regulación que recibió la solicitud, no la de origen ni destino.
// Es texto libre (BOGOTA D.C. / MEDELLÍN), sin catálogo cerrado: se agrupa por prefijo.
const CIUDADES_JUNTA = [
  { ciudad: "Bogotá", prefijo: "bogot" },
  { ciudad: "Medellín", prefijo: "medell" },
] as const;

const sinAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** `desde`/`hasta`: "yyyy-MM-dd" — rango que Gerencia elige para la tendencia mensual
 * por ciudad. Si no se pasa, cae a los últimos 6 meses (comportamiento anterior). */
export async function getEstadisticasServiciosPorCiudad(params?: {
  desde: string;
  hasta: string;
}): Promise<EstadisticasPorCiudad[]> {
  const supabase = createClient();

  let desdeIso: string;
  let hastaExclusivoIso: string;
  const hoy = hoyBogota();
  if (params) {
    ({ desde: desdeIso, hastaExclusivo: hastaExclusivoIso } = limitesInstante(params.desde, params.hasta));
  } else {
    ({ desde: desdeIso, hastaExclusivo: hastaExclusivoIso } = limitesInstante(sumarMeses(hoy, -6), hoy));
  }
  const hace30dias = Date.parse(limitesInstante(sumarDias(hoy, -30), hoy).desde);

  const filas = await leerTodo((d, h) =>
    supabase
      .from("medical_services")
      .select("etapa, fecha_hora_registro, ciudad_registro, tiempo_total")
      .gte("fecha_hora_registro", desdeIso)
      .lt("fecha_hora_registro", hastaExclusivoIso)
      .not("ciudad_registro", "is", null)
      .order("id")
      .range(d, h),
  );

  return CIUDADES_JUNTA.map(({ ciudad, prefijo }) => {
    const deLaCiudad = filas.filter((s) => sinAcentos(s.ciudad_registro ?? "").startsWith(prefijo));
    const ultimos30 = deLaCiudad.filter((s) => Date.parse((s as { fecha_hora_registro: string }).fecha_hora_registro) >= hace30dias);
    const finalizados = ultimos30.filter((s) => s.etapa === "FINALIZADO").length;

    const porMesMap = new Map<string, number>();
    for (const s of deLaCiudad) {
      const registro = (s as { fecha_hora_registro: string | null }).fecha_hora_registro;
      const mes = registro ? diaEnBogota(registro).slice(0, 7) : "s/f";
      porMesMap.set(mes, (porMesMap.get(mes) ?? 0) + 1);
    }

    const tiempos = ultimos30.filter((s) => s.tiempo_total != null).map((s) => Number(s.tiempo_total));
    const tiempoTotalPromedio = tiempos.length > 0 ? Math.round((tiempos.reduce((a, b) => a + b, 0) / tiempos.length) * 10) / 10 : 0;

    return {
      ciudad,
      total30dias: ultimos30.length,
      pctFinalizados: ultimos30.length > 0 ? Math.round((finalizados / ultimos30.length) * 100) : 0,
      tiempoTotalPromedio,
      serieMensual: Array.from(porMesMap, ([mes, cantidad]) => ({ mes, cantidad })).sort((a, b) => a.mes.localeCompare(b.mes)),
    };
  });
}

// ─── Resumen operativo diario (Daniel, 2026-07-30) ─────────────────────────
// Port directo del reporte que Regulación ya revisa a diario en SISRES, por
// ciudad, con filtro de fecha. Definiciones exactas que dio Daniel:
//   Asignados  = servicios solicitados que Regulación recibe y programa
//                (todas las etapas reales — excluye NO EFECTIVO, que no
//                cuenta como servicio real; DUPLICADO tampoco se cuenta acá
//                por la misma razón, aunque Daniel no lo mencionó explícito).
//                Es el total: Asignados = Programados + En curso + Atendidos
//                + Fallidos + Cancelados, exacto (2026-08-03: Daniel pidió
//                una tarjeta por cada estado, no solo el agregado).
//   Programados = etapa PROGRAMADO
//   En curso   = etapa CURSO
//   Atendidos  = etapa FINALIZADO (se terminan efectivamente en el turno)
//   Fallidos   = etapa FALLIDO (se recibe la solicitud pero no se presta —
//                la razón exacta queda pendiente de que Daniel la confirme)
//   Cancelados = etapa CANCELADO
//   No efectivo = etapa "NO EFECTIVO" (definición exacta pendiente)
// "Por tipo de servicio": TAB DOBLE/TAM DOBLE cuentan doble (2 en vez de 1)
// dentro de este desglose — por eso la suma por tipo no cuadra contra el
// total de Asignados, tal como se ve en el reporte real de SISRES.

export type TipoServicioResumen = "Medicina Domiciliaria" | "TAB" | "TAM" | "Telemedicina" | "Otros";
const ORDEN_TIPOS: TipoServicioResumen[] = ["Medicina Domiciliaria", "TAB", "TAM", "Telemedicina", "Otros"];

function tipoResumenDe(tipoServicio: string): TipoServicioResumen {
  const t = tipoServicio.toUpperCase();
  if (t.includes("DOMICILIARIA")) return "Medicina Domiciliaria";
  if (t.startsWith("TAB")) return "TAB";
  if (t.startsWith("TAM")) return "TAM";
  if (t === "TELEMEDICINA") return "Telemedicina";
  return "Otros";
}

const pesoDe = (tipoServicio: string) => (tipoServicio.toUpperCase().includes("DOBLE") ? 2 : 1);

export interface ResumenOperativoBucket {
  asignados: number;
  programados: number;
  enCurso: number;
  atendidos: number;
  fallidos: number;
  cancelados: number;
  noEfectivo: number;
  porTipo: { tipo: TipoServicioResumen; asignados: number; atendidos: number }[];
}

export interface ResumenOperativoCiudad extends ResumenOperativoBucket {
  ciudad: string;
}

export interface ResumenOperativoConsolidado {
  consolidado: ResumenOperativoBucket;
  porCiudad: ResumenOperativoCiudad[];
}

function calcularBucket(filas: { etapa: string; tipo_servicio: string }[]): ResumenOperativoBucket {
  const porTipoAsignados = new Map<TipoServicioResumen, number>();
  const porTipoAtendidos = new Map<TipoServicioResumen, number>();
  let asignados = 0, programados = 0, enCurso = 0, atendidos = 0, fallidos = 0, cancelados = 0, noEfectivo = 0;

  for (const s of filas) {
    if (s.etapa === "NO EFECTIVO") { noEfectivo++; continue; }
    if (s.etapa === "DUPLICADO") continue;

    asignados++;
    if (s.etapa === "PROGRAMADO") programados++;
    if (s.etapa === "CURSO") enCurso++;
    if (s.etapa === "FINALIZADO") atendidos++;
    if (s.etapa === "FALLIDO") fallidos++;
    if (s.etapa === "CANCELADO") cancelados++;

    const tipo = tipoResumenDe(s.tipo_servicio);
    const peso = pesoDe(s.tipo_servicio);
    porTipoAsignados.set(tipo, (porTipoAsignados.get(tipo) ?? 0) + peso);
    if (s.etapa === "FINALIZADO") porTipoAtendidos.set(tipo, (porTipoAtendidos.get(tipo) ?? 0) + peso);
  }

  return {
    asignados,
    programados,
    enCurso,
    atendidos,
    fallidos,
    cancelados,
    noEfectivo,
    porTipo: ORDEN_TIPOS.map((tipo) => ({
      tipo,
      asignados: porTipoAsignados.get(tipo) ?? 0,
      atendidos: porTipoAtendidos.get(tipo) ?? 0,
    })),
  };
}

const sumarBuckets = (buckets: ResumenOperativoBucket[]): ResumenOperativoBucket => ({
  asignados: buckets.reduce((s, b) => s + b.asignados, 0),
  programados: buckets.reduce((s, b) => s + b.programados, 0),
  enCurso: buckets.reduce((s, b) => s + b.enCurso, 0),
  atendidos: buckets.reduce((s, b) => s + b.atendidos, 0),
  fallidos: buckets.reduce((s, b) => s + b.fallidos, 0),
  cancelados: buckets.reduce((s, b) => s + b.cancelados, 0),
  noEfectivo: buckets.reduce((s, b) => s + b.noEfectivo, 0),
  porTipo: ORDEN_TIPOS.map((tipo) => ({
    tipo,
    asignados: buckets.reduce((s, b) => s + (b.porTipo.find((t) => t.tipo === tipo)?.asignados ?? 0), 0),
    atendidos: buckets.reduce((s, b) => s + (b.porTipo.find((t) => t.tipo === tipo)?.atendidos ?? 0), 0),
  })),
});

/**
 * `desde`/`hasta`: "yyyy-MM-dd". Devuelve el desglose por cada ciudad
 * (Medellín, Bogotá — en ese orden) más un consolidado que es la SUMA
 * de esas dos ciudades exactamente (no un tercer query "todas las
 * ciudades sin filtrar", que incluiría otras ciudades y no cuadraría
 * contra la suma — así lo pidió Daniel explícitamente).
 */
export async function getResumenOperativoDiario(params: {
  desde: string;
  hasta: string;
}): Promise<ResumenOperativoConsolidado> {
  const supabase = createClient();
  const { desde: desdeIso, hastaExclusivo: hastaExclusivoIso } = limitesInstante(params.desde, params.hasta);

  // Mismo alcance que la lista de servicios: Regulación cuenta lo de su centro,
  // si no, el resumen muestra cifras de servicios que ni puede abrir.
  const centro = centroVisible(await getProfile());
  const filas = await leerTodo((d, h) => {
    let query = supabase
      .from("medical_services")
      .select("etapa, tipo_servicio, ciudad_registro")
      .gte("fecha_hora_registro", desdeIso)
      .lt("fecha_hora_registro", hastaExclusivoIso);
    if (centro) query = query.or(`operational_center_id.eq.${centro.id},operational_center_id.is.null`);
    return query.order("id").range(d, h);
  });

  const porCiudad: ResumenOperativoCiudad[] = [...CIUDADES_JUNTA].reverse().map(({ ciudad, prefijo }) => ({
    ciudad,
    ...calcularBucket(filas.filter((s) => sinAcentos(s.ciudad_registro ?? "").startsWith(prefijo))),
  }));

  return { consolidado: sumarBuckets(porCiudad), porCiudad };
}
