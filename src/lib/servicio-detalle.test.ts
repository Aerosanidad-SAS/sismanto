import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rolesFaltantes, rolesRequeridosPorTipo, textoDiagnostico, textoParada } from "./servicio-detalle";

describe("textoParada", () => {
  it("une dirección y ciudad", () => assert.equal(textoParada("Cra 70 #44-30", "Medellín"), "Cra 70 #44-30, Medellín"));
  it("con solo uno de los dos, devuelve ese", () => {
    assert.equal(textoParada(null, "Medellín"), "Medellín");
    assert.equal(textoParada("  Calle 10 #5-20 ", ""), "Calle 10 #5-20");
  });
  it("vacío si no hay nada", () => assert.equal(textoParada(undefined, " "), ""));
});

describe("textoDiagnostico", () => {
  it("código y descripción", () => assert.equal(textoDiagnostico("J189", "Neumonía", "tos"), "J189 — Neumonía"));
  it("solo el código si no hay descripción", () => assert.equal(textoDiagnostico("J189", null), "J189"));
  it("sin CIE cae al motivo de consulta", () => assert.equal(textoDiagnostico(null, null, " dolor torácico "), "dolor torácico"));
  it("vacío si no hay nada", () => assert.equal(textoDiagnostico(null, null), ""));
});

describe("tripulación por tipo de servicio", () => {
  it("TAB lleva OVEM y auxiliar; TAM suma médico", () => {
    assert.deepEqual(rolesRequeridosPorTipo("TAB SIMPLE"), ["OVEM", "AUXILIAR_ENFERMERIA"]);
    assert.deepEqual(rolesRequeridosPorTipo("tam doble"), ["OVEM", "AUXILIAR_ENFERMERIA", "MEDICO"]);
  });
  it("los otros tipos no fijan tripulación", () => {
    assert.deepEqual(rolesRequeridosPorTipo("MEDICINA DOMICILIARIA"), []);
    assert.deepEqual(rolesRequeridosPorTipo(null), []);
  });
  it("faltantes: TAB sin auxiliar; TAM con todos no falta nadie", () => {
    assert.deepEqual(rolesFaltantes("TAB SIMPLE", { ovem: { id: 1 } }), ["AUXILIAR_ENFERMERIA"]);
    assert.deepEqual(rolesFaltantes("TAM SIMPLE", { ovem: 1, auxiliar: 1, medico: 1 }), []);
    assert.deepEqual(rolesFaltantes("TAM SIMPLE", undefined), ["OVEM", "AUXILIAR_ENFERMERIA", "MEDICO"]);
  });
});
