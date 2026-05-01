/**
 * Verifica tablas roles / user_profiles y el enlace user_id → auth.
 * Uso: npx tsx scripts/verify-user-profiles.ts
 */
import * as fs from "fs";
import * as path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ No existe .env.local");
  process.exit(1);
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function restSelect<T>(table: string, select: string): Promise<T[]> {
  const res = await fetch(
    `${url}/rest/v1/${table}?select=${encodeURIComponent(select)}`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    }
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${table}: ${res.status} ${txt}`);
  }
  return (await res.json()) as T[];
}

async function main() {
  console.log("--- 1) Tablas roles y user_profiles (API REST) ---\n");

  let roles: { id: number; codigo: string; nombre: string }[];
  try {
    roles = await restSelect("roles", "id,codigo,nombre");
  } catch (e: any) {
    console.log("❌ roles:", e.message);
    console.log("\nSi ves PGRST205, ejecuta en Supabase SQL Editor: scripts/migrations/003_rbac.sql");
    process.exit(1);
  }

  let profiles: {
    id: number;
    user_id: string;
    role_id: number;
    email: string | null;
    nombre_completo: string | null;
    activo: boolean;
  }[];
  try {
    profiles = await restSelect(
      "user_profiles",
      "id,user_id,role_id,email,nombre_completo,activo"
    );
  } catch (e: any) {
    console.log("❌ user_profiles:", e.message);
    console.log("\nSi ves PGRST205, ejecuta en Supabase SQL Editor: scripts/migrations/003_rbac.sql");
    process.exit(1);
  }

  console.log("✅ Lectura de public.roles OK");
  console.log("✅ Lectura de public.user_profiles OK");

  roles.sort((a, b) => a.codigo.localeCompare(b.codigo));
  profiles.sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));

  console.log("\n--- 2) Catálogo de roles (no tienen columna activo en el esquema) ---\n");
  console.log(`Filas en roles: ${roles?.length ?? 0}`);
  for (const r of roles || []) {
    console.log(`  • ${r.codigo} (id=${r.id}) — ${r.nombre}`);
  }

  const roleById = new Map((roles || []).map((r) => [r.id, r.codigo]));

  console.log("\n--- 3) Perfiles de usuario (activo = usuario habilitado en la app) ---\n");
  if (!profiles?.length) {
    console.log("⚠️  No hay filas en user_profiles. Crea usuarios en Auth y enlázalos aquí.");
  } else {
    let inactivos = 0;
    for (const p of profiles) {
      const cod = roleById.get(p.role_id) ?? "??? (role_id inválido)";
      const a = p.activo === true ? "activo" : "INACTIVO";
      if (p.activo !== true) inactivos++;
      console.log(
        `  • ${p.email ?? "(sin email)"} | user_id=${p.user_id} | rol=${cod} | ${a}`
      );
    }
    if (inactivos > 0) {
      console.log(`\n⚠️  ${inactivos} perfil(es) con activo distinto de true (la app redirige a /pending).`);
    }
  }

  console.log("\n--- 4) Resumen ---\n");
  console.log(
    `Usuarios en user_profiles: ${profiles?.length ?? 0} | Roles definidos: ${roles?.length ?? 0}`
  );
  console.log(
    "\nNota: \"activo\" en roles no aplica; solo user_profiles.activo controla si el usuario puede entrar."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
