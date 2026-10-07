import assert from "node:assert/strict";
import { test } from "node:test";

import { generarClaveTemporal, LARGO_CLAVE_TEMPORAL } from "./clave-temporal";
import { LARGO_MINIMO_CLAVE, validarClaveNueva } from "./usuarios-carga";

test("la clave temporal tiene el largo esperado y no usa caracteres ambiguos", () => {
  for (let i = 0; i < 200; i++) {
    const c = generarClaveTemporal();
    assert.equal(c.length, LARGO_CLAVE_TEMPORAL);
    assert.match(c, /^[A-HJKMNP-Z2-9]+$/);
  }
});

test("cumple el mínimo de la clave inicial y pasa las reglas de validarClaveNueva", () => {
  assert.ok(LARGO_CLAVE_TEMPORAL >= LARGO_MINIMO_CLAVE);
  const c = generarClaveTemporal();
  assert.equal(validarClaveNueva(c, c, "1020458300", "123456"), null);
});

test("dos claves seguidas casi nunca coinciden", () => {
  const vistas = new Set(Array.from({ length: 500 }, () => generarClaveTemporal()));
  assert.equal(vistas.size, 500);
});
