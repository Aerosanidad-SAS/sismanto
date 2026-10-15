import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAMPOS_OPCIONES_SERVICIO,
  combinarOpciones,
  esCampoOpcionesServicio,
  opcionesConValorActual,
  opcionesDeFabrica,
} from "./servicios-opciones";

describe("Soporte como campo con opciones administrables (migración 134)", () => {
  it("es un campo administrable y trae opciones de fábrica sin repetidas", () => {
    assert.equal(esCampoOpcionesServicio("soporte"), true);
    const fabrica = opcionesDeFabrica().soporte;
    assert.ok(fabrica.length >= 5);
    assert.equal(new Set(fabrica.map((o) => o.toUpperCase())).size, fabrica.length);
    assert.ok(fabrica.includes("NO REQUIERE"));
  });

  it("sin fila guardada usa la fábrica; con lista del administrador usa la suya", () => {
    assert.deepEqual(combinarOpciones([]).soporte, opcionesDeFabrica().soporte);
    const r = combinarOpciones([{ campo: "soporte", opciones: ["  OXIGENO  ", "oxigeno", "BIPAP", ""] }]);
    assert.deepEqual(r.soporte, ["OXIGENO", "BIPAP"]);
  });

  it("un valor histórico fuera de la lista se conserva en el select", () => {
    const lista = opcionesDeFabrica().soporte;
    const r = opcionesConValorActual(lista, "PESO 108 KILOS - NO SE MOVIL");
    assert.equal(r[r.length - 1], "PESO 108 KILOS - NO SE MOVIL");
    assert.equal(opcionesConValorActual(lista, "NO REQUIERE").length, lista.length);
  });

  it("las opciones de todos los campos siguen teniendo nombre único (el CHECK de la base los enumera)", () => {
    const campos = CAMPOS_OPCIONES_SERVICIO.map((c) => c.campo);
    assert.equal(new Set(campos).size, campos.length);
    assert.equal(campos.length, 8);
  });
});
