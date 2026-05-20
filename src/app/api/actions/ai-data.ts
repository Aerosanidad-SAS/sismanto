"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DAILY_BUDGET_USD = parseFloat(process.env.AI_DAILY_BUDGET_USD ?? "2.00");
const MONTHLY_BUDGET_USD = parseFloat(process.env.AI_MONTHLY_BUDGET_USD ?? "30.00");

export async function checkBudget(): Promise<{ ok: boolean; reason?: string }> {
  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + "-01";

  const { data: daily } = await admin
    .from("ai_usage_log")
    .select("cost_usd")
    .gte("created_at", today + "T00:00:00Z");

  const dailyTotal = (daily ?? []).reduce((s, r) => s + Number(r.cost_usd), 0);
  if (dailyTotal >= DAILY_BUDGET_USD) {
    return { ok: false, reason: `Límite diario alcanzado ($${DAILY_BUDGET_USD.toFixed(2)} USD)` };
  }

  const { data: monthly } = await admin
    .from("ai_usage_log")
    .select("cost_usd")
    .gte("created_at", monthStart + "T00:00:00Z");

  const monthlyTotal = (monthly ?? []).reduce((s, r) => s + Number(r.cost_usd), 0);
  if (monthlyTotal >= MONTHLY_BUDGET_USD) {
    return { ok: false, reason: `Límite mensual alcanzado ($${MONTHLY_BUDGET_USD.toFixed(2)} USD)` };
  }

  return { ok: true };
}

export async function logUsage(
  feature: "chat" | "insights",
  modelo: string,
  tokensIn: number,
  tokensOut: number,
  costUsd: number,
  usuarioId: string
) {
  const admin = createAdminClient();
  await admin.from("ai_usage_log").insert({
    feature,
    modelo,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    cost_usd: costUsd,
    usuario_id: usuarioId,
  });
}

// ─── Herramientas del chat ────────────────────────────────────────────────────

export async function toolGetNovedades(input: {
  placa?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
  limit?: number;
}) {
  const supabase = createClient();
  let q = supabase
    .from("incidents")
    .select("id, fecha_reporte, descripcion, severidad, prioridad, estado, afecta_operatividad, fecha_cierre, vehicle_id, reportado_por, vehicles(placa)")
    .order("fecha_reporte", { ascending: false })
    .limit(input.limit ?? 20);

  if (input.estado) q = q.eq("estado", input.estado);
  if (input.desde) q = q.gte("fecha_reporte", input.desde);
  if (input.hasta) q = q.lte("fecha_reporte", input.hasta);

  if (input.placa) {
    const { data: veh } = await supabase
      .from("vehicles")
      .select("id")
      .ilike("placa", input.placa.replace(/-/g, "").trim())
      .limit(1)
      .single();
    if (veh) q = q.eq("vehicle_id", veh.id);
    else return { error: `No se encontró vehículo con placa: ${input.placa}` };
  }

  const { data, error } = await q;
  if (error) return { error: error.message };
  return { novedades: data, total: data?.length ?? 0 };
}

export async function toolGetVehiculos(input: { estado?: string }) {
  const supabase = createClient();
  let q = supabase
    .from("vehicles")
    .select("id, placa, marca, modelo, anio, estado_actual, centro_operativo, kilometraje_actual")
    .order("placa");

  if (input.estado) q = q.eq("estado_actual", input.estado);

  const { data, error } = await q;
  if (error) return { error: error.message };
  return { vehiculos: data, total: data?.length ?? 0 };
}

export async function toolGetMantenimientos(input: {
  placa?: string;
  desde?: string;
  hasta?: string;
  tipo?: string;
  limit?: number;
}) {
  const supabase = createClient();
  let q = supabase
    .from("maintenance_records")
    .select("id_manto, fecha, tipo, descripcion_trabajo, valor, proveedor, kilometraje_actual, vehicles(placa)")
    .order("fecha", { ascending: false })
    .limit(input.limit ?? 20);

  if (input.tipo) q = q.eq("tipo", input.tipo);
  if (input.desde) q = q.gte("fecha", input.desde);
  if (input.hasta) q = q.lte("fecha", input.hasta);

  if (input.placa) {
    const { data: veh } = await supabase
      .from("vehicles")
      .select("id")
      .ilike("placa", input.placa.replace(/-/g, "").trim())
      .limit(1)
      .single();
    if (veh) q = q.eq("vehicle_id", veh.id);
    else return { error: `No se encontró vehículo con placa: ${input.placa}` };
  }

  const { data, error } = await q;
  if (error) return { error: error.message };
  return { mantenimientos: data, total: data?.length ?? 0 };
}

export async function toolGetCombustible(input: {
  placa?: string;
  desde?: string;
  hasta?: string;
  limit?: number;
}) {
  const supabase = createClient();
  let q = supabase
    .from("fuel_logs")
    .select("id, fecha, cantidad_litros, valor_total, kilometraje, vehicles(placa)")
    .order("fecha", { ascending: false })
    .limit(input.limit ?? 20);

  if (input.desde) q = q.gte("fecha", input.desde);
  if (input.hasta) q = q.lte("fecha", input.hasta);

  if (input.placa) {
    const { data: veh } = await supabase
      .from("vehicles")
      .select("id")
      .ilike("placa", input.placa.replace(/-/g, "").trim())
      .limit(1)
      .single();
    if (veh) q = q.eq("vehicle_id", veh.id);
    else return { error: `No se encontró vehículo con placa: ${input.placa}` };
  }

  const { data, error } = await q;
  if (error) return { error: error.message };
  return { combustible: data, total: data?.length ?? 0 };
}

// ─── Datos para insights ─────────────────────────────────────────────────────

export async function getInsightsData() {
  const supabase = createClient();
  const hace90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [vehiculos, novedadesAbiertas, mantenimientos, combustible] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, placa, marca, modelo, estado_actual, centro_operativo"),

    supabase
      .from("incidents")
      .select("id, vehicle_id, fecha_reporte, severidad, estado, afecta_operatividad, reportado_por, vehicles(placa)")
      .gte("fecha_reporte", hace90)
      .order("fecha_reporte", { ascending: false })
      .limit(200),

    supabase
      .from("maintenance_records")
      .select("id_manto, vehicle_id, fecha, tipo, valor, vehicles(placa)")
      .gte("fecha", hace90)
      .order("fecha", { ascending: false })
      .limit(200),

    supabase
      .from("fuel_logs")
      .select("id, vehicle_id, fecha, cantidad_litros, valor_total, vehicles(placa)")
      .gte("fecha", hace90)
      .order("fecha", { ascending: false })
      .limit(300),
  ]);

  // Agregados por vehículo
  const flota = (vehiculos.data ?? []).map((v) => {
    const novedades = (novedadesAbiertas.data ?? []).filter((n) => n.vehicle_id === v.id);
    const mantos = (mantenimientos.data ?? []).filter((m) => m.vehicle_id === v.id);
    const fuels = (combustible.data ?? []).filter((f) => f.vehicle_id === v.id);

    const costoMantos = mantos.reduce((s, m) => s + Number(m.valor ?? 0), 0);
    const litrosTotales = fuels.reduce((s, f) => s + Number(f.cantidad_litros ?? 0), 0);
    const costoFuel = fuels.reduce((s, f) => s + Number(f.valor_total ?? 0), 0);
    const litrosPromedio = fuels.length > 0 ? litrosTotales / fuels.length : 0;
    const litrosMax = fuels.length > 0 ? Math.max(...fuels.map((f) => Number(f.cantidad_litros))) : 0;

    return {
      placa: v.placa,
      estado: v.estado_actual,
      novedadesAbiertas: novedades.filter((n) => n.estado === "ABIERTO").length,
      novedadesTotal: novedades.length,
      novedadesAlta: novedades.filter((n) => n.severidad === "ALTA").length,
      mantenimientosTotal: mantos.length,
      costoMantenimiento: costoMantos,
      cargasCombustible: fuels.length,
      litrosTotales,
      costoFuel,
      litrosPromedioCarga: Math.round(litrosPromedio * 10) / 10,
      litrosMaxCarga: litrosMax,
    };
  });

  // Conductores con más novedades (por reportado_por)
  const novedadesPorCondutor: Record<string, number> = {};
  for (const n of (novedadesAbiertas.data ?? [])) {
    if (n.reportado_por) {
      novedadesPorCondutor[n.reportado_por] = (novedadesPorCondutor[n.reportado_por] ?? 0) + 1;
    }
  }
  const conductoresRanking = Object.entries(novedadesPorCondutor)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([conductor, total]) => ({ conductor, total }));

  return {
    fechaAnalisis: new Date().toISOString().slice(0, 10),
    periodoAnalisis: `${hace90} al ${new Date().toISOString().slice(0, 10)}`,
    resumenFlota: {
      totalVehiculos: vehiculos.data?.length ?? 0,
      operativos: (vehiculos.data ?? []).filter((v) => v.estado_actual === "OPERATIVO").length,
      fueraServicio: (vehiculos.data ?? []).filter((v) => v.estado_actual === "FUERA_SERVICIO").length,
    },
    flotaDetalle: flota,
    conductoresConMasNovedades: conductoresRanking,
    totalNovedadesAbiertas: (novedadesAbiertas.data ?? []).filter((n) => n.estado === "ABIERTO").length,
    novedadesAltaSeveridad: (novedadesAbiertas.data ?? []).filter((n) => n.severidad === "ALTA").length,
  };
}
