import assert from "node:assert/strict";
import { test } from "node:test";

import { mayorLectura, validarKmEnLinea, type LecturaKm } from "./kilometraje";

const L = (fecha: string, km: number, origen: LecturaKm["origen"] = "odómetro"): LecturaKm => ({ fecha, km, origen });

test("el km del mismo día no puede bajar: preoperacional 151240 y tanqueo 151220", () => {
  const err = validarKmEnLinea(151220, "2026-10-12", [L("2026-10-12", 151240, "preoperacional")]);
  assert.ok(err);
  assert.match(err, /151\.240|151,240|151240/);
  assert.match(err, /preoperacional/);
});

test("igual al anterior es válido (el vehículo no se movió) y mayor también", () => {
  assert.equal(validarKmEnLinea(151240, "2026-10-12", [L("2026-10-12", 151240)]), null);
  assert.equal(validarKmEnLinea(151300, "2026-10-12", [L("2026-10-12", 151240)]), null);
});

test("sin lecturas previas no hay nada que contradecir", () => {
  assert.equal(validarKmEnLinea(10, "2026-10-12", []), null);
});

test("lecturas de días anteriores también limitan por abajo", () => {
  assert.ok(validarKmEnLinea(100, "2026-10-12", [L("2026-10-11", 200)]));
});

test("un tanqueo con fecha pasada no puede superar la lectura posterior", () => {
  const lecturas = [L("2026-10-10", 1000), L("2026-10-12", 1200)];
  assert.equal(validarKmEnLinea(1100, "2026-10-11", lecturas), null);
  assert.ok(validarKmEnLinea(1300, "2026-10-11", lecturas));
  assert.ok(validarKmEnLinea(900, "2026-10-11", lecturas));
});

test("mayorLectura devuelve la más alta o null", () => {
  assert.equal(mayorLectura([]), null);
  assert.equal(mayorLectura([L("2026-10-10", 5), L("2026-10-11", 9), L("2026-10-12", 7)])?.km, 9);
});
