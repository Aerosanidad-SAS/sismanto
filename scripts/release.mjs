// Publica una versión de SISMANTO (ver changelog/README.md).
//
//   npm run release            calcula la versión, actualiza CHANGELOG.md y package.json y borra los archivos pendientes
//   npm run release -- --dry-run   solo muestra lo que haría, sin escribir nada
//
// Se ejecuta en una rama `chore/release-vX.Y.Z` desde `origin/dev` y va en su PR `chore(release): vX.Y.Z` hacia `dev`.
// Después se promueve dev → staging; al mergear a staging un workflow crea el tag vX.Y.Z.
import fs from "node:fs";
import { ENCABEZADO_CHANGELOG, DIR_PENDIENTES, leerPendientes, nuevaVersion, seccionMarkdown } from "./lib/changelog.mjs";

const simulacro = process.argv.includes("--dry-run");
const fallar = (m) => {
  console.error(`\n❌ ${m}\n`);
  process.exit(1);
};

let fragmentos;
try {
  fragmentos = leerPendientes();
} catch (e) {
  fallar(e.message);
}
if (fragmentos.length === 0) fallar(`No hay nada que publicar: ${DIR_PENDIENTES}/ está vacío.`);

const paquete = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = nuevaVersion(paquete.version, fragmentos);
// Fecha en hora de Colombia (UTC-5, sin horario de verano), como el resto de la aplicación.
const fecha = new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10);
const seccion = seccionMarkdown(version, fecha, fragmentos);

console.log(`Versión actual: ${paquete.version} → nueva: ${version} (${fragmentos.length} cambio(s))\n`);
console.log(seccion);

if (simulacro) {
  console.log("(--dry-run: no se escribió nada)");
  process.exit(0);
}

// CHANGELOG.md: la versión nueva va justo debajo del encabezado.
const rutaChangelog = "CHANGELOG.md";
const previo = fs.existsSync(rutaChangelog) ? fs.readFileSync(rutaChangelog, "utf8").replace(/\r\n/g, "\n") : "";
const cuerpoPrevio = previo.startsWith("# ") ? previo.slice(previo.indexOf("\n## ") >= 0 ? previo.indexOf("\n## ") + 1 : previo.length) : previo;
fs.writeFileSync(rutaChangelog, `${ENCABEZADO_CHANGELOG}${seccion}\n${cuerpoPrevio}`.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n");

// package.json y package-lock.json (dos campos) con la misma versión.
paquete.version = version;
fs.writeFileSync("package.json", JSON.stringify(paquete, null, 2) + "\n");
if (fs.existsSync("package-lock.json")) {
  const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
  lock.version = version;
  if (lock.packages?.[""]) lock.packages[""].version = version;
  fs.writeFileSync("package-lock.json", JSON.stringify(lock, null, 2) + "\n");
}

for (const f of fragmentos) fs.unlinkSync(`${DIR_PENDIENTES}/${f.nombre}`);

console.log(`\n✅ Versión v${version} lista. Siguiente paso:`);
console.log(`   git checkout -b chore/release-v${version}   (desde origin/dev)`);
console.log(`   git add -A && git commit -m "chore(release): v${version}"`);
console.log("   PR hacia dev con ese título; luego se promueve dev → staging (ahí se crea el tag).");
