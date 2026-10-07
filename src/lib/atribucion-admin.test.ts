import assert from "node:assert/strict";
import { test } from "node:test";

import { TEXTO_ATRIBUCION_ADMIN, detalleConAtribucion } from "./atribucion-admin";

test("el ADMIN deja constancia en el detalle de que no fue la tripulación", () => {
  assert.equal(detalleConAtribucion("ADMIN", "Paso fecha_hora_llegada_origen"), `Paso fecha_hora_llegada_origen · ${TEXTO_ATRIBUCION_ADMIN}`);
});

test("los demás roles conservan el detalle tal cual", () => {
  for (const rol of ["OVEM", "MEDICO", "AUXILIAR_ENFERMERIA", "REGULACION", null, undefined]) {
    assert.equal(detalleConAtribucion(rol, "Paso x"), "Paso x");
  }
});
