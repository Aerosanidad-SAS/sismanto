/**
 * ETL SISRES (MySQL) → SISRES V2 (Postgres/Supabase).
 *
 * No se conecta a MySQL: consume los CSV que genera sisres/sql/generar_csv_etl.php
 * (uno por tabla, con encabezados). Así el ensayo en staging y el corte final
 * usan exactamente el mismo camino.
 *
 * Uso:
 *   npx tsx scripts/etl-sisres.ts <carpeta-csv> --validar   ensayo en seco
 *   npx tsx scripts/etl-sisres.ts <carpeta-csv>             carga real
 *
 * Garantías:
 * - Idempotente: cada tabla hace upsert por clave natural (cedula, numero,
 *   codigo, placa_equipo) o por `sisres_id` (migración 058). Re-ejecutar
 *   actualiza con lo último de SISRES en vez de duplicar.
 * - Hora local: la sesión corre en America/Bogota. SISRES guarda hora de
 *   Colombia sin zona; interpretada en UTC, todo el histórico quedaría
 *   corrido 5 horas.
 * - Una fila inválida no aborta la carga: va a `etl-rechazos-<tabla>.csv`
 *   con el motivo. Un campo irrecuperable (fecha o número ilegible) se carga
 *   vacío y queda en `etl-avisos-<tabla>.csv`. Ambos archivos se escriben en
 *   la carpeta de los CSV y contienen datos personales: no subirlos a git.
 * - Transacción por tabla: un error fuera de una fila revierte la tabla
 *   completa, nunca la deja a medias.
 * - --validar corre la carga completa dentro de una sola transacción y la
 *   revierte al final: valida contra las restricciones reales de la BD sin
 *   dejar nada escrito.
 *
 * Requiere la migración 058 aplicada en la BD de destino.
 */
import * as fs from "fs";
import * as path from "path";
import pg from "pg";
import { sanitizarTelefono } from "../src/lib/notifications/whatsapp";
import { resolverCiudad } from "../src/lib/colombia-geo";

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

// ─── Bitácora de rechazos y avisos ───────────────────────────────────────────
type Fila = Record<string, string>;
type Ctx = { tabla: string; fila: Fila };
type FilaCarga = { valores: unknown[]; origen: Fila };

/** Lanzarla dentro de una transformación manda la fila completa a rechazos. */
class RechazoFila extends Error {}

const TAMANO_LOTE = 500;
const rechazos = new Map<string, { motivo: string; fila: Fila }[]>();
const avisos = new Map<string, { motivo: string; fila: Fila }[]>();

function registrar(bitacora: typeof rechazos, tabla: string, fila: Fila, motivo: string) {
  const lista = bitacora.get(tabla) ?? [];
  lista.push({ motivo, fila });
  bitacora.set(tabla, lista);
}

function escribirBitacora(dir: string, prefijo: string, bitacora: typeof rechazos) {
  const celda = (x: string) => `"${x.replace(/"/g, '""')}"`;
  for (const [tabla, lista] of bitacora) {
    const columnas = Array.from(new Set(lista.flatMap((r) => Object.keys(r.fila))));
    const lineas = [["motivo", ...columnas].map(celda).join(",")];
    for (const r of lista) {
      lineas.push([r.motivo, ...columnas.map((c) => r.fila[c] ?? "")].map(celda).join(","));
    }
    const ruta = path.join(dir, `${prefijo}-${tabla}.csv`);
    fs.writeFileSync(ruta, "﻿" + lineas.join("\n"), "utf-8");
    console.log(`   📝 ${path.basename(ruta)}: ${lista.length} filas`);
  }
}

// ─── CSV parser (RFC 4180: comillas, comas y saltos de línea embebidos) ──────
// Encabezados en minúscula: los CSV crudos de MySQL traen "Codigo", los
// renombrados por generar_csv_etl.php traen "codigo" — ambos deben funcionar.
function parseCsv(texto: string): Fila[] {
  const contenido = texto.replace(/^﻿/, ""); // BOM de generar_csv_etl.php
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let enComillas = false;
  for (let i = 0; i < contenido.length; i++) {
    const c = contenido[i];
    if (enComillas) {
      if (c === '"') {
        if (contenido[i + 1] === '"') { campo += '"'; i++; }
        else enComillas = false;
      } else campo += c;
    } else if (c === '"') {
      enComillas = true;
    } else if (c === ",") {
      fila.push(campo); campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && contenido[i + 1] === "\n") i++;
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
  const headers = filas[0].map((h) => h.trim().toLowerCase());
  return filas.slice(1).map((f) => {
    const obj: Fila = {};
    headers.forEach((h, idx) => { obj[h] = (f[idx] ?? "").trim(); });
    return obj;
  });
}

function leerCsv(dir: string, nombre: string): Fila[] | null {
  const ruta = path.join(dir, nombre);
  if (!fs.existsSync(ruta)) {
    console.log(`⏭  ${nombre} no encontrado — tabla omitida`);
    return null;
  }
  const filas = parseCsv(fs.readFileSync(ruta, "utf-8"));
  console.log(`📄 ${nombre}: ${filas.length} filas`);
  return filas;
}

// ─── Lectura de campos ───────────────────────────────────────────────────────
/** SISRES usa '' y fechas cero en vez de NULL (DB_MAP.md §5). */
const s = (raw: string | undefined): string | null => {
  const t = (raw ?? "").trim();
  return t === "" || t === "NULL" || t === "null" || t === "0000-00-00" || t === "0000-00-00 00:00:00" ? null : t;
};

/** Primer valor no vacío entre varios nombres de columna (sin distinguir mayúsculas). */
const v = (f: Fila, ...nombres: string[]): string | null => {
  for (const n of nombres) {
    const x = s(f[n.toLowerCase()]);
    if (x !== null) return x;
  }
  return null;
};

const entero = (raw: string | null): number | null => (raw !== null && /^-?\d+$/.test(raw) ? Number(raw) : null);
/** Bandera 0/1 de SISRES → boolean. Sin dato = activa (el DEFAULT de `estado` en SISRES es 1). */
const bandera = (raw: string | null): boolean => raw === null || !/^(0|false|f|no)$/i.test(raw.trim());

function requerirId(f: Fila): number {
  const id = entero(v(f, "id"));
  if (id === null) throw new RechazoFila("sin id de origen (columna id) — no se puede enlazar ni re-ejecutar sin duplicar");
  return id;
}

const activo = (f: Fila): boolean => (v(f, "estado") ?? "1") !== "0";

const boolSiNo = (raw: string | null, porDefecto: boolean): boolean => {
  const t = (raw ?? "").toLowerCase();
  if (t === "si" || t === "sí" || t === "1" || t === "true") return true;
  if (t === "no" || t === "0" || t === "false") return false;
  return porDefecto;
};

/**
 * Número con formato colombiano: "150.000" es ciento cincuenta mil, no 150
 * (el ETL anterior hacía replace(",", ".") y dejaba 150). Ilegible → vacío + aviso.
 */
function numero(ctx: Ctx, ...nombres: string[]): number | null {
  const raw = v(ctx.fila, ...nombres);
  if (raw === null) return null;
  let t = raw.replace(/[$\s]/g, "");
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, "").replace(",", ".");
  else if (/^-?\d+,\d+$/.test(t)) t = t.replace(",", ".");
  const num = Number(t);
  if (t === "" || Number.isNaN(num)) {
    registrar(avisos, ctx.tabla, ctx.fila, `${nombres[0]}: número no reconocido "${raw}" — se cargó vacío`);
    return null;
  }
  return num;
}

/**
 * Convierte una fecha tal como la guarda SISRES a "YYYY-MM-DD" o
 * "YYYY-MM-DD HH:MM:SS" (hora local de Colombia; la sesión ya corre en
 * America/Bogota). Devuelve null si el formato no se reconoce: el campo se
 * carga vacío y queda en etl-avisos.
 *
 * Solo las columnas date/datetime reales de MySQL garantizan ISO. Las
 * `varchar` (fechaHoraRegistro, llegadas/salidas de servicios,
 * inventario.fechaCompra, valoraciones.fechaHoraVuelo…) pueden traer otros
 * formatos — DB_MAP.md §5 advierte que no hay uno único.
 */
function parsearFechaSisres(raw: string): string | null {
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (iso) {
    const [, a, m, d, hh, mm, ss] = iso;
    return hh ? `${a}-${m}-${d} ${hh}:${mm}:${ss ?? "00"}` : `${a}-${m}-${d}`;
  }

  // TODO(Daniel): formatos de las columnas varchar de SISRES, con los
  // ejemplos reales que confirme León (plan §6, punto 4).
  // Decisión clave: "03/04/2026" — ¿3 de abril (dd/mm, lo normal en
  // Colombia) o 4 de marzo (mm/dd, lo que produce un <input type="date"> en
  // un navegador en inglés)? Si SISRES tiene ambos mezclados no hay forma de
  // distinguirlos fila por fila: elegir una convención o mandarlos a aviso.
  // Considerar también la hora en 12 h ("02:30 PM") y el separador "T".

  return null;
}

function fechaValida(iso: string): boolean {
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d));
  return a >= 1900 && a <= 2100 && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function fecha(ctx: Ctx, ...nombres: string[]): string | null {
  const raw = v(ctx.fila, ...nombres);
  if (raw === null) return null;
  const iso = parsearFechaSisres(raw);
  if (iso === null || !fechaValida(iso)) {
    registrar(avisos, ctx.tabla, ctx.fila, `${nombres[0]}: fecha no reconocida "${raw}" — se cargó vacía`);
    return null;
  }
  return iso;
}

/** SISRES a veces guarda un celular en la columna `correo` (Ronda 2, pregunta 7). */
function separarCorreo(raw: string | null): { correo: string | null; celularEnCorreo: string | null } {
  if (!raw) return { correo: null, celularEnCorreo: null };
  if (raw.includes("@")) return { correo: raw.toLowerCase(), celularEnCorreo: null };
  return { correo: null, celularEnCorreo: sanitizarTelefono(raw) ? raw.replace(/\D+/g, "") : null };
}

const sinAcentos = (x: string) => x.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

/**
 * Nombre canónico DIVIPOLA de ciudad/departamento. Si el departamento que
 * trae SISRES contradice al del catálogo (municipios homónimos, ej. Barbosa
 * en Antioquia y en Santander), se deja el dato original.
 */
function ubicacion(departamento: string | null, ciudad: string | null) {
  const r = resolverCiudad(ciudad);
  if (!r) return { departamento, ciudad };
  if (departamento && sinAcentos(departamento) !== sinAcentos(r.departamento)) return { departamento, ciudad };
  return r;
}

const normalizarPlaca = (raw: string | null): string | null => (raw ? raw.toUpperCase().replace(/\s+/g, "") : null);

// Etapas SISRES → CHECK de medical_services (Ronda 2, pregunta 3): "NO EFECTIVO"
// lleva espacio, DUPLICADO es terminal vivo, SOLUCIONADO es alias legacy de
// CANCELADO y REPROGRAMADO/RE-PROGRAMADO no tienen equivalente vivo.
const normalizarEtapa = (raw: string | null): string => {
  const t = (raw ?? "PROGRAMADO").toUpperCase().trim();
  if (t === "SOLUCIONADO") return "CANCELADO";
  if (t === "REPROGRAMADO" || t === "RE-PROGRAMADO") return "PROGRAMADO";
  const validas = ["PROGRAMADO", "CURSO", "FINALIZADO", "CANCELADO", "FALLIDO", "NO EFECTIVO", "DUPLICADO"];
  return validas.includes(t) ? t : "PROGRAMADO";
};

/** Código CIE-10 al inicio del texto libre de servicios.cie ("J189 - NEUMONIA…"). */
const codigoCie = (raw: string | null): string | null => raw?.match(/^\s*([A-Z]\d{2}[0-9A-Z]?)\b/i)?.[1].toUpperCase() ?? null;

// ─── Escritura por lotes ─────────────────────────────────────────────────────
function transformar(tabla: string, filas: Fila[], fn: (f: Fila, ctx: Ctx) => unknown[]): FilaCarga[] {
  const salida: FilaCarga[] = [];
  for (const f of filas) {
    try {
      salida.push({ valores: fn(f, { tabla, fila: f }), origen: f });
    } catch (e) {
      if (!(e instanceof RechazoFila)) throw e;
      registrar(rechazos, tabla, f, e.message);
    }
  }
  return salida;
}

function sqlInsert(tabla: string, columnas: string[], cantidad: number): string {
  const valores = Array.from({ length: cantidad }, (_, r) =>
    `(${columnas.map((_, c) => `$${r * columnas.length + c + 1}`).join(",")})`
  ).join(",");
  return `INSERT INTO ${tabla} (${columnas.join(",")}) VALUES ${valores}`;
}

const actualizar = (columnas: string[], excluir: string[]) =>
  columnas.filter((c) => !excluir.includes(c)).map((c) => `${c} = EXCLUDED.${c}`).join(", ");

/**
 * Inserta de a TAMANO_LOTE filas. Si un lote falla, se reintenta fila por fila
 * (con SAVEPOINT) para cargar las buenas y mandar solo las malas a rechazos.
 */
async function upsertLote(
  client: pg.Client,
  tabla: string,
  columnas: string[],
  conflicto: string,
  filas: FilaCarga[]
): Promise<number> {
  let ok = 0;
  for (let i = 0; i < filas.length; i += TAMANO_LOTE) {
    const lote = filas.slice(i, i + TAMANO_LOTE);
    await client.query("SAVEPOINT lote");
    try {
      await client.query(`${sqlInsert(tabla, columnas, lote.length)} ${conflicto}`, lote.flatMap((f) => f.valores));
      await client.query("RELEASE SAVEPOINT lote");
      ok += lote.length;
    } catch {
      await client.query("ROLLBACK TO SAVEPOINT lote");
      for (const f of lote) {
        await client.query("SAVEPOINT fila");
        try {
          await client.query(`${sqlInsert(tabla, columnas, 1)} ${conflicto}`, f.valores);
          await client.query("RELEASE SAVEPOINT fila");
          ok++;
        } catch (e) {
          await client.query("ROLLBACK TO SAVEPOINT fila");
          registrar(rechazos, tabla, f.origen, e instanceof Error ? e.message : String(e));
        }
      }
    }
  }
  return ok;
}

let modoValidar = false;

async function enTransaccion(client: pg.Client, nombre: string, fn: () => Promise<void>) {
  // En --validar todo corre dentro de la transacción única que main() revierte.
  if (modoValidar) return fn();
  await client.query("BEGIN");
  try {
    await fn();
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw new Error(`${nombre}: ${e instanceof Error ? e.message : String(e)} (tabla revertida completa)`);
  }
}

async function contar(client: pg.Client, tabla: string): Promise<number> {
  const { rows } = await client.query(`SELECT COUNT(*)::int AS c FROM ${tabla}`);
  return rows[0].c;
}

// ─── Cargas por tabla ────────────────────────────────────────────────────────

async function cargarClientes(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "clientes.csv");
  if (!filas) return;
  const columnas = [
    "sisres_id", "tipo_documento", "numero", "digito_verificacion", "nombre", "sector", "direccion",
    "departamento", "ciudad", "telefono1", "telefono2", "telefono3", "correo", "activo",
  ];
  const carga = transformar("clients", filas, (f) => {
    const numeroDoc = v(f, "numero");
    if (!numeroDoc) throw new RechazoFila("sin número de documento");
    const { correo, celularEnCorreo } = separarCorreo(v(f, "correo"));
    const telefonos = [v(f, "telefono1"), v(f, "telefono2"), v(f, "telefono3")];
    const libre = telefonos.indexOf(null);
    if (celularEnCorreo && libre >= 0) telefonos[libre] = celularEnCorreo;
    const u = ubicacion(v(f, "departamento"), v(f, "ciudad"));
    return [
      entero(v(f, "id")), v(f, "tipoDocumento") ?? "NIT", numeroDoc, v(f, "digitoVerificacion"),
      v(f, "nombre") ?? "—", v(f, "sector"), v(f, "direccion"), u.departamento, u.ciudad,
      ...telefonos, correo, activo(f),
    ];
  });
  await enTransaccion(client, "clients", async () => {
    const ok = await upsertLote(client, "clients", columnas,
      `ON CONFLICT (numero) DO UPDATE SET ${actualizar(columnas, ["numero"])}, updated_at = NOW()`, carga);
    console.log(`   ✔ clients: ${ok}/${filas.length}`);
  });
}

async function cargarAerolineas(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "aerolineas.csv");
  if (!filas) return;
  const columnas = ["sisres_id", "nombre", "activo"];
  const carga = transformar("airlines", filas, (f) => {
    const nombre = v(f, "nombre");
    if (!nombre) throw new RechazoFila("sin nombre");
    return [entero(v(f, "id")), nombre, activo(f)];
  });
  await enTransaccion(client, "airlines", async () => {
    const ok = await upsertLote(client, "airlines", columnas,
      `ON CONFLICT (nombre) DO UPDATE SET ${actualizar(columnas, ["nombre"])}, updated_at = NOW()`, carga);
    console.log(`   ✔ airlines: ${ok}/${filas.length}`);
  });
}

/** Dataset OurAirports (~85.818 filas): se carga con los nombres en español de SISMANTO; `scheduled_service` yes/no (en inglés, no si/no) → boolean. */
async function cargarAeropuertos(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "aeropuertos.csv");
  if (!filas) return;
  const columnas = [
    "sisres_id", "ident", "tipo", "nombre", "municipio", "pais", "region", "iata_code", "icao_code",
    "servicio_regular", "latitud", "longitud", "elevacion_ft",
  ];
  const carga = transformar("airports", filas, (f, ctx) => {
    const nombre = v(f, "name");
    if (!nombre) throw new RechazoFila("sin nombre");
    return [
      entero(v(f, "id")), v(f, "ident"), v(f, "type"), nombre, v(f, "municipality"), v(f, "iso_country"),
      v(f, "iso_region"), v(f, "iata_code"), v(f, "icao_code"), (v(f, "scheduled_service") ?? "").toLowerCase() === "yes",
      numero(ctx, "latitude_deg"), numero(ctx, "longitude_deg"), entero(v(f, "elevation_ft")),
    ];
  });
  await enTransaccion(client, "airports", async () => {
    const ok = await upsertLote(client, "airports", columnas,
      `ON CONFLICT (sisres_id) DO UPDATE SET ${actualizar(columnas, ["sisres_id"])}`, carga);
    console.log(`   ✔ airports: ${ok}/${filas.length}`);
  });
}

async function cargarCie10(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "cie10.csv");
  if (!filas) return;
  const carga = transformar("cie10", filas, (f) => {
    const codigo = v(f, "codigo", "cie");
    const descripcion = v(f, "descripcion", "nombre");
    if (!codigo || !descripcion) throw new RechazoFila("sin código o descripción");
    if (codigo.length > 10) throw new RechazoFila(`código de más de 10 caracteres: "${codigo}"`);
    return [codigo, descripcion];
  });
  await enTransaccion(client, "cie10", async () => {
    const ok = await upsertLote(client, "cie10", ["codigo", "descripcion"],
      "ON CONFLICT (codigo) DO UPDATE SET descripcion = EXCLUDED.descripcion", carga);
    console.log(`   ✔ cie10: ${ok}/${filas.length}`);
  });
}

async function cargarEps(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "eps.csv");
  if (!filas) return;
  const columnas = ["sisres_id", "entidad", "codigo", "codigo_movilidad", "nit", "regimen"];
  const carga = transformar("eps", filas, (f) => {
    const entidad = v(f, "entidad");
    if (!entidad) throw new RechazoFila("sin nombre de entidad");
    return [entero(v(f, "id")), entidad, v(f, "codigo"), v(f, "codigoMovilidad"), v(f, "nit"), v(f, "regimen")];
  });
  await enTransaccion(client, "eps", async () => {
    const ok = await upsertLote(client, "eps", columnas,
      `ON CONFLICT (entidad) DO UPDATE SET ${actualizar(columnas, ["entidad"])}`, carga);
    console.log(`   ✔ eps: ${ok}/${filas.length}`);
  });
}

async function cargarProveedores(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "proveedores.csv");
  if (!filas) return;
  const columnas = [
    "sisres_id", "tipo_documento", "numero", "digito_verificacion", "nombre", "sector", "direccion",
    "departamento", "ciudad", "telefono1", "telefono2", "telefono3", "correo", "area", "activo",
  ];
  const carga = transformar("medical_providers", filas, (f) => {
    const nombre = v(f, "nombre");
    if (!nombre) throw new RechazoFila("sin nombre");
    const { correo } = separarCorreo(v(f, "correo"));
    const u = ubicacion(v(f, "departamento"), v(f, "ciudad"));
    return [
      requerirId(f), v(f, "tipoDocumento"), v(f, "numero"), v(f, "digitoVerificacion"), nombre,
      v(f, "sector"), v(f, "direccion"), u.departamento, u.ciudad,
      v(f, "telefono1"), v(f, "telefono2"), v(f, "telefono3"), correo, v(f, "area"), activo(f),
    ];
  });
  await enTransaccion(client, "medical_providers", async () => {
    const ok = await upsertLote(client, "medical_providers", columnas,
      `ON CONFLICT (sisres_id) DO UPDATE SET ${actualizar(columnas, ["sisres_id"])}, updated_at = NOW()`, carga);
    console.log(`   ✔ medical_providers: ${ok}/${filas.length}`);
  });
}

async function cargarPacientes(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "paciente.csv");
  if (!filas) return;
  const columnas = [
    "sisres_id", "cedula", "tipo_documento", "nombre1", "nombre2", "apellido1", "apellido2",
    "fecha_nacimiento", "direccion", "barrio", "localidad", "departamento", "ciudad", "rh", "sexo",
    "estatura", "eps", "celular", "correo", "activo",
  ];
  const carga = transformar("patients", filas, (f, ctx) => {
    const cedula = v(f, "cedula");
    if (!cedula) throw new RechazoFila("sin cédula");
    const { correo, celularEnCorreo } = separarCorreo(v(f, "correo"));
    const u = ubicacion(v(f, "departamento"), v(f, "ciudad"));
    return [
      entero(v(f, "id")), cedula, v(f, "tipoDocumento") ?? "CEDULA CIUDADANIA", v(f, "nombre1") ?? "—",
      v(f, "nombre2"), v(f, "apellido1") ?? "—", v(f, "apellido2"), fecha(ctx, "fechaNacimiento"),
      v(f, "direccion"), v(f, "barrio"), v(f, "localidad"), u.departamento, u.ciudad, v(f, "rh"),
      v(f, "sexo"), v(f, "estatura"), v(f, "eps"), v(f, "celular") ?? celularEnCorreo, correo, activo(f),
    ];
  });
  await enTransaccion(client, "patients", async () => {
    const ok = await upsertLote(client, "patients", columnas,
      `ON CONFLICT (cedula) DO UPDATE SET ${actualizar(columnas, ["cedula"])}, updated_at = NOW()`, carga);
    console.log(`   ✔ patients: ${ok}/${filas.length}`);
  });
}

async function cargarMovil(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "movil.csv");
  if (!filas) return;
  await enTransaccion(client, "vehicles", async () => {
    let actualizados = 0;
    const huerfanas: string[] = [];
    for (const f of filas) {
      const placa = normalizarPlaca(v(f, "placa"));
      if (!placa) continue;
      const ctx = { tabla: "vehicles", fila: f };
      // Import único de campos que solo tenía SISRES — vehicles es la autoritativa:
      // COALESCE nunca pisa un dato que ya exista en V2.
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
          placa, v(f, "numeroMotor"), v(f, "numeroChasis"), v(f, "carroceria"), v(f, "cilindraje"),
          numero(ctx, "pasajeros"), v(f, "imeiGps"), v(f, "ciudadPlaca"), fecha(ctx, "fechaPase"),
          v(f, "multas"), v(f, "obsMultas"), v(f, "descripcionMovil"),
        ]
      );
      if (rowCount && rowCount > 0) actualizados++;
      else huerfanas.push(placa);
    }
    console.log(`   ✔ vehicles: ${actualizados} enriquecidos con datos de movil`);
    if (huerfanas.length > 0) {
      console.log(`   ⚠ placas de movil sin vehículo en V2: ${huerfanas.join(", ")}`);
    }
  });
}

async function cargarInventario(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "inventario.csv");
  if (!filas) return;
  const columnas = [
    "sisres_id", "placa_equipo", "equipo", "marca", "modelo", "serie", "registro_invima", "riesgo",
    "ultimo_mantenimiento", "proximo_mantenimiento", "ultima_calibracion", "proxima_calibracion",
    "frec_mantenimiento", "frec_calibracion", "ubicacion_interna", "aeropuerto", "departamento", "ciudad",
    "adquisicion", "area", "observaciones", "voltaje", "corriente", "potencia", "frecuencia", "humedad",
    "dimensiones", "peso", "temperatura", "fecha_compra", "proveedor_nombre", "proveedor_contacto",
    "operador", "activo",
  ];
  const carga = transformar("biomedical_equipment", filas, (f, ctx) => {
    const placa = v(f, "placa");
    if (!placa) throw new RechazoFila("sin placa de equipo");
    const u = ubicacion(v(f, "departamento"), v(f, "ciudad"));
    return [
      entero(v(f, "id")), placa, v(f, "equipo") ?? "—", v(f, "marca"), v(f, "modelo"), v(f, "serie"),
      v(f, "registroInvima"), v(f, "riesgo"), fecha(ctx, "ultimoMantenimiento"),
      fecha(ctx, "proximoMantenimiento"), fecha(ctx, "ultimaCalibracion"), fecha(ctx, "proximaCalibracion"),
      v(f, "frecMantenimiento"), v(f, "frecCalibracion"), v(f, "ubicacionInterna"), v(f, "aeropuerto"),
      u.departamento, u.ciudad, v(f, "adquisicion"), v(f, "area"), v(f, "observaciones"), v(f, "voltaje"),
      v(f, "corriente"), v(f, "potencia"), v(f, "frecuencia"), v(f, "humedad"), v(f, "dimensiones"),
      v(f, "peso"), v(f, "temperatura"), fecha(ctx, "fechaCompra"), v(f, "nomProveedor"),
      v(f, "contacProveedor"), v(f, "operador"), activo(f),
    ];
  });
  await enTransaccion(client, "biomedical_equipment", async () => {
    const ok = await upsertLote(client, "biomedical_equipment", columnas,
      `ON CONFLICT (placa_equipo) DO UPDATE SET ${actualizar(columnas, ["placa_equipo"])}, updated_at = NOW()`, carga);
    console.log(`   ✔ biomedical_equipment: ${ok}/${filas.length}`);
  });
}

async function cargarServicios(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "servicios.csv");
  if (!filas) return;

  const heredadas = await client.query<{ c: number }>(
    "SELECT COUNT(*)::int AS c FROM medical_services WHERE sisres_id IS NULL AND created_by IS NULL"
  );
  if (heredadas.rows[0].c > 0) {
    console.log(
      `   ⚠ ${heredadas.rows[0].c} servicios sin sisres_id ni created_by: probablemente de una carga con el ETL anterior.` +
      " Se duplicarían con esta carga — revisarlos y borrarlos antes de la carga real."
    );
  }

  const { rows: pacientes } = await client.query<{ id: number; cedula: string }>("SELECT id, cedula FROM patients");
  const pacientePorCedula = new Map(pacientes.map((p) => [p.cedula, p.id]));
  const { rows: vehiculos } = await client.query<{ id: string; placa: string }>("SELECT id, placa FROM vehicles");
  const vehiculoPorPlaca = new Map(vehiculos.map((x) => [x.placa, x.id]));

  const columnas = [
    "sisres_id", "patient_id", "cedula_paciente", "nombre_completo", "fecha_hora_registro", "tipo_servicio",
    "vehicle_id", "movil_placa", "fecha_hora_programacion", "oportunidad_atencion", "turno_programacion",
    "autorizacion", "asesor", "prestador", "cie_codigo", "cie_descripcion", "requiere_aislamiento", "soporte",
    "departamento_origen", "ciudad_origen", "departamento_destino", "ciudad_destino", "perimetro",
    "direccion_origen", "fecha_hora_llegada_origen", "fecha_hora_salida_origen", "tiempo_total_origen",
    "direccion_intermedia", "fecha_hora_llegada_intermedia", "fecha_hora_salida_intermedia",
    "tiempo_espera_intermedia", "direccion_destino", "fecha_hora_llegada_destino", "fecha_hora_salida_destino",
    "tiempo_espera_destino", "tiempo_total", "finalidad_traslado", "acepta_ips", "valor_servicio",
    "metodo_pago", "cliente", "proveedor", "medico", "auxiliar", "ovem", "usuario_recibe",
    "usuario_despacha", "novedad_servicio", "observaciones", "motivo_externo", "motivo_interno", "etapa",
    "estado_servicio", "ciudad_registro",
  ];

  let sinPaciente = 0;
  const placasHuerfanas = new Map<string, number>();
  const carga = transformar("medical_services", filas, (f, ctx) => {
    const cedula = v(f, "cedula");
    const patientId = cedula ? (pacientePorCedula.get(cedula) ?? null) : null;
    if (!patientId) sinPaciente++;
    const placa = normalizarPlaca(v(f, "movil"));
    const vehicleId = placa ? (vehiculoPorPlaca.get(placa) ?? null) : null;
    if (placa && !vehicleId) placasHuerfanas.set(placa, (placasHuerfanas.get(placa) ?? 0) + 1);
    const cie = v(f, "cie");
    const origen = ubicacion(v(f, "departamentoOrigen"), v(f, "ciudadOrigen"));
    const destino = ubicacion(v(f, "departamentoDestino"), v(f, "ciudadDestino"));
    return [
      requerirId(f), patientId, cedula, v(f, "nombreCompleto") ?? "—", fecha(ctx, "fechaHoraRegistro"),
      v(f, "tipoServicio") ?? "OTRO", vehicleId, placa, fecha(ctx, "fechaHoraProgramacionServicio"),
      numero(ctx, "oportunidadAtencion"), v(f, "turnoProgramacion"), v(f, "autorizacion"), v(f, "asesor"),
      v(f, "prestador"), codigoCie(cie), cie, v(f, "requiereAislamiento"), v(f, "soporte"),
      origen.departamento, origen.ciudad, destino.departamento, destino.ciudad, v(f, "perimetro"),
      v(f, "direccion"), fecha(ctx, "fechaHoraLlegadaOrigen"), fecha(ctx, "fechaHoraSalidaOrigen"),
      numero(ctx, "tiempoTotalOrigen"), v(f, "direccionIntermedia"), fecha(ctx, "fechaHoraLlegadaIntermedia"),
      fecha(ctx, "fechaHoraSalidaIntermedia"), numero(ctx, "tiempoEsperaIntermedio"),
      v(f, "direccionDestinoServicio"), fecha(ctx, "fechaHoraLlegadaDestino"),
      fecha(ctx, "fechaHoraSalidaDestino"), numero(ctx, "tiempoEsperaDestino"),
      numero(ctx, "tiempoTotalEsperaDestino"), v(f, "finalidadTraslado"), v(f, "aceptaIps"),
      numero(ctx, "valorServicio"), v(f, "metodoPago"), v(f, "cliente"), v(f, "proveedor"), v(f, "medico"),
      v(f, "auxiliar"), v(f, "ovem"), v(f, "usuarioRecibeServicio"), v(f, "usuarioDespachaServicio"),
      v(f, "novedadServicio"), v(f, "observaciones"), v(f, "motivoExterno"), v(f, "motivoInterno"),
      normalizarEtapa(v(f, "etapaServicio")), v(f, "estadoServicio"), v(f, "ciudadRegistroUsuario"),
    ];
  });

  await enTransaccion(client, "medical_services", async () => {
    // DO UPDATE solo toca columnas que vienen de SISRES: lo que se agrega en V2
    // (boleta de salida, tripulación por user_id, created_by) no se pisa.
    const ok = await upsertLote(client, "medical_services", columnas,
      `ON CONFLICT (sisres_id) DO UPDATE SET ${actualizar(columnas, ["sisres_id"])}, updated_at = NOW()`, carga);
    console.log(`   ✔ medical_services: ${ok}/${filas.length} (${sinPaciente} sin paciente en el maestro — conservan cedula_paciente)`);
  });
  if (placasHuerfanas.size > 0) {
    const detalle = Array.from(placasHuerfanas, ([p, n]) => `${p} (${n})`).join(", ");
    console.log(`   ⚠ placas de servicios sin vehículo en V2: ${detalle}`);
  }
}

async function cargarValoraciones(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "valoraciones.csv");
  if (!filas) return;
  const { rows: pacientes } = await client.query<{ id: number; cedula: string }>("SELECT id, cedula FROM patients");
  const pacientePorCedula = new Map(pacientes.map((p) => [p.cedula, p.id]));
  const columnas = [
    "sisres_id", "patient_id", "cedula", "nombre_completo", "fecha_nacimiento", "genero", "aerolinea",
    "fecha_hora_vuelo", "acompanante", "origen", "destino", "hc", "concepto_medico", "tiempo_estimado",
    "recomendaciones", "valoracion", "medico", "pasajero", "estado", "activo", "correo",
  ];
  const carga = transformar("medical_assessments", filas, (f, ctx) => {
    const cedula = v(f, "cedula");
    if (!cedula) throw new RechazoFila("sin cédula");
    return [
      requerirId(f), pacientePorCedula.get(cedula) ?? null, cedula, v(f, "nombreCompleto") ?? "—",
      fecha(ctx, "fechaNacimiento"), v(f, "genero"), v(f, "aerolinea"), fecha(ctx, "fechaHoraVuelo"),
      v(f, "acompañante", "acompanante"), v(f, "origen"), v(f, "destino"), v(f, "hc"), v(f, "conceptoMedico"),
      v(f, "tiempoEstimado"), v(f, "recomendaciones"), v(f, "valoracion"), v(f, "medico"), v(f, "pasajero"),
      // Son dos campos distintos en SISRES: `estadoServicio` es el select ACTIVO(0)/INACTIVO(1) del formulario
      // y `estado` es la bandera de borrado suave (1 = activa, 0 = eliminada con delete.php). Antes se mezclaban y
      // una valoración eliminada entraba como normal.
      v(f, "estadoServicio"), bandera(v(f, "estado")),
      // Correo del pasajero: dato personal; se carga tal cual solo si parece un correo (SISRES lo guardaba sin validar).
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v(f, "correo") ?? "") ? v(f, "correo") : null,
    ];
  });
  await enTransaccion(client, "medical_assessments", async () => {
    const ok = await upsertLote(client, "medical_assessments", columnas,
      `ON CONFLICT (sisres_id) DO UPDATE SET ${actualizar(columnas, ["sisres_id"])}, updated_at = NOW()`, carga);
    console.log(`   ✔ medical_assessments: ${ok}/${filas.length}`);
  });
}

async function cargarMantenimientos(client: pg.Client, dir: string) {
  const filas = leerCsv(dir, "mantenimiento.csv");
  if (!filas) return;
  const { rows: equipos } = await client.query<{ id: number; placa_equipo: string; sisres_id: number | null }>(
    "SELECT id, placa_equipo, sisres_id FROM biomedical_equipment"
  );
  const equipoPorSisresId = new Map(equipos.filter((e) => e.sisres_id !== null).map((e) => [e.sisres_id, e.id]));
  const equipoPorPlaca = new Map(equipos.map((e) => [e.placa_equipo, e.id]));
  const columnas = [
    "sisres_id", "equipment_id", "orden_numero", "fecha_mantenimiento", "tipo_mantenimiento",
    "codigo_institucional", "ubicacion", "sanidad", "chk_items", "chk_total", "chk_marcados",
    "descripcion_falla", "obs_apto", "obs_averiado", "obs_reparacion", "obs_baja", "obs_partes",
    "observaciones", "repuesto", "referencia_serial", "cantidad", "obs_reparaciones", "realizo_nombre",
    "realizo_cargo", "reviso_nombre", "reviso_cargo",
  ];
  const carga = transformar("biomedical_maintenance", filas, (f, ctx) => {
    // inventario_id es una de las 3 FK reales de SISRES: es el vínculo fiable.
    const inventarioId = entero(v(f, "inventario_id"));
    const placa = v(f, "placa", "codigo_institucional");
    const equipmentId =
      (inventarioId !== null ? equipoPorSisresId.get(inventarioId) : undefined) ??
      (placa ? equipoPorPlaca.get(placa) : undefined);
    if (!equipmentId) throw new RechazoFila(`equipo no encontrado (inventario_id=${inventarioId ?? "—"}, placa=${placa ?? "—"})`);
    const fechaMantenimiento = fecha(ctx, "fecha_mantenimiento");
    if (!fechaMantenimiento) throw new RechazoFila("sin fecha de mantenimiento válida");

    let chkItems: string | null = null;
    const chkRaw = v(f, "chk_items");
    if (chkRaw) {
      try { chkItems = JSON.stringify(JSON.parse(chkRaw)); }
      catch { registrar(avisos, ctx.tabla, f, "chk_items: JSON inválido — se cargó vacío"); }
    }

    return [
      requerirId(f), equipmentId, v(f, "orden_numero"), fechaMantenimiento, v(f, "tipo_mantenimiento"),
      v(f, "codigo_institucional"), v(f, "ubicacion"), v(f, "sanidad"), chkItems,
      entero(v(f, "chk_total")), entero(v(f, "chk_marcados")), v(f, "descripcion_falla"),
      boolSiNo(v(f, "obs_apto"), true), boolSiNo(v(f, "obs_averiado"), false),
      boolSiNo(v(f, "obs_reparacion"), false), boolSiNo(v(f, "obs_baja"), false),
      boolSiNo(v(f, "obs_partes"), true), v(f, "observaciones_texto", "observaciones"), v(f, "repuesto"),
      v(f, "referencia_serial"), entero(v(f, "cantidad")), v(f, "obsreparaciones"),
      v(f, "realizo_nombre") ?? "—", v(f, "realizo_cargo"), v(f, "reviso_nombre"), v(f, "reviso_cargo"),
    ];
  });
  await enTransaccion(client, "biomedical_maintenance", async () => {
    const ok = await upsertLote(client, "biomedical_maintenance", columnas,
      `ON CONFLICT (sisres_id) DO UPDATE SET ${actualizar(columnas, ["sisres_id"])}`, carga);
    console.log(`   ✔ biomedical_maintenance: ${ok}/${filas.length}`);
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  modoValidar = args.includes("--validar");
  const dir = args.find((a) => !a.startsWith("--"));
  if (!dir || !fs.existsSync(dir)) {
    console.error("Uso: npx tsx scripts/etl-sisres.ts <carpeta-con-CSVs> [--validar]");
    console.error("CSVs: clientes cie10 eps proveedores paciente movil inventario servicios valoraciones mantenimiento");
    process.exit(1);
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Falta DATABASE_URL en .env.local");
    process.exit(1);
  }
  const host = new URL(url.replace(/^postgres(ql)?:\/\//, "http://")).hostname;
  console.log(`🎯 Destino: ${host}${modoValidar ? "  (--validar: nada queda escrito)" : ""}`);
  console.log(`📂 Origen: ${path.resolve(dir)}\n`);

  const inicio = Date.now();
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query("SET TIME ZONE 'America/Bogota'");
    if (modoValidar) await client.query("BEGIN");

    // Orden: catálogos → maestros → transaccionales (cada uno resuelve FKs del anterior)
    await cargarClientes(client, dir);
    await cargarCie10(client, dir);
    await cargarEps(client, dir);
    await cargarAerolineas(client, dir);
    await cargarAeropuertos(client, dir);
    await cargarProveedores(client, dir);
    await cargarPacientes(client, dir);
    await cargarMovil(client, dir);
    await cargarInventario(client, dir);
    await cargarServicios(client, dir);
    await cargarValoraciones(client, dir);
    await cargarMantenimientos(client, dir);

    console.log("\n📊 Conteos en destino (validar contra MySQL):");
    for (const tabla of [
      "clients", "cie10", "eps", "airlines", "airports", "medical_providers", "patients", "biomedical_equipment",
      "medical_services", "medical_assessments", "biomedical_maintenance",
    ]) {
      console.log(`   ${tabla}: ${await contar(client, tabla)}`);
    }

    if (modoValidar) await client.query("ROLLBACK");
  } catch (e) {
    if (modoValidar) await client.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally {
    await client.end();
  }

  console.log("\n🗂  Bitácora:");
  if (rechazos.size === 0 && avisos.size === 0) console.log("   sin rechazos ni avisos");
  escribirBitacora(dir, "etl-rechazos", rechazos);
  escribirBitacora(dir, "etl-avisos", avisos);

  const segundos = Math.round((Date.now() - inicio) / 1000);
  console.log(`\n${modoValidar ? "✅ Validación completa (revertida)" : "✅ ETL completado"} en ${segundos} s.`);
}

main().catch((e) => {
  console.error("❌ ETL falló:", e instanceof Error ? e.message : e);
  process.exit(1);
});
