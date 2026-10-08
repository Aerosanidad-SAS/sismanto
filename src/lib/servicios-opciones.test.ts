import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { combinarOpciones, limpiarOpciones, opcionesConValorActual, opcionesDeFabrica } from "./servicios-opciones";

describe("limpiarOpciones", () => {
  it("recorta, quita vacías y repetidas sin distinguir mayúsculas, y conserva el orden", () => {
    assert.deepEqual(limpiarOpciones(["  DIA ", "", "noche", "Dia", "NOCHE", "  ", "TARDE   EXTRA"]), ["DIA", "noche", "TARDE EXTRA"]);
  });
});

describe("combinarOpciones", () => {
  it("usa las de fábrica para los campos sin fila", () => {
    assert.deepEqual(combinarOpciones([]), opcionesDeFabrica());
  });

  it("usa la lista guardada y descarta filas inválidas, vacías o de campos desconocidos", () => {
    const r = combinarOpciones([
      { campo: "perimetro", opciones: ["URBANO", "INTERMUNICIPAL"] },
      { campo: "metodo_pago", opciones: [] },
      { campo: "turno_programacion", opciones: "DIA" },
      { campo: "etapa", opciones: ["INVENTADA"] },
    ]);
    assert.deepEqual(r.perimetro, ["URBANO", "INTERMUNICIPAL"]);
    assert.deepEqual(r.metodo_pago, opcionesDeFabrica().metodo_pago);
    assert.deepEqual(r.turno_programacion, ["DIA", "NOCHE"]);
    assert.equal((r as Record<string, unknown>).etapa, undefined);
  });
});

describe("opcionesConValorActual", () => {
  it("conserva un valor guardado que ya no está en la lista", () => {
    assert.deepEqual(opcionesConValorActual(["URBANO", "RURAL"], "METROPOLITANO"), ["URBANO", "RURAL", "METROPOLITANO"]);
  });

  it("no duplica ni agrega vacíos", () => {
    assert.deepEqual(opcionesConValorActual(["URBANO"], "URBANO"), ["URBANO"]);
    assert.deepEqual(opcionesConValorActual(["URBANO"], null), ["URBANO"]);
    assert.deepEqual(opcionesConValorActual(["URBANO"], "  "), ["URBANO"]);
  });
});
