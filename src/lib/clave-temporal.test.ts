import assert from "node:assert/strict";
import { test } from "node:test";

import { generarClaveTemporal, LARGO_CLAVE_TEMPORAL } from "./clave-temporal";
import { LARGO_MINIMO_CLAVE } from "./usuarios-carga";

test("la clave temporal tiene el largo esperado, cumple el mínimo del sistema y no usa caracteres ambiguos", () => {
  assert.ok(LARGO_CLAVE_TEMPORAL >= LARGO_MINIMO_CLAVE);
  for (let i = 0; i < 200; i++) {
    const c = generarClaveTemporal();
    assert.equal(c.length, LARGO_CLAVE_TEMPORAL);
    assert.match(c, /^[A-HJ-NP-Za-km-z2-9]+$/);
  }
});

test("usa el generador recibido (recorre el alfabeto sin salirse)", () => {
  assert.equal(generarClaveTemporal(() => 0), "A".repeat(LARGO_CLAVE_TEMPORAL));
  assert.equal(generarClaveTemporal((n) => n - 1), "9".repeat(LARGO_CLAVE_TEMPORAL));
});

test("dos claves seguidas no coinciden", () => {
  assert.notEqual(generarClaveTemporal(), generarClaveTemporal());
});
