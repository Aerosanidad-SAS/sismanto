/**
 * Falla si algún archivo de `scripts/` tiene un error de SINTAXIS.
 *
 * Por qué: `tsconfig.json` excluye `scripts/` del chequeo de tipos y `next lint` tampoco los cubre, así que una cadena
 * sin cerrar o una llave de más pasa el CI, y revienta cuando `db:apply` (que corre con `tsx`) intenta cargar el módulo:
 * ni siquiera llega a conectarse. Pasó el 14/10/2026 con `scripts/apply-database.ts` (#285): `db-migrate.yml` falló en
 * `dev` y la migración 132 no se aplicó. Aquí solo se mira la sintaxis (no tipos), que es barata y sin falsos positivos.
 *
 * Uso: `npm run check:scripts`
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const DIR = "scripts";
const archivos = [];
(function recorrer(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) recorrer(p);
    else if (/\.(ts|tsx|mts|mjs|js|cjs)$/.test(e.name)) archivos.push(p);
  }
})(DIR);

const malos = [];
for (const f of archivos) {
  const out = ts.transpileModule(fs.readFileSync(f, "utf8"), {
    fileName: f,
    reportDiagnostics: true,
    compilerOptions: { allowJs: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  for (const d of out.diagnostics ?? []) {
    if (d.category !== ts.DiagnosticCategory.Error) continue;
    const pos = d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start) : null;
    malos.push(`${f}${pos ? `:${pos.line + 1}:${pos.character + 1}` : ""}  ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`);
  }
}

if (malos.length > 0) {
  console.error(`\n❌ ${malos.length} error(es) de sintaxis en scripts/ (db:apply y el ETL no cargarían):\n`);
  for (const m of malos) console.error("  " + m);
  process.exit(1);
}
console.log(`✅ ${archivos.length} archivos de scripts/ sin errores de sintaxis.`);
