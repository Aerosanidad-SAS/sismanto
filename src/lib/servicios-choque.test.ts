import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VENTANA_CHOQUE_MIN, filtroRecursos, motivosDeChoque, textoChoque, ventanaChoque } from "./servicios-choque";

describe("ventanaChoque", () => {
  it("abarca la ventana completa a cada lado", () => {
    const v = ventanaChoque("2026-10-10T15:00:00.000Z");
    assert.ok(v);
    assert.equal(v.desde, "2026-10-10T14:00:00.000Z");
    assert.equal(v.hasta, "2026-10-10T16:00:00.000Z");
    assert.equal(VENTANA_CHOQUE_MIN, 60);
  });

  it("devuelve null si la fecha no es válida", () => {
    assert.equal(ventanaChoque("no-es-fecha"), null);
    assert.equal(ventanaChoque(""), null);
  });
});

describe("motivosDeChoque", () => {
  it("lista los recursos que comparten", () => {
    const m = motivosDeChoque({ vehicle_id: "v1", ovem_user_id: "o1" }, { vehicle_id: "v1", ovem_user_id: "o1", medico_user_id: "m1" });
    assert.deepEqual(m, ["el mismo vehículo", "el mismo conductor"]);
  });

  it("un recurso sin asignar nunca choca, aunque el otro también esté vacío", () => {
    assert.deepEqual(motivosDeChoque({ vehicle_id: null, ovem_user_id: undefined }, { vehicle_id: null, ovem_user_id: undefined }), []);
    assert.deepEqual(motivosDeChoque({ vehicle_id: "v1" }, { vehicle_id: "v2" }), []);
  });
});

describe("filtroRecursos", () => {
  it("arma el filtro solo con lo asignado", () => {
    assert.equal(filtroRecursos({ vehicle_id: "v1", auxiliar_user_id: "a1" }), "vehicle_id.eq.v1,auxiliar_user_id.eq.a1");
  });

  it("es null si no hay ningún recurso", () => {
    assert.equal(filtroRecursos({}), null);
    assert.equal(filtroRecursos({ vehicle_id: "", ovem_user_id: null }), null);
  });
});

describe("textoChoque", () => {
  it("una línea por servicio con su hora y el motivo", () => {
    const t = textoChoque(
      [{ id: 5, nombre_completo: "Ana", fecha_hora_programacion: "2026-10-10T15:00:00.000Z", motivos: ["el mismo vehículo", "el mismo conductor"] }],
      () => "10:00"
    );
    assert.deepEqual(t, ["#5 Ana · 10:00 · comparte el mismo vehículo y el mismo conductor"]);
  });
});
