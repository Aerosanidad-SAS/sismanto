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
