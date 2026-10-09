import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clavesSinEntregar, esCorreoEnviable, soloEnviables } from "./correo-destinatarios";

describe("esCorreoEnviable", () => {
  it("acepta correos de personas", () => {
    for (const c of ["ana@aerosanidadsas.com", "sistemas@gmail.com", " Luis.Perez@empresa.com.co "]) assert.equal(esCorreoEnviable(c), true, c);
  });

  it("rechaza las cuentas de prueba e internas", () => {
    for (const c of ["test.coordinacion@sismanto.test", "u@sismanto.invalid", "admin@staging.local", "a@example.com", "a@EXAMPLE.org"]) {
      assert.equal(esCorreoEnviable(c), false, c);
    }
  });

  it("rechaza vacíos y textos que no son un correo", () => {
    for (const c of [null, undefined, "", "   ", "sin-arroba", "a@b", "a b@c.com"]) assert.equal(esCorreoEnviable(c), false, String(c));
  });
});

describe("soloEnviables", () => {
  it("filtra, pone en minúscula, no repite y conserva el orden", () => {
    assert.deepEqual(
      soloEnviables(["B@x.com", "test@sismanto.test", "a@x.com", "b@x.com", null, "x@staging.local"]),
      ["b@x.com", "a@x.com"]
    );
  });

  it("acepta cualquier iterable (un Set)", () => {
    assert.deepEqual(soloEnviables(new Set(["a@x.com", "u@sismanto.invalid"])), ["a@x.com"]);
  });
});

describe("clavesSinEntregar", () => {
  it("si el envío salió, nada queda sin entregar", () => {
    assert.deepEqual(clavesSinEntregar(["a", "b"], [{ claves: ["a", "b"], ok: true }]), []);
  });

  it("si el envío falló, todos sus avisos quedan sin entregar", () => {
    assert.deepEqual(clavesSinEntregar(["a", "b"], [{ claves: ["a", "b"], ok: false }]), ["a", "b"]);
  });

  it("sin ningún envío (no había destinatarios o correo), todo queda sin entregar", () => {
    assert.deepEqual(clavesSinEntregar(["a", "b"], []), ["a", "b"]);
  });

  it("un aviso entregado por un envío y fallado en otro cuenta como entregado (no se repite el correo que sí salió)", () => {
    assert.deepEqual(
      clavesSinEntregar(["a", "b", "c"], [
        { claves: ["a", "b"], ok: true },
        { claves: ["b", "c"], ok: false },
      ]),
      ["c"]
    );
  });

  it("un aviso que no iba en ningún envío queda sin entregar aunque otros sí salieran", () => {
    assert.deepEqual(clavesSinEntregar(["a", "z"], [{ claves: ["a"], ok: true }]), ["z"]);
  });
});
