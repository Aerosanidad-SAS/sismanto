import assert from "node:assert/strict";
import { test } from "node:test";

import { LADOS_VEHICULO, columnaDeLado, esLadoVehiculo, rutaFotoVehiculo } from "./vehiculo-fotos";

test("los 4 lados tienen columna y etiqueta únicas", () => {
  assert.equal(LADOS_VEHICULO.length, 4);
  assert.equal(new Set(LADOS_VEHICULO.map((l) => l.lado)).size, 4);
  assert.equal(new Set(LADOS_VEHICULO.map((l) => l.columna)).size, 4);
});

test("esLadoVehiculo valida solo los 4 lados conocidos", () => {
  assert.ok(esLadoVehiculo("frente"));
  assert.ok(esLadoVehiculo("lateral_derecho"));
  assert.ok(!esLadoVehiculo("techo"));
  assert.ok(!esLadoVehiculo(""));
});

test("columnaDeLado devuelve la columna de ese lado", () => {
  assert.equal(columnaDeLado("frente"), "foto_frente");
  assert.equal(columnaDeLado("lateral_izquierdo"), "foto_lateral_izquierdo");
});

test("rutaFotoVehiculo separa vehículo y preoperacional por prefijo", () => {
  assert.equal(rutaFotoVehiculo("vehiculo", "abc-123", "frente", "jpg", "xyz"), "vehiculo-abc-123/frente-xyz.jpg");
  assert.equal(rutaFotoVehiculo("preoperacional", 42, "trasera", "png", "xyz"), "preoperacional-42/trasera-xyz.png");
});
