import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { permitirIntento } from "./rate-limit-memoria";

// Claves únicas por prueba (Date.now()) para que no compartan cupo entre sí.
const clave = (etiqueta: string) => `${etiqueta}:${Date.now()}:${Math.random()}`;

describe("permitirIntento", () => {
  it("permite hasta el máximo y bloquea el siguiente", () => {
    const k = clave("tope");
    assert.equal(permitirIntento(k, 3, 60_000), true);
    assert.equal(permitirIntento(k, 3, 60_000), true);
    assert.equal(permitirIntento(k, 3, 60_000), true);
    assert.equal(permitirIntento(k, 3, 60_000), false);
    assert.equal(permitirIntento(k, 3, 60_000), false);
  });

  it("no mezcla el cupo de claves distintas", () => {
    const a = clave("a");
    const b = clave("b");
    assert.equal(permitirIntento(a, 1, 60_000), true);
    assert.equal(permitirIntento(a, 1, 60_000), false);
    assert.equal(permitirIntento(b, 1, 60_000), true);
  });

  it("reabre el cupo cuando la ventana ya venció", async () => {
    const k = clave("ventana");
    assert.equal(permitirIntento(k, 1, 20), true);
    assert.equal(permitirIntento(k, 1, 20), false);
    await new Promise((r) => setTimeout(r, 30));
    assert.equal(permitirIntento(k, 1, 20), true);
  });
});
