import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prestadorSchema, puedeEditarPrestadores } from "./prestadores";

describe("prestadorSchema", () => {
  it("vacíos opcionales quedan en null y exige documento y nombre", () => {
    const r = prestadorSchema.parse({ numero: "900123456", nombre: "Clínica Ejemplo", sector: "", correo: "", area: "" });
    assert.equal(r.sector, null);
    assert.equal(r.correo, null);
    assert.equal(r.area, null);
    assert.equal(r.activo, true);
    assert.equal(prestadorSchema.safeParse({ numero: "", nombre: "X" }).success, false);
  });

  it("respeta el tamaño de las columnas y el catálogo de áreas", () => {
    assert.equal(prestadorSchema.safeParse({ numero: "900", nombre: "Uno", digito_verificacion: "123" }).success, false);
    assert.equal(prestadorSchema.safeParse({ numero: "900", nombre: "Uno", area: "OTRA" }).success, false);
    assert.equal(prestadorSchema.safeParse({ numero: "900", nombre: "Uno", area: "BIOMEDICA" }).success, true);
  });
});

describe("puedeEditarPrestadores", () => {
  it("ADMIN, ANALISTA y REGULACION (igual que la RLS de la 058 y la 123)", () => {
    assert.equal(puedeEditarPrestadores("ADMIN"), true);
    assert.equal(puedeEditarPrestadores("ANALISTA"), true);
    assert.equal(puedeEditarPrestadores("REGULACION"), true);
    assert.equal(puedeEditarPrestadores("MEDICO"), false);
    assert.equal(puedeEditarPrestadores("VISTA"), false);
    assert.equal(puedeEditarPrestadores(null), false);
  });
});
