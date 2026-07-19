/**
 * ETL SISRES (MySQL) → Aeromanto (Postgres/Supabase) — Fase 6 del plan.
 *
 * No se conecta a MySQL: consume CSVs exportados por tabla (phpMyAdmin →
 * Exportar → CSV con encabezados, o `SELECT ... INTO OUTFILE`). Así el ensayo
 * contra staging usa exactamente el mismo camino que el corte final.
 *
 * Uso:
 *   1. Exportar de SISRES los CSV (con fila de encabezados, separador coma):
 *      paciente.csv, clientes.csv, cie10.csv, servicios.csv, valoraciones.csv,
 *      inventario.csv, mantenimiento.csv, movil.csv
 *   2. Colocarlos en una carpeta, ej. ./etl-data/
 *   3. DATABASE_URL apuntando a staging (ensayo) o producción (corte final):
 *      npx tsx scripts/etl-sisres.ts ./etl-data
 *
 * Idempotente: usa ON CONFLICT sobre las claves naturales (cedula, numero,
 * placa_equipo, codigo) — re-ejecutar no duplica. `servicios` y `mantenimiento`
 * no tienen clave natural: el script los inserta solo si la tabla destino está
 * vacía (guardas de conteo), para no duplicar en re-ensayos.
 */
import * as fs from "fs";
import * as path from "path";
import pg from "pg";

// ─── Env (mismo mecanismo que apply-database.ts) ─────────────────────────────
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf-8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}
loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

// ─── CSV parser (RFC 4180: comillas, comas y saltos de línea embebidos) ──────
function parseCsv(texto: string): Record<string, string>[] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++; }
        else enComillas = false;
      } else campo += c;
    } else if (c === '"') {
      enComillas = true;
    } else if (c === ",") {
      fila.push(campo); campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo); campo = "";
      if (fila.some((f) => f !== "")) filas.push(fila);
      fila = [];
    } else campo += c;
  }
  if (campo !== "" || fila.length > 0) {
    fila.push(campo);
    if (fila.some((f) => f !== "")) filas.push(fila);
  }
  if (filas.length < 2) return [];
  const headers = filas[0].map((h) => h.trim());
  return filas.slice(1).map((f) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = (f[idx] ?? "").trim(); });
    return obj;
  });
}

// ─── Helpers de normalización ────────────────────────────────────────────────
const s = (v: string | undefined): string | null => {
  const t = (v ?? "").trim();
  return t === "" || t === "NULL" || t === "null" || t === "0000-00-00" || t === "0000-00-00 00:00:00" ? null : t;
};
const n = (v: string | undefined): number | null => {
  const t = s(v);
  if (t === null) return null;
  const num = Number(t.replace(",", "."));
  return Number.isNaN(num) ? null : num;
};
const boolSiNo = (v: string | undefined, porDefecto: boolean): boolean => {
  const t = (s(v) ?? "").toLowerCase();
  if (t === "si" || t === "sí" || t === "1" || t === "true") return true;
  if (t === "no" || t === "0" || t === "false") return false;
  return porDefecto;
};
const normalizarPlaca = (v: string | undefined): string | null => {
  const t = s(v);
  return t ? t.toUpperCase().replace(/\s+/g, "") : null;
};
// Etapas SISRES → CHECK de medical_services (NO EFECTIVO lleva guion bajo)
const normalizarEtapa = (v: string | undefined): string => {
  const t = (s(v) ?? "PROGRAMADO").toUpperCase().replace(/\s+/g, "_");
  return ["PROGRAMADO", "CURSO", "FINALIZADO", "CANCELADO", "FALLIDO", "NO_EFECTIVO"].includes(t)
    ? t
    : "PROGRAMADO";
};

function leerCsv(dir: string, nombre: string): Record<string, string>[] | null {
  const ruta = path.join(dir, nombre);
  if (!fs.existsSync(ruta)) {
    console.log(`⏭  ${nombre} no encontrado — tabla omitida`);
    return null;
  }
  const filas = parseCsv(fs.readFileSync(ruta, "utf-8"));
  console.log(`📄 ${nombre}: ${filas.length} filas`);
  return filas;
}

async function contar(client: pg.Client, tabla: string): Promise<number> {
  const { rows } = await client.query(`SELECT COUNT(*)::int AS c FROM ${tabla}`);
  return rows[0].c;
}

// ─── Cargas por tabla ────────────────────────────────────────────────────────

async function cargarPacientes(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "paciente.csv");
  if (!filas) return;
  let ok = 0;
  for (const f of filas) {
    const cedula = s(f.cedula);
    if (!cedula) continue;
    await client.query(
      `INSERT INTO patients (cedula, tipo_documento, nombre1, nombre2, apellido1, apellido2,
         fecha_nacimiento, direccion, barrio, localidad, departamento, ciudad, rh, sexo,
         estatura, eps, celular, correo, activo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       ON CONFLICT (cedula) DO UPDATE SET
         direccion = EXCLUDED.direccion, ciudad = EXCLUDED.ciudad, eps = EXCLUDED.eps,
         celular = EXCLUDED.celular, correo = EXCLUDED.correo, updated_at = NOW()`,
      [
        cedula, s(f.tipoDocumento) ?? "CC", s(f.nombre1) ?? "—", s(f.nombre2),
        s(f.apellido1) ?? "—", s(f.apellido2), s(f.fechaNacimiento), s(f.direccion),
        s(f.barrio), s(f.localidad), s(f.departamento), s(f.ciudad), s(f.rh), s(f.sexo),
        s(f.estatura), s(f.eps), s(f.celular), s(f.correo), (s(f.estado) ?? "1") !== "0",
      ]
    );
    ok++;
  }
  console.log(`   ✔ patients: ${ok} upserts`);
}

async function cargarClientes(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "clientes.csv");
  if (!filas) return;
  let ok = 0;
  for (const f of filas) {
    const numero = s(f.numero);
    if (!numero) continue;
    await client.query(
      `INSERT INTO clients (tipo_documento, numero, digito_verificacion, nombre, sector,
         direccion, departamento, ciudad, telefono1, telefono2, telefono3, correo, activo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (numero) DO UPDATE SET nombre = EXCLUDED.nombre, updated_at = NOW()`,
      [
        s(f.tipoDocumento) ?? "NIT", numero, s(f.digitoVerificacion), s(f.nombre) ?? "—",
        s(f.sector), s(f.direccion), s(f.departamento), s(f.ciudad),
        s(f.telefono1), s(f.telefono2), s(f.telefono3), s(f.correo),
        (s(f.estado) ?? "1") !== "0",
      ]
    );
    ok++;
  }
  console.log(`   ✔ clients: ${ok} upserts`);
}

async function cargarCie10(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "cie10.csv");
  if (!filas) return;
  let ok = 0;
  for (const f of filas) {
    const codigo = s(f.codigo) ?? s(f.cie);
    const descripcion = s(f.descripcion) ?? s(f.nombre);
    if (!codigo || !descripcion) continue;
    await client.query(
      `INSERT INTO cie10 (codigo, descripcion) VALUES ($1,$2)
       ON CONFLICT (codigo) DO UPDATE SET descripcion = EXCLUDED.descripcion`,
      [codigo, descripcion]
    );
    ok++;
  }
  console.log(`   ✔ cie10: ${ok} upserts`);
}

async function cargarMovil(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "movil.csv");
  if (!filas) return;
  let actualizados = 0;
  const huerfanas: string[] = [];
  for (const f of filas) {
    const placa = normalizarPlaca(f.placa);
    if (!placa) continue;
    // Import único de campos que solo tenía SISRES — vehicles es la autoritativa
    const { rowCount } = await client.query(
      `UPDATE vehicles SET
         numero_motor = COALESCE(numero_motor, $2),
         numero_chasis = COALESCE(numero_chasis, $3),
         carroceria = COALESCE(carroceria, $4),
         cilindraje = COALESCE(cilindraje, $5),
         pasajeros = COALESCE(pasajeros, $6),
         imei_gps = COALESCE(imei_gps, $7),
         ciudad_placa = COALESCE(ciudad_placa, $8),
         fecha_pase_aeroportuario = COALESCE(fecha_pase_aeroportuario, $9),
         multas = COALESCE(multas, $10),
         obs_multas = COALESCE(obs_multas, $11),
         descripcion_sisres = COALESCE(descripcion_sisres, $12)
       WHERE placa = $1`,
      [
        placa, s(f.numeroMotor), s(f.numeroChasis), s(f.carroceria), s(f.cilindraje),
        n(f.pasajeros), s(f.imeiGps), s(f.ciudadPlaca), s(f.fechaPase),
        s(f.multas), s(f.obsMultas), s(f.descripcionMovil),
      ]
    );
    if (rowCount && rowCount > 0) actualizados++;
    else huerfanas.push(placa);
  }
  console.log(`   ✔ vehicles: ${actualizados} enriquecidos con datos de movil`);
  if (huerfanas.length > 0) {
    console.log(`   ⚠ placas de SISRES sin match en vehicles (reporte de huérfanos): ${huerfanas.join(", ")}`);
  }
}

async function cargarServicios(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "servicios.csv");
  if (!filas) return;
  const existentes = await contar(client, "medical_services");
  if (existentes > 0) {
    console.log(`   ⏭ medical_services ya tiene ${existentes} filas — se omite para no duplicar (vaciar la tabla para re-ensayar)`);
    return;
  }
  // Mapas de resolución de FKs
  const { rows: pacientes } = await client.query<{ id: number; cedula: string }>(
    "SELECT id, cedula FROM patients"
  );
  const pacientePorCedula = new Map(pacientes.map((p) => [p.cedula, p.id]));
  const { rows: vehiculos } = await client.query<{ id: string; placa: string }>(
    "SELECT id, placa FROM vehicles"
  );
  const vehiculoPorPlaca = new Map(vehiculos.map((v) => [v.placa, v.id]));

  let ok = 0;
  let sinPaciente = 0;
  for (const f of filas) {
    const cedula = s(f.cedula);
    const patientId = cedula ? (pacientePorCedula.get(cedula) ?? null) : null;
    if (!patientId) sinPaciente++;
    const placa = normalizarPlaca(f.movil);
    const vehicleId = placa ? (vehiculoPorPlaca.get(placa) ?? null) : null;

    await client.query(
      `INSERT INTO medical_services (
         patient_id, nombre_completo, fecha_hora_registro, tipo_servicio, vehicle_id, movil_placa,
         fecha_hora_programacion, oportunidad_atencion, turno_programacion, autorizacion, asesor,
         prestador, cie_codigo, requiere_aislamiento, soporte, departamento_origen, ciudad_origen,
         departamento_destino, ciudad_destino, perimetro, direccion_origen,
         fecha_hora_llegada_origen, fecha_hora_salida_origen, tiempo_total_origen,
         direccion_intermedia, fecha_hora_llegada_intermedia, fecha_hora_salida_intermedia,
         tiempo_espera_intermedia, direccion_destino, fecha_hora_llegada_destino,
         fecha_hora_salida_destino, tiempo_espera_destino, tiempo_total, finalidad_traslado,
         acepta_ips, valor_servicio, metodo_pago, cliente, proveedor, medico, auxiliar, ovem,
         usuario_recibe, usuario_despacha, novedad_servicio, observaciones, motivo_externo,
         motivo_interno, etapa, estado_servicio, ciudad_registro
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,
         $22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,
         $43,$44,$45,$46,$47,$48,$49,$50,$51)`,
      [
        patientId, s(f.nombreCompleto) ?? "—", s(f.fechaHoraRegistro) ?? new Date().toISOString(),
        s(f.tipoServicio) ?? "OTRO", vehicleId, placa,
        s(f.fechaHoraProgramacionServicio), n(f.oportunidadAtencion), s(f.turnoProgramacion),
        s(f.autorizacion), s(f.asesor), s(f.prestador), s(f.cie), s(f.requiereAislamiento),
        s(f.soporte), s(f.departamentoOrigen), s(f.ciudadOrigen), s(f.departamentoDestino),
        s(f.ciudadDestino), s(f.perimetro), s(f.direccion),
        s(f.fechaHoraLlegadaOrigen), s(f.fechaHoraSalidaOrigen), n(f.tiempoTotalOrigen),
        s(f.direccionIntermedia), s(f.fechaHoraLlegadaIntermedia), s(f.fechaHoraSalidaIntermedia),
        n(f.tiempoEsperaIntermedio), s(f.direccionDestinoServicio), s(f.fechaHoraLlegadaDestino),
        s(f.fechaHoraSalidaDestino), n(f.tiempoEsperaDestino), n(f.tiempoTotalEsperaDestino),
        s(f.finalidadTraslado), s(f.aceptaIps), n(f.valorServicio), s(f.metodoPago),
        s(f.cliente), s(f.proveedor), s(f.medico), s(f.auxiliar), s(f.ovem),
        s(f.usuarioRecibeServicio), s(f.usuarioDespachaServicio), s(f.novedadServicio),
        s(f.observaciones), s(f.motivoExterno), s(f.motivoInterno),
        normalizarEtapa(f.etapaServicio), s(f.estadoServicio), s(f.ciudadRegistroUsuario),
      ]
    );
    ok++;
  }
  console.log(`   ✔ medical_services: ${ok} insertados (${sinPaciente} sin match de paciente — quedan con snapshot de nombre)`);
}

async function cargarValoraciones(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "valoraciones.csv");
  if (!filas) return;
  const existentes = await contar(client, "medical_assessments");
  if (existentes > 0) {
    console.log(`   ⏭ medical_assessments ya tiene ${existentes} filas — se omite para no duplicar`);
    return;
  }
  const { rows: pacientes } = await client.query<{ id: number; cedula: string }>(
    "SELECT id, cedula FROM patients"
  );
  const pacientePorCedula = new Map(pacientes.map((p) => [p.cedula, p.id]));
  let ok = 0;
  for (const f of filas) {
    const cedula = s(f.cedula);
    if (!cedula) continue;
    await client.query(
      `INSERT INTO medical_assessments (patient_id, cedula, nombre_completo, fecha_nacimiento,
         genero, aerolinea, fecha_hora_vuelo, acompanante, origen, destino, hc, concepto_medico,
         tiempo_estimado, recomendaciones, valoracion, medico, pasajero, estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [
        pacientePorCedula.get(cedula) ?? null, cedula, s(f.nombreCompleto) ?? "—",
        s(f.fechaNacimiento), s(f.genero), s(f.aerolinea), s(f.fechaHoraVuelo),
        s(f["acompañante"]) ?? s(f.acompanante), s(f.origen), s(f.destino), s(f.hc),
        s(f.conceptoMedico), s(f.tiempoEstimado), s(f.recomendaciones), s(f.valoracion),
        s(f.medico), s(f.pasajero), s(f.estadoServicio) ?? s(f.estado),
      ]
    );
    ok++;
  }
  console.log(`   ✔ medical_assessments: ${ok} insertados`);
}

async function cargarInventario(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "inventario.csv");
  if (!filas) return;
  let ok = 0;
  for (const f of filas) {
    const placa = s(f.placa);
    if (!placa) continue;
    await client.query(
      `INSERT INTO biomedical_equipment (placa_equipo, equipo, marca, modelo, serie,
         registro_invima, riesgo, ultimo_mantenimiento, proximo_mantenimiento,
         ultima_calibracion, proxima_calibracion, frec_mantenimiento, frec_calibracion,
         ubicacion_interna, aeropuerto, departamento, ciudad, adquisicion, area, observaciones,
         voltaje, corriente, potencia, frecuencia, humedad, dimensiones, peso, temperatura,
         fecha_compra, proveedor_nombre, proveedor_contacto, operador, activo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,
         $23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33)
       ON CONFLICT (placa_equipo) DO UPDATE SET
         ultimo_mantenimiento = EXCLUDED.ultimo_mantenimiento,
         proximo_mantenimiento = EXCLUDED.proximo_mantenimiento, updated_at = NOW()`,
      [
        placa, s(f.equipo) ?? "—", s(f.marca), s(f.modelo), s(f.serie), s(f.registroInvima),
        s(f.riesgo), s(f.ultimoMantenimiento), s(f.proximoMantenimiento), s(f.ultimaCalibracion),
        s(f.proximaCalibracion), s(f.frecMantenimiento), s(f.frecCalibracion),
        s(f.ubicacionInterna), s(f.aeropuerto), s(f.departamento), s(f.ciudad), s(f.adquisicion),
        s(f.area), s(f.observaciones), s(f.voltaje), s(f.corriente), s(f.potencia),
        s(f.frecuencia), s(f.humedad), s(f.dimensiones), s(f.peso), s(f.temperatura),
        s(f.fechaCompra), s(f.nomProveedor), s(f.contacProveedor), s(f.operador),
        (s(f.estado) ?? "1") !== "0",
      ]
    );
    ok++;
  }
  console.log(`   ✔ biomedical_equipment: ${ok} upserts`);
}

async function cargarMantenimientos(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "mantenimiento.csv");
  if (!filas) return;
  const existentes = await contar(client, "biomedical_maintenance");
  if (existentes > 0) {
    console.log(`   ⏭ biomedical_maintenance ya tiene ${existentes} filas — se omite para no duplicar`);
    return;
  }
  const { rows: equipos } = await client.query<{ id: number; placa_equipo: string }>(
    "SELECT id, placa_equipo FROM biomedical_equipment"
  );
  const equipoPorPlaca = new Map(equipos.map((e) => [e.placa_equipo, e.id]));
  let ok = 0;
  let sinEquipo = 0;
  for (const f of filas) {
    // El CSV de mantenimiento referencia inventario_id (id de MySQL) o placa —
    // se resuelve por placa del equipo si viene; si no, por serie no es fiable → se salta
    const placa = s(f.placa) ?? s(f.placa_equipo);
    let equipmentId = placa ? (equipoPorPlaca.get(placa) ?? null) : null;
    if (!equipmentId && s(f.equipo)) {
      // Fallback: match por nombre+serie
      const { rows } = await client.query<{ id: number }>(
        "SELECT id FROM biomedical_equipment WHERE equipo = $1 AND (serie = $2 OR $2 IS NULL) LIMIT 1",
        [s(f.equipo), s(f.serie)]
      );
      equipmentId = rows[0]?.id ?? null;
    }
    if (!equipmentId) { sinEquipo++; continue; }

    let chkItems: unknown = null;
    const chkRaw = s(f.chk_items);
    if (chkRaw) {
      try { chkItems = JSON.parse(chkRaw); } catch { chkItems = null; }
    }

    await client.query(
      `INSERT INTO biomedical_maintenance (equipment_id, orden_numero, fecha_mantenimiento,
         tipo_mantenimiento, codigo_institucional, ubicacion, sanidad, chk_items, chk_total,
         chk_marcados, descripcion_falla, obs_apto, obs_averiado, obs_reparacion, obs_baja,
         obs_partes, observaciones, repuesto, referencia_serial, cantidad, obs_reparaciones,
         realizo_nombre, realizo_cargo, reviso_nombre, reviso_cargo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
      [
        equipmentId, s(f.orden_numero), s(f.fecha_mantenimiento) ?? new Date().toISOString().slice(0, 10),
        s(f.tipo_mantenimiento), s(f.codigo_institucional), s(f.ubicacion), s(f.sanidad),
        chkItems ? JSON.stringify(chkItems) : null, n(f.chk_total), n(f.chk_marcados),
        s(f.descripcion_falla), boolSiNo(f.obs_apto, true), boolSiNo(f.obs_averiado, false),
        boolSiNo(f.obs_reparacion, false), boolSiNo(f.obs_baja, false), boolSiNo(f.obs_partes, true),
        s(f.observaciones_texto), s(f.repuesto), s(f.referencia_serial), n(f.cantidad),
        s(f.obsreparaciones), s(f.realizo_nombre) ?? "—", s(f.realizo_cargo),
        s(f.reviso_nombre), s(f.reviso_cargo),
      ]
    );
    ok++;
  }
  console.log(`   ✔ biomedical_maintenance: ${ok} insertados (${sinEquipo} sin match de equipo)`);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const dir = process.argv[2];
  if (!dir || !fs.existsSync(dir)) {
    console.error("Uso: npx tsx scripts/etl-sisres.ts <carpeta-con-CSVs>");
    console.error("CSVs esperados: paciente.csv clientes.csv cie10.csv movil.csv servicios.csv valoraciones.csv inventario.csv mantenimiento.csv");
    process.exit(1);
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Falta DATABASE_URL en .env.local");
    process.exit(1);
  }
  const host = new URL(url.replace(/^postgres(ql)?:\/\//, "http://")).hostname;
  console.log(`🎯 Destino: ${host}`);
  console.log(`📂 Origen: ${path.resolve(dir)}\n`);

  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    // Orden importa: catálogos → maestros → transaccionales
    await cargarClientes(client, dir);
    await cargarCie10(client, dir);
    await cargarPacientes(client, dir);
    await cargarMovil(client, dir);
    await cargarInventario(client, dir);
    await cargarServicios(client, dir);
    await cargarValoraciones(client, dir);
    await cargarMantenimientos(client, dir);

    console.log("\n📊 Conteos finales (validar contra MySQL):");
    for (const tabla of [
      "patients", "clients", "cie10", "medical_services", "medical_assessments",
      "biomedical_equipment", "biomedical_maintenance",
    ]) {
      console.log(`   ${tabla}: ${await contar(client, tabla)}`);
    }
    console.log("\n✅ ETL completado.");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("❌ ETL falló:", e instanceof Error ? e.message : e);
  process.exit(1);
});
