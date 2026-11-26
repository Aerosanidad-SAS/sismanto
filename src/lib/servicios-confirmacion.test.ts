import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { confirmacionAlCrear, filtroDesdeHoy, porConfirmar, quitarConfirmacion, serviciosPorConfirmarDelDia } from "./servicios-confirmacion";

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

describe("confirmacionAlCrear", () => {
  const REGULADOR = { user_id: "u-reg", role_codigo: "REGULACION" };
  const AHORA = "2026-11-25T12:00:00.000Z";
  const TAM = { etapa: "PROGRAMADO", tipo_servicio: "TAM SIMPLE", vehicle_id: "v1", ovem_user_id: "o", medico_user_id: "m", auxiliar_user_id: "a" };

  it("con móvil y la tripulación completa de su tipo nace confirmado por quien lo crea", () => {
    assert.deepEqual(confirmacionAlCrear(TAM, REGULADOR, AHORA), { confirmado_at: AHORA, confirmado_por: "u-reg" });
    const domiciliaria = { ...TAM, tipo_servicio: "MEDICINA DOMICILIARIA", auxiliar_user_id: null };
    assert.equal(confirmacionAlCrear(domiciliaria, REGULADOR, AHORA).confirmado_por, "u-reg");
  });

  it("si falta el móvil o alguien que su tipo exige, queda por confirmar", () => {
    for (const falta of ["vehicle_id", "ovem_user_id", "medico_user_id", "auxiliar_user_id"] as const) {
      assert.deepEqual(confirmacionAlCrear({ ...TAM, [falta]: null }, REGULADOR, AHORA), {}, falta);
    }
  });

  it("solo en PROGRAMADO y solo si lo crea alguien que puede confirmar", () => {
    assert.deepEqual(confirmacionAlCrear({ ...TAM, etapa: "CURSO" }, REGULADOR, AHORA), {});
    assert.deepEqual(confirmacionAlCrear(TAM, { user_id: "u-med", role_codigo: "MEDICO" }, AHORA), {});
    assert.deepEqual(confirmacionAlCrear(TAM, null, AHORA), {});
  });
});

describe("filtroDesdeHoy", () => {
  it("deja los de hoy (medianoche de Colombia) en adelante y los sin hora", () => {
    assert.equal(filtroDesdeHoy(HOY), "fecha_hora_programacion.is.null,fecha_hora_programacion.gte.2026-11-25T00:00:00-05:00");
  });
});

describe("quitarConfirmacion", () => {
  function baseFalsa() {
    const llamadas: unknown[][] = [];
    const consulta: Record<string, unknown> = {};
    for (const m of ["from", "update", "in", "eq", "not"]) {
      consulta[m] = (...args: unknown[]) => {
        llamadas.push([m, ...args]);
        return consulta;
      };
    }
    consulta.select = async () => ({ data: [{ id: 1 }, { id: 2 }] });
    return { db: consulta, llamadas };
  }

  it("borra la confirmación de los PROGRAMADO confirmados de todos los móviles tocados, también de los liberados", async () => {
    const { db, llamadas } = baseFalsa();
    assert.equal(await quitarConfirmacion(db, ["destino", "liberado", "liberado"]), 2);
    assert.deepEqual(llamadas.find((l) => l[0] === "in"), ["in", "vehicle_id", ["destino", "liberado"]]);
    assert.deepEqual(llamadas.find((l) => l[0] === "eq"), ["eq", "etapa", "PROGRAMADO"]);
    const cambios = llamadas.find((l) => l[0] === "update")![1] as Record<string, unknown>;
    assert.equal(cambios.confirmado_at, null);
    assert.equal(cambios.confirmado_por, null);
  });

  it("sin móviles no escribe nada", async () => {
    const { db, llamadas } = baseFalsa();
    assert.equal(await quitarConfirmacion(db, []), 0);
    assert.equal(llamadas.length, 0);
  });
});
