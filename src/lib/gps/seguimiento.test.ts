import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { enlaceVigente, esTokenSeguimiento, nuevoTokenSeguimiento } from "./seguimiento";
import { urlMapaOsm } from "./mapas";

describe("token de seguimiento", () => {
  it("es opaco, de 43 caracteres URL-safe, y distinto cada vez", () => {
    const a = nuevoTokenSeguimiento();
    assert.equal(esTokenSeguimiento(a), true);
    assert.notEqual(a, nuevoTokenSeguimiento());
    assert.equal(esTokenSeguimiento("123"), false);
    assert.equal(esTokenSeguimiento("a".repeat(42) + "'"), false);
  });
});

describe("enlaceVigente", () => {
  const ahora = Date.parse("2026-09-30T12:00:00Z");
  it("vale 24 h y solo con el servicio en PROGRAMADO o CURSO", () => {
    assert.equal(enlaceVigente("2026-09-30T00:00:00Z", "CURSO", ahora), true);
    assert.equal(enlaceVigente("2026-09-29T11:59:00Z", "CURSO", ahora), false);
    assert.equal(enlaceVigente("2026-09-30T00:00:00Z", "FINALIZADO", ahora), false);
    assert.equal(enlaceVigente(null, "PROGRAMADO", ahora), false);
  });
});

describe("urlMapaOsm", () => {
  it("centra el mapa y pone el marcador en el punto", () => {
    const u = urlMapaOsm(4.6711, -74.0542);
    assert.match(u, /^https:\/\/www\.openstreetmap\.org\/export\/embed\.html\?bbox=-74\.06420,4\.66110,-74\.04420,4\.68110/);
    assert.match(u, /marker=4\.671100,-74\.054200$/);
  });
});
