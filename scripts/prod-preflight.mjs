// Comprobación de SOLO LECTURA de una base de producción antes (y después) de migrarla.
// No ejecuta ninguna migración ni escribe nada. La usan .github/workflows/db-migrate-prod.yml y
// .github/workflows/deploy-prod.yml, y se puede correr a mano:
//
//   DATABASE_URL=... PRODUCTION_SUPABASE_REF=<ref> node scripts/prod-preflight.mjs
//
// Variables:
//   DATABASE_URL             URI de la base de PRODUCCIÓN (Session pooler). Nunca se imprime.
//   PRODUCTION_SUPABASE_REF  ref del proyecto Supabase de producción (la URI debe contenerlo).
//   REQUIRE_ZERO=1           falla si queda alguna migración pendiente (guardia antes de desplegar).
//
// Por qué existe: scripts/apply-database.ts, cuando la base YA tiene esquema pero NO tiene la tabla
// `schema_migrations`, marca TODAS las migraciones del array como aplicadas SIN ejecutarlas. En una base
// de producción sin tracker, esa primera corrida sería un "éxito" que no crea ninguna tabla nueva.
// Esta comprobación aborta antes de que eso pueda pasar.
import fs from "node:fs";
import pg from "pg";

const REF_STAGING = "oanbqlfvdmdpckrcwfqi"; // SISMANTO_Staging (ENTORNOS.md): nunca es producción
const fallar = (m) => {
  console.error(`\n❌ ${m}\n`);
  process.exit(1);
};

const url = process.env.DATABASE_URL;
const ref = (process.env.PRODUCTION_SUPABASE_REF || "").trim();
if (!url) fallar("Falta DATABASE_URL (en Actions es el secreto DATABASE_URL_PROD del entorno Production).");
if (!ref) fallar("Falta PRODUCTION_SUPABASE_REF (variable del entorno Production: el ref del proyecto Supabase de producción).");
if (url.includes(REF_STAGING)) fallar("DATABASE_URL apunta a SISMANTO_Staging. Esto es solo para la base de producción.");
if (!url.includes(ref)) fallar(`DATABASE_URL no contiene el ref de producción (${ref}). Revisa el secreto y la variable.`);

const fuente = fs.readFileSync("scripts/apply-database.ts", "utf8");
const enArray = [...fuente.matchAll(/name:\s*"([^"]+\.sql)"/g)].map((m) => m[1]);
const numero = (n) => (/^(\d+)_/.exec(n) ? Number(/^(\d+)_/.exec(n)[1]) : 0);
// Línea base de producción: lo que ya estaba en main antes del salto de hoy (schema.sql y 002 a 034).
const base = enArray.filter((n) => n === "schema.sql" || numero(n) <= 34);

const cliente = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
try {
  await cliente.connect();
} catch (e) {
  fallar(`No se pudo conectar (${e?.code ?? "sin código"}): ${e?.message ?? e}\n   Usa la URI de "Session pooler" de Supabase → Connect (el host directo es solo IPv6).`);
}

const q = async (sql) => (await cliente.query(sql)).rows;
const host = new URL(url).host;
const [{ db, version }] = await q("SELECT current_database() AS db, split_part(version(), ' ', 2) AS version");
console.log(`✓ Conectado a ${host} · base "${db}" · PostgreSQL ${version}`);

const tablas = new Set((await q("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")).map((r) => r.table_name));
for (const t of ["vehicles", "user_profiles", "roles"]) {
  if (!tablas.has(t)) fallar(`Falta la tabla ${t}: esta no parece la base de SISMANTO (o está vacía). Abortado.`);
}
const [{ n: vehiculos }] = await q("SELECT count(*)::int AS n FROM public.vehicles");
const [{ n: perfiles }] = await q("SELECT count(*)::int AS n FROM public.user_profiles");
console.log(`  datos existentes: ${vehiculos} vehículos, ${perfiles} perfiles de usuario`);

if (!tablas.has("schema_migrations")) {
  fallar(
    "La base NO tiene la tabla schema_migrations (el registro de migraciones aplicadas).\n" +
      "   Si se corriera `npm run db:apply` ahora, marcaría las ~" + enArray.length + " migraciones como aplicadas SIN ejecutarlas.\n" +
      "   Antes hay que sembrar el registro con SOLO la línea base (schema.sql y 002–034) que de verdad esté aplicada.\n" +
      "   Ver docs/PRODUCCION_PASO_A_PASO.md, sección «Si producción no tiene schema_migrations».",
  );
}
const aplicadas = new Set((await q("SELECT name FROM public.schema_migrations")).map((r) => r.name));
console.log(`  migraciones registradas como aplicadas: ${aplicadas.size}`);

const baseFaltante = base.filter((n) => !aplicadas.has(n));
if (baseFaltante.length > 0) {
  fallar(
    `El registro de producción no incluye ${baseFaltante.length} migración(es) de la línea base:\n   ${baseFaltante.join("\n   ")}\n` +
      "   Producción no está donde se espera. Revisa con Daniel antes de continuar.",
  );
}

const pendientes = enArray.filter((n) => !aplicadas.has(n));
console.log(`\n  Pendientes de aplicar: ${pendientes.length}`);
for (const n of pendientes) console.log(`   · ${n}`);
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Base de producción (${host})\n- Migraciones pendientes: **${pendientes.length}**\n${pendientes.map((n) => `  - ${n}`).join("\n")}\n`,
  );
}
await cliente.end();

if (process.env.REQUIRE_ZERO === "1" && pendientes.length > 0) {
  fallar(`Hay ${pendientes.length} migración(es) pendiente(s). No se despliega código que las necesita sin aplicarlas antes.`);
}
console.log(pendientes.length === 0 ? "\n✅ La base está al día." : "\n✅ Comprobación correcta: se pueden aplicar las pendientes.");
