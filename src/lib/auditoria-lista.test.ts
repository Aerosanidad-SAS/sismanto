import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { ENTIDADES_AUDITORIA } from "./auditoria-lista";

function archivosFuente(dir: string): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) return archivosFuente(ruta);
    return /\.tsx?$/.test(nombre) && !nombre.endsWith(".test.ts") ? [ruta] : [];
  });
}

// SISRES b137a58 (2026-10-01): el filtro «Módulo» del Log era una lista fija y no ofrecía módulos que sí se escribían.
// Aquí la lista sigue fija (tipada), pero esta prueba falla si alguien audita una entidad que el filtro no ofrece.
test("cada entidad que se escribe en la bitácora se puede filtrar en Bitácora", () => {
  const usadas = new Set<string>();
  for (const archivo of archivosFuente("src")) {
    for (const m of readFileSync(archivo, "utf8").matchAll(/\bauditar\(\s*"[A-Z]+",\s*"([a-z_]+)"/g)) usadas.add(m[1]);
  }
  assert.ok(usadas.size > 10, "no se encontraron llamadas a auditar(): ¿cambió la firma?");
  const faltan = Array.from(usadas).filter((e) => !(ENTIDADES_AUDITORIA as readonly string[]).includes(e));
  assert.deepEqual(faltan, [], `Agregar a ENTIDADES_AUDITORIA: ${faltan.join(", ")}`);
});
