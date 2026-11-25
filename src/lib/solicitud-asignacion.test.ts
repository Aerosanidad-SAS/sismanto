import { test } from "node:test";
import assert from "node:assert/strict";
import { operadoresConLlegada, validarDecisionAsignacion } from "./solicitud-asignacion";

test("confirmar no pide nota; rechazar sí", () => {
  assert.equal(validarDecisionAsignacion("CONFIRMAR"), null);
  assert.match(validarDecisionAsignacion("RECHAZAR", "no")!, /Explica/);
  assert.equal(validarDecisionAsignacion("RECHAZAR", "El vehículo es de otro turno"), null);
  assert.equal(validarDecisionAsignacion("OTRA"), "Decisión inválida.");
});

test("el conductor que llega se suma sin duplicarse", () => {
  assert.deepEqual(operadoresConLlegada(["a"], "b"), ["a", "b"]);
  assert.deepEqual(operadoresConLlegada(["a", "b"], "b"), ["a", "b"]);
});
