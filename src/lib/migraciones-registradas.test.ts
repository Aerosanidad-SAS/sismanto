import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

// Al resolver el conflicto de scripts/apply-database.ts en un squash merge se han borrado líneas del registro dos veces
// (094–096 en #151, 100–105 después). El archivo queda en el repo, db-migrate.yml no lo aplica y nadie se entera.
test("cada migración de scripts/migrations está registrada en apply-database.ts", () => {
  const registro = readFileSync("scripts/apply-database.ts", "utf8");
  const archivos = readdirSync("scripts/migrations").filter((f) => /^\d{3}_.*\.sql$/.test(f));
  assert.ok(archivos.length > 50, "no se encontraron migraciones: ¿se corre desde la raíz del repo?");
  // Registrada en MIGRATIONS, o excluida a propósito con su motivo en un comentario `//` del archivo.
  const comentarios = registro.split(/\r?\n/).filter((l) => l.trimStart().startsWith("//")).join("\n");
  const faltan = archivos.filter((f) => !registro.includes(`"scripts/migrations/${f}"`) && !comentarios.includes(f));
  assert.deepEqual(faltan, [], `Registrar en MIGRATIONS de scripts/apply-database.ts: ${faltan.join(", ")}`);
});
