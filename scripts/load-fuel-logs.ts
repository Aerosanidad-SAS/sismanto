/**
 * Carga histórico de combustible desde el Excel del proveedor.
 *
 * Formato esperado (columnas del proveedor):
 *   Cliente | Nro.Identificación | Código SAP | No. Venta | Fecha | Estación |
 *   Regional | Id EDS | Placa | Conductor | Combustible | Cantidad | Precio |
 *   Unidad de Venta | Total Venta | Kilometraje | Precio facturado | Valor factura | Numero de factura
 *
 * Uso:
 *   npm run fuel:load -- <ruta-al-xlsx>
 *   npm run fuel:load -- "C:/ruta/al/archivo.xlsx"
 *
 * Idempotente: usa No. Venta como clave única (ON CONFLICT DO NOTHING).
 * Los registros debug (notas = 'DEBUG_TCO_SEED') se eliminan antes de cargar.
 * Placas no encontradas en la BD se omiten y se reportan al final.
 */

import * as fs from "fs";
import * as path from "path";
import XLSX from "xlsx";
import pg from "pg";
import { leerVentas, localizarEncabezados, notasDeVenta } from "../src/lib/combustible-proveedor";

// ── Env ──────────────────────────────────────────────────────────────────────

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf-8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (k) process.env[k] = v;
  }
}

function loadEnv() {
  const root = process.cwd();
  loadEnvFile(path.join(root, ".env"));
  loadEnvFile(path.join(root, ".env.local"));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();

  const xlsxPath = process.argv[2];
  if (!xlsxPath) {
    console.error(`
❌ Falta la ruta del archivo Excel.

Uso:
  npm run fuel:load -- "<ruta-al-xlsx>"
  npm run fuel:load -- "C:/ruta/fuel_logs.xlsx"
`);
    process.exit(1);
  }

  const resolvedPath = path.resolve(xlsxPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Archivo no encontrado: ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`\nLeyendo: ${resolvedPath}`);
  const wb = XLSX.readFile(resolvedPath);
  const nombreHoja = wb.SheetNames.find((n) => /combustible/i.test(n)) ?? wb.SheetNames[0];
  const hoja = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[nombreHoja], { header: 1, defval: "", raw: true });

  // Misma lectura que la web (Configuracion > Carga masiva > Combustible): columnas por NOMBRE, una sola implementacion.
  const enc = localizarEncabezados(hoja);
  if ("error" in enc) {
    console.error(`Error: ${enc.error}`);
    process.exit(1);
  }
  const { ventas, errores } = leerVentas(hoja, enc);
  console.log(`   ${ventas.length} filas validas, ${errores.length} con error`);
  for (const e of errores.slice(0, 20)) console.log(`   fila ${e.fila} ${e.placa}: ${e.mensaje}`);

  // ── Conectar BD ───────────────────────────────────────────────────────────

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL no configurada en .env.local");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log("✓ Conectado a Postgres\n");

  // ── Limpiar registros de debug ────────────────────────────────────────────

  const { rowCount: deleted } = await client.query(
    `DELETE FROM fuel_logs WHERE notas = 'DEBUG_TCO_SEED'`
  );
  if ((deleted ?? 0) > 0) {
    console.log(`🧹 ${deleted} registros DEBUG_TCO_SEED eliminados\n`);
  }

  // ── Cargar mapa placa → vehicle_id ────────────────────────────────────────

  const { rows: vehicles } = await client.query<{ id: string; placa: string }>(
    "SELECT id, placa FROM vehicles"
  );
  const placaMap = new Map(vehicles.map((v) => [v.placa.trim().toUpperCase(), v.id]));

  // ── Procesar filas ────────────────────────────────────────────────────────

  interface FuelRow {
    vehicleId: string;
    fecha: string;
    kilometraje: number;
    galones: number;
    costo: number;
    notas: string | null;
    numeroVenta: string | null;
  }

  const validRows: FuelRow[] = [];
  const skippedPlates = new Set<string>();
  const skippedPlateCount: Record<string, number> = {};

  for (const v of ventas) {
    const vehicleId = placaMap.get(v.placa);
    if (!vehicleId) {
      skippedPlates.add(v.placa);
      skippedPlateCount[v.placa] = (skippedPlateCount[v.placa] ?? 0) + 1;
      continue;
    }
    validRows.push({
      vehicleId,
      fecha: v.dia,
      galones: v.galones,
      costo: v.costo,
      kilometraje: v.km,
      notas: notasDeVenta(v),
      numeroVenta: v.numeroVenta,
    });
  }

  // Insertar en lotes de 200 para evitar timeout del pooler
  const BATCH = 200;
  let inserted = 0;
  let skippedDup = 0;

  for (let i = 0; i < validRows.length; i += BATCH) {
    const batch = validRows.slice(i, i + BATCH);

    // Construir INSERT multi-valores con parámetros numerados
    const valuePlaceholders = batch.map((_, j) => {
      const base = j * 7;
      return `($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7})`;
    }).join(",");

    const params: (string | number | null)[] = [];
    for (const r of batch) {
      params.push(r.vehicleId, r.fecha, r.kilometraje, r.galones, r.costo, r.notas, r.numeroVenta);
    }

    const { rowCount } = await client.query(
      `INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas, numero_venta)
       VALUES ${valuePlaceholders}
       ON CONFLICT (numero_venta) WHERE numero_venta IS NOT NULL DO NOTHING`,
      params
    );

    inserted += rowCount ?? 0;
    skippedDup += batch.length - (rowCount ?? 0);

    const pct = Math.round(((i + batch.length) / validRows.length) * 100);
    process.stdout.write(`\r   Cargando... ${pct}% (${i + batch.length}/${validRows.length})`);
  }
  console.log();

  await client.end();

  // ── Resumen ───────────────────────────────────────────────────────────────

  console.log(`✅ Carga completada:`);
  console.log(`   ${inserted.toLocaleString()}  registros insertados`);
  if (skippedDup > 0)    console.log(`   ${skippedDup.toLocaleString()}  duplicados omitidos (ya existían)`);
  if (skippedPlates.size > 0) {
    console.log(`\n⚠️  Placas omitidas (no encontradas en BD):`);
    for (const p of [...skippedPlates].sort()) {
      console.log(`   ${p}: ${skippedPlateCount[p]} registros`);
    }
    console.log(`   → Agrega estos vehículos al sistema si quieres cargar su historial.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
