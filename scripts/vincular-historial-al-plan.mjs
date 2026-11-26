/**
 * scripts/vincular-historial-al-plan.mjs
 *
 * El historial de mantenimientos (maintenance_records) es la fuente de verdad. Este script deriva de él el «último
 * mantenimiento por tarea del plan» que lee la vista vehicle_maintenance_alerts (vehicle_maintenance_log), con el enlace
 * maintenance_record_id al registro que lo originó. Las reglas viven en scripts/lib/mapeo-plan.mjs.
 *
 * Las categorías del Excel no se conservan todas en la base (solo 20 coinciden con maintenance_categories), por eso se lee
 * la categoría del Excel y se cruza con la base por placa + fecha + descripción + valor.
 *
 * Uso:
 *   MANTO_FILE="<ruta al Excel>" ENV_FILE="<ruta a .env.local>" node scripts/vincular-historial-al-plan.mjs [--confirmar]
 * Sin --confirmar solo informa (no escribe). Es repetible: no duplica un (vehículo, tarea, fecha) que ya existe.
 */
import { readFileSync, writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";
import { claveServicio, faltaKm, fechaExcel, itemDelPlan, kmDelServicio, norm, tareasDelServicio } from "./lib/mapeo-plan.mjs";

const CONFIRMAR = process.argv.includes("--confirmar");
const MANTO_FILE = process.env.MANTO_FILE;
const SHEET = "HistorialMantenimientos";
if (!MANTO_FILE) {
  console.error("Falta MANTO_FILE (ruta al Excel de control de mantenimientos).");
  process.exit(1);
}

function loadEnv() {
  const raw = readFileSync(process.env.ENV_FILE || ".env.local", "utf-8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const placaNorm = (p) => String(p ?? "").trim().toUpperCase().replace(/\s+/g, "");
const claveLinea = (vehicleId, fecha, desc, valor) => `${vehicleId}|${fecha}|${norm(desc).slice(0, 80)}|${Math.round(Number(valor) || 0)}`;

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

/**
 * Lee TODAS las filas (Supabase corta en 1.000), ordenadas por la llave para que las páginas no se pisen. Un error
 * detiene el script: seguir con una lectura vacía duplicaría vínculos.
 */
async function selectAll(table, columns, key) {
  const rows = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await supabase.from(table).select(columns).order(key).range(desde, desde + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

const vehiculos = await selectAll("vehicles", "id, placa, centro_operativo", "id");
const porPlaca = new Map(vehiculos.map((v) => [placaNorm(v.placa), v]));
const plan = await selectAll("maintenance_plan_items", "id, descripcion, aplica_a, intervalo_km", "id");

const registros = await selectAll("maintenance_records", "id_manto, vehicle_id, fecha, kilometraje_actual, descripcion_trabajo, valor, numero_factura", "id_manto");
const idPorLinea = new Map();
for (const r of registros) idPorLinea.set(claveLinea(r.vehicle_id, r.fecha, r.descripcion_trabajo, r.valor), r);

// Excel → líneas con categoría, agrupadas por servicio.
const ws = XLSX.readFile(MANTO_FILE).Sheets[SHEET];
const filas = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }).slice(1);
const servicios = new Map();
let sinCruce = 0;
let sinVehiculo = 0;
for (const r of filas) {
  const v = porPlaca.get(placaNorm(r[0]));
  const fecha = fechaExcel(r[1]);
  if (!placaNorm(r[0]) || !fecha) continue;
  if (!v) { sinVehiculo++; continue; }
  const reg = idPorLinea.get(claveLinea(v.id, fecha, r[5], r[7]));
  if (!reg) { sinCruce++; continue; }
  const k = claveServicio(v.id, fecha, r[9] || r[8]);
  const s = servicios.get(k) ?? { vehicle: v, fecha, km: 0, kmReal: false, lineas: [], registro: reg.id_manto };
  s.lineas.push({ categoria: String(r[4] ?? ""), descripcion: String(r[5] ?? "") });
  Object.assign(s, kmDelServicio({ km: s.km, kmReal: s.kmReal }, Number(r[2]) || 0, reg.kilometraje_actual));
  servicios.set(k, s);
}

// Último servicio por (vehículo, tarea).
const ultimo = new Map();
for (const s of servicios.values()) {
  const esAirplan = String(s.vehicle.centro_operativo ?? "").toUpperCase() === "AIRPLAN";
  for (const tarea of tareasDelServicio(s.lineas, esAirplan)) {
    const k = `${s.vehicle.id}|${tarea}`;
    const previo = ultimo.get(k);
    if (!previo || s.fecha > previo.fecha) ultimo.set(k, { vehicle: s.vehicle, tarea, fecha: s.fecha, km: s.km, kmReal: s.kmReal, registro: s.registro });
  }
}

const enElPlan = new Set(plan.map((p) => p.descripcion));
const sinTarea = [...new Set([...ultimo.values()].map((u) => u.tarea))].filter((t) => !enElPlan.has(t));
const existentes = await selectAll("vehicle_maintenance_log", "vehicle_id, plan_item_id, fecha_realizado", "id");
const yaHay = new Set(existentes.map((l) => `${l.vehicle_id}|${l.plan_item_id}|${l.fecha_realizado}`));
const nuevos = [];
let noAplican = 0;
const sinKm = [];
for (const u of ultimo.values()) {
  const item = itemDelPlan(plan, u.tarea, u.vehicle);
  if (!item) { noAplican++; continue; }
  if (faltaKm(item, u.km)) { sinKm.push(`${u.vehicle.placa} · ${u.tarea} (${u.fecha})`); continue; }
  const id = item.id;
  if (yaHay.has(`${u.vehicle.id}|${id}|${u.fecha}`)) continue;
  nuevos.push({
    vehicle_id: u.vehicle.id,
    plan_item_id: id,
    fecha_realizado: u.fecha,
    km_realizado: u.km > 0 ? u.km : null,
    maintenance_record_id: u.registro,
    notas: `Vinculado desde el historial${u.km > 0 && !u.kmReal ? " (km estimado)" : ""}`,
  });
}

const porPlacaCuenta = new Map();
for (const u of ultimo.values()) porPlacaCuenta.set(u.vehicle.placa, (porPlacaCuenta.get(u.vehicle.placa) ?? 0) + 1);
console.log(`Servicios armados: ${servicios.size} · filas sin cruce con la base: ${sinCruce} · sin vehículo: ${sinVehiculo}`);
console.log(`Tareas con último mantenimiento derivado: ${ultimo.size} · nuevas para el plan: ${nuevos.length}`);
if (sinTarea.length) console.log("Tareas del mapeo que NO existen en maintenance_plan_items:", sinTarea.join(" | "));
console.log(`Sin enlazar: ${noAplican} porque el plan de ese vehículo no tiene la tarea · ${sinKm.length} por kilómetros sin km conocido`);
for (const l of sinKm) console.log(`  sin km: ${l}`);
for (const p of ["TRG544", "KQX040"]) {
  console.log(`\n${p}:`);
  for (const u of [...ultimo.values()].filter((x) => x.vehicle.placa === p).sort((a, b) => a.tarea.localeCompare(b.tarea)))
    console.log(`  ${u.fecha}  ${String(u.km || "s/km").padStart(7)}${u.km && !u.kmReal ? "*" : " "} ${u.tarea}`);
}
writeFileSync(
  "vinculos-propuestos.csv",
  "placa,tarea,fecha,km,km_estimado\n" +
    [...ultimo.values()].map((u) => [u.vehicle.placa, `"${u.tarea}"`, u.fecha, u.km || "", u.km && !u.kmReal ? "si" : ""].join(",")).join("\n")
);
console.log("\nDetalle completo en vinculos-propuestos.csv");

if (!CONFIRMAR) {
  console.log("Informe solamente: no se escribió nada. Usa --confirmar para crear los vínculos.");
} else {
  for (let i = 0; i < nuevos.length; i += 100) {
    const { error } = await supabase.from("vehicle_maintenance_log").insert(nuevos.slice(i, i + 100));
    if (error) { console.error("Error:", error.message); process.exit(1); }
  }
  console.log(`Vínculos creados: ${nuevos.length}`);
}
