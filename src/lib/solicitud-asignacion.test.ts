import { test } from "node:test";
import assert from "node:assert/strict";
import { avisoAsignacion, motivoNoConfirmable, operadoresConLlegada, validarDecisionAsignacion } from "./solicitud-asignacion";

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

test("no se confirma una solicitud de otro día ni de un vehículo con NO APTO pendiente", () => {
  const base = { fechaSolicitud: "2026-11-26", hoy: "2026-11-26", noAptoPendiente: false };
  assert.equal(motivoNoConfirmable(base), null);
  assert.match(motivoNoConfirmable({ ...base, fechaSolicitud: "2026-11-25" })!, /otro día/);
  assert.match(motivoNoConfirmable({ ...base, noAptoPendiente: true })!, /NO APTO/);
});

test("el aviso del OVEM sigue la programación del día antes que la solicitud", () => {
  const caso = (asignadoHoy: boolean, estado: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | null, enviadaAhora = false) =>
    avisoAsignacion({ vehicleId: "v1", asignadoHoy, solicitud: estado ? { vehicleId: "v1", estado } : null, enviadaAhora });
  assert.equal(caso(false, null), "PEDIR");
  assert.equal(caso(false, null, true), "PENDIENTE");
  assert.equal(caso(false, "PENDIENTE"), "PENDIENTE");
  // Rechazada mientras la pantalla seguía abierta: el «enviada» local no la tapa.
  assert.equal(caso(false, "RECHAZADA", true), "RECHAZADA");
  assert.equal(caso(true, "CONFIRMADA"), "CONFIRMADA");
  assert.equal(caso(true, null), "OCULTO");
  // Confirmada y después retirado de la programación: puede volver a pedirlo.
  assert.equal(caso(false, "CONFIRMADA"), "PEDIR");
  // La solicitud de otro vehículo no dice nada sobre este.
  assert.equal(avisoAsignacion({ vehicleId: "v2", asignadoHoy: false, solicitud: { vehicleId: "v1", estado: "PENDIENTE" }, enviadaAhora: false }), "PEDIR");
});
