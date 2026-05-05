/**
 * Establece la misma contraseña en usuarios Auth (lista QA por defecto).
 * Requiere SUPABASE_SERVICE_ROLE_KEY y NEXT_PUBLIC_SUPABASE_URL en .env.local
 *
 * Uso (desde la raíz del repo):
 *   npx tsx scripts/set-auth-passwords.ts aero123
 *
 * Solo los correos QA de scripts/qa-test-users.sql:
 *   npx tsx scripts/set-auth-passwords.ts aero123
 *
 * Todos los usuarios del proyecto (¡cuidado en producción!):
 *   npx tsx scripts/set-auth-passwords.ts aero123 --all
 */
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

const QA_EMAILS = [
  "admin@aeromanto.co",
  "innovizar@aerosanidadsas.com",
  "gerencial@aeromanto.co",
  "ovem@aeromanto.co",
  "regulacion@aeromanto.co",
] as const;

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

async function listAllUsers(admin: ReturnType<typeof createClient>) {
  const out: { id: string; email: string | undefined }[] = [];
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data.users;
    for (const u of users) {
      if (u.email) out.push({ id: u.id, email: u.email });
    }
    if (users.length < perPage) break;
    page += 1;
  }
  return out;
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const argv = process.argv.slice(2).filter((a) => a !== "--all");
  const allUsers = process.argv.includes("--all");
  const password = argv[0];

  if (!password || password.length < 6) {
    console.error("Uso: npx tsx scripts/set-auth-passwords.ts <contraseña_mín_6_caracteres> [--all]");
    process.exit(1);
  }
  if (!url || !serviceKey) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const targets = allUsers
    ? (await listAllUsers(admin)).map((u) => u.id)
    : (
        await listAllUsers(admin)
      )
        .filter((u) => {
          if (!u.email) return false;
          const e = u.email.toLowerCase();
          return (QA_EMAILS as readonly string[]).includes(e);
        })
        .map((u) => u.id);

  if (!allUsers && targets.length === 0) {
    console.error("No se encontraron usuarios QA por email. ¿Existen en Auth? Usa --all si quieres todos.");
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;
  for (const id of targets) {
    const { error } = await admin.auth.admin.updateUserById(id, {
      password,
      email_confirm: true,
    });
    if (error) {
      console.error(`Error ${id}:`, error.message);
      fail += 1;
    } else {
      ok += 1;
    }
  }

  console.log(`Listo. Actualizados: ${ok}. Fallos: ${fail}.`);
  if (!allUsers) {
    console.log("Solo emails QA. Para todos los usuarios añade --all");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
