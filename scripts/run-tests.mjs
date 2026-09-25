/**
 * Corre las pruebas (`*.test.ts` bajo src/) tres veces, con la zona horaria del proceso en UTC, en Colombia y en
 * Japón (UTC+9). Si un cálculo depende de la zona del equipo, alguna de las tres falla: es la red de seguridad contra
 * el "en local sale una cosa y en Vercel otra". Sin dependencias: usa el ejecutor de pruebas de Node vía tsx.
 *
 * Uso: npm test
 */
import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ZONAS = ["UTC", "America/Bogota", "Asia/Tokyo"];

function archivosDePrueba(dir) {
  const out = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) {
      if (nombre !== "node_modules") out.push(...archivosDePrueba(ruta));
    } else if (nombre.endsWith(".test.ts")) {
      out.push(ruta);
    }
  }
  return out;
}

const archivos = archivosDePrueba("src");
if (archivos.length === 0) {
  console.log("No hay pruebas.");
  process.exit(0);
}

let fallo = false;
for (const tz of ZONAS) {
  console.log(`\n=== TZ=${tz} ===`);
  const res = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "--test", ...archivos], {
    stdio: "inherit",
    env: { ...process.env, TZ: tz },
  });
  if (res.status !== 0) fallo = true;
}
process.exit(fallo ? 1 : 0);
