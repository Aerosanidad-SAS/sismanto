import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { direccionesFaltantes, faltasParaDespachar, seDespacha } from "./servicios-direccion";

const COMPLETO = {
  direccion_origen: "Calle 1 # 2-3",
  ciudad_origen: "Medellín",
  direccion_destino: "Carrera 4 # 5-6",
  ciudad_destino: "Bogotá D.C.",
};

describe("direccionesFaltantes", () => {
  it("TAB y TAM piden dirección y ciudad de origen y de destino", () => {
    for (const tipo of ["TAB SIMPLE", "TAB DOBLE", "TAB SENCILLO", "TAM SIMPLE", "TAM DOBLE"]) {
      assert.deepEqual(
        direccionesFaltantes(tipo, {}).map((f) => f.campo),
        ["direccion_origen", "ciudad_origen", "direccion_destino", "ciudad_destino"],
        tipo
      );
      assert.deepEqual(direccionesFaltantes(tipo, COMPLETO), [], tipo);
    }
  });

  it("un texto en blanco cuenta como vacío y el mensaje sale en español junto al campo", () => {
    const faltas = direccionesFaltantes("TAB SIMPLE", { ...COMPLETO, direccion_origen: "   " });
    assert.equal(faltas.length, 1);
    assert.equal(faltas[0].campo, "direccion_origen");
    assert.equal(faltas[0].mensaje, "Escribe la dirección de origen para despachar el servicio.");
  });

  it("medicina domiciliaria pide la dirección del domicilio: sirve en origen o en destino", () => {
    const sin = direccionesFaltantes("MEDICINA DOMICILIARIA", {});
    assert.deepEqual(sin.map((f) => f.campo), ["direccion_destino"]);
    assert.match(sin[0].mensaje, /domicilio/);
    assert.deepEqual(direccionesFaltantes("MEDICINA DOMICILIARIA", { direccion_destino: "Calle 9 # 8-7" }), []);
    assert.deepEqual(direccionesFaltantes("MEDICINA DOMICILIARIA", { direccion_origen: "Calle 9 # 8-7" }), []);
  });

  it("telemedicina, traslado aéreo y tipos desconocidos no piden dirección", () => {
    for (const tipo of ["TELEMEDICINA", "TRASLADO AEREO", "OTRO", ""]) assert.deepEqual(direccionesFaltantes(tipo, {}), [], tipo);
  });
});

describe("seDespacha", () => {
  it("pasar a CURSO o asignar un OVEM nuevo es despachar", () => {
    assert.equal(seDespacha({ etapaAntes: "PROGRAMADO", etapaDespues: "CURSO" }), true);
    assert.equal(seDespacha({ etapaDespues: "CURSO" }), true);
    assert.equal(seDespacha({ etapaDespues: "PROGRAMADO", ovemDespues: "u1" }), true);
    assert.equal(seDespacha({ etapaAntes: "PROGRAMADO", etapaDespues: "PROGRAMADO", ovemAntes: "u1", ovemDespues: "u2" }), true);
  });

  it("guardar sin tocar la etapa ni el OVEM no despacha (los servicios históricos se siguen editando)", () => {
    assert.equal(seDespacha({ etapaAntes: "CURSO", etapaDespues: "CURSO", ovemAntes: "u1", ovemDespues: "u1" }), false);
    assert.equal(seDespacha({ etapaAntes: "PROGRAMADO", etapaDespues: "PROGRAMADO" }), false);
    assert.equal(seDespacha({ etapaAntes: "PROGRAMADO", etapaDespues: "PROGRAMADO", ovemAntes: "u1", ovemDespues: "" }), false);
    assert.equal(seDespacha({ etapaDespues: "FINALIZADO", ovemDespues: "" }), false);
  });
});

describe("faltasParaDespachar", () => {
  it("un TAB sin dirección de origen no se despacha: error en español junto a ese campo", () => {
    const faltas = faltasParaDespachar("TAB SIMPLE", { ...COMPLETO, direccion_origen: "" }, { etapaDespues: "CURSO" });
    assert.deepEqual(faltas.map((f) => f.campo), ["direccion_origen"]);
  });

  it("se puede guardar sin dirección mientras no se despache", () => {
    assert.deepEqual(faltasParaDespachar("TAB SIMPLE", {}, { etapaDespues: "PROGRAMADO" }), []);
  });

  it("con las direcciones completas se despacha", () => {
    assert.deepEqual(faltasParaDespachar("TAM DOBLE", COMPLETO, { etapaDespues: "PROGRAMADO", ovemDespues: "u1" }), []);
  });
});
