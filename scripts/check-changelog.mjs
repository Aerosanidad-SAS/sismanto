// Comprobación de CI de los PR hacia `dev` (ver changelog/README.md):
//  1. Nadie sube la versión en su PR: package.json (campo version) y CHANGELOG.md no cambian, salvo en el PR de release.
//  2. Todo PR trae al menos un archivo nuevo en changelog/unreleased/ y con el formato correcto, salvo los de solo
//     documentación con la etiqueta `no-changelog`.
//
// Variables: BASE_REF (ej. origin/dev), PR_TITLE, PR_LABELS (separadas por coma).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { DIR_PENDIENTES, leerFragmento } from "./lib/changelog.mjs";

const base = process.env.BASE_REF || "origin/dev";
const titulo = process.env.PR_TITLE || "";
const etiquetas = (process.env.PR_LABELS || "").split(",").map((e) => e.trim()).filter(Boolean);
// stderr de git se descarta: algunas comprobaciones (p. ej. «¿existe el archivo en la base?») fallan a propósito.
const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const fallar = (m) => {
  console.error(`\n❌ ${m}\n   Reglas de versionamiento: changelog/README.md\n`);
  process.exit(1);
};

// El PR de release es el único que puede tocar la versión y el CHANGELOG.
if (/^chore\(release\)/i.test(titulo)) {
  console.log("PR de release: se permite cambiar package.json y CHANGELOG.md.");
  process.exit(0);
}

const cambiados = git("diff", "--name-only", `${base}...HEAD`).split("\n").filter(Boolean);

// Prohibido EDITARLO; crearlo (el PR que introduce el versionamiento) sí se permite.
const existeEnBase = (() => {
  try {
    git("cat-file", "-e", `${base}:CHANGELOG.md`);
    return true;
  } catch {
    return false;
  }
})();
if (cambiados.includes("CHANGELOG.md") && existeEnBase) fallar("Este PR modifica CHANGELOG.md. Nadie lo edita a mano: lo genera `npm run release` en el PR de release.");

if (cambiados.includes("package.json")) {
  const versionBase = JSON.parse(git("show", `${base}:package.json`)).version;
  const versionPr = JSON.parse(fs.readFileSync("package.json", "utf8")).version;
  if (versionBase !== versionPr) fallar(`Este PR cambia la versión de package.json (${versionBase} → ${versionPr}). La sube solo quien hace el release.`);
}

if (etiquetas.includes("no-changelog")) {
  console.log("Etiqueta no-changelog: no se exige archivo de changelog.");
  process.exit(0);
}

const nuevos = git("diff", "--name-only", "--diff-filter=AM", `${base}...HEAD`, "--", DIR_PENDIENTES)
  .split("\n")
  .filter((f) => f.endsWith(".md") && !/readme\.md$/i.test(f));
if (nuevos.length === 0) {
  fallar(
    `Falta el archivo de changelog. Crea ${DIR_PENDIENTES}/<tema>.md con este formato (un archivo por PR):\n\n` +
      "   ---\n   type: feat | fix | chore | docs\n   area: soporte\n   roles: ADMIN, ANALISTA   (o «ninguno»)\n   migration: 065           (opcional)\n   ---\n" +
      "   Una línea en español, escrita para el usuario final.\n\n" +
      "   Si es solo documentación, pon la etiqueta `no-changelog` al PR.",
  );
}

const errores = [];
for (const f of nuevos) {
  try {
    leerFragmento(f.split("/").pop(), fs.readFileSync(f, "utf8"));
  } catch (e) {
    errores.push(e.message);
  }
}
if (errores.length > 0) fallar(`Archivo(s) de changelog inválido(s):\n   - ${errores.join("\n   - ")}`);

console.log(`✅ Changelog correcto: ${nuevos.join(", ")}`);
