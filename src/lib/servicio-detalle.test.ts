import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mensajeTripulacionFaltante, rolesFaltantes, rolesRequeridosPorTipo, textoDiagnostico, textoParada, tripulacionPorCompletar } from "./servicio-detalle";

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
  it("medicina domiciliaria lleva OVEM (conductor) y médico", () => {
    assert.deepEqual(rolesRequeridosPorTipo("MEDICINA DOMICILIARIA"), ["OVEM", "MEDICO"]);
    assert.deepEqual(rolesFaltantes("MEDICINA DOMICILIARIA", { ovem: 1 }), ["MEDICO"]);
    assert.deepEqual(rolesFaltantes("MEDICINA DOMICILIARIA", { ovem: 1, medico: 1 }), []);
  });
  it("los otros tipos no fijan tripulación", () => {
    assert.deepEqual(rolesRequeridosPorTipo("TELEMEDICINA"), []);
    assert.deepEqual(rolesRequeridosPorTipo("TRASLADO AEREO"), []);
    assert.deepEqual(rolesRequeridosPorTipo(null), []);
  });
  it("faltantes: TAB sin auxiliar; TAM con todos no falta nadie", () => {
    assert.deepEqual(rolesFaltantes("TAB SIMPLE", { ovem: { id: 1 } }), ["AUXILIAR_ENFERMERIA"]);
    assert.deepEqual(rolesFaltantes("TAM SIMPLE", { ovem: 1, auxiliar: 1, medico: 1 }), []);
    assert.deepEqual(rolesFaltantes("TAM SIMPLE", undefined), ["OVEM", "AUXILIAR_ENFERMERIA", "MEDICO"]);
  });
});

describe("un solo aviso de tripulación faltante", () => {
  it("el OVEM siempre cuenta, aunque el tipo no pida tripulación", () => {
    assert.deepEqual(tripulacionPorCompletar("TELEMEDICINA", {}), ["OVEM"]);
    assert.deepEqual(tripulacionPorCompletar("", undefined), ["OVEM"]);
    assert.deepEqual(tripulacionPorCompletar("TRASLADO AEREO", { ovem: 1 }), []);
  });
  it("lo que falta sale en orden OVEM, auxiliar, médico según el tipo", () => {
    assert.deepEqual(tripulacionPorCompletar("TAB DOBLE", {}), ["OVEM", "AUXILIAR_ENFERMERIA"]);
    assert.deepEqual(tripulacionPorCompletar("TAM SIMPLE", { ovem: 1 }), ["AUXILIAR_ENFERMERIA", "MEDICO"]);
    assert.deepEqual(tripulacionPorCompletar("MEDICINA DOMICILIARIA", { ovem: 1 }), ["MEDICO"]);
    assert.deepEqual(tripulacionPorCompletar("MEDICINA DOMICILIARIA", { ovem: 1, medico: 1 }), []);
  });
  it("el mensaje dice qué lleva el tipo y qué falta, en una sola frase", () => {
    assert.equal(
      mensajeTripulacionFaltante("TAB DOBLE", ["OVEM", "AUXILIAR_ENFERMERIA"]),
      "TAB DOBLE lleva OVEM y auxiliar de enfermería: falta OVEM y auxiliar de enfermería en este móvil. Sin OVEM, el servicio no le aparece a ningún conductor."
    );
    assert.equal(mensajeTripulacionFaltante("TAM SIMPLE", ["MEDICO"]), "TAM SIMPLE lleva OVEM, auxiliar de enfermería y médico: falta médico en este móvil.");
    assert.equal(mensajeTripulacionFaltante("MEDICINA DOMICILIARIA", ["MEDICO"]), "MEDICINA DOMICILIARIA lleva OVEM y médico: falta médico en este móvil.");
    assert.equal(mensajeTripulacionFaltante("", ["OVEM"]), "Falta OVEM en este móvil. Sin OVEM, el servicio no le aparece a ningún conductor.");
    assert.equal(mensajeTripulacionFaltante("TAB SIMPLE", []), "");
  });
});
