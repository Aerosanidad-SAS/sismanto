import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { movilesPorDisponibilidad, turnoPorFechaHora } from "./turno-servicio";

describe("turnoPorFechaHora", () => {
  it("de 06:00 a 17:59 es diurno", () => {
    for (const h of ["06:00", "06:01", "12:30", "17:59"]) assert.equal(turnoPorFechaHora(`2026-10-15T${h}`), "DIA", h);
  });

  it("de 18:00 a 05:59 es nocturno", () => {
    for (const h of ["18:00", "23:59", "00:00", "03:15", "05:59"]) assert.equal(turnoPorFechaHora(`2026-10-15T${h}`), "NOCHE", h);
  });

  it("sin fecha completa o inválida no propone nada", () => {
    for (const v of ["", "2026-10-15", "2026-10-15T", "2026-10-15T24:00", "2026-10-15T12:60", "15/10/2026 08:00", null, undefined]) {
      assert.equal(turnoPorFechaHora(v), null, String(v));
    }
  });
});

describe("movilesPorDisponibilidad", () => {
  const moviles = [
    { id: "a", placa: "TRG540" },
    { id: "b", placa: "ABC123" },
    { id: "c", placa: "XYZ999" },
    { id: "d", placa: "MNO456" },
  ];

  it("libres primero y, en cada grupo, por placa", () => {
    const r = movilesPorDisponibilidad(moviles, new Set(["b", "d"]));
    assert.deepEqual(r.map((m) => m.placa), ["TRG540", "XYZ999", "ABC123", "MNO456"]);
  });

  it("sin ocupados queda ordenado por placa y no toca la lista original", () => {
    const r = movilesPorDisponibilidad(moviles, new Set());
    assert.deepEqual(r.map((m) => m.placa), ["ABC123", "MNO456", "TRG540", "XYZ999"]);
    assert.deepEqual(moviles.map((m) => m.placa), ["TRG540", "ABC123", "XYZ999", "MNO456"]);
  });
});
