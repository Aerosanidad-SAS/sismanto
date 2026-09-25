// Lector del historial de versiones para mostrarlo en la app (menú lateral → versión). Lee el mismo formato que
// escribe scripts/lib/changelog.mjs (CHANGELOG.md y changelog/unreleased/*.md): si cambia allá, cambia aquí.
// Funciones puras: reciben el texto, no leen archivos.

export interface CambioVersion {
  area: string;
  descripcion: string;
  roles: string | null;
  migraciones: string | null;
  incompatible: boolean;
}

export interface SeccionVersion {
  titulo: string;
  cambios: CambioVersion[];
}

export interface Version {
  version: string;
  fecha: string;
  migraciones: string | null;
  secciones: SeccionVersion[];
}

export interface Pendiente extends CambioVersion {
  tipo: string;
}

const LINEA = /^- \*\*([^*]+)\*\* — (.*)$/;
const COLA = /^(.*?)(?: _Roles: (.*?)(?:\. Migración: (.*?))?\._)$/;

function leerLinea(linea: string): CambioVersion | null {
  const m = LINEA.exec(linea);
  if (!m) return null;
  let descripcion = m[2];
  let roles: string | null = null;
  let migraciones: string | null = null;
  const cola = COLA.exec(descripcion);
  if (cola) {
    descripcion = cola[1];
    roles = cola[2] ?? null;
    migraciones = cola[3] ?? null;
  }
  const incompatible = descripcion.includes(" ⚠️ Cambio incompatible.");
  return { area: m[1], descripcion: descripcion.replace(" ⚠️ Cambio incompatible.", "").trim(), roles, migraciones, incompatible };
}

/** Versiones publicadas, de la más reciente a la más antigua (el orden del archivo). */
export function leerVersiones(markdown: string): Version[] {
  const versiones: Version[] = [];
  let actual: Version | null = null;
  let seccion: SeccionVersion | null = null;

  for (const linea of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const v = /^## v(\d+\.\d+\.\d+) — (\d{4}-\d{2}-\d{2})\s*$/.exec(linea);
    if (v) {
      actual = { version: v[1], fecha: v[2], migraciones: null, secciones: [] };
      versiones.push(actual);
      seccion = null;
      continue;
    }
    if (!actual) continue;
    const mig = /^Migraciones incluidas: (.*)\.$/.exec(linea);
    if (mig) {
      actual.migraciones = mig[1];
      continue;
    }
    const s = /^### (.+)$/.exec(linea);
    if (s) {
      seccion = { titulo: s[1].trim(), cambios: [] };
      actual.secciones.push(seccion);
      continue;
    }
    const cambio = seccion ? leerLinea(linea) : null;
    if (cambio && seccion) seccion.cambios.push(cambio);
  }
  return versiones;
}

const TITULO_TIPO: Record<string, string> = { feat: "Funcionalidad", fix: "Corrección", chore: "Mantenimiento", docs: "Documentación" };

/** Un archivo de changelog/unreleased → un cambio pendiente. Devuelve null si el archivo no tiene el formato. */
export function leerPendiente(contenido: string): Pendiente | null {
  const m = /^---\n([\s\S]*?)\n---(?:\n([\s\S]*))?$/.exec(contenido.replace(/\r\n/g, "\n").trim());
  if (!m) return null;
  const meta: Record<string, string> = {};
  for (const linea of m[1].split("\n")) {
    const i = linea.indexOf(":");
    if (i > 0) meta[linea.slice(0, i).trim().toLowerCase()] = linea.slice(i + 1).trim();
  }
  const descripcion = (m[2] ?? "").trim();
  if (!meta.type || !meta.area || !descripcion) return null;
  return {
    tipo: TITULO_TIPO[meta.type] ?? meta.type,
    area: meta.area,
    descripcion,
    roles: meta.roles ?? null,
    migraciones: meta.migration ?? null,
    incompatible: meta.breaking === "true",
  };
}
