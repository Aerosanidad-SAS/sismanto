/**
 * ETL de la bitácora de SISRES (`log_sistema`) → `audit_log` de SISMANTO.
 *
 * Uso:
 *   npx tsx scripts/etl-bitacora.ts <log.csv>             ensayo: carga todo dentro de una transacción y la REVIERTE
 *   npx tsx scripts/etl-bitacora.ts <log.csv> --cargar    carga de verdad (DATABASE_URL en .env.local)
 *
 * El CSV sale de MySQL con el nombre del actor ya resuelto (así no hace falta cargar la tabla de usuarios aquí).
 * OJO: la tabla `usuarios` de SISRES tiene cédulas repetidas y 8 usuarios con cédula 0; un JOIN simple DUPLICA entradas
 * (comprobado: 19.932 filas en vez de 19.302), por eso el nombre va en una subconsulta de UNA fila:
 *   SELECT l.id, l.fecha_hora, l.usuario, l.cargo, l.accion, l.tabla, l.registro_id, l.detalle, l.ip,
 *          (SELECT TRIM(CONCAT_WS(' ', u.nombre1, u.nombre2, u.apellido1, u.apellido2)) FROM usuarios u
 *            WHERE u.usuario = l.usuario AND u.usuario <> 0 ORDER BY (u.estado = 1) DESC, u.id LIMIT 1) AS nombre
 *   FROM log_sistema l ORDER BY l.id;
 * (Comprobar que el CSV tiene tantas filas como `SELECT COUNT(*) FROM log_sistema`.)
 *
 * - Requiere las migraciones 077 y 081 aplicadas.
 * - Idempotente: (origen='SISRES', origen_id) es único; una segunda corrida no duplica.
 * - Hora: SISRES guarda hora de Colombia sin zona; se convierte con America/Bogota.
 * - `user_id` se enlaza por cédula con `user_profiles.cedula` (rellenada por el ETL de usuarios); si no está, queda nulo y el
 *   nombre del actor se conserva igual en `user_label`.
 * - El reporte de rechazos (`etl-bitacora-rechazadas.csv`) queda junto al CSV; puede tener datos personales: no subirlo a git.
 */
import * as fs from "fs";
import * as path from "path";
import pg from "pg";
import { parseCsv, aCsv } from "../src/lib/csv";
import { planificarBitacora, type EntradaImportada } from "../src/lib/etl-bitacora";

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

const LOTE = 500;
const COLUMNAS = 11;

/** INSERT multi-fila con ON CONFLICT DO NOTHING; devuelve cuántas filas entraron de verdad. */
export async function insertarLote(client: pg.ClientBase, lote: EntradaImportada[], usuarios: Map<string, string>): Promise<number> {
  const params: unknown[] = [];
  const valores = lote.map((e, i) => {
    const b = i * COLUMNAS;
    params.push(e.fechaLocal, usuarios.get(e.cedula) ?? null, e.label, e.role, e.action, e.entity, e.entityId, e.detail, e.ip, "SISRES", e.origenId);
    return `(($${b + 1}::timestamp AT TIME ZONE 'America/Bogota'), $${b + 2}::uuid, $${b + 3}, $${b + 4}, $${b + 5}, $${b + 6}, $${b + 7}, $${b + 8}, $${b + 9}, $${b + 10}, $${b + 11}::bigint)`;
  });
  const r = await client.query(
    `INSERT INTO audit_log (at, user_id, user_label, role, action, entity, entity_id, detail, ip, origen, origen_id)
     VALUES ${valores.join(",")} ON CONFLICT (origen, origen_id) WHERE origen_id IS NOT NULL DO NOTHING`,
    params
  );
  return r.rowCount ?? 0;
}

async function main() {
  const args = process.argv.slice(2);
  const archivo = args.find((a) => !a.startsWith("--"));
  const cargar = args.includes("--cargar");
  if (!archivo || !fs.existsSync(archivo)) {
    console.error("Uso: npx tsx scripts/etl-bitacora.ts <log.csv> [--cargar]");
    process.exit(1);
  }
  const filas = parseCsv(fs.readFileSync(archivo, "utf-8"));
  const plan = planificarBitacora(filas);
  console.log(`Leídas ${filas.length} entradas de SISRES → a cargar: ${plan.cargar.length}, rechazadas: ${plan.rechazadas.length}`);
  if (plan.rechazadas.length > 0) {
    const ruta = path.join(path.dirname(path.resolve(archivo)), "etl-bitacora-rechazadas.csv");
    fs.writeFileSync(ruta, aCsv(["motivo", "id", "fecha_hora", "usuario", "accion", "tabla"], plan.rechazadas.map((r) => [r.motivo, r.fila.id ?? "", r.fila.fecha_hora ?? "", r.fila.usuario ?? "", r.fila.accion ?? "", r.fila.tabla ?? ""])), "utf-8");
    console.log(`📝 ${path.basename(ruta)}: ${plan.rechazadas.length} filas`);
  }

  cargarEnv(path.join(process.cwd(), ".env.local"));
  cargarEnv(path.join(process.cwd(), ".env"));
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Falta DATABASE_URL en .env.local (el ensayo también valida contra la base real).");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ cedula: string; user_id: string }>("SELECT cedula, user_id FROM user_profiles WHERE cedula IS NOT NULL");
    const usuarios = new Map(rows.map((r) => [r.cedula, r.user_id]));
    let nuevas = 0;
    for (let i = 0; i < plan.cargar.length; i += LOTE) nuevas += await insertarLote(client, plan.cargar.slice(i, i + LOTE), usuarios);
    const yaEstaban = plan.cargar.length - nuevas;
    const enlazadas = plan.cargar.filter((e) => usuarios.has(e.cedula)).length;
    console.log(`Nuevas: ${nuevas} | ya estaban: ${yaEstaban} | con usuario enlazado: ${enlazadas}/${plan.cargar.length}`);
    if (cargar) {
      await client.query("COMMIT");
      console.log("✅ Cargado.");
    } else {
      await client.query("ROLLBACK");
      console.log("Ensayo: se revirtió, no quedó nada escrito. Para cargar de verdad: agregar --cargar");
    }
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await client.end();
  }
}

if (process.argv[1] && /etl-bitacora/.test(process.argv[1])) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
