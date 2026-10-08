/**
 * Concilia los identificadores de un CSV de SISRES con la base de SISMANTO. SOLO LECTURA: no escribe nada.
 *
 * Responde: ¿qué hay en la base que ya no está en SISRES (se borró allá, o el CSV es más viejo)? y ¿qué hay en SISRES
 * que todavía no se cargó? Úsalo ANTES de la carga real del ETL: `etl-sisres.ts` no borra, así que lo que "sobra" en la
 * base se queda a menos que alguien decida otra cosa.
 *
 * Uso:
 *   npx tsx scripts/etl-conciliar.ts <carpeta-con-CSVs> [servicios|pacientes|equipos|todo]     (por defecto: todo)
 *
 * Necesita `DATABASE_URL` en `.env.local` (el mismo del ETL) y los CSV que genera `generar_csv_etl.php`
 * (`servicios.csv`, `paciente.csv`, `inventario.csv`; los tres con la columna `id`).
 *
 * Privacidad: solo lee la columna `id` de los CSV y solo imprime conteos. Escribe, junto a los CSV, una lista de
 * identificadores numéricos por tabla (`conciliacion-<tabla>-sobran.csv` y `-faltan.csv`): no llevan ningún dato de
 * personas, pero igual quedan en la carpeta local, nunca en git.
 */
import * as fs from "fs";
import * as path from "path";
import pg from "pg";
import { conciliar, extraerColumnaCsv } from "../src/lib/etl-conciliacion";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf-8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}
loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

interface Tabla {
  clave: string;
  csv: string;
  tabla: string;
  /** Columna por la que se desglosa lo que sobra (etapa, activo…); null = sin desglose. */
  desglose: string | null;
}

const TABLAS: Tabla[] = [
  { clave: "servicios", csv: "servicios.csv", tabla: "medical_services", desglose: "etapa" },
  { clave: "pacientes", csv: "paciente.csv", tabla: "patients", desglose: "activo" },
  { clave: "equipos", csv: "inventario.csv", tabla: "biomedical_equipment", desglose: null },
];

const num = (n: number) => n.toLocaleString("es-CO");

function escribirIds(dir: string, nombre: string, ids: number[]) {
  fs.writeFileSync(path.join(dir, nombre), ["sisres_id", ...ids].join("\n") + "\n");
}

async function conciliarTabla(client: pg.Client, dir: string, t: Tabla) {
  const ruta = path.join(dir, t.csv);
  console.log(`\n── ${t.clave} (${t.csv} ↔ ${t.tabla}) ──`);
  if (!fs.existsSync(ruta)) {
    console.log(`   ⏭  No está ${t.csv} en la carpeta: se omite.`);
    return;
  }
  const valoresCsv = extraerColumnaCsv(fs.readFileSync(ruta, "utf-8"), "id");
  const { rows } = await client.query<{ sisres_id: number }>(`SELECT sisres_id FROM ${t.tabla} WHERE sisres_id IS NOT NULL`);
  const r = conciliar(valoresCsv, rows.map((x) => x.sisres_id));

  const { rows: sinOrigen } = await client.query<{ c: number }>(`SELECT COUNT(*)::int AS c FROM ${t.tabla} WHERE sisres_id IS NULL`);

  console.log(`   Filas en el CSV:                       ${num(valoresCsv.length)}  (${num(r.enCsv)} identificadores distintos)`);
  if (r.repetidosEnCsv > 0) console.log(`   ⚠ Identificadores repetidos en el CSV:  ${num(r.repetidosEnCsv)}`);
  if (r.invalidosEnCsv > 0) console.log(`   ⚠ Filas sin identificador válido:       ${num(r.invalidosEnCsv)}  (el ETL las rechaza)`);
  console.log(`   Filas en la base con origen SISRES:    ${num(rows.length)}`);
  console.log(`   En los dos lados:                      ${num(r.enAmbos)}`);
  console.log(`   SOLO EN LA BASE (ya no están en SISRES): ${num(r.soloEnBd.length)}   ← el ETL no las borra`);
  console.log(`   SOLO EN EL CSV (faltan por cargar):      ${num(r.soloEnCsv.length)}`);
  console.log(`   Filas de la base sin origen SISRES:    ${num(sinOrigen[0].c)}  (creadas en SISMANTO o por una carga vieja)`);

  if (r.soloEnBd.length > 0 && t.desglose) {
    const { rows: d } = await client.query<{ valor: string; c: number }>(
      `SELECT ${t.desglose}::text AS valor, COUNT(*)::int AS c FROM ${t.tabla} WHERE sisres_id = ANY($1::int[]) GROUP BY 1 ORDER BY 2 DESC`,
      [r.soloEnBd]
    );
    console.log(`   Lo que sobra, por ${t.desglose}: ` + d.map((x) => `${x.valor}=${num(x.c)}`).join(" · "));
    console.log(`   Rango de identificadores que sobran: ${r.soloEnBd[0]} … ${r.soloEnBd[r.soloEnBd.length - 1]}`);
  }
  if (sinOrigen[0].c > 0 && t.clave === "servicios") {
    const { rows: d } = await client.query<{ autor: string; etapa: string; c: number }>(
      `SELECT CASE WHEN created_by IS NULL THEN 'sin autor (carga vieja?)' ELSE 'creado en SISMANTO' END AS autor, etapa, COUNT(*)::int AS c
         FROM medical_services WHERE sisres_id IS NULL GROUP BY 1, 2 ORDER BY 1, 3 DESC`
    );
    console.log("   Sin origen SISRES, por autor y etapa: " + d.map((x) => `${x.autor}/${x.etapa}=${x.c}`).join(" · "));
  }

  escribirIds(dir, `conciliacion-${t.clave}-sobran.csv`, r.soloEnBd);
  escribirIds(dir, `conciliacion-${t.clave}-faltan.csv`, r.soloEnCsv);
  console.log(`   📝 conciliacion-${t.clave}-sobran.csv y conciliacion-${t.clave}-faltan.csv (solo identificadores)`);
}

async function main() {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !["todo", ...TABLAS.map((t) => t.clave)].includes(a));
  const cual = args.find((a) => ["todo", ...TABLAS.map((t) => t.clave)].includes(a)) ?? "todo";
  if (!dir || !fs.existsSync(dir)) {
    console.error("Uso: npx tsx scripts/etl-conciliar.ts <carpeta-con-CSVs> [servicios|pacientes|equipos|todo]");
    process.exit(1);
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Falta DATABASE_URL en .env.local");
    process.exit(1);
  }
  const host = new URL(url.replace(/^postgres(ql)?:\/\//, "http://")).hostname;
  console.log(`🎯 Base: ${host}  (solo lectura)`);
  console.log(`📂 CSV:  ${path.resolve(dir)}`);

  const client = new pg.Client({ connectionString: url, ssl: process.env.DATABASE_SSL === "off" ? false : { rejectUnauthorized: false } });
  await client.connect();
  try {
    // Transacción de solo lectura: aunque algo del script se equivocara, la base no puede cambiar.
    await client.query("BEGIN READ ONLY");
    for (const t of TABLAS) if (cual === "todo" || cual === t.clave) await conciliarTabla(client, dir, t);
    await client.query("ROLLBACK");
  } finally {
    await client.end();
  }
  console.log("\n✔ Listo. No se escribió nada en la base.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
