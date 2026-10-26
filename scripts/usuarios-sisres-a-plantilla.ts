/**
 * Prepara la pasada de usuarios de SISRES: convierte el CSV de la tabla `usuarios` en la plantilla de carga masiva de
 * SISMANTO (Administración → Usuarios → carga masiva). NO escribe en ninguna base ni envía nada: solo genera archivos.
 * Guía completa y riesgos: docs/PASADA_USUARIOS.md.
 *
 * Uso:
 *   npx tsx scripts/usuarios-sisres-a-plantilla.ts <usuarios.csv> --salida <carpeta> [--roles-clave-propia ROL1,ROL2]
 * *                                                  [--estados 1,2] [--estados-inactivos 0]
 *                                                  [--centros-por-ciudad "CARTAGENA=CTG,CÚCUTA=ADO"]
 *                                                  [--aceptar-carpeta-sincronizada]
 *
 *   --estados             estados de SISRES que se cargan como personas ACTIVAS (por omisión solo 1).
 *   --estados-inactivos   estados de SISRES que se cargan como personas INACTIVAS: se crean desactivadas (no pueden entrar) pero
 *                         existen, porque siguen ligadas a servicios históricos. Van en usuarios-inactivos-NN.xlsx, aparte.
 *   --centros-por-ciudad  ciudad de SISRES = código de centro, para las que no son Bogotá ni Medellín (solo Bogotá y Medellín
 *                         tienen regla oficial; las demás se omiten en los roles que ven solo su centro hasta que se asignen aquí).
 *
 * El CSV sale de la tabla `usuarios` de SISRES. Exporta SOLO las columnas que se usan (id, usuario, identificacion, nombre1,
 * nombre2, apellido1, apellido2, cargo, correo, ciudad, estado): este script no usa la columna de contraseñas, pero el
 * archivo que la lleve ya la tendría en claro.
 *
 * Genera en --salida:
 *   usuarios-plantilla-01.xlsx, -02.xlsx…  hoja «USUARIOS», máximo 500 filas por archivo (el límite de la pantalla).
 *                                          LLEVAN las claves en claro de ADMIN, ANALISTA, GERENCIAL y cédulas cortas.
 *   usuarios-inactivos-01.xlsx…            las personas inactivas (columna activo = NO), SIN correo y con una clave al azar que nadie ve.
 *                                          Subirlas SOLO cuando la carga masiva desplegada entienda la columna «activo» (PR de esta guía).
 *   usuarios-omitidas.csv                  quién NO entra y por qué (cargo sin equivalente, sin centro, repetido…).
 *   usuarios-avisos.csv                    quién entra, pero con algo que revisar (correo repetido o inválido, ceros…).
 *   claves-iniciales-especiales.csv        esas mismas claves, en una lista para entregar en persona.
 *
 * La clave inicial de todos los demás es su cédula: la pantalla de carga obliga a cambiarla en el primer ingreso y rechaza
 * la cédula como clave nueva. Todo lo que se escribe tiene datos personales y claves: BÓRRALO cuando termine la carga.
 *
 * Salvaguardas: se NIEGA a escribir dentro del repo (ni por enlaces simbólicos ni desde otra carpeta de trabajo), se niega a
 * escribir en una carpeta sincronizada a la nube (OneDrive, Dropbox…) salvo que se acepte con la bandera, no pisa los
 * archivos de una corrida anterior (las claves ya no coincidirían), y crea todo con permisos solo para su dueño.
 */
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { aCsv, parseCsvUsuarios } from "../src/lib/etl-usuarios";
import {
  archivosDeCorridaAnterior,
  COLUMNAS_PLANTILLA,
  convertirUsuariosSisres,
  evaluarCarpetaDeSalida,
  revisarColumnasSisres,
} from "../src/lib/usuarios-sisres-a-plantilla";

const FILAS_POR_ARCHIVO = 500;
/** Banderas que llevan un valor detrás: ese valor no es el archivo de entrada. */
const VALORES_DE_BANDERAS = ["--salida", "--roles-clave-propia", "--estados", "--estados-inactivos", "--centros-por-ciudad"];
const SOLO_DUENO = 0o600;

function valorDe(args: string[], bandera: string): string | undefined {
  const i = args.indexOf(bandera);
  return i >= 0 ? args[i + 1] : undefined;
}

/** `realpath` de una ruta que quizá aún no existe: se resuelve el ancestro más cercano que sí existe y se le agrega el resto. */
function rutaReal(ruta: string): string {
  const resto: string[] = [];
  let actual = path.resolve(ruta);
  while (!fs.existsSync(actual)) {
    resto.unshift(path.basename(actual));
    const padre = path.dirname(actual);
    if (padre === actual) break;
    actual = padre;
  }
  return path.join(fs.realpathSync(actual), ...resto);
}

function escribir(ruta: string, contenido: string | Buffer) {
  fs.writeFileSync(ruta, contenido, { mode: SOLO_DUENO });
  fs.chmodSync(ruta, SOLO_DUENO); // `mode` solo aplica al crear el archivo
}

function main() {
  const args = process.argv.slice(2);
  const archivo = args.find((a, i) => !a.startsWith("--") && !VALORES_DE_BANDERAS.includes(args[i - 1]));
  const salidaPedida = valorDe(args, "--salida");
  if (!archivo || !fs.existsSync(archivo) || !salidaPedida) {
    console.error(
      "Uso: npx tsx scripts/usuarios-sisres-a-plantilla.ts <usuarios.csv> --salida <carpeta fuera del repo> [--estados 1,2] [--estados-inactivos 0] " +
        '[--centros-por-ciudad "CIUDAD=CENTRO,…"] [--roles-clave-propia ROL1,ROL2] [--aceptar-carpeta-sincronizada]'
    );
    process.exit(1);
  }

  // La raíz del repo sale de la ubicación de este archivo, no de la carpeta desde la que se ejecuta.
  const raiz = fs.realpathSync(path.resolve(__dirname, ".."));
  const salida = rutaReal(salidaPedida);
  const { dentroDelRepo, sincronizada } = evaluarCarpetaDeSalida(salida, raiz);
  if (dentroDelRepo) {
    console.error("La salida tiene datos personales y claves: escríbela FUERA del repo (usa --salida con otra carpeta).");
    process.exit(1);
  }
  if (sincronizada && !args.includes("--aceptar-carpeta-sincronizada")) {
    console.error(
      "Esa carpeta parece sincronizarse a la nube (OneDrive, Dropbox…): las cédulas y las claves saldrían de este equipo. " +
        "Usa una carpeta local sin sincronizar, o repite con --aceptar-carpeta-sincronizada si de verdad quieres asumirlo."
    );
    process.exit(1);
  }
  if (fs.existsSync(salida)) {
    const previos = archivosDeCorridaAnterior(fs.readdirSync(salida));
    if (previos.length > 0) {
      console.error(`Ya hay archivos de una corrida anterior en la salida (${previos.length}); sus claves no coincidirían con las de esta. Bórralos o usa otra carpeta.`);
      process.exit(1);
    }
    // Una carpeta que ya existía conserva sus permisos: si otros usuarios del equipo pueden entrar, las claves quedarían a su
    // alcance aunque cada archivo sea 0600. No se le cambian los permisos en silencio (podría ser una carpeta tuya de uso general).
    if ((fs.statSync(salida).mode & 0o077) !== 0) {
      console.error(`La carpeta de salida ya existe y otros usuarios del equipo pueden entrar en ella. Usa una carpeta nueva (la creo solo para ti) o restríngela tú: chmod 700 "${salida}"`);
      process.exit(1);
    }
  }

  const filas = parseCsvUsuarios(fs.readFileSync(archivo, "utf-8"));
  const problemas = revisarColumnasSisres(filas);
  if (problemas.length > 0) {
    for (const p of problemas) console.error("✖ " + p);
    process.exit(1);
  }

  const rolesExtra = (valorDe(args, "--roles-clave-propia") ?? "").split(",").map((r) => r.trim().toUpperCase()).filter(Boolean);
  const estados = (valorDe(args, "--estados") ?? "1").split(",").map((e) => e.trim()).filter(Boolean);
  const centrosPorCiudad: Record<string, string> = {};
  for (const par of (valorDe(args, "--centros-por-ciudad") ?? "").split(",").map((x) => x.trim()).filter(Boolean)) {
    const i = par.lastIndexOf("=");
    if (i <= 0) {
      console.error(`--centros-por-ciudad: «${par}» no tiene la forma CIUDAD=CENTRO.`);
      process.exit(1);
    }
    centrosPorCiudad[par.slice(0, i).trim()] = par.slice(i + 1).trim().toUpperCase();
  }
  const estadosInactivos = (valorDe(args, "--estados-inactivos") ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  const r = convertirUsuariosSisres(filas, { rolesConClavePropia: rolesExtra, estadosCargados: estados, estadosInactivos, centrosPorCiudad });

  fs.mkdirSync(salida, { recursive: true, mode: 0o700 });
  // La ruta se resolvió ANTES de crear la carpeta: si entre una cosa y otra alguien puso un enlace simbólico en el camino, la
  // ruta real ya no es la que se evaluó. Se vuelve a resolver y a evaluar con la carpeta ya creada.
  const evaluacionFinal = evaluarCarpetaDeSalida(fs.realpathSync(salida), raiz);
  if (evaluacionFinal.dentroDelRepo || (evaluacionFinal.sincronizada && !args.includes("--aceptar-carpeta-sincronizada"))) {
    console.error("La carpeta de salida cambió de destino mientras se creaba (enlace simbólico): no se escribió nada. Usa una carpeta local fuera del repo.");
    process.exit(1);
  }

  // Plantilla(s): una hoja «USUARIOS» con los encabezados en la fila 1 y los datos desde la fila 2, como la lee la pantalla.
  // Las activas y las inactivas van en archivos distintos: las inactivas solo se suben cuando la carga masiva entienda «activo».
  const archivos: string[] = [];
  const escribirPlantillas = (filas: typeof r.plantilla, prefijo: string) => {
    let n = 0;
    for (let i = 0; i < filas.length; i += FILAS_POR_ARCHIVO) {
      const lote = filas.slice(i, i + FILAS_POR_ARCHIVO);
      const hoja = XLSX.utils.aoa_to_sheet([[...COLUMNAS_PLANTILLA], ...lote.map((p) => COLUMNAS_PLANTILLA.map((c) => p[c]))]);
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, hoja, "USUARIOS");
      const nombre = `${prefijo}-${String(++n).padStart(2, "0")}.xlsx`;
      escribir(path.join(salida, nombre), XLSX.write(libro, { type: "buffer", bookType: "xlsx" }) as Buffer);
      archivos.push(nombre);
    }
  };
  const activas = r.plantilla.filter((p) => p.activo === "SI");
  const inactivas = r.plantilla.filter((p) => p.activo === "NO");
  escribirPlantillas(activas, "usuarios-plantilla");
  escribirPlantillas(inactivas, "usuarios-inactivos");

  escribir(
    path.join(salida, "usuarios-omitidas.csv"),
    aCsv(["categoria", "motivo", "id_sisres", "cedula", "cargo", "ciudad", "estado"], r.omitidas.map((o) => [o.categoria, o.motivo, o.fila.id ?? "", o.fila.usuario ?? "", o.fila.cargo ?? "", o.fila.ciudad ?? "", o.fila.estado ?? ""]))
  );
  escribir(path.join(salida, "usuarios-avisos.csv"), aCsv(["categoria", "id_sisres", "cedula", "aviso"], r.avisos.map((a) => [a.categoria, a.idSisres, a.cedula, a.aviso])));
  escribir(
    path.join(salida, "claves-iniciales-especiales.csv"),
    aCsv(["cedula", "nombre", "rol", "clave", "motivo"], r.clavesEspeciales.map((c) => [c.cedula, c.nombre, c.rol, c.clave, c.motivo]))
  );

  // Solo conteos por categoría fija: ni cédulas, ni nombres, ni claves, ni texto libre del CSV salen por pantalla.
  const porRol = new Map<string, number>();
  for (const p of r.plantilla) porRol.set(p.rol, (porRol.get(p.rol) ?? 0) + 1);
  const porCategoria = new Map<string, number>();
  for (const o of r.omitidas) porCategoria.set(o.categoria, (porCategoria.get(o.categoria) ?? 0) + 1);
  const avisosPorCategoria = new Map<string, number>();
  for (const a of r.avisos) avisosPorCategoria.set(a.categoria, (avisosPorCategoria.get(a.categoria) ?? 0) + 1);
  // Las ciudades que dejaron a alguien sin centro: son nombres de ciudad (no datos personales) y es lo que hay que decidir.
  const ciudadesSinCentro = new Map<string, number>();
  for (const o of r.omitidas) if (o.categoria === "SIN_CENTRO") ciudadesSinCentro.set((o.fila.ciudad ?? "").trim() || "(vacía)", (ciudadesSinCentro.get((o.fila.ciudad ?? "").trim() || "(vacía)") ?? 0) + 1);
  console.log(`Leídas ${filas.length} filas de SISRES → a la plantilla: ${r.plantilla.length} (${activas.length} activas + ${inactivas.length} inactivas; ${archivos.length} archivo${archivos.length === 1 ? "" : "s"}), omitidas: ${r.omitidas.length}, con aviso: ${r.avisos.length}`);
  console.log("Por rol:", Object.fromEntries(porRol));
  console.log("Omitidas por categoría:", Object.fromEntries(porCategoria));
  console.log("Avisos por categoría:", Object.fromEntries(avisosPorCategoria));
  if (ciudadesSinCentro.size > 0) console.log("Sin centro, por ciudad:", Object.fromEntries([...ciudadesSinCentro.entries()].sort((a, b) => b[1] - a[1])));
  console.log(`Activas con la cédula como clave: ${activas.filter((p) => p.password_inicial === "").length} | con clave propia o aparte: ${r.clavesEspeciales.length} | inactivas (sin poder entrar): ${inactivas.length}`);
  console.log(`📝 Archivos en ${salida} (solo legibles por ti)`);
  console.log("⚠️  Los .xlsx y los .csv tienen datos personales y CLAVES: no los subas a git ni los compartas, y bórralos TODOS cuando termine la carga.");
}

main();
