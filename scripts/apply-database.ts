/**
 * Aplica migraciones en orden usando la tabla schema_migrations como tracker.
 *
 * Primera ejecución en una DB existente: crea el tracker y marca las migraciones
 * ya aplicadas sin re-ejecutarlas. Las nuevas se ejecutan y se registran.
 *
 * Requiere DATABASE_URL en .env.local o .env.
 * Uso: npm run db:apply
 */
import * as fs from "fs";
import * as path from "path";
import pg from "pg";

// ─── Migraciones en orden canónico ───────────────────────────────────────────
// Excluidos permanentemente:
//   004_reserved_rls.sql        → placeholder vacío, reemplazado por 004_rls_roles.sql
//   013_coordinacion_role_access.sql → duplicado parcial de 013_coordinacion_capacitaciones.sql
//   018_kia_picanto_bogota.sql  → SUPERSEDED (Kia Picanto no son vehículos de flota)
//   021_reset_fuel_logs_manual_reload.sql → TRUNCATE destructivo, no repetir
const MIGRATIONS: { name: string; file: string }[] = [
  { name: "schema.sql",                              file: "scripts/schema.sql" },
  { name: "002_iteracion2.sql",                      file: "scripts/migrations/002_iteracion2.sql" },
  { name: "003_rbac.sql",                            file: "scripts/migrations/003_rbac.sql" },
  { name: "004_rls_roles.sql",                       file: "scripts/migrations/004_rls_roles.sql" },
  { name: "005_maintenance_items_checklist.sql",     file: "scripts/migrations/005_maintenance_items_checklist.sql" },
  { name: "006_mantenimiento_flota_ovem.sql",        file: "scripts/migrations/006_mantenimiento_flota_ovem.sql" },
  { name: "007_daily_check_items_cantidad_ok.sql",   file: "scripts/migrations/007_daily_check_items_cantidad_ok.sql" },
  { name: "008_fleet_vencimientos_checklist.sql",    file: "scripts/migrations/008_fleet_vencimientos_checklist.sql" },
  { name: "009_vehicle_fds_desde.sql",               file: "scripts/migrations/009_vehicle_fds_desde.sql" },
  { name: "010_vehicle_status_history.sql",          file: "scripts/migrations/010_vehicle_status_history.sql" },
  { name: "011_suppliers_fields.sql",                file: "scripts/migrations/011_suppliers_fields.sql" },
  { name: "012_preventive_maintenance_plan.sql",     file: "scripts/migrations/012_preventive_maintenance_plan.sql" },
  { name: "013_coordinacion_capacitaciones.sql",     file: "scripts/migrations/013_coordinacion_capacitaciones.sql" },
  { name: "015_vencimientos_soat_tecnicomecanica.sql", file: "scripts/migrations/015_vencimientos_soat_tecnicomecanica.sql" },
  { name: "016_historial_mantenimientos.sql",        file: "scripts/migrations/016_historial_mantenimientos.sql" },
  { name: "017_historial_combustible.sql",           file: "scripts/migrations/017_historial_combustible.sql" },
  { name: "019_security_perf_hardening.sql",         file: "scripts/migrations/019_security_perf_hardening.sql" },
  { name: "020_reference_spark_2021.sql",            file: "scripts/migrations/020_reference_spark_2021.sql" },
  { name: "022_vehicle_specs_required.sql",          file: "scripts/migrations/022_vehicle_specs_required.sql" },
  { name: "023_normalize_placas.sql",               file: "scripts/migrations/023_normalize_placas.sql" },
  { name: "024_maintenance_valor_review.sql",        file: "scripts/migrations/024_maintenance_valor_review.sql" },
  { name: "025_invoice_jobs.sql",                    file: "scripts/migrations/025_invoice_jobs.sql" },
  { name: "028_costos_fijos_reales.sql",             file: "scripts/migrations/028_costos_fijos_reales.sql" },
  { name: "029_schema_migrations_rls.sql",           file: "scripts/migrations/029_schema_migrations_rls.sql" },
  { name: "030_fuel_logs_numero_venta.sql",          file: "scripts/migrations/030_fuel_logs_numero_venta.sql" },
  { name: "031_vehiculos_ivk968_lqw155.sql",         file: "scripts/migrations/031_vehiculos_ivk968_lqw155.sql" },
  { name: "032_rtm_historico.sql",                   file: "scripts/migrations/032_rtm_historico.sql" },
  { name: "033_rtm_solo_desde_2024.sql",             file: "scripts/migrations/033_rtm_solo_desde_2024.sql" },
  { name: "034_corregir_historial_fds.sql",          file: "scripts/migrations/034_corregir_historial_fds.sql" },
  // ─── Integración SISRES (PLAN_INTEGRACION_SISRES.md) ──────────────────────
  { name: "035_sisres_roles.sql",                    file: "scripts/migrations/035_sisres_roles.sql" },
  { name: "036_vehicles_campos_sisres.sql",          file: "scripts/migrations/036_vehicles_campos_sisres.sql" },
  { name: "037_sisres_clientes_cie10.sql",           file: "scripts/migrations/037_sisres_clientes_cie10.sql" },
  { name: "038_sisres_pacientes.sql",                file: "scripts/migrations/038_sisres_pacientes.sql" },
  { name: "039_sisres_servicios_valoraciones.sql",   file: "scripts/migrations/039_sisres_servicios_valoraciones.sql" },
  { name: "040_sisres_inventario_biomedico.sql",     file: "scripts/migrations/040_sisres_inventario_biomedico.sql" },
  { name: "041_sisres_campanas.sql",                 file: "scripts/migrations/041_sisres_campanas.sql" },
  { name: "042_centro_operativo_ado.sql",             file: "scripts/migrations/042_centro_operativo_ado.sql" },
  { name: "043_user_profiles_cedula.sql",              file: "scripts/migrations/043_user_profiles_cedula.sql" },
  { name: "044_enum_centro_operativo_ado.sql",          file: "scripts/migrations/044_enum_centro_operativo_ado.sql" },
  { name: "045_etapa_servicio_no_efectivo_duplicado.sql", file: "scripts/migrations/045_etapa_servicio_no_efectivo_duplicado.sql" },
  { name: "046_analista_paridad_admin.sql",               file: "scripts/migrations/046_analista_paridad_admin.sql" },
  { name: "047_analista_paridad_admin_core.sql",          file: "scripts/migrations/047_analista_paridad_admin_core.sql" },
  { name: "048_patients_tipo_documento_catalogo.sql",     file: "scripts/migrations/048_patients_tipo_documento_catalogo.sql" },
  { name: "049_incidents_cierre_manual.sql",              file: "scripts/migrations/049_incidents_cierre_manual.sql" },
  { name: "050_servicios_tripulacion_y_campos.sql",       file: "scripts/migrations/050_servicios_tripulacion_y_campos.sql" },
  { name: "051_vehicle_assignments_rol_en_turno.sql",     file: "scripts/migrations/051_vehicle_assignments_rol_en_turno.sql" },
  { name: "052_user_profiles_ciudad.sql",                 file: "scripts/migrations/052_user_profiles_ciudad.sql" },
  { name: "053_medical_services_rls_tripulacion.sql",     file: "scripts/migrations/053_medical_services_rls_tripulacion.sql" },
  { name: "054_revertir_delete_analista.sql",             file: "scripts/migrations/054_revertir_delete_analista.sql" },
  { name: "055_candado_finalizado_auditoria.sql",         file: "scripts/migrations/055_candado_finalizado_auditoria.sql" },
  { name: "056_company_settings_branding.sql",            file: "scripts/migrations/056_company_settings_branding.sql" },
  { name: "057_paridad_estricta_servicios_sisres.sql",    file: "scripts/migrations/057_paridad_estricta_servicios_sisres.sql" },
  { name: "058_etl_identidad_origen.sql",                 file: "scripts/migrations/058_etl_identidad_origen.sql" },
  { name: "059_centro_operativo_servicios.sql",          file: "scripts/migrations/059_centro_operativo_servicios.sql" },
  { name: "060_ovem_turno.sql",                          file: "scripts/migrations/060_ovem_turno.sql" },
  { name: "061_dotacion_auxiliares.sql",                 file: "scripts/migrations/061_dotacion_auxiliares.sql" },
  // 062_dotacion_catalogo.sql: se registra cuando esté la lista real de dotación.
  { name: "063_servicios_lista_regulacion.sql",          file: "scripts/migrations/063_servicios_lista_regulacion.sql" },
  { name: "064_notificaciones_vencimientos.sql",         file: "scripts/migrations/064_notificaciones_vencimientos.sql" },
  { name: "068_valoraciones_activo.sql",                   file: "scripts/migrations/068_valoraciones_activo.sql" },
  { name: "069_aeropuertos_aerolineas.sql",                file: "scripts/migrations/069_aeropuertos_aerolineas.sql" },
  { name: "075_valoraciones_correo.sql",                   file: "scripts/migrations/075_valoraciones_correo.sql" },
  { name: "070_formatos_ti_acta_entrega.sql",              file: "scripts/migrations/070_formatos_ti_acta_entrega.sql" },
  { name: "071_formatos_ti_diagnostico.sql",               file: "scripts/migrations/071_formatos_ti_diagnostico.sql" },
  { name: "072_formatos_ti_baja.sql",                      file: "scripts/migrations/072_formatos_ti_baja.sql" },
  { name: "073_formatos_ti_prestamo.sql",                  file: "scripts/migrations/073_formatos_ti_prestamo.sql" },
  { name: "074_formatos_ti_firma_remota.sql",              file: "scripts/migrations/074_formatos_ti_firma_remota.sql" },
  { name: "065_biomedico_vencimiento_parche.sql",        file: "scripts/migrations/065_biomedico_vencimiento_parche.sql" },
  { name: "066_biomedical_alerts_log.sql",               file: "scripts/migrations/066_biomedical_alerts_log.sql" },
  { name: "067_biomedical_especificaciones_100.sql",     file: "scripts/migrations/067_biomedical_especificaciones_100.sql" },
  { name: "065_tickets_soporte.sql",                     file: "scripts/migrations/065_tickets_soporte.sql" },
  { name: "066_tickets_gestion.sql",                     file: "scripts/migrations/066_tickets_gestion.sql" },
  { name: "067_tickets_config_indicadores.sql",          file: "scripts/migrations/067_tickets_config_indicadores.sql" },
  { name: "077_audit_log.sql",                             file: "scripts/migrations/077_audit_log.sql" },
  { name: "081_audit_log_origen.sql",                     file: "scripts/migrations/081_audit_log_origen.sql" },
  { name: "082_audit_log_exportar.sql",                   file: "scripts/migrations/082_audit_log_exportar.sql" },
  { name: "076_roles_tecnico_aeropuerto.sql",              file: "scripts/migrations/076_roles_tecnico_aeropuerto.sql" },
  { name: "080_captacion_aeroportuaria.sql",             file: "scripts/migrations/080_captacion_aeroportuaria.sql" },
  { name: "081_sispro_catalogos.sql",                    file: "scripts/migrations/081_sispro_catalogos.sql" },
];

// ─── Env loading ──────────────────────────────────────────────────────────────
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

function hintIfDatabaseUrlCommented(): string | undefined {
  const root = process.cwd();
  for (const name of [".env.local", ".env"] as const) {
    const filePath = path.join(root, name);
    if (!fs.existsSync(filePath)) continue;
    for (const line of fs.readFileSync(filePath, "utf-8").split(/\r?\n/)) {
      if (/^\s*#\s*DATABASE_URL\s*=/.test(line)) {
        return `En ${name} la línea DATABASE_URL está comentada. Quita el # y reemplaza el placeholder por la contraseña real.`;
      }
    }
  }
  return undefined;
}

function databaseUrlConfigError(url: string): string | undefined {
  if (/\bTU_PASSWORD\b|\[YOUR-PASSWORD\]/i.test(url)) {
    return (
      "DATABASE_URL tiene un marcador de contraseña. " +
      "Reemplázalo por la contraseña real en Supabase (Connect → URI)."
    );
  }
  return undefined;
}

// ─── Tracker ─────────────────────────────────────────────────────────────────
async function ensureTracker(client: pg.Client): Promise<boolean> {
  const { rows } = await client.query<{ exists: boolean }>(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'schema_migrations'
    ) AS exists
  `);
  const existed = rows[0]?.exists ?? false;

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  return existed; // false = primera vez (necesita seed)
}

async function hasExistingSchema(client: pg.Client): Promise<boolean> {
  const { rows } = await client.query<{ exists: boolean }>(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'vehicles'
    ) AS exists
  `);
  return rows[0]?.exists ?? false;
}

async function isApplied(client: pg.Client, name: string): Promise<boolean> {
  const { rows } = await client.query(
    "SELECT 1 FROM public.schema_migrations WHERE name = $1",
    [name]
  );
  return rows.length > 0;
}

async function markApplied(client: pg.Client, name: string) {
  await client.query(
    "INSERT INTO public.schema_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING",
    [name]
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  loadEnv();
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error(`
❌ Falta DATABASE_URL (no está en .env, .env.local, ni en la variable de entorno)

Cómo obtenerla (Supabase):
1. Abre tu proyecto → botón "Connect"
2. Elige "Session pooler" y copia la URI
3. En .env.local: DATABASE_URL=postgresql://...
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
    ssl: process.env.DATABASE_SSL === "off" ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
  } catch (e: any) {
    const code = e?.code as string | undefined;
    const msg = (e?.message ?? String(e)) as string;
    console.error("\n❌ No se pudo conectar a Postgres.");
    if (code === "ENOTFOUND" || /ENOTFOUND|getaddrinfo/i.test(msg)) {
      console.error(`   ${msg}
   Prueba la URI de "Session pooler" en Supabase → Connect (host tipo aws-0-<región>.pooler.supabase.com).`);
    } else if (/Tenant or user not found/i.test(msg)) {
      console.error(`   ${msg}
   Abre Supabase → Connect → Session pooler y pega la URI completa.`);
    } else if (code === "28P01" || /password authentication failed/i.test(msg)) {
      console.error(`   ${msg}
   Contraseña rechazada. Caracteres especiales en la contraseña deben estar URL-encoded.`);
    } else {
      console.error(`   ${msg}`);
    }
    process.exit(1);
  }

  console.log("✓ Conectado a Postgres\n");

  const trackerExisted = await ensureTracker(client);

  if (!trackerExisted) {
    // El tracker no existía. Dos escenarios posibles:
    //  a) DB ya tiene el esquema aplicado (p.ej. producción) sin el tracker → sembrar sin re-ejecutar.
    //  b) DB recién creada y completamente vacía (p.ej. nuevo proyecto Supabase de staging)
    //     → sembrar la marcaría como "al día" sin haber corrido ni una migración.
    if (await hasExistingSchema(client)) {
      console.log("ℹ  Tracker nuevo detectado — sembrando migraciones previas como ya aplicadas...");
      for (const m of MIGRATIONS) {
        await markApplied(client, m.name);
      }
      console.log(`   ${MIGRATIONS.length} migraciones marcadas. Futuras migraciones se ejecutarán normalmente.\n`);

      // Igual ejecutamos el bloque de ADMIN por si acaso (idempotente).
      await ensureAdminProfile(client);
      console.log("\n✅ Tracker inicializado.");
      await client.end();
      return;
    }

    console.log("ℹ  Base de datos vacía detectada — se ejecutarán todas las migraciones desde cero.\n");
    // No hacemos return: cae al loop normal de abajo, que aplicará las 29 migraciones en orden.
  }

  // Ejecución normal: aplicar solo las pendientes
  let applied = 0;
  let skipped = 0;

  for (const m of MIGRATIONS) {
    if (await isApplied(client, m.name)) {
      console.log(`  ⏭  ${m.name}`);
      skipped++;
      continue;
    }

    const filePath = path.join(process.cwd(), m.file);
    if (!fs.existsSync(filePath)) {
      console.error(`\n❌ Archivo no encontrado: ${filePath}`);
      await client.end();
      process.exit(1);
    }

    const sql = fs.readFileSync(filePath, "utf-8");
    console.log(`  →  Aplicando: ${m.name} ...`);
    try {
      await client.query(sql);
      await markApplied(client, m.name);
      console.log(`  ✓  ${m.name}`);
      applied++;
    } catch (e: any) {
      console.error(`\n❌ Error en ${m.name}:\n   ${e.message}`);
      await client.end();
      process.exit(1);
    }
  }

  console.log(`\n  ${applied} aplicadas, ${skipped} ya al día.`);

  await ensureAdminProfile(client);

  console.log("\n✅ Base de datos al día.\n");
  await client.end();
}

async function ensureAdminProfile(client: pg.Client) {
  const adminEmail =
    process.env.ADMIN_SETUP_EMAIL?.trim() || "innovizar@aerosanidadsas.com";

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
  role_id        = EXCLUDED.role_id,
  nombre_completo = EXCLUDED.nombre_completo,
  email          = EXCLUDED.email,
  activo         = true,
  updated_at     = NOW()
`,
    [adminEmail]
  );

  if ((r.rowCount ?? 0) > 0) {
    console.log(`\n  ✓ Perfil ADMIN actualizado para "${adminEmail}"`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
