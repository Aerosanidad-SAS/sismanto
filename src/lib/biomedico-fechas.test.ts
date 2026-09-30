import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { completarFechasProximas, fechasTrasMantenimiento, mesesDeFrecuencia } from "./biomedico-fechas";

describe("mesesDeFrecuencia", () => {
  it("reconoce las frecuencias escritas y cae en el valor por defecto", () => {
    assert.equal(mesesDeFrecuencia("SEMESTRAL", 6), 6);
    assert.equal(mesesDeFrecuencia(" anual ", 6), 12);
    assert.equal(mesesDeFrecuencia(null, 6), 6);
    assert.equal(mesesDeFrecuencia("CADA QUE SE PUEDA", 12), 12);
  });
});

describe("fechasTrasMantenimiento", () => {
  it("un preventivo mueve el último y recalcula el próximo con la frecuencia del equipo", () => {
    assert.deepEqual(
      fechasTrasMantenimiento({ ultimo_mantenimiento: "2026-01-10", frec_mantenimiento: "SEMESTRAL" }, "2026-09-30", "PREVENTIVO"),
      { ultimo_mantenimiento: "2026-09-30", proximo_mantenimiento: "2027-03-30" }
    );
    assert.deepEqual(
      fechasTrasMantenimiento({ frec_mantenimiento: "ANUAL" }, "2026-09-30", "Correctivo").proximo_mantenimiento,
      "2027-09-30"
    );
  });

  it("una calibración mueve la calibración, no el mantenimiento", () => {
    assert.deepEqual(fechasTrasMantenimiento({}, "2026-08-31", "Calibración"), {
      ultima_calibracion: "2026-08-31",
      proxima_calibracion: "2027-08-31",
    });
  });

  it("no retrocede si se carga un mantenimiento más viejo que el último", () => {
    assert.deepEqual(fechasTrasMantenimiento({ ultimo_mantenimiento: "2026-09-01" }, "2026-03-01", "PREVENTIVO"), {});
  });

  it("fin de mes: 31 de agosto + 6 meses = último día de febrero", () => {
    assert.equal(fechasTrasMantenimiento({}, "2026-08-31", "PREVENTIVO").proximo_mantenimiento, "2027-02-28");
  });
});

describe("completarFechasProximas", () => {
  it("completa la próxima vacía o desactualizada y respeta una coherente escrita a mano", () => {
    const r = completarFechasProximas({
      ultimo_mantenimiento: "2026-09-30",
      proximo_mantenimiento: "2026-03-01", // anterior al último: desactualizada
      ultima_calibracion: "2026-01-15",
      proxima_calibracion: "2026-12-01", // coherente: se respeta
    });
    assert.equal(r.proximo_mantenimiento, "2027-03-30");
    assert.equal(r.proxima_calibracion, "2026-12-01");
    assert.equal(completarFechasProximas({ ultimo_mantenimiento: "", proximo_mantenimiento: "" }).proximo_mantenimiento, "");
  });
});
