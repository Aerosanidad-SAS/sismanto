import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mensajeFaltantesParaFinalizar, tramosFaltantesParaFinalizar } from "./servicios-finalizar";

const D = "2026-10-07T08:00";
const COMPLETO = {
  fecha_hora_llegada_origen: D,
  fecha_hora_salida_origen: D,
  fecha_hora_llegada_intermedia: D,
  fecha_hora_salida_intermedia: D,
  fecha_hora_llegada_destino: D,
  fecha_hora_salida_destino: D,
};

describe("tramosFaltantesParaFinalizar", () => {
  it("medicina domiciliaria acepta la visita completa en origen o en destino (la tripulación la graba en destino)", () => {
    assert.deepEqual(tramosFaltantesParaFinalizar("MEDICINA DOMICILIARIA", {}), ["origen o destino"]);
    assert.deepEqual(
      tramosFaltantesParaFinalizar("MEDICINA DOMICILIARIA", { fecha_hora_llegada_origen: D, fecha_hora_salida_origen: D }),
      []
    );
    assert.deepEqual(
      tramosFaltantesParaFinalizar("MEDICINA DOMICILIARIA", { fecha_hora_llegada_destino: D, fecha_hora_salida_destino: D }),
      []
    );
  });

  it("un tramo con solo la llegada, o solo la salida, sigue incompleto", () => {
    assert.deepEqual(tramosFaltantesParaFinalizar("MEDICINA DOMICILIARIA", { fecha_hora_llegada_origen: D }), ["origen o destino"]);
    assert.deepEqual(tramosFaltantesParaFinalizar("MEDICINA DOMICILIARIA", { fecha_hora_salida_destino: D }), ["origen o destino"]);
    // La llegada en un tramo y la salida en otro no suman una visita completa.
    assert.deepEqual(
      tramosFaltantesParaFinalizar("MEDICINA DOMICILIARIA", { fecha_hora_llegada_origen: D, fecha_hora_salida_destino: D }),
      ["origen o destino"]
    );
  });

  it("TAB/TAM simple exigen origen y destino, no la intermedia", () => {
    for (const tipo of ["TAB SIMPLE", "TAM SIMPLE", "TAB SENCILLO"]) {
      assert.deepEqual(tramosFaltantesParaFinalizar(tipo, {}), ["origen", "destino"]);
      assert.deepEqual(
        tramosFaltantesParaFinalizar(tipo, {
          fecha_hora_llegada_origen: D,
          fecha_hora_salida_origen: D,
          fecha_hora_llegada_destino: D,
          fecha_hora_salida_destino: D,
        }),
        []
      );
    }
  });

  it("TAB/TAM doble y traslado aéreo exigen los tres tramos", () => {
    for (const tipo of ["TAB DOBLE", "TAM DOBLE", "TRASLADO AEREO"]) {
      assert.deepEqual(tramosFaltantesParaFinalizar(tipo, {}), ["origen", "punto intermedio", "destino"]);
      assert.deepEqual(tramosFaltantesParaFinalizar(tipo, COMPLETO), []);
      assert.deepEqual(
        tramosFaltantesParaFinalizar(tipo, { ...COMPLETO, fecha_hora_llegada_intermedia: "" }),
        ["punto intermedio"]
      );
    }
  });

  it("el flujo de la tripulación (pasos de estado-servicio.ts) deja cumplida la regla", () => {
    // Domiciliaria: inicio, inicio de atención (llegada destino) y fin de atención (salida destino).
    assert.deepEqual(
      tramosFaltantesParaFinalizar("MEDICINA DOMICILIARIA", { fecha_hora_llegada_destino: D, fecha_hora_salida_destino: D }),
      []
    );
    // Traslado sencillo: sitio, salida con paciente, llegada a destino, paciente entregado.
    assert.deepEqual(tramosFaltantesParaFinalizar("TAB SIMPLE", COMPLETO), []);
  });

  it("texto en blanco o null cuenta como vacío", () => {
    assert.deepEqual(
      tramosFaltantesParaFinalizar("TAB SIMPLE", { ...COMPLETO, fecha_hora_salida_destino: "   " }),
      ["destino"]
    );
    assert.deepEqual(tramosFaltantesParaFinalizar("TAB SIMPLE", { ...COMPLETO, fecha_hora_salida_origen: null }), ["origen"]);
  });

  it("telemedicina y tipos sin regla no exigen nada (no tienen sección de ruta en SISMANTO)", () => {
    assert.deepEqual(tramosFaltantesParaFinalizar("TELEMEDICINA", {}), []);
    assert.deepEqual(tramosFaltantesParaFinalizar("ENFERMERIA DOMICILIARIA", {}), []);
    assert.deepEqual(tramosFaltantesParaFinalizar(null, {}), []);
    assert.deepEqual(tramosFaltantesParaFinalizar(undefined, {}), []);
  });

  it("no distingue mayúsculas ni espacios sobrantes en el tipo", () => {
    assert.deepEqual(tramosFaltantesParaFinalizar(" tab simple ", {}), ["origen", "destino"]);
  });
});

describe("mensajeFaltantesParaFinalizar", () => {
  it("es null cuando no falta nada", () => {
    assert.equal(mensajeFaltantesParaFinalizar("TAB DOBLE", COMPLETO), null);
    assert.equal(mensajeFaltantesParaFinalizar("TELEMEDICINA", {}), null);
  });

  it("nombra el tipo y los tramos que faltan", () => {
    const m = mensajeFaltantesParaFinalizar("TAB SIMPLE", { fecha_hora_llegada_origen: D, fecha_hora_salida_origen: D });
    assert.ok(m?.includes("TAB SIMPLE"));
    assert.ok(m?.includes("destino"));
    assert.ok(!m?.includes("origen,"));
  });
});
