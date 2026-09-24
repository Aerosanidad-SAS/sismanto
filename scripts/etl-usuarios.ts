/**
 * ETL de usuarios SISRES → SISMANTO (Supabase Auth + user_profiles).
 *
 * Uso:
 *   npx tsx scripts/etl-usuarios.ts <usuarios.csv>            ensayo: NO escribe nada, solo muestra el plan y el reporte
 *   npx tsx scripts/etl-usuarios.ts <usuarios.csv> --crear    crea los usuarios (necesita SUPABASE_SERVICE_ROLE_KEY)
 *
 * El CSV sale de la tabla `usuarios` de SISRES (columnas: id, usuario, identificacion, nombre1, nombre2, apellido1,
 * apellido2, cargo, correo, ciudad, estado; el resto se ignora). NO se lee la columna de contraseñas.
 *
 * - Requiere la migración 076 (roles TECNICO/AEROPUERTO) aplicada en la base de destino.
 * - Las contraseñas no se migran: cada usuario recibe una clave aleatoria que nadie ve. Entra por «olvidé mi contraseña».
 *   Este script NO envía correos: avisar a 190 personas es una decisión de León (fecha, texto), no un efecto lateral.
 * - Idempotente: quien ya tiene perfil (mismo correo o cédula) se omite y no se le toca el rol.
 * - Reportes (`etl-usuarios-omitidos.csv`, `etl-usuarios-fallidos.csv`) junto al CSV de entrada: tienen datos personales,
 *   no subirlos a git.
 */
import * as fs from "fs";
import * as path from "path";
import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { aCsv, crearUsuarios, parseCsvUsuarios, planificarUsuarios, type PuertoUsuarios } from "../src/lib/etl-usuarios";

function cargarEnv(ruta: string) {
  if (!fs.existsSync(ruta)) return;
  for (const linea of fs.readFileSync(ruta, "utf-8").split(/\r?\n/)) {
    const i = linea.indexOf("=");
    if (i > 0 && !linea.trim().startsWith("#")) {
      const k = linea.slice(0, i).trim();
      if (k && process.env[k] === undefined) process.env[k] = linea.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const archivo = args.find((a) => !a.startsWith("--"));
  const crear = args.includes("--crear");
  if (!archivo || !fs.existsSync(archivo)) {
    console.error("Uso: npx tsx scripts/etl-usuarios.ts <usuarios.csv> [--crear]");
    process.exit(1);
  }
  const dir = path.dirname(path.resolve(archivo));

  const filas = parseCsvUsuarios(fs.readFileSync(archivo, "utf-8"));
  const plan = planificarUsuarios(filas);
  console.log(`Leídos ${filas.length} usuarios de SISRES → a crear: ${plan.crear.length}, omitidos: ${plan.omitidos.length}`);
  const porRol = new Map<string, number>();
  for (const u of plan.crear) porRol.set(u.rol, (porRol.get(u.rol) ?? 0) + 1);
  console.log("Por rol:", Object.fromEntries(porRol));
  const porMotivo = new Map<string, number>();
  for (const o of plan.omitidos) porMotivo.set(o.motivo.replace(/[0-9]+/g, "N").replace(/: .*/, ""), (porMotivo.get(o.motivo.replace(/[0-9]+/g, "N").replace(/: .*/, "")) ?? 0) + 1);
  console.log("Omitidos por motivo:", Object.fromEntries(porMotivo));

  const escribirOmitidos = (omitidos: typeof plan.omitidos) => {
    const ruta = path.join(dir, "etl-usuarios-omitidos.csv");
    fs.writeFileSync(
      ruta,
      aCsv(["motivo", "id_sisres", "cedula", "correo", "cargo", "estado"], omitidos.map((o) => [o.motivo, o.fila.id ?? "", o.fila.usuario ?? "", o.fila.correo ?? "", o.fila.cargo ?? "", o.fila.estado ?? ""])),
      "utf-8"
    );
    console.log(`📝 ${path.basename(ruta)}: ${omitidos.length} filas`);
  };

  if (!crear) {
    escribirOmitidos(plan.omitidos);
    console.log("\nEnsayo: no se escribió nada en la base. Para crear los usuarios: agregar --crear");
    return;
  }

  cargarEnv(path.join(process.cwd(), ".env.local"));
  cargarEnv(path.join(process.cwd(), ".env"));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno (.env.local).");
    process.exit(1);
  }
  const admin = createClient(url, clave, { auth: { autoRefreshToken: false, persistSession: false } });

  const puerto: PuertoUsuarios = {
    yaExiste: async (email, cedula) => {
      const { data } = await admin.from("user_profiles").select("email, cedula").or(`email.ilike.${email},cedula.eq.${cedula}`).limit(1);
      const p = (data ?? [])[0] as { email: string | null; cedula: string | null } | undefined;
      if (!p) return null;
      return p.cedula === cedula ? `cédula ${cedula}` : `correo ${email}`;
    },
    rolId: async (codigo) => {
      const { data } = await admin.from("roles").select("id").eq("codigo", codigo).maybeSingle();
      return (data as { id: number } | null)?.id ?? null;
    },
    crearAuth: async (email, password) => {
      const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      return error || !data.user ? { error: error?.message ?? "sin usuario" } : { id: data.user.id };
    },
    crearPerfil: async ({ userId, roleId, u }) => {
      const { error } = await admin.from("user_profiles").insert({
        user_id: userId, role_id: roleId, nombre_completo: u.nombre, email: u.email, cedula: u.cedula, ciudad: u.ciudad, activo: true,
      } as never);
      return error?.message ?? null;
    },
    borrarAuth: async (id) => {
      await admin.auth.admin.deleteUser(id);
    },
    claveAleatoria: () => randomBytes(24).toString("base64url"),
  };

  const res = await crearUsuarios(plan, puerto);
  console.log(`\n✅ Creados: ${res.creados.length} | omitidos: ${res.omitidos.length} | fallidos: ${res.fallidos.length}`);
  escribirOmitidos(res.omitidos);
  if (res.fallidos.length > 0) {
    const ruta = path.join(dir, "etl-usuarios-fallidos.csv");
    fs.writeFileSync(ruta, aCsv(["id_sisres", "correo", "rol", "error"], res.fallidos.map((f) => [f.usuario.sisresId, f.usuario.email, f.usuario.rol, f.error])), "utf-8");
    console.log(`📝 ${path.basename(ruta)}: ${res.fallidos.length} filas`);
    process.exitCode = 2;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
