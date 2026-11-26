import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { esEnvioRepetido } from "./captacion-procedimientos";

// La migración 144 no se puede probar contra Postgres en CI: esto vigila en el texto lo que protege los datos.
const sql = readFileSync("scripts/migrations/144_captacion_procedimientos.sql", "utf8")
  .split(/\r?\n/)
  .filter((l) => !l.trimStart().startsWith("--"))
  .join("\n");

describe("migración 144: captacion_procedimientos", () => {
  it("enciende la RLS y le quita todo a anon", () => {
    assert.match(sql, /ALTER TABLE captacion_procedimientos ENABLE ROW LEVEL SECURITY/);
    assert.match(sql, /REVOKE ALL ON captacion_procedimientos FROM anon;/);
    assert.doesNotMatch(sql, /\bTO (anon|public)\b/i);
  });

  it("tiene una política por operación, solo para authenticated, y la restrictiva de roles restringidos", () => {
    for (const op of ["SELECT", "INSERT", "UPDATE", "DELETE"]) {
      assert.match(sql, new RegExp(`FOR ${op} TO authenticated`));
    }
    assert.doesNotMatch(sql, /FOR ALL/);
    assert.match(sql, /aplicar_politica_rol_restringido\('captacion_procedimientos'\)/);
  });

  it("evalúa rol y usuario una vez por consulta (087)", () => {
    const sinEnvolver = sql
      .replace(/\(SELECT (puede_captacion|get_user_role|auth\.uid)\(\)\)/g, "")
      .match(/puede_captacion\(\)|get_user_role\(\)|auth\.uid\(\)/g);
    assert.equal(sinEnvolver, null);
  });

  it("no deja guardar dos veces la misma línea de un lote", () => {
    assert.match(sql, /CREATE UNIQUE INDEX IF NOT EXISTS \w+ ON captacion_procedimientos \(lote, procedimiento\)/);
  });
});

describe("esEnvioRepetido", () => {
  it("reconoce solo la violación de unicidad", () => {
    assert.equal(esEnvioRepetido({ code: "23505" }), true);
    assert.equal(esEnvioRepetido({ code: "42501" }), false);
    assert.equal(esEnvioRepetido(null), false);
  });
});
