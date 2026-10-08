/**
 * Falla si TypeScript encuentra un nombre que no existe o un import roto.
 *
 * Por qué: `next.config.mjs` ignora los errores de tipos al compilar (`ignoreBuildErrors`), porque el cliente de Supabase
 * infiere `never` en cientos de lugares. Ese ruido tapaba errores GRAVES: un nombre sin importar compila igual y
 * revienta en producción con «ReferenceError» (pasó con `CORREO_INTERNO` en recuperar-contrasena.ts, que dejaba sin
 * funcionar «¿Olvidaste tu contraseña?», y con dos funciones sin importar en ovem.ts, que dejaban el preoperacional sin
 * novedades). Aquí solo se vigilan los códigos que significan «esto no existe», que no dependen de la inferencia de
 * Supabase y hoy son cero:
 *   TS2304  no se encuentra el nombre
 *   TS2552  no se encuentra el nombre (¿quiso decir…?)
 *   TS2305  el módulo no exporta ese miembro
 *   TS2724  el módulo no exporta ese miembro (¿quiso decir…?)
 *   TS2307  no se encuentra el módulo
 *
 * Uso: `npm run check:nombres`
 */
import { spawnSync } from "node:child_process";

const CODIGOS = ["TS2304", "TS2552", "TS2305", "TS2724", "TS2307"];

const res = spawnSync(process.execPath, ["node_modules/typescript/bin/tsc", "--noEmit", "--pretty", "false"], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
const salida = `${res.stdout ?? ""}${res.stderr ?? ""}`;
const graves = salida
  .split("\n")
  .filter((l) => CODIGOS.some((c) => l.includes(`error ${c}:`)));

if (graves.length > 0) {
  console.error(`\n❌ ${graves.length} nombre(s) o import(s) que no existen (reventarían en producción):\n`);
  for (const l of graves) console.error("  " + l);
  console.error("\nSuelen ser un import que se perdió al resolver un conflicto de merge. Corrígelo y vuelve a correr `npm run check:nombres`.");
  process.exit(1);
}
console.log("✅ Sin nombres ni imports rotos.");
