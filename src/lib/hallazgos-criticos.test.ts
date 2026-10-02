import assert from "node:assert/strict";
import { test } from "node:test";

import { armarAlertaNoApto, esDescripcionCritica, HALLAZGOS_CRITICOS } from "./hallazgos-criticos";

test("solo la lista cerrada cuenta como crítica", () => {
  assert.equal(esDescripcionCritica("CRÍTICO: Falla de frenos. pedal largo"), true);
  assert.equal(esDescripcionCritica("  CRÍTICO: Sin aceite de motor."), true);
  assert.equal(esDescripcionCritica("CRÍTICO: me parece que está raro"), false);
  assert.equal(esDescripcionCritica("Falla de frenos"), false);
  assert.ok(HALLAZGOS_CRITICOS.length >= 8);
});

test("el aviso nombra la placa, el centro y los hallazgos, y escapa el HTML", () => {
  const a = armarAlertaNoApto({ placa: "JQS239", centro: "CRA Bogotá", hallazgos: ["Falla de frenos <urgente>"], reportadoPor: "Ana", cuando: "02/10/2026 07:41" });
  assert.match(a.asunto, /NO APTO — JQS239/);
  assert.match(a.html, /CRA Bogotá/);
  assert.match(a.html, /&lt;urgente&gt;/);
  assert.match(a.html, /07:41/);
});
