/**
 * Aplica en orden: schema.sql → 002_iteracion2.sql → 003_rbac.sql → 004_reserved_rls.sql
 * y opcionalmente crea rol SUPERADMIN + perfil ADMIN para ADMIN_SETUP_EMAIL.
 *
 * Requiere DATABASE_URL en .env.local (Supabase → Settings → Database → URI).
 * Uso: npm run db:apply
 */
import * as fs from "fs";
import * as path from "path";
import pg from "pg";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error("No existe .env.local en la raíz del proyecto.");
  }
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (k) process.env[k] = v;
  }
}

async function runSql(client: pg.Client, label: string, sql: string) {
  console.log(`\n→ Ejecutando: ${label} ...`);
  await client.query(sql);
  console.log(`   ✓ OK`);
}

async function main() {
  loadEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(`
❌ Falta DATABASE_URL en .env.local

Cómo obtenerla (Supabase):
1. Abre tu proyecto en https://supabase.com/dashboard
2. Settings (engranaje) → Database
3. En "Connection string" elige URI y copia la cadena
4. Sustituye [YOUR-PASSWORD] por la contraseña de la base de datos
5. Añade en .env.local una línea:
   DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.xxxxx.supabase.co:5432/postgres

(Puerto 5432 sesión directa; el pooler 6543 también suele funcionar con ?pgbouncer=true según doc de Supabase)
`);
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Conectado a Postgres.");

  const files = [
    ["schema.sql", path.join(process.cwd(), "scripts", "schema.sql")],
    ["002_iteracion2.sql", path.join(process.cwd(), "scripts", "migrations", "002_iteracion2.sql")],
    ["003_rbac.sql", path.join(process.cwd(), "scripts", "migrations", "003_rbac.sql")],
    ["004_reserved_rls.sql", path.join(process.cwd(), "scripts", "migrations", "004_reserved_rls.sql")],
  ] as const;

  try {
    for (const [label, filePath] of files) {
      if (!fs.existsSync(filePath)) {
        throw new Error(`No se encontró el archivo: ${filePath}`);
      }
      const sql = fs.readFileSync(filePath, "utf-8");
      await runSql(client, label, sql);
    }

    const adminEmail =
      process.env.ADMIN_SETUP_EMAIL?.trim() ||
      "innovizar@aerosanidadsas.com";

    console.log(`\n→ Post-migración: rol SUPERADMIN + perfil para "${adminEmail}" (si el usuario existe en Auth) ...`);
    await client.query(`
INSERT INTO roles (codigo, nombre, descripcion)
VALUES ('SUPERADMIN', 'Super Administrador', 'Acceso total (alias de administración en la app)')
ON CONFLICT (codigo) DO NOTHING;
`);

    const r = await client.query(
      `
INSERT INTO user_profiles (user_id, role_id, nombre_completo, email, activo)
SELECT
  u.id,
  COALESCE(
    (SELECT id FROM roles WHERE codigo = 'SUPERADMIN' LIMIT 1),
    (SELECT id FROM roles WHERE codigo = 'ADMIN' LIMIT 1)
  ),
  'Administrador',
  u.email,
  true
FROM auth.users u
WHERE u.email = $1
ON CONFLICT (user_id) DO UPDATE SET
  role_id = EXCLUDED.role_id,
  nombre_completo = EXCLUDED.nombre_completo,
  email = EXCLUDED.email,
  activo = true,
  updated_at = NOW();
`,
      [adminEmail]
    );
    console.log(`   ✓ Perfil actualizado o insertado (filas: ${r.rowCount ?? 0})`);

    if ((r.rowCount ?? 0) === 0) {
      console.log(`
   ⚠️  Si no había fila en auth.users con ese email, no se insertó perfil.
       Crea el usuario en Authentication → Users y vuelve a ejecutar solo el bloque SQL
       o cambia ADMIN_SETUP_EMAIL en .env.local y ejecuta de nuevo npm run db:apply
`);
    }
  } catch (e: any) {
    console.error("\n❌ Error:", e.message || e);
    console.error(`
Si el error es por "already exists" / duplicado, puede que el esquema ya esté parcialmente creado.
En ese caso usa el SQL Editor de Supabase para revisar qué falta, o restaura un proyecto limpio.
`);
    process.exit(1);
  } finally {
    await client.end();
  }

  console.log(`
✅ Migraciones aplicadas.

Siguientes pasos (solo si hace falta):
1. Supabase Dashboard → Settings → API → si PostgREST no ve tablas nuevas, espera 1–2 min o reinicia el proyecto.
2. Ejecuta: npx tsx scripts/verify-user-profiles.ts
3. Inicia sesión en la app con el usuario de Auth que enlazaste.
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
