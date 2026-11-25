import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { porConfirmar, serviciosPorConfirmarDelDia } from "./servicios-confirmacion";

const HOY = "2026-11-25";
const BASE = { etapa: "PROGRAMADO", vehicle_id: "v1", confirmado_at: null, fecha_hora_programacion: "2026-11-25T14:00:00-05:00" };

describe("porConfirmar", () => {
  it("un servicio programado de hoy con móvil y sin confirmar está por confirmar", () => {
    assert.equal(porConfirmar(BASE, HOY), true);
  });

  it("confirmado, sin móvil o fuera de PROGRAMADO no está por confirmar", () => {
    assert.equal(porConfirmar({ ...BASE, confirmado_at: "2026-11-25T08:00:00Z" }, HOY), false);
    assert.equal(porConfirmar({ ...BASE, vehicle_id: null }, HOY), false);
    for (const etapa of ["CURSO", "FINALIZADO", "CANCELADO", "FALLIDO"]) assert.equal(porConfirmar({ ...BASE, etapa }, HOY), false, etapa);
  });

  it("solo cuenta hoy y después (en hora de Bogotá), no los programados de días pasados", () => {
    assert.equal(porConfirmar({ ...BASE, fecha_hora_programacion: "2026-11-24T23:59:00-05:00" }, HOY), false);
    // 00:30 del 25 en Bogotá = 05:30 UTC del 25; 23:30 del 24 en Bogotá = 04:30 UTC del 25 (sigue siendo el 24 allá).
    assert.equal(porConfirmar({ ...BASE, fecha_hora_programacion: "2026-11-25T04:30:00Z" }, HOY), false);
    assert.equal(porConfirmar({ ...BASE, fecha_hora_programacion: "2026-11-25T05:30:00Z" }, HOY), true);
    assert.equal(porConfirmar({ ...BASE, fecha_hora_programacion: "2026-11-30T09:00:00-05:00" }, HOY), true);
  });

  it("sin hora de programación cuenta (lo agendó Regulación sin fecha y sigue pendiente)", () => {
    assert.equal(porConfirmar({ ...BASE, fecha_hora_programacion: null }, HOY), true);
  });
});

describe("serviciosPorConfirmarDelDia", () => {
  it("filtra la lista y conserva el orden", () => {
    const lista = [
      { id: 1, ...BASE },
      { id: 2, ...BASE, confirmado_at: "2026-11-25T08:00:00Z" },
      { id: 3, ...BASE, etapa: "CURSO" },
      { id: 4, ...BASE },
    ];
    assert.deepEqual(serviciosPorConfirmarDelDia(lista, HOY).map((s) => s.id), [1, 4]);
  });
});
