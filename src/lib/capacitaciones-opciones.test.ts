import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { COLUMNAS_OPCION_PUBLICAS, puedeVerRespuestasCorrectas, seleccionOpciones } from "./capacitaciones-opciones";

describe("clave de respuestas de las capacitaciones", () => {
  it("solo ADMIN y COORDINACION ven es_correcta", () => {
    assert.equal(puedeVerRespuestasCorrectas("ADMIN"), true);
    assert.equal(puedeVerRespuestasCorrectas("COORDINACION"), true);
    for (const rol of ["OVEM", "REGULACION", "ANALISTA", "GERENCIAL", "MANTENIMIENTO", "VISTA", "MEDICO", "AUXILIAR_ENFERMERIA", "TECNICO", "AEROPUERTO", "", null, undefined]) {
      assert.equal(puedeVerRespuestasCorrectas(rol), false, String(rol));
    }
  });

  it("quien rinde la evaluación pide solo columnas públicas, sin es_correcta", () => {
    assert.equal(seleccionOpciones("OVEM"), COLUMNAS_OPCION_PUBLICAS);
    assert.ok(!COLUMNAS_OPCION_PUBLICAS.includes("es_correcta"));
    assert.ok(!COLUMNAS_OPCION_PUBLICAS.includes("*"));
    assert.equal(seleccionOpciones("ADMIN"), "*");
  });
});
