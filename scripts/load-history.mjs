/**
 * scripts/load-history.mjs
 *
 * Carga historial de mantenimientos y combustible desde Excel a Supabase.
 * Imputa km faltantes en mantenimientos usando interpolación/extrapolación lineal
 * con la serie temporal de tanqueos (y otros puntos de km conocidos).
 *
 * Uso:
 *   node scripts/load-history.mjs [--dry-run] [--solo-manto] [--solo-comb]
 *
 * Flags:
 *   --dry-run   Procesa y valida sin insertar nada en la BD
 *   --solo-manto Solo carga mantenimientos (no combustible)
 *   --solo-comb  Solo carga combustible (no mantenimientos)
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");
const SOLO_MANTO = process.argv.includes("--solo-manto");
const SOLO_COMB = process.argv.includes("--solo-comb");

const MANTO_FILE = "CONTROL_VEH_INTERASSIST_UPDATED V2  2026 COMB.xlsx";
const MANTO_SHEET = "HistorialMantenimientos";
const COMB_INTERNA_SHEET = "Tabla_Combustibles"; // dentro del mismo workbook
const COMB_PROVEEDOR_FILE = "detailed_consumption_2_1778607907.xlsx";
const COMB_PROVEEDOR_SHEET = "detailed_consumption_2";

const BATCH_SIZE = 100;

// Placas que sabemos son de referencia/no-flota: excluir de carga
const REFERENCE_PLATES = new Set(["KOS929", "KYV199", "KYV219", "KZO779"]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadEnv() {
  const raw = readFileSync(".env.local", "utf-8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

/**
 * Convierte un número de serie de Excel a ISO date string "YYYY-MM-DD".
 * Maneja decimales (con tiempo) tomando solo la parte entera.
 */
function excelSerialToIso(serial) {
  if (!serial && serial !== 0) return null;
  const n = Math.floor(Number(serial));
  if (isNaN(n) || n < 1) return null;
  // Fórmula estándar: días desde 1970-01-01 = serial - 25569
  const ms = (n - 25569) * 86400000;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function normalPlaca(p) {
  return String(p || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

function safeStr(v) {
  const s = String(v || "").trim();
  return s === "" ? null : s;
}

/** Clamp: si km imputado retrocede, usa el último punto conocido. */
function clampKm(km, minKm) {
  return Math.max(Math.round(km), minKm);
}

// ─── Imputación de km ─────────────────────────────────────────────────────────

/**
 * Construye un índice: vehicleId → Array<{fecha:string, km:number}> ordenado por fecha.
 */
function buildKmTimeline(fuelRows, mantoRowsWithKm) {
  const idx = {};
  const add = (vehicleId, fecha, km) => {
    if (!vehicleId || !fecha || km <= 0) return;
    if (!idx[vehicleId]) idx[vehicleId] = [];
    idx[vehicleId].push({ fecha, km });
  };
  for (const r of fuelRows) add(r.vehicle_id, r.fecha, r.km);
  for (const r of mantoRowsWithKm) add(r.vehicle_id, r.fecha, r.kilometraje_actual);
  // Ordenar y deduplicar por fecha (guardamos el km más alto en caso de empate)
  for (const vid of Object.keys(idx)) {
    idx[vid].sort((a, b) => a.fecha.localeCompare(b.fecha));
    // Deduplicate keeping max km per date
    const deduped = [];
    for (const pt of idx[vid]) {
      const last = deduped[deduped.length - 1];
      if (last && last.fecha === pt.fecha) {
        last.km = Math.max(last.km, pt.km);
      } else {
        deduped.push({ ...pt });
      }
    }
    // Enforce monotonicity: km should never decrease
    for (let i = 1; i < deduped.length; i++) {
      if (deduped[i].km < deduped[i - 1].km) {
        deduped[i].km = deduped[i - 1].km;
      }
    }
    idx[vid] = deduped;
  }
  return idx;
}

/**
 * Interpola/extrapola km para un vehicleId + fecha dados.
 * - Si hay punto antes Y después: interpolación lineal.
 * - Si solo hay puntos antes: extrapolación con tasa de los últimos 2 puntos.
 * - Si solo hay puntos después: usa el primer punto conocido (no extrapolar hacia atrás).
 * - Sin puntos: retorna 0 (no se puede imputar).
 *
 * Returns { km: number, metodo: string }
 */
function imputeKm(vehicleId, fechaIso, timeline) {
  const pts = timeline[vehicleId];
  if (!pts || pts.length === 0) return { km: 0, metodo: "sin_datos" };

  const d = new Date(fechaIso).getTime();
  if (isNaN(d)) return { km: 0, metodo: "fecha_invalida" };

  let beforeIdx = -1;
  let afterIdx = -1;
  for (let i = 0; i < pts.length; i++) {
    const pd = new Date(pts[i].fecha).getTime();
    if (pd <= d) beforeIdx = i;
    else if (afterIdx === -1) afterIdx = i;
  }

  if (beforeIdx >= 0 && afterIdx >= 0) {
    // Interpolación lineal
    const p0 = pts[beforeIdx];
    const p1 = pts[afterIdx];
    const d0 = new Date(p0.fecha).getTime();
    const d1 = new Date(p1.fecha).getTime();
    if (d1 === d0) return { km: p0.km, metodo: "exacto" };
    const ratio = (d - d0) / (d1 - d0);
    const km = clampKm(p0.km + (p1.km - p0.km) * ratio, p0.km);
    return { km, metodo: "interpolacion" };
  }

  if (beforeIdx >= 0) {
    // Solo puntos anteriores — extrapolar si hay al menos 2
    if (beforeIdx >= 1) {
      const p1 = pts[beforeIdx - 1];
      const p2 = pts[beforeIdx];
      const d1 = new Date(p1.fecha).getTime();
      const d2 = new Date(p2.fecha).getTime();
      if (d2 > d1 && p2.km >= p1.km) {
        const ratePorMs = (p2.km - p1.km) / (d2 - d1);
        const km = clampKm(p2.km + ratePorMs * (d - d2), p2.km);
        return { km, metodo: "extrapolacion" };
      }
    }
    return { km: pts[beforeIdx].km, metodo: "carry_forward" };
  }

  // Solo puntos posteriores — usar el primero conocido como piso
  return { km: pts[afterIdx].km, metodo: "primer_conocido" };
}

// ─── Excel parsers ────────────────────────────────────────────────────────────

/**
 * Lee HistorialMantenimientos y retorna filas normalizadas.
 * Columnas (0-indexed):
 *   0 Placa | 1 fecha_salida | 2 Km | 3 Tipo | 4 Area | 5 Descripcion |
 *   6 Proveedor | 7 Valor | 8 IVA | 9 Factura | 10 fecha_ingreso |
 *   11 TFDS | 12 Notas | 13-15 ignorar
 */
function parseMantenimientoSheet(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  const result = [];
  const skipped = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const placa = normalPlaca(r[0]);
    if (!placa || placa === "?" || placa === "FLOTA" || placa === "") {
      skipped.push({ fila: i + 1, motivo: `Placa inválida: "${r[0]}"` });
      continue;
    }
    if (REFERENCE_PLATES.has(placa)) {
      skipped.push({ fila: i + 1, motivo: `Placa de referencia ignorada: ${placa}` });
      continue;
    }

    const fechaRaw = r[1];
    const fecha = typeof fechaRaw === "number" ? excelSerialToIso(fechaRaw)
      : String(fechaRaw || "").trim() !== "" ? String(fechaRaw).trim().slice(0, 10) : null;
    if (!fecha || isNaN(Date.parse(fecha))) {
      skipped.push({ fila: i + 1, motivo: `Fecha inválida: "${fechaRaw}"`, placa });
      continue;
    }

    const km = safeNum(r[2], 0);
    const tipoRaw = String(r[3] || "").trim().toUpperCase();
    const tipo = tipoRaw.startsWith("P") ? "PREVENTIVO" : tipoRaw.startsWith("C") ? "CORRECTIVO" : null;
    if (!tipo) {
      skipped.push({ fila: i + 1, motivo: `Tipo inválido: "${r[3]}"`, placa, fecha });
      continue;
    }

    const valorRaw = safeNum(r[7], -1);
    const valor = valorRaw < 0 ? null : valorRaw; // negativos → NULL

    result.push({
      _fila: i + 1,
      placa,
      fecha,
      kilometraje_raw: km, // 0 si falta
      tipo,
      categoria_nombre: String(r[4] || "").trim().toUpperCase() || null,
      descripcion_trabajo: safeStr(r[5]),
      proveedor: safeStr(r[6]),
      valor,
      // Columna 8 (IVA) a veces contiene el No. Factura; columna 9 también
      numero_factura: safeStr(r[9]) || safeStr(r[8]) || null,
      tiempo_fuera_servicio_horas: safeNum(r[11], 0) || null,
      notas_adicionales: safeStr(r[12]),
    });
  }
  return { result, skipped };
}

/**
 * Lee la hoja interna Tabla_Combustibles.
 * Columnas: 0 Cliente | 1 NIT | 2 SAP | 3 NoVenta | 4 Fecha | 5 Estacion |
 *           6 Regional | 7 IdEDS | 8 Placa | 9 Conductor | 10 Combustible |
 *           11 Cantidad | 12 Precio | 13 Unidad | 14 TotalVenta | 15 Km
 */
function parseCombInternaSheet(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  const result = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const placa = normalPlaca(r[8]);
    if (!placa || REFERENCE_PLATES.has(placa)) continue;
    const fecha = typeof r[4] === "number" ? excelSerialToIso(r[4])
      : String(r[4] || "").trim().slice(0, 10);
    if (!fecha || isNaN(Date.parse(fecha))) continue;
    const galones = safeNum(r[11], 0);
    if (galones <= 0) continue;
    const km = safeNum(r[15], 0);
    const costo = safeNum(r[14], 0) || null;
    const notas = [safeStr(r[10]), safeStr(r[5])].filter(Boolean).join(" — ") || null;
    result.push({ placa, fecha, galones, kilometraje: km, costo, notas });
  }
  return result;
}

/**
 * Lee detailed_consumption del proveedor.
 * Columnas: 0 Fecha | 1 Placa | 2 Combustible | 3 Cantidad |
 *           4 Precio | 5 TotalVenta | 6 Km
 */
function parseCombProveedorSheet(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  const result = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const placa = normalPlaca(r[1]);
    if (!placa || REFERENCE_PLATES.has(placa)) continue;
    const fecha = typeof r[0] === "number" ? excelSerialToIso(r[0])
      : String(r[0] || "").trim().slice(0, 10);
    if (!fecha || isNaN(Date.parse(fecha))) continue;
    const galones = safeNum(r[3], 0);
    if (galones <= 0) continue;
    const km = safeNum(r[6], 0);
    const costo = safeNum(r[5], 0) || null;
    const notas = safeStr(r[2]);
    result.push({ placa, fecha, galones, kilometraje: km, costo, notas });
  }
  return result;
}

// ─── Deduplicación combustible ────────────────────────────────────────────────

function deduplicateFuel(rows) {
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    // Clave de deduplicación: placa + fecha + km (redondeado)
    const key = `${r.placa}|${r.fecha}|${Math.round(r.km || r.kilometraje || 0)}|${Math.round(r.galones * 100)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

// ─── Deduplicación mantenimientos ─────────────────────────────────────────────

function buildMantoKey(vehicleId, fecha, factura, km, valor, tipo, desc) {
  const f = String(fecha || "").slice(0, 10);
  const fac = String(factura || "").trim().toUpperCase();
  if (fac) return `${vehicleId}|${f}|FAC|${fac}`;
  return `${vehicleId}|${f}|NOFAC|${Math.round(km)}|${Math.round(valor || 0)}|${tipo}|${String(desc || "").slice(0, 80).toUpperCase()}`;
}

// ─── Batch insert ─────────────────────────────────────────────────────────────

async function batchInsert(supabase, table, rows, label) {
  let inserted = 0;
  let errors = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).insert(batch);
    if (error) {
      errors.push({ batch: i / BATCH_SIZE + 1, error: error.message });
      console.error(`  [ERROR] ${label} batch ${i / BATCH_SIZE + 1}:`, error.message);
    } else {
      inserted += batch.length;
      process.stdout.write(`\r  ${label}: ${inserted}/${rows.length} insertados...`);
    }
  }
  if (rows.length > 0) console.log(); // nueva línea
  return { inserted, errors };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${"═".repeat(60)}`);
  console.log("  CARGA HISTÓRICA — Mantenimientos + Combustible");
  if (DRY_RUN) console.log("  *** DRY RUN: no se insertará nada ***");
  console.log(`${"═".repeat(60)}\n`);

  // 1. Conectar a Supabase con service role (bypassa RLS)
  const env = loadEnv();
  const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"];
  const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!supabaseUrl || !serviceKey) {
    console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  console.log("✓ Conectado a Supabase\n");

  // 2. Cargar catálogos de la BD
  const { data: vehiclesRaw, error: vErr } = await supabase
    .from("vehicles")
    .select("id, placa");
  if (vErr) { console.error("❌ Error cargando vehículos:", vErr.message); process.exit(1); }

  const { data: categoriasRaw } = await supabase
    .from("maintenance_categories")
    .select("id, nombre");

  // Normalizar placa al construir el mapa: quitar espacios para unificar "TRG 542" ↔ "TRG542"
  const vehicleMap = new Map(
    (vehiclesRaw || []).map((v) => [v.placa.trim().toUpperCase().replace(/\s+/g, ""), v.id])
  );
  const catMap = new Map((categoriasRaw || []).map((c) => [c.nombre.toUpperCase(), c.id]));

  console.log(`Vehículos en BD: ${vehicleMap.size}`);
  console.log(`Categorías de mantenimiento: ${catMap.size}\n`);

  // 3. Leer archivos Excel
  console.log("📂 Leyendo archivos Excel...");
  const wbManto = XLSX.readFile(MANTO_FILE);
  const wbCombProv = XLSX.readFile(COMB_PROVEEDOR_FILE);

  const shManto = wbManto.Sheets[MANTO_SHEET];
  const shCombInterna = wbManto.Sheets[COMB_INTERNA_SHEET];
  const shCombProv = wbCombProv.Sheets[COMB_PROVEEDOR_SHEET];

  if (!shManto) { console.error(`❌ Hoja "${MANTO_SHEET}" no encontrada en ${MANTO_FILE}`); process.exit(1); }

  // 4. Parsear combustible (ambas fuentes)
  const combInternas = parseCombInternaSheet(shCombInterna || {});
  const combProveedor = parseCombProveedorSheet(shCombProv || {});
  console.log(`Combustible interno (Tabla_Combustibles): ${combInternas.length} filas`);
  console.log(`Combustible proveedor (detailed_consumption): ${combProveedor.length} filas`);

  // Unificar y deduplicar usando el formato interno {placa, fecha, galones, kilometraje, costo, notas}
  const allCombRaw = [...combInternas, ...combProveedor];

  // Resolver placa → vehicle_id y filtrar desconocidos
  const combErrors = [];
  const combConVehiculo = allCombRaw.map((r) => {
    const vid = vehicleMap.get(r.placa);
    if (!vid) {
      combErrors.push({ placa: r.placa, fecha: r.fecha, motivo: "Placa no encontrada en BD" });
      return null;
    }
    return { ...r, vehicle_id: vid };
  }).filter(Boolean);

  // Deduplicar por vehicle_id + fecha + km + galones
  const combSeen = new Set();
  const combUniq = combConVehiculo.filter((r) => {
    const k = `${r.vehicle_id}|${r.fecha}|${Math.round(r.kilometraje)}|${Math.round(r.galones * 100)}`;
    if (combSeen.has(k)) return false;
    combSeen.add(k);
    return true;
  });

  console.log(`Combustible después de deduplicar (cross-source): ${combUniq.length}`);

  // 5. Parsear mantenimientos
  const { result: mantoRows, skipped: mantoSkipped } = parseMantenimientoSheet(shManto);
  console.log(`\nMantenimientos parseados: ${mantoRows.length} válidos, ${mantoSkipped.length} omitidos\n`);

  // Resolver placa → vehicle_id
  const mantoConVehiculo = [];
  const mantoPlacaNoEncontrada = [];
  for (const r of mantoRows) {
    const vid = vehicleMap.get(r.placa);
    if (!vid) {
      mantoPlacaNoEncontrada.push({ placa: r.placa, fila: r._fila });
    } else {
      mantoConVehiculo.push({ ...r, vehicle_id: vid });
    }
  }

  if (mantoPlacaNoEncontrada.length > 0) {
    const uniqueInvalid = [...new Set(mantoPlacaNoEncontrada.map((x) => x.placa))];
    console.log(`⚠️  Placas en mantenimiento no encontradas en BD (${uniqueInvalid.length}):`);
    console.log("   ", uniqueInvalid.join(", "));
    console.log(`   → ${mantoPlacaNoEncontrada.length} filas serán omitidas\n`);
  }

  // 6. Construir km timeline (fuel + mantenimientos con km > 0 existentes en BD)
  console.log("📐 Construyendo serie temporal de km...");

  // También leer km de mantenimientos existentes en BD para mejorar timeline
  const { data: existingMantoKm } = await supabase
    .from("maintenance_records")
    .select("vehicle_id, fecha, kilometraje_actual")
    .gt("kilometraje_actual", 0);
  const existingFuelKm = await supabase
    .from("fuel_logs")
    .select("vehicle_id, fecha, kilometraje");

  const timelinePoints = [
    // Combustible nuevo (con km)
    ...combUniq.filter((r) => r.kilometraje > 0).map((r) => ({
      vehicle_id: r.vehicle_id, fecha: r.fecha, km: r.kilometraje,
    })),
    // Mantenimientos existentes en BD con km
    ...(existingMantoKm || []).map((r) => ({
      vehicle_id: r.vehicle_id, fecha: r.fecha, km: r.kilometraje_actual,
    })),
    // Fuel logs existentes en BD
    ...((existingFuelKm.data || []).map((r) => ({
      vehicle_id: r.vehicle_id, fecha: r.fecha, km: r.kilometraje,
    }))),
    // Mantenimientos nuevos con km > 0 (los del Excel actual)
    ...mantoConVehiculo.filter((r) => r.kilometraje_raw > 0).map((r) => ({
      vehicle_id: r.vehicle_id, fecha: r.fecha, km: r.kilometraje_raw,
    })),
  ];

  const kmTimeline = buildKmTimeline(
    timelinePoints.filter((p) => p.km > 0),
    []
  );

  const vehiculosConTimeline = Object.keys(kmTimeline).length;
  const totalPuntos = Object.values(kmTimeline).reduce((s, a) => s + a.length, 0);
  console.log(`Timeline construido: ${vehiculosConTimeline} vehículos, ${totalPuntos} puntos totales\n`);

  // 7. Imputar km en mantenimientos sin km
  let imputados = 0;
  let sinDatosKm = 0;
  const imputacionResumen = { interpolacion: 0, extrapolacion: 0, carry_forward: 0, primer_conocido: 0, sin_datos: 0 };

  for (const r of mantoConVehiculo) {
    if (r.kilometraje_raw > 0) {
      r.kilometraje_actual = r.kilometraje_raw;
    } else {
      const { km, metodo } = imputeKm(r.vehicle_id, r.fecha, kmTimeline);
      r.kilometraje_actual = km;
      imputacionResumen[metodo] = (imputacionResumen[metodo] || 0) + 1;
      if (km > 0) imputados++;
      else sinDatosKm++;
    }
  }

  console.log(`Imputación de km (de ${mantoConVehiculo.filter((r) => r.kilometraje_raw === 0).length} registros sin km):`);
  for (const [m, n] of Object.entries(imputacionResumen)) {
    if (n > 0) console.log(`  ${m.padEnd(20)}: ${n}`);
  }
  console.log(`  Imputados con valor  : ${imputados}`);
  console.log(`  Sin datos (quedan 0) : ${sinDatosKm}\n`);

  // 8. Deduplicar mantenimientos contra BD existente
  const { data: existingManto } = await supabase
    .from("maintenance_records")
    .select("vehicle_id, fecha, numero_factura, kilometraje_actual, valor, tipo, descripcion_trabajo");

  const existingMantoKeys = new Set();
  for (const e of existingManto || []) {
    existingMantoKeys.add(buildMantoKey(
      e.vehicle_id, e.fecha, e.numero_factura,
      e.kilometraje_actual, e.valor, e.tipo, e.descripcion_trabajo
    ));
  }

  const mantoDups = [];
  const mantoToInsert = [];
  const seenMantoKeys = new Set();

  for (const r of mantoConVehiculo) {
    const key = buildMantoKey(
      r.vehicle_id, r.fecha, r.numero_factura,
      r.kilometraje_actual, r.valor, r.tipo, r.descripcion_trabajo
    );
    if (existingMantoKeys.has(key) || seenMantoKeys.has(key)) {
      mantoDups.push({ fila: r._fila, placa: r.placa, fecha: r.fecha });
    } else {
      seenMantoKeys.add(key);
      mantoToInsert.push({
        vehicle_id: r.vehicle_id,
        fecha: r.fecha,
        kilometraje_actual: r.kilometraje_actual,
        tipo: r.tipo,
        categoria_id: r.categoria_nombre ? (catMap.get(r.categoria_nombre) || null) : null,
        descripcion_trabajo: r.descripcion_trabajo,
        proveedor: r.proveedor,
        valor: r.valor,
        numero_factura: r.numero_factura,
        tiempo_fuera_servicio_horas: r.tiempo_fuera_servicio_horas,
        notas_adicionales: r.notas_adicionales,
      });
    }
  }

  // 9. Deduplicar combustible contra BD existente
  const { data: existingFuel } = await supabase
    .from("fuel_logs")
    .select("vehicle_id, fecha, kilometraje, galones");

  const existingFuelKeys = new Set();
  for (const e of existingFuel || []) {
    existingFuelKeys.add(`${e.vehicle_id}|${e.fecha}|${Math.round(e.kilometraje)}|${Math.round(e.galones * 100)}`);
  }

  const combToInsert = combUniq.filter((r) => {
    const k = `${r.vehicle_id}|${r.fecha}|${Math.round(r.kilometraje)}|${Math.round(r.galones * 100)}`;
    return !existingFuelKeys.has(k);
  }).map((r) => ({
    vehicle_id: r.vehicle_id,
    fecha: r.fecha,
    kilometraje: r.kilometraje,
    galones: r.galones,
    costo: r.costo,
    notas: r.notas,
  }));

  // 10. Resumen previo a inserción
  console.log("─".repeat(60));
  console.log("RESUMEN DE CARGA:");
  console.log(`  Mantenimientos a insertar : ${mantoToInsert.length}`);
  console.log(`  Mantenimientos duplicados  : ${mantoDups.length}`);
  console.log(`  Mantenimientos omitidos    : ${mantoSkipped.length + mantoPlacaNoEncontrada.length}`);
  console.log(`  Combustible a insertar     : ${combToInsert.length}`);
  console.log(`  Combustible duplicado      : ${combUniq.length - combToInsert.length}`);
  if (combErrors.length > 0) {
    const uniqueErrPlates = [...new Set(combErrors.map((e) => e.placa))];
    console.log(`  Combustible placa no en BD : ${uniqueErrPlates.length} placas → ${combErrors.length} filas`);
    console.log(`    Placas: ${uniqueErrPlates.join(", ")}`);
  }
  console.log("─".repeat(60));

  if (DRY_RUN) {
    console.log("\n✅ DRY RUN completado. No se insertó nada.");
    console.log("   Ejecuta sin --dry-run para cargar a Supabase.\n");
    return;
  }

  // 11. Insertar combustible primero (es fuente de km para imputation)
  if (!SOLO_MANTO && combToInsert.length > 0) {
    console.log("\n⛽ Insertando registros de combustible...");
    const { inserted: fInserted, errors: fErrors } = await batchInsert(
      supabase, "fuel_logs", combToInsert, "Combustible"
    );
    console.log(`  ✓ Combustible: ${fInserted} insertados, ${fErrors.length} lotes con error`);
  } else if (!SOLO_MANTO) {
    console.log("\n⛽ Combustible: nada nuevo que insertar.");
  }

  // 12. Insertar mantenimientos
  if (!SOLO_COMB && mantoToInsert.length > 0) {
    console.log("\n🔧 Insertando registros de mantenimiento...");
    const { inserted: mInserted, errors: mErrors } = await batchInsert(
      supabase, "maintenance_records", mantoToInsert, "Mantenimiento"
    );
    console.log(`  ✓ Mantenimiento: ${mInserted} insertados, ${mErrors.length} lotes con error`);
  } else if (!SOLO_COMB) {
    console.log("\n🔧 Mantenimiento: nada nuevo que insertar.");
  }

  // 13. Reporte final de omitidos / warnings
  if (mantoSkipped.length > 0) {
    console.log(`\n⚠️  Filas omitidas de mantenimiento (${mantoSkipped.length}):`);
    const byMotivo = {};
    for (const s of mantoSkipped) {
      byMotivo[s.motivo] = (byMotivo[s.motivo] || 0) + 1;
    }
    for (const [m, n] of Object.entries(byMotivo)) console.log(`   ${n}x ${m}`);
  }

  console.log("\n✅ Carga completada.\n");
}

main().catch((err) => {
  console.error("\n❌ Error inesperado:", err);
  process.exit(1);
});
