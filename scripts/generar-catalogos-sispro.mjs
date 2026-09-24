// Genera scripts/migrations/081_sispro_catalogos.sql a partir de las hojas de referencia
// del libro "SISPRO 2026.xlsx" (PAISES, IPS, AEROPUERTOS, AEROPUERTOS NAL).
// Son catálogos oficiales del reporte, sin datos de personas. Solo hace falta volver a
// correrlo si el Ministerio cambia los catálogos:
//
//   node scripts/generar-catalogos-sispro.mjs "C:/ruta/SISPRO 2026.xlsx"
//
// La migración resultante es idempotente (ON CONFLICT DO NOTHING).
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

const XLSX = createRequire(import.meta.url)("xlsx");
const ruta = process.argv[2];
if (!ruta) {
  console.error('Uso: node scripts/generar-catalogos-sispro.mjs "<ruta al SISPRO xlsx>"');
  process.exit(1);
}

const wb = XLSX.readFile(ruta);
const filas = (hoja) => XLSX.utils.sheet_to_json(wb.Sheets[hoja], { header: 1, defval: "" });
const limpio = (v) => String(v ?? "").replace(/\s+/g, " ").trim().toUpperCase();
const sql = (v) => (v === "" || v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const lote = (tabla, columnas, filasSql) => {
  const partes = [];
  for (let i = 0; i < filasSql.length; i += 200) {
    partes.push(`INSERT INTO ${tabla} (${columnas}) VALUES\n${filasSql.slice(i, i + 200).join(",\n")}\nON CONFLICT DO NOTHING;`);
  }
  return partes.join("\n\n");
};

// PAISES: A = nombre, B = código ISO
const paises = filas("PAISES").map((r) => [limpio(r[0]), limpio(r[1])]).filter(([n, c]) => n && c);

// IPS: A = nombre, B = código de habilitación (999 = desconocida). Las primeras filas son títulos.
const ips = filas("IPS")
  .map((r) => [limpio(r[0]), String(r[1]).trim()])
  .filter(([n, c]) => n && c && !n.startsWith("REMISION DE PACIENTES"));

// AEROPUERTOS (procedencia): NOMBRE, CIUDAD, CÓDIGO CIUDAD, OACI, PAÍS, NAL/INT
const aeropuertos = filas("AEROPUERTOS")
  .slice(1)
  .map((r) => [limpio(r[0]), limpio(r[1]), String(r[2]).trim(), limpio(r[3]), limpio(r[4]), limpio(r[5])])
  .filter(([n]) => n);

// AEROPUERTOS NAL (atención): NOMBRE, OACI, CIUDAD, DEPARTAMENTO
const nal = filas("AEROPUERTOS NAL")
  .slice(1)
  .map((r) => [limpio(r[0]), limpio(r[1]), limpio(r[2]), limpio(r[3])])
  .filter(([n]) => n);

const salida = `-- ============================================================
-- Migración 081: catálogos oficiales del reporte SISPRO de atenciones en aeropuertos
--
-- Generada con scripts/generar-catalogos-sispro.mjs a partir de las hojas PAISES, IPS,
-- AEROPUERTOS y AEROPUERTOS NAL del libro "SISPRO 2026". Son catálogos de referencia
-- (sin datos de personas). Con ellos la exportación mensual resuelve, como las fórmulas
-- BUSCARV del Excel, el código del país, la ciudad de procedencia y el código de la IPS.
--
-- Lectura para cualquier usuario con rol; escritura solo ADMIN. Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS sispro_paises (
  nombre VARCHAR(80) PRIMARY KEY,
  codigo VARCHAR(4) NOT NULL
);
CREATE TABLE IF NOT EXISTS sispro_ips (
  nombre VARCHAR(200) PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL          -- 999 = IPS desconocida
);
CREATE TABLE IF NOT EXISTS sispro_aeropuertos (        -- aeropuerto de procedencia
  nombre        VARCHAR(150) PRIMARY KEY,
  ciudad        VARCHAR(100) NOT NULL,
  codigo_ciudad VARCHAR(10),
  oaci          VARCHAR(10),
  pais          VARCHAR(80),
  ambito        VARCHAR(15)
);
CREATE TABLE IF NOT EXISTS sispro_aeropuertos_atencion (  -- aeropuertos nacionales donde se atiende
  nombre       VARCHAR(150) PRIMARY KEY,
  oaci         VARCHAR(10),
  ciudad       VARCHAR(100),
  departamento VARCHAR(100)
);

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['sispro_paises', 'sispro_ips', 'sispro_aeropuertos', 'sispro_aeropuertos_atencion'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_select', t);
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT TO authenticated USING (get_user_role() IS NOT NULL)', t || '_select', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_write', t);
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL TO authenticated USING (get_user_role() = ''ADMIN'') WITH CHECK (get_user_role() = ''ADMIN'')', t || '_write', t);
  END LOOP;
END $$;

${lote("sispro_paises", "nombre, codigo", paises.map(([n, c]) => `(${sql(n)}, ${sql(c)})`))}

${lote("sispro_ips", "nombre, codigo", ips.map(([n, c]) => `(${sql(n)}, ${sql(c)})`))}

${lote(
  "sispro_aeropuertos",
  "nombre, ciudad, codigo_ciudad, oaci, pais, ambito",
  aeropuertos.map(([n, ci, cc, o, p, a]) => `(${sql(n)}, ${sql(ci)}, ${sql(cc)}, ${sql(o)}, ${sql(p)}, ${sql(a)})`),
)}

${lote(
  "sispro_aeropuertos_atencion",
  "nombre, oaci, ciudad, departamento",
  nal.map(([n, o, c, d]) => `(${sql(n)}, ${sql(o)}, ${sql(c)}, ${sql(d)})`),
)}
`;

writeFileSync(new URL("./migrations/081_sispro_catalogos.sql", import.meta.url), salida);
console.log(`081_sispro_catalogos.sql: ${paises.length} países, ${ips.length} IPS, ${aeropuertos.length} aeropuertos, ${nal.length} aeropuertos de atención`);
