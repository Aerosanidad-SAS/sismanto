"use server";

import { createClient } from "@/lib/supabase/server";

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
export async function getEstadisticasServicios(): Promise<EstadisticasServicios> {
  const supabase = createClient();
  const desde = new Date();
  desde.setMonth(desde.getMonth() - 12);

  const { data } = await supabase
    .from("medical_services")
    .select(
      "etapa, tipo_servicio, fecha_hora_registro, ciudad_origen, oportunidad_atencion, tiempo_total_origen, tiempo_espera_destino, tiempo_total"
    )
    .gte("fecha_hora_registro", desde.toISOString())
    .limit(20000);

  const filas = data || [];

  const porEtapaMap = new Map<string, number>();
  const porTipoMap = new Map<string, number>();
  const porMesMap = new Map<string, { cantidad: number; finalizados: number }>();
  const porCiudadMap = new Map<string, number>();
  const sumas = { oportunidad: 0, nOportunidad: 0, origen: 0, nOrigen: 0, destino: 0, nDestino: 0, total: 0, nTotal: 0 };

  for (const s of filas) {
    porEtapaMap.set(s.etapa, (porEtapaMap.get(s.etapa) ?? 0) + 1);
    porTipoMap.set(s.tipo_servicio, (porTipoMap.get(s.tipo_servicio) ?? 0) + 1);

    const mes = s.fecha_hora_registro?.slice(0, 7) ?? "s/f";
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

// Bogotá/Medellín por texto libre — no hay catálogo de ciudad cerrado en
// medical_services (ni un centro_operativo 1:1 con ciudad: AIRPLAN mezcla
// Medellín con otras 5 ciudades). Es una cifra aproximada, no exacta —
// avisar antes de presentarla como dato cerrado.
const CIUDADES_JUNTA = [
  { ciudad: "Bogotá", prefijo: "bogot" },
  { ciudad: "Medellín", prefijo: "medell" },
] as const;

export async function getEstadisticasServiciosPorCiudad(): Promise<EstadisticasPorCiudad[]> {
  const supabase = createClient();
  const desde = new Date();
  desde.setMonth(desde.getMonth() - 6);
  const hace30dias = new Date();
  hace30dias.setDate(hace30dias.getDate() - 30);

  const { data } = await supabase
    .from("medical_services")
    .select("etapa, fecha_hora_registro, ciudad_origen, tiempo_total")
    .gte("fecha_hora_registro", desde.toISOString())
    .not("ciudad_origen", "is", null)
    .limit(20000);

  const filas = data || [];
  const sinAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  return CIUDADES_JUNTA.map(({ ciudad, prefijo }) => {
    const deLaCiudad = filas.filter((s) => sinAcentos(s.ciudad_origen ?? "").startsWith(prefijo));
    const ultimos30 = deLaCiudad.filter((s) => new Date(s.fecha_hora_registro) >= hace30dias);
    const finalizados = ultimos30.filter((s) => s.etapa === "FINALIZADO").length;

    const porMesMap = new Map<string, number>();
    for (const s of deLaCiudad) {
      const mes = s.fecha_hora_registro?.slice(0, 7) ?? "s/f";
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
