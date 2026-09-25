/**
 * Crea (o actualiza) un usuario de prueba por rol para el selector "Ver como…" (src/app/api/actions/role-switcher.ts).
 *
 * Los usuarios son `test.<rol>@sismanto.test`: sin contraseña y sin buzón, marcados con `app_metadata.role_switch_test`
 * (el propio usuario no puede editar app_metadata). Solo se entra a ellos desde el selector, siendo ADMIN.
 *
 * Solo corre contra el proyecto de staging. Idempotente.
 * Uso: npm run db:seed-role-users   (requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local)
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { ROLES_POR_CENTRO } from "../src/lib/auth-utils";
import { ROLES_SELECTOR, testEmailForRole } from "../src/lib/role-switcher";

const STAGING_REF = "oanbqlfvdmdpckrcwfqi";
const CENTRO_POR_DEFECTO = "CRA_MEDELLIN";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i > 0) {
      const k = line.slice(0, i).trim();
      if (k && !line.trim().startsWith("#")) process.env[k] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (process.env.VERCEL_ENV === "production") {
  console.error("❌ No se siembran usuarios de prueba en producción.");
  process.exit(1);
}
if (!SUPABASE_URL.includes(STAGING_REF)) {
  console.error(`❌ NEXT_PUBLIC_SUPABASE_URL no apunta al proyecto de staging (${STAGING_REF}). Nada se escribió.`);
  process.exit(1);
}
if (!SERVICE_ROLE_KEY) {
  console.error("❌ Falta SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findAuthUserId(email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) return found.id;
    if (data.users.length < 1000) return null;
  }
  return null;
}

function nombreDeRol(rol: string): string {
  return `[TEST] ${rol.charAt(0)}${rol.slice(1).toLowerCase().replace(/_/g, " ")}`;
}

async function main() {
  const { data: roles, error: rolesError } = await admin.from("roles").select("id, codigo");
  if (rolesError) throw new Error(`No se pudo leer roles: ${rolesError.message}`);
  const roleId = new Map((roles ?? []).map((r) => [r.codigo as string, r.id as number]));

  const { data: centro } = await admin.from("operational_centers").select("id").eq("codigo", CENTRO_POR_DEFECTO).maybeSingle();
  const centroId = (centro as { id: number } | null)?.id ?? null;
  if (!centroId) console.warn(`⚠ No se encontró el centro ${CENTRO_POR_DEFECTO}: los roles por centro quedarán sin centro.`);

  let fallos = 0;
  for (const rol of ROLES_SELECTOR) {
    const email = testEmailForRole(rol);
    process.stdout.write(`${rol.padEnd(20)} ${email.padEnd(42)} `);
    try {
      const rid = roleId.get(rol);
      if (!rid) throw new Error("el rol no existe en la tabla roles");

      let userId = await findAuthUserId(email);
      if (userId) {
        const { error } = await admin.auth.admin.updateUserById(userId, {
          email_confirm: true,
          app_metadata: { role_switch_test: true },
        });
        if (error) throw error;
      } else {
        const { data, error } = await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          app_metadata: { role_switch_test: true },
        });
        if (error || !data.user) throw error ?? new Error("no se creó el usuario");
        userId = data.user.id;
      }

      const { error: perfilError } = await admin.from("user_profiles").upsert(
        {
          user_id: userId,
          role_id: rid,
          nombre_completo: nombreDeRol(rol),
          email,
          activo: true,
          operational_center_id: ROLES_POR_CENTRO.includes(rol) ? centroId : null,
        },
        { onConflict: "user_id" }
      );
      if (perfilError) throw perfilError;
      console.log("✅");
    } catch (e) {
      fallos++;
      console.log("❌", e instanceof Error ? e.message : e);
    }
  }
  console.log(fallos ? `\n${fallos} rol(es) con error.` : `\n✅ ${ROLES_SELECTOR.length} usuarios de prueba al día.`);
  if (fallos) process.exit(1);
}

main().catch((e) => {
  console.error("❌", e instanceof Error ? e.message : e);
  process.exit(1);
});
