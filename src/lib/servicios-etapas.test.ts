import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { errorDeCambioEtapa, esEtapaCerrada, esEtapaNegativa, MOTIVO_MAX } from "./servicios-etapas";

describe("esEtapaNegativa / esEtapaCerrada", () => {
  it("reconoce las etapas negativas y las cerradas", () => {
    for (const e of ["CANCELADO", "FALLIDO", "NO EFECTIVO", "DUPLICADO"]) assert.equal(esEtapaNegativa(e), true);
    for (const e of ["PROGRAMADO", "CURSO", "FINALIZADO"]) assert.equal(esEtapaNegativa(e), false);
    assert.equal(esEtapaCerrada("FINALIZADO"), true);
    assert.equal(esEtapaCerrada("CANCELADO"), true);
    assert.equal(esEtapaCerrada("DUPLICADO"), true);
    assert.equal(esEtapaCerrada("FALLIDO"), false);
  });
});

describe("errorDeCambioEtapa", () => {
  it("pide motivo para las etapas negativas", () => {
    assert.match(errorDeCambioEtapa("PROGRAMADO", "CANCELADO", "REGULACION", "") ?? "", /motivo/);
    assert.match(errorDeCambioEtapa("CURSO", "FALLIDO", "REGULACION", "   ab ") ?? "", /motivo/);
    assert.equal(errorDeCambioEtapa("PROGRAMADO", "NO EFECTIVO", "REGULACION", "Paciente no estaba"), null);
  });

  it("rechaza un motivo demasiado largo", () => {
    assert.match(errorDeCambioEtapa("PROGRAMADO", "DUPLICADO", "REGULACION", "x".repeat(MOTIVO_MAX + 1)) ?? "", /largo/);
  });

  it("no pide motivo para las etapas normales", () => {
    assert.equal(errorDeCambioEtapa("PROGRAMADO", "CURSO", "REGULACION", null), null);
    assert.equal(errorDeCambioEtapa("CURSO", "FINALIZADO", "OVEM", undefined), null);
  });

  it("solo un ADMIN saca un servicio de una etapa cerrada", () => {
    assert.match(errorDeCambioEtapa("FINALIZADO", "PROGRAMADO", "REGULACION", null) ?? "", /administrador/);
    assert.match(errorDeCambioEtapa("CANCELADO", "CURSO", "ANALISTA", null) ?? "", /administrador/);
    assert.match(errorDeCambioEtapa("DUPLICADO", "PROGRAMADO", "REGULACION", null) ?? "", /administrador/);
    assert.equal(errorDeCambioEtapa("FINALIZADO", "PROGRAMADO", "ADMIN", null), null);
  });

  it("un ADMIN que reabre hacia una etapa negativa sigue necesitando motivo", () => {
    assert.match(errorDeCambioEtapa("FINALIZADO", "FALLIDO", "ADMIN", "") ?? "", /motivo/);
  });
});
