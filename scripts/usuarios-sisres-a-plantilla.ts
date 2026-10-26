/**
 * Prepara la pasada de usuarios de SISRES: convierte el CSV de la tabla `usuarios` en la plantilla de carga masiva de
 * SISMANTO (Administración → Usuarios → carga masiva). NO escribe en ninguna base ni envía nada: solo genera archivos.
 * Guía completa y riesgos: docs/PASADA_USUARIOS.md.
 *
 * Uso:
 *   npx tsx scripts/usuarios-sisres-a-plantilla.ts <usuarios.csv> --salida <carpeta> [--roles-clave-propia ROL1,ROL2]
 *                                                  [--aceptar-carpeta-sincronizada]
 *
 * El CSV sale de la tabla `usuarios` de SISRES. Exporta SOLO las columnas que se usan (id, usuario, identificacion, nombre1,
 * nombre2, apellido1, apellido2, cargo, correo, ciudad, estado): este script no usa la columna de contraseñas, pero el
 * archivo que la lleve ya la tendría en claro.
 *
 * Genera en --salida:
 *   usuarios-plantilla-01.xlsx, -02.xlsx…  hoja «USUARIOS», máximo 500 filas por archivo (el límite de la pantalla).
 *                                          LLEVAN las claves en claro de ADMIN, ANALISTA, GERENCIAL y cédulas cortas.
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
  const archivo = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--salida" && args[i - 1] !== "--roles-clave-propia");
  const salidaPedida = valorDe(args, "--salida");
  if (!archivo || !fs.existsSync(archivo) || !salidaPedida) {
    console.error("Uso: npx tsx scripts/usuarios-sisres-a-plantilla.ts <usuarios.csv> --salida <carpeta fuera del repo> [--roles-clave-propia ROL1,ROL2] [--aceptar-carpeta-sincronizada]");
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
  }

  const filas = parseCsvUsuarios(fs.readFileSync(archivo, "utf-8"));
  const problemas = revisarColumnasSisres(filas);
  if (problemas.length > 0) {
    for (const p of problemas) console.error("✖ " + p);
    process.exit(1);
  }

  const rolesExtra = (valorDe(args, "--roles-clave-propia") ?? "").split(",").map((r) => r.trim().toUpperCase()).filter(Boolean);
  const r = convertirUsuariosSisres(filas, { rolesConClavePropia: rolesExtra });

  fs.mkdirSync(salida, { recursive: true, mode: 0o700 });

  // Plantilla(s): una hoja «USUARIOS» con los encabezados en la fila 1 y los datos desde la fila 2, como la lee la pantalla.
  const archivos: string[] = [];
  for (let i = 0; i < r.plantilla.length; i += FILAS_POR_ARCHIVO) {
    const lote = r.plantilla.slice(i, i + FILAS_POR_ARCHIVO);
    const hoja = XLSX.utils.aoa_to_sheet([[...COLUMNAS_PLANTILLA], ...lote.map((p) => COLUMNAS_PLANTILLA.map((c) => p[c]))]);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "USUARIOS");
    const nombre = `usuarios-plantilla-${String(archivos.length + 1).padStart(2, "0")}.xlsx`;
    escribir(path.join(salida, nombre), XLSX.write(libro, { type: "buffer", bookType: "xlsx" }) as Buffer);
    archivos.push(nombre);
  }

  escribir(
    path.join(salida, "usuarios-omitidas.csv"),
    aCsv(["categoria", "motivo", "id_sisres", "cedula", "cargo", "ciudad", "estado"], r.omitidas.map((o) => [o.categoria, o.motivo, o.fila.id ?? "", o.fila.usuario ?? "", o.fila.cargo ?? "", o.fila.ciudad ?? "", o.fila.estado ?? ""]))
  );
  escribir(path.join(salida, "usuarios-avisos.csv"), aCsv(["id_sisres", "cedula", "aviso"], r.avisos.map((a) => [a.idSisres, a.cedula, a.aviso])));
  escribir(
    path.join(salida, "claves-iniciales-especiales.csv"),
    aCsv(["cedula", "nombre", "rol", "clave", "motivo"], r.clavesEspeciales.map((c) => [c.cedula, c.nombre, c.rol, c.clave, c.motivo]))
  );

  // Solo conteos por categoría fija: ni cédulas, ni nombres, ni claves, ni texto libre del CSV salen por pantalla.
  const porRol = new Map<string, number>();
  for (const p of r.plantilla) porRol.set(p.rol, (porRol.get(p.rol) ?? 0) + 1);
  const porCategoria = new Map<string, number>();
  for (const o of r.omitidas) porCategoria.set(o.categoria, (porCategoria.get(o.categoria) ?? 0) + 1);
  console.log(`Leídas ${filas.length} filas de SISRES → a la plantilla: ${r.plantilla.length} (${archivos.length} archivo${archivos.length === 1 ? "" : "s"}), omitidas: ${r.omitidas.length}, con aviso: ${r.avisos.length}`);
  console.log("Por rol:", Object.fromEntries(porRol));
  console.log("Omitidas por categoría:", Object.fromEntries(porCategoria));
  console.log(`Entran con la cédula como clave: ${r.plantilla.filter((p) => p.password_inicial === "").length} | con clave propia o aparte: ${r.clavesEspeciales.length}`);
  console.log(`📝 Archivos en ${salida} (solo legibles por ti)`);
  console.log("⚠️  Los .xlsx y los .csv tienen datos personales y CLAVES: no los subas a git ni los compartas, y bórralos TODOS cuando termine la carga.");
}

main();
