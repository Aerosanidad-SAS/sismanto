// Lógica compartida del versionamiento de SISMANTO (ver changelog/README.md). Sin dependencias.
// La usan scripts/release.mjs (publicar una versión) y scripts/check-changelog.mjs (CI de los PR).
// El mismo formato lo lee la app (src/lib/changelog.ts): si se cambia aquí, hay que cambiarlo allá.
import fs from "node:fs";
import path from "node:path";

export const DIR_PENDIENTES = "changelog/unreleased";

// Orden y título de cada sección del CHANGELOG.
export const TIPOS = {
  feat: "Funcionalidades",
  fix: "Correcciones",
  chore: "Mantenimiento",
  docs: "Documentación",
};

/**
 * Lee un archivo de changelog:
 *
 *   ---
 *   type: feat            (feat | fix | chore | docs)
 *   area: soporte
 *   roles: ADMIN, ANALISTA  (o «ninguno»)
 *   migration: 065          (opcional; varias separadas por coma)
 *   breaking: true          (opcional: cambio incompatible o migración [DB-DESTRUCTIVE])
 *   ---
 *   Una línea, en español, escrita para el usuario final.
 */
export function leerFragmento(nombre, contenido) {
  const texto = contenido.replace(/\r\n/g, "\n").trim();
  const m = /^---\n([\s\S]*?)\n---(?:\n([\s\S]*))?$/.exec(texto);
  if (!m) throw new Error(`${nombre}: debe empezar con un bloque «---» con type, area y roles.`);

  const meta = {};
  for (const linea of m[1].split("\n")) {
    if (!linea.trim()) continue;
    const i = linea.indexOf(":");
    if (i < 0) throw new Error(`${nombre}: línea inválida en el bloque: «${linea}»`);
    meta[linea.slice(0, i).trim().toLowerCase()] = linea.slice(i + 1).trim();
  }

  if (!Object.hasOwn(TIPOS, meta.type)) throw new Error(`${nombre}: type debe ser ${Object.keys(TIPOS).join(", ")} (es «${meta.type ?? ""}»).`);
  if (!meta.area) throw new Error(`${nombre}: falta «area».`);
  if (!/^[a-z0-9-]+$/.test(meta.area)) throw new Error(`${nombre}: area debe ir en minúsculas, sin espacios (ej. soporte, formatos-ti).`);
  if (!meta.roles) throw new Error(`${nombre}: falta «roles» (usa «ninguno» si no aplica).`);
  if (meta.migration && !/^\d{3}(\s*,\s*\d{3})*$/.test(meta.migration)) throw new Error(`${nombre}: migration debe ser números de 3 cifras separados por coma (ej. 065, 066).`);
  if (meta.breaking && !["true", "false"].includes(meta.breaking)) throw new Error(`${nombre}: breaking debe ser true o false.`);

  const descripcion = (m[2] ?? "").trim();
  if (!descripcion) throw new Error(`${nombre}: falta la descripción (una línea) después del bloque.`);
  if (descripcion.includes("\n")) throw new Error(`${nombre}: la descripción debe ser UNA sola línea.`);

  return {
    nombre,
    type: meta.type,
    area: meta.area,
    roles: meta.roles,
    migraciones: meta.migration ? meta.migration.split(",").map((x) => x.trim()) : [],
    breaking: meta.breaking === "true",
    descripcion,
  };
}

export function leerPendientes(raiz = ".") {
  const dir = path.join(raiz, DIR_PENDIENTES);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .sort()
    .map((f) => leerFragmento(f, fs.readFileSync(path.join(dir, f), "utf8")));
}

/** 0.x: feat o breaking suben MINOR, lo demás PATCH. Desde 1.0: breaking sube MAJOR, feat MINOR, lo demás PATCH. */
export function nuevaVersion(actual, fragmentos) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(actual);
  if (!m) throw new Error(`La versión actual «${actual}» no es MAJOR.MINOR.PATCH.`);
  let [major, minor, patch] = m.slice(1).map(Number);
  const hayBreaking = fragmentos.some((f) => f.breaking);
  const hayFeat = fragmentos.some((f) => f.type === "feat");
  if (major >= 1 && hayBreaking) return `${major + 1}.0.0`;
  if (hayFeat || hayBreaking) return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export function lineaFragmento(f) {
  const partes = [`Roles: ${f.roles}`];
  if (f.migraciones.length > 0) partes.push(`Migración: ${f.migraciones.join(", ")}`);
  const cola = ` _${partes.join(". ")}._`;
  return `- **${f.area}** — ${f.descripcion}${f.breaking ? " ⚠️ Cambio incompatible." : ""}${cola}`;
}

export function seccionMarkdown(version, fecha, fragmentos) {
  const migraciones = [...new Set(fragmentos.flatMap((f) => f.migraciones))].sort();
  const lineas = [`## v${version} — ${fecha}`, ""];
  if (migraciones.length > 0) lineas.push(`Migraciones incluidas: ${migraciones.join(", ")}.`, "");
  for (const [tipo, titulo] of Object.entries(TIPOS)) {
    const delTipo = fragmentos.filter((f) => f.type === tipo).sort((a, b) => a.area.localeCompare(b.area) || a.nombre.localeCompare(b.nombre));
    if (delTipo.length === 0) continue;
    lineas.push(`### ${titulo}`, "", ...delTipo.map(lineaFragmento), "");
  }
  return lineas.join("\n");
}

export const ENCABEZADO_CHANGELOG =
  "# Historial de cambios de SISMANTO\n\n" +
  "Lo genera `npm run release` a partir de los archivos de `changelog/unreleased/`. No se edita a mano (ver `changelog/README.md`).\n\n";
