import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { errorDeCronologia, instanteDe } from "./servicios-cronologia";

const COMPLETO = {
  fecha_hora_programacion: "2026-10-07T08:00",
  fecha_hora_inicio_desplazamiento: "2026-10-07T08:10",
  fecha_hora_llegada_origen: "2026-10-07T08:30",
  fecha_hora_salida_origen: "2026-10-07T09:00",
  fecha_hora_llegada_intermedia: "2026-10-07T09:20",
  fecha_hora_salida_intermedia: "2026-10-07T09:40",
  fecha_hora_llegada_destino: "2026-10-07T10:00",
  fecha_hora_salida_destino: "2026-10-07T10:30",
};

describe("instanteDe", () => {
  it("la hora del formulario es hora de Colombia, igual que la misma hora con zona -05:00", () => {
    assert.equal(instanteDe("2026-10-07T08:00"), Date.parse("2026-10-07T13:00:00Z"));
    assert.equal(instanteDe("2026-10-07T08:00"), instanteDe("2026-10-07T13:00:00+00:00"));
    assert.equal(instanteDe("2026-10-07T08:00"), instanteDe("2026-10-07T08:00:00-05:00"));
  });

  it("vacío o inválido es null", () => {
    for (const v of [null, undefined, "", "   ", "no es fecha", "2026-13-45T99:99"]) assert.equal(instanteDe(v), null, String(v));
  });
});

describe("errorDeCronologia", () => {
  it("un recorrido en orden es correcto", () => {
    assert.equal(errorDeCronologia(COMPLETO), null);
  });

  it("sin ninguna hora, o solo la programación, no hay nada que validar", () => {
    assert.equal(errorDeCronologia({}), null);
    assert.equal(errorDeCronologia({ fecha_hora_programacion: "2026-10-07T08:00" }), null);
  });

  it("la salida antes de la llegada del mismo tramo es un error y nombra los dos pasos", () => {
    const e = errorDeCronologia({ ...COMPLETO, fecha_hora_salida_origen: "2026-10-07T08:20" });
    assert.ok(e?.includes("Salida de origen"));
    assert.ok(e?.includes("Llegada a origen"));
  });

  it("la misma hora en pasos seguidos vale", () => {
    assert.equal(errorDeCronologia({ ...COMPLETO, fecha_hora_salida_origen: COMPLETO.fecha_hora_llegada_origen }), null);
  });

  it("los pasos vacíos no estorban: se comparan los que están escritos", () => {
    const sinIntermedia = { ...COMPLETO, fecha_hora_llegada_intermedia: "", fecha_hora_salida_intermedia: null };
    assert.equal(errorDeCronologia(sinIntermedia), null);
    // …pero con la intermedia vacía, el destino sigue debiendo ir después del origen.
    assert.ok(errorDeCronologia({ ...sinIntermedia, fecha_hora_llegada_destino: "2026-10-07T08:45" }));
  });

  it("llegar ANTES de la programación vale; terminar antes de la programación no", () => {
    assert.equal(
      errorDeCronologia({
        fecha_hora_programacion: "2026-10-07T08:00",
        fecha_hora_llegada_origen: "2026-10-07T07:50",
        fecha_hora_salida_origen: "2026-10-07T08:40",
      }),
      null
    );
    const e = errorDeCronologia({
      fecha_hora_programacion: "2026-10-07T08:00",
      fecha_hora_llegada_origen: "2026-10-07T07:10",
      fecha_hora_salida_origen: "2026-10-07T07:40",
    });
    assert.ok(e?.includes("programación"));
  });

  it("cruza la medianoche sin problema", () => {
    assert.equal(
      errorDeCronologia({ fecha_hora_llegada_origen: "2026-10-07T23:40", fecha_hora_salida_origen: "2026-10-08T00:20" }),
      null
    );
    assert.ok(errorDeCronologia({ fecha_hora_llegada_origen: "2026-10-08T00:20", fecha_hora_salida_origen: "2026-10-07T23:40" }));
  });

  it("compara formularios y horas de la base entre sí (mismo instante en distinto formato)", () => {
    assert.equal(
      errorDeCronologia({
        fecha_hora_llegada_origen: "2026-10-07T13:30:00+00:00", // 08:30 en Colombia
        fecha_hora_salida_origen: "2026-10-07T08:45", // 08:45 en Colombia
      }),
      null
    );
    assert.ok(
      errorDeCronologia({
        fecha_hora_llegada_origen: "2026-10-07T13:30:00+00:00",
        fecha_hora_salida_origen: "2026-10-07T08:20",
      })
    );
  });

  it("ignora fechas inválidas en lugar de rechazar por ellas", () => {
    assert.equal(errorDeCronologia({ fecha_hora_llegada_origen: "basura", fecha_hora_salida_origen: "2026-10-07T08:20" }), null);
  });
});
