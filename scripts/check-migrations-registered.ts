/**
 * Comprueba que TODA migración de scripts/migrations/ esté registrada en MIGRATIONS de scripts/apply-database.ts.
 * El pipeline (db-migrate.yml → `npm run db:apply`) solo aplica lo que esté en esa lista: una migración que no se
 * registra se puede mergear, pasar el CI y no aplicarse nunca (pasó con las migraciones 068 a 076 hasta que se notó).
 *
 * También avisa de números repetidos (cosmético: el pipeline registra por nombre, no por número) y de entradas
 * que apuntan a un archivo de scripts/migrations/ que no existe. Sale con código 1 si hay algo NUEVO sin registrar
 * o un archivo faltante.
 *
 * Uso: npx tsx scripts/check-migrations-registered.ts
 */
import fs from "node:fs";
import path from "node:path";

/** Migraciones que a propósito NO se registran. Cada una con su motivo. */
const NO_REGISTRADAS_A_PROPOSITO: Record<string, string> = {
  "062_dotacion_catalogo.sql": "se registra cuando esté la lista real de dotación (comentario en apply-database.ts)",
};

/**
 * Migraciones anteriores a este chequeo que NO están registradas y que nadie ha confirmado si debían estarlo (algunas
 * son de un solo uso a propósito: "reset", "debug_seed", "clear"). Se listan como aviso, no como error, para que el
 * chequeo sirva desde hoy para las nuevas sin obligar a decidir sobre las viejas. Revisar con quien las escribió.
 */
const LEGADO_SIN_REVISAR: readonly string[] = [
  "004_reserved_rls.sql",
  "013_coordinacion_role_access.sql",
  "018_kia_picanto_bogota.sql",
  "021_reset_fuel_logs_manual_reload.sql",
  "024_ai_usage_log.sql",
  "026_clear_maintenance_records.sql",
  "027_tco_debug_seed.sql",
];

export interface Resultado {
  legado: string[];
  sinRegistrar: string[];
  archivoFaltante: string[];
  numerosRepetidos: string[];
}

const PREFIJO = "scripts/migrations/";

/** Núcleo puro: recibe los nombres de archivo y el texto de apply-database.ts. */
export function comprobar(archivos: string[], textoApply: string): Resultado {
  // Solo cuentan las líneas reales (no comentadas) con forma { name: "...", file: "..." }.
  const entradas = textoApply
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*\{\s*name:\s*"([^"]+)"\s*,\s*file:\s*"([^"]+)"/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ name: m[1], file: m[2] }));
  const registradas = new Set(entradas.map((e) => e.name));
  const sql = archivos.filter((f) => f.endsWith(".sql")).sort();

  const pendientes = sql.filter((f) => !registradas.has(f) && !(f in NO_REGISTRADAS_A_PROPOSITO));
  const legado = pendientes.filter((f) => LEGADO_SIN_REVISAR.includes(f));
  const sinRegistrar = pendientes.filter((f) => !LEGADO_SIN_REVISAR.includes(f));
  // schema.sql vive en scripts/, no en scripts/migrations/: solo se verifican las entradas de esa carpeta.
  const archivoFaltante = entradas
    .filter((e) => e.file.startsWith(PREFIJO) && !sql.includes(e.file.slice(PREFIJO.length)))
    .map((e) => e.name)
    .sort();

  const porNumero = new Map<string, string[]>();
  for (const f of sql) {
    const num = f.match(/^(\d+)_/)?.[1];
    if (num) porNumero.set(num, [...(porNumero.get(num) ?? []), f]);
  }
  const numerosRepetidos = Array.from(porNumero.entries())
    .filter(([, fs]) => fs.length > 1)
    .map(([n, fs]) => `${n}: ${fs.join(", ")}`);

  return { legado, sinRegistrar, archivoFaltante, numerosRepetidos };
}

if (process.argv[1] && /check-migrations-registered/.test(process.argv[1])) {
  const raiz = process.cwd();
  const archivos = fs.readdirSync(path.join(raiz, "scripts", "migrations"));
  const texto = fs.readFileSync(path.join(raiz, "scripts", "apply-database.ts"), "utf8");
  const r = comprobar(archivos, texto);

  for (const f of r.legado) console.warn(`⚠ Legado sin registrar (sin revisar): ${f}`);
  for (const l of r.numerosRepetidos) console.warn(`⚠ Número repetido (cosmético, el pipeline registra por nombre) — ${l}`);
  for (const f of r.sinRegistrar) console.error(`✖ Sin registrar en apply-database.ts: ${f}`);
  for (const f of r.archivoFaltante) console.error(`✖ Registrada pero el archivo no existe: ${f}`);

  if (r.sinRegistrar.length || r.archivoFaltante.length) process.exit(1);
  console.log(`✔ ${archivos.filter((f) => f.endsWith(".sql")).length} migraciones; ninguna nueva sin registrar.`);
}
