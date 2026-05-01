/**
 * Script para crear usuarios de prueba en Supabase (uno por cada rol).
 * Ejecutar con: npx tsx scripts/create-test-users.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Cargar .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8").split("\n").forEach((line) => {
    const idx = line.indexOf("=");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (key) process.env[key] = val;
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "Aeromanto2025!";

const USERS = [
  { email: "admin@aeromanto.co",      roleCodigo: "ADMIN",      nombre: "Administrador" },
  { email: "ovem@aeromanto.co",       roleCodigo: "OVEM",       nombre: "Conductor OVEM" },
  { email: "regulacion@aeromanto.co", roleCodigo: "REGULACION", nombre: "Regulación" },
  { email: "gerencial@aeromanto.co",  roleCodigo: "GERENCIAL",  nombre: "Gerencial" },
];

let roleCache: Record<string, number> | null = null;

async function loadRoles(): Promise<Record<string, number>> {
  if (roleCache) return roleCache;
  // Fetch directo a REST API (no usa supabase-js para evitar schema cache issue)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/roles?select=id,codigo`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`No se pudo leer roles: ${res.status} ${txt}`);
  }
  const data = (await res.json()) as { id: number; codigo: string }[];
  roleCache = {};
  for (const r of data) roleCache[r.codigo] = r.id;
  return roleCache;
}

async function getRoleId(codigo: string): Promise<number | null> {
  const roles = await loadRoles();
  return roles[codigo] ?? null;
}

async function main() {
  console.log("Verificando conexión...");
  const { error: testError } = await admin.from("roles").select("*", { count: "exact", head: true });
  if (testError) {
    console.error("❌ No se puede conectar a la BD:", testError.message);
    process.exit(1);
  }
  console.log("✅ Conexión OK\n");

  const results: { email: string; rol: string; contrasena: string; estado: string }[] = [];

  for (const u of USERS) {
    process.stdout.write(`Creando ${u.email} (${u.roleCodigo})... `);

    // 1. Crear en Auth
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
    });

    let userId: string;

    if (authError) {
      if (authError.message.toLowerCase().includes("already") || authError.message.includes("registered")) {
        // Usuario ya existe, buscarlo
        const { data: list } = await admin.auth.admin.listUsers();
        const existing = list?.users?.find((x) => x.email === u.email);
        if (!existing) {
          console.log("❌ No se pudo obtener usuario existente");
          results.push({ email: u.email, rol: u.roleCodigo, contrasena: PASSWORD, estado: "Error: " + authError.message });
          continue;
        }
        userId = existing.id;
        console.log("(ya existía) ");
      } else {
        console.log("❌", authError.message);
        results.push({ email: u.email, rol: u.roleCodigo, contrasena: PASSWORD, estado: "Error: " + authError.message });
        continue;
      }
    } else {
      userId = authData.user.id;
    }

    // 2. Obtener role_id
    const roleId = await getRoleId(u.roleCodigo);
    if (!roleId) {
      results.push({ email: u.email, rol: u.roleCodigo, contrasena: PASSWORD, estado: "Error: rol no encontrado" });
      continue;
    }

    // 3. Crear / actualizar perfil
    const { error: profileError } = await admin.from("user_profiles").upsert(
      { user_id: userId, role_id: roleId, nombre_completo: u.nombre, email: u.email, activo: true },
      { onConflict: "user_id" }
    );

    if (profileError) {
      console.log("❌ Error en perfil:", profileError.message);
      results.push({ email: u.email, rol: u.roleCodigo, contrasena: PASSWORD, estado: "Error perfil: " + profileError.message });
    } else {
      console.log("✅");
      results.push({ email: u.email, rol: u.roleCodigo, contrasena: PASSWORD, estado: "✅ Creado" });
    }
  }

  // Tabla resumen
  console.log("\n╔══════════════════════════════╦═════════════╦═══════════════════╗");
  console.log("║ Email                        ║ Rol         ║ Contraseña        ║");
  console.log("╠══════════════════════════════╬═════════════╬═══════════════════╣");
  for (const r of results) {
    const email = r.email.padEnd(28);
    const rol   = r.rol.padEnd(11);
    const pass  = r.contrasena.padEnd(17);
    console.log(`║ ${email} ║ ${rol} ║ ${pass} ║`);
  }
  console.log("╚══════════════════════════════╩═════════════╩═══════════════════╝");
}

main().catch(console.error);
