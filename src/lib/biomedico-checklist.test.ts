import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { armarChecklist, checklistParaEquipo, leerChecklistGuardado, normalizarEquipo } from "./biomedico-checklist";

describe("normalizarEquipo", () => {
  it("da la misma clave que SISRES", () => {
    assert.equal(normalizarEquipo("  Bomba de infusión "), "BOMBA_DE_INFUSION");
    assert.equal(normalizarEquipo("Lámpara cuello de cisne"), "LAMPARA_CUELLO_DE_CISNE");
    assert.equal(normalizarEquipo("Monitor (signos) vitales"), "MONITOR_SIGNOS_VITALES");
    assert.equal(normalizarEquipo("Báscula / tallímetro"), "BASCULA__TALLIMETRO");
    assert.equal(normalizarEquipo("Señal wifi"), "SENAL_WIFI");
  });
});

describe("checklistParaEquipo", () => {
  const catalogo = { DEA: ["Autotest", "Electrodos"], GENERAL: ["Verificación inicial"] };

  it("usa la lista del tipo del equipo", () => {
    assert.deepEqual(checklistParaEquipo("dea", catalogo), { clave: "DEA", items: ["Autotest", "Electrodos"], esGeneral: false });
  });

  it("cae en GENERAL si el tipo no tiene lista, y en null si tampoco hay GENERAL", () => {
    assert.equal(checklistParaEquipo("Camilla", catalogo)?.esGeneral, true);
    assert.equal(checklistParaEquipo("Camilla", { DEA: ["x"] }), null);
  });
});

describe("armarChecklist", () => {
  it("guarda los desmarcados como 0 (bug de SISRES: quedaba «10 de 10»)", () => {
    assert.deepEqual(armarChecklist(["A", "B", "C"], ["A", "C"]), { chk_items: { A: 1, B: 0, C: 1 }, chk_total: 3, chk_marcados: 2 });
  });

  it("ignora marcados que no están en la lista y devuelve null sin ítems", () => {
    assert.deepEqual(armarChecklist(["A"], ["Z"]), { chk_items: { A: 0 }, chk_total: 1, chk_marcados: 0 });
    assert.equal(armarChecklist([], ["A"]), null);
  });
});

describe("leerChecklistGuardado", () => {
  it("acepta 1/0, '1'/'0' y true/false; rechaza lo que no es objeto", () => {
    assert.deepEqual(leerChecklistGuardado({ A: 1, B: "0", C: true }), [["A", true], ["B", false], ["C", true]]);
    assert.deepEqual(leerChecklistGuardado(["A"]), []);
    assert.deepEqual(leerChecklistGuardado(null), []);
  });
});
