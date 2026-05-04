/**
 * Aplica en orden: schema.sql → 002_iteracion2.sql → 003_rbac.sql → 004_reserved_rls.sql
 * y opcionalmente crea rol SUPERADMIN + perfil ADMIN para ADMIN_SETUP_EMAIL.
 *
 * Requiere DATABASE_URL en .env.local o .env, o en el entorno (Supabase: Connect → URI, o Project settings → Database).
 * Uso: npm run db:apply
 */
import * as fs from "fs";
import * as path from "path";
import pg from "pg";

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

/** Orden: `.env` y luego `.env.local` (este último pisa claves). La shell puede aportar DATABASE_URL si no está en archivos. */
function loadEnv() {
  const root = process.cwd();
  loadEnvFile(path.join(root, ".env"));
  loadEnvFile(path.join(root, ".env.local"));
}

/** Si solo existe como comentario, muchos equipos olvidan quitar el `#`. */
function hintIfDatabaseUrlCommented(): string | undefined {
  const root = process.cwd();
  for (const name of [".env.local", ".env"] as const) {
    const filePath = path.join(root, name);
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
    for (const line of lines) {
      if (/^\s*#\s*DATABASE_URL\s*=/.test(line)) {
        return `En ${name} la línea DATABASE_URL está comentada (empieza con #). Quita el # y sustituye el placeholder de la contraseña por la contraseña real de la base en Supabase.`;
      }
    }
  }
  return undefined;
}

/** Evita intentar conectar con plantillas típicas (mensaje más claro que ENOTFOUND o 28P01). */
function databaseUrlConfigError(url: string): string | undefined {
  if (/\bTU_PASSWORD\b|\[YOUR-PASSWORD\]/i.test(url)) {
    return (
      "DATABASE_URL sigue con un marcador de contraseña (p. ej. TU_PASSWORD). " +
      "Sustitúyelo por la contraseña real de la base en Supabase (Connect → URI o Database → reset password). " +
      "En Windows conviene pegar la URI completa de Session pooler si db.*.supabase.co no resuelve (IPv6)."
    );
  }
  return undefined;
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
❌ Falta DATABASE_URL (no está en .env, ni en .env.local, ni en la variable de entorno DATABASE_URL)

Cómo obtenerla (Supabase, UI actual):
1. Abre tu proyecto en https://supabase.com/dashboard
2. Arriba, botón "Connect" → elige "Direct connection" o "Session pooler" (recomendado si no tienes IPv6) y copia la URI
   O bien: engranaje "Project settings" (abajo del menú lateral) → Database → Connection string / Connection info
3. Sustituye [YOUR-PASSWORD] por la contraseña de la base (URL-encode si tiene @, #, etc.)
4. Añade en la raíz del proyecto, en .env.local (o .env):
   DATABASE_URL=postgresql://...

(No mezcles modo Transaction pooler para migraciones largas sin saberlo; Direct o Session suelen ir bien con este script.)
`);
    const commented = hintIfDatabaseUrlCommented();
    if (commented) console.error(`\n💡 ${commented}\n`);
    process.exit(1);
  }

  const cfgErr = databaseUrlConfigError(databaseUrl);
  if (cfgErr) {
    console.error(`\n❌ ${cfgErr}\n`);
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
  } catch (e: any) {
    const code = e?.code as string | undefined;
    const msg = (e?.message ?? String(e)) as string;
    console.error("\n❌ No se pudo conectar a Postgres.");
    if (
      code === "ENOTFOUND" ||
      /ENOTFOUND|getaddrinfo/i.test(msg)
    ) {
      console.error(`   ${msg}
   Si usas el host "db.<proyecto>.supabase.co" (conexión directa), muchas veces solo hay registro IPv6 y en este equipo Node puede fallar antes de conectar.
   Prueba la URI de "Session pooler" en Supabase → Connect (host tipo aws-0-<región>.pooler.supabase.com, usuario postgres.<ref>, puerto 5432).
   También: internet, VPN y que DATABASE_URL no siga con el literal TU_PASSWORD.`);
    } else if (/Tenant or user not found/i.test(msg)) {
      console.error(`   ${msg}
   Suele indicar usuario/host del pooler distinto al del proyecto: abre Supabase → Connect → Session pooler
   y pega la URI completa (usuario postgres.<ref> y host tipo aws-*-<región>.pooler..., copiados tal cual).
   También revisa la contraseña: un fallo de credenciales a veces se reporta así.`);
    } else if (
      code === "28P01" ||
      /password authentication failed/i.test(msg)
    ) {
      console.error(`   ${msg}
   Contraseña rechazada: usa la de la base en Supabase (Connect / Database), no anon ni service_role.
   Caracteres especiales en la contraseña → codificar en la URL (p. ej. @ como %40).`);
    } else {
      console.error(`   ${msg}`);
    }
    process.exit(1);
  }
  console.log("Conectado a Postgres.");

  const files = [
    ["schema.sql", path.join(process.cwd(), "scripts", "schema.sql")],
    ["002_iteracion2.sql", path.join(process.cwd(), "scripts", "migrations", "002_iteracion2.sql")],
    ["003_rbac.sql", path.join(process.cwd(), "scripts", "migrations", "003_rbac.sql")],
    ["004_rls_roles.sql", path.join(process.cwd(), "scripts", "migrations", "004_rls_roles.sql")],
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

    console.log(`\n→ Post-migración: perfil ADMIN para "${adminEmail}" (si el usuario existe en Auth) ...`);
    const r = await client.query(
      `
INSERT INTO user_profiles (user_id, role_id, nombre_completo, email, activo)
SELECT
  u.id,
  (SELECT id FROM roles WHERE codigo = 'ADMIN' LIMIT 1),
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
