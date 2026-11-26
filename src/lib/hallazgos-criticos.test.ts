import assert from "node:assert/strict";
import { test } from "node:test";

import { armarAlertaNoApto, descripcionCritica, HALLAZGOS_CRITICOS } from "./hallazgos-criticos";
import { incidentSchema } from "./validations";

const base = { vehicleId: "11111111-1111-4111-8111-111111111111", reportadoPor: "Ana Pérez", afectaOperatividad: false };

test("la descripción crítica la arma el servidor con el hallazgo, con o sin detalle", () => {
  assert.equal(descripcionCritica("Falla de frenos"), "CRÍTICO: Falla de frenos.");
  assert.equal(descripcionCritica("Falla de frenos", "  pedal largo "), "CRÍTICO: Falla de frenos. pedal largo");
  // Si el cliente ya trae el prefijo de este hallazgo no se duplica.
  assert.equal(descripcionCritica("Falla de frenos", "CRÍTICO: Falla de frenos. pedal largo"), "CRÍTICO: Falla de frenos. pedal largo");
  assert.ok(HALLAZGOS_CRITICOS.length >= 8);
});

test("regresión: un hallazgo crítico sigue siéndolo aunque el OVEM borre o reescriba el texto", () => {
  const sinTexto = incidentSchema.safeParse({ ...base, descripcion: "", hallazgoCritico: "Falla de frenos" });
  assert.equal(sinTexto.success, true);
  const otroTexto = incidentSchema.safeParse({ ...base, descripcion: "TEST- algo distinto", hallazgoCritico: "Falla de frenos" });
  assert.equal(otroTexto.success, true);
  assert.equal(otroTexto.success && otroTexto.data.hallazgoCritico, "Falla de frenos");
});

test("solo la lista cerrada cuenta como hallazgo crítico", () => {
  assert.equal(incidentSchema.safeParse({ ...base, descripcion: "me parece que está raro", hallazgoCritico: "me parece que está raro" }).success, false);
  assert.equal(incidentSchema.safeParse({ ...base, descripcion: "texto con CRÍTICO: Falla de frenos. pero sin hallazgo" }).success, true);
});

test("sin hallazgo crítico la descripción sigue pidiendo 10 caracteres", () => {
  const r = incidentSchema.safeParse({ ...base, descripcion: "corta" });
  assert.equal(r.success, false);
  assert.equal(!r.success && r.error.issues[0]?.path[0], "descripcion");
});

test("el aviso nombra la placa, el centro y los hallazgos, y escapa el HTML", () => {
  const a = armarAlertaNoApto({ placa: "JQS239", centro: "CRA Bogotá", hallazgos: ["Falla de frenos <urgente>"], reportadoPor: "Ana", cuando: "02/10/2026 07:41" });
  assert.match(a.asunto, /NO APTO — JQS239/);
  assert.match(a.html, /CRA Bogotá/);
  assert.match(a.html, /&lt;urgente&gt;/);
  assert.match(a.html, /07:41/);
});

test("la solicitud dice que requiere aval y que hay bloqueo provisional", () => {
  const a = armarAlertaNoApto({ placa: "JQS239", centro: "CRA Medellín", hallazgos: ["Choque lateral con lesionados"], reportadoPor: "Ana", cuando: "02/10/2026 07:41", tipo: "SOLICITUD" });
  assert.match(a.asunto, /SOLICITUD DE NO APTO — JQS239/);
  assert.match(a.html, /bloqueo provisional/);
  assert.match(a.html, /avala o rechaza/);
});
