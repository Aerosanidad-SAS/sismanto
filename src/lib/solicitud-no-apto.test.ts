import assert from "node:assert/strict";
import { test } from "node:test";

import { puedeResolver, siniestroPideNoApto, validarDecision, validarMotivo } from "./solicitud-no-apto";

test("un siniestro pide NO APTO con lesionados o con el vehículo no operativo", () => {
  assert.equal(siniestroPideNoApto({ hayLesionados: true, vehiculoOperativo: true }), true);
  assert.equal(siniestroPideNoApto({ hayLesionados: false, vehiculoOperativo: false }), true);
  assert.equal(siniestroPideNoApto({ hayLesionados: false, vehiculoOperativo: true }), false);
});

test("el motivo y la nota de rechazo son obligatorios", () => {
  assert.notEqual(validarMotivo("  "), null);
  assert.equal(validarMotivo("Choque lateral"), null);
  assert.equal(validarDecision("AVALAR", undefined), null);
  assert.notEqual(validarDecision("RECHAZAR", ""), null);
  assert.equal(validarDecision("RECHAZAR", "Daño menor, se revisó en sitio"), null);
});

test("Coordinación solo resuelve las de su centro; Admin y Mantenimiento, todas; los demás, ninguna", () => {
  assert.equal(puedeResolver("COORDINACION", "CRA_BOGOTA", "CRA_BOGOTA"), true);
  assert.equal(puedeResolver("COORDINACION", "CRA_BOGOTA", "CRA_MEDELLIN"), false);
  assert.equal(puedeResolver("COORDINACION", null, "CRA_BOGOTA"), false);
  assert.equal(puedeResolver("ADMIN", null, "CRA_MEDELLIN"), true);
  assert.equal(puedeResolver("MANTENIMIENTO", null, "CRA_MEDELLIN"), true);
  for (const r of ["OVEM", "REGULACION", "ANALISTA"]) assert.equal(puedeResolver(r, "CRA_BOGOTA", "CRA_BOGOTA"), false);
});
