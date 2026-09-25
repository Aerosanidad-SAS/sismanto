import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aniosDelRango,
  anioDe,
  diaEnBogota,
  diasDelRango,
  diasEntre,
  edadEn,
  esDia,
  formatoDia,
  hoyBogota,
  limitesInstante,
  mesesDelRango,
  normalizarDia,
  solapeDias,
  sumarDias,
  sumarMeses,
  ultimoDiaDelMes,
} from "./fechas";

// Estas pruebas corren con TZ=UTC, America/Bogota y Asia/Tokyo (scripts/run-tests.mjs): cada caso tiene que dar lo
// mismo en las tres. Es justo lo que falló con `new Date("2024-01-01").getFullYear()` (2023 en Bogotá, 2024 en UTC).

describe("esDia", () => {
  it("acepta días reales y rechaza el resto", () => {
    assert.equal(esDia("2024-02-29"), true);
    assert.equal(esDia("2023-02-29"), false);
    assert.equal(esDia("2024-13-01"), false);
    assert.equal(esDia("2024-01-01T00:00:00Z"), false);
    assert.equal(esDia(""), false);
    assert.equal(esDia(null), false);
  });
});

describe("hoyBogota / diaEnBogota", () => {
  it("cambia de día a las 00:00 de Colombia (05:00 UTC), no a las 19:00", () => {
    assert.equal(hoyBogota(new Date("2026-09-25T04:59:59Z")), "2026-09-24");
    assert.equal(hoyBogota(new Date("2026-09-25T05:00:00Z")), "2026-09-25");
    assert.equal(hoyBogota(new Date("2026-09-25T23:59:59Z")), "2026-09-25");
  });
  it("un timestamptz nocturno cae en el día de Colombia", () => {
    assert.equal(diaEnBogota("2026-01-01T03:30:00+00:00"), "2025-12-31");
  });
});

describe("normalizarDia", () => {
  it("un DATE queda igual y un instante se convierte a Bogotá", () => {
    assert.equal(normalizarDia("2024-03-22"), "2024-03-22");
    assert.equal(normalizarDia("2024-03-22T02:00:00Z"), "2024-03-21");
    assert.equal(normalizarDia(new Date("2024-03-22T12:00:00Z")), "2024-03-22");
  });
});

describe("componentes y aritmética", () => {
  it("el año de un día no depende de la zona (el bug del RTM)", () => {
    assert.equal(anioDe("2024-01-01"), 2024);
    assert.deepEqual(aniosDelRango("2024-01-01", "2026-09-25"), [2024, 2025, 2026]);
  });
  it("suma días y meses con calendario real", () => {
    assert.equal(sumarDias("2024-02-28", 1), "2024-02-29");
    assert.equal(sumarDias("2024-12-31", 1), "2025-01-01");
    assert.equal(sumarDias("2026-03-08", -30), "2026-02-06");
    assert.equal(sumarMeses("2024-01-31", 1), "2024-02-29");
    assert.equal(sumarMeses("2026-05-31", -3), "2026-02-28");
    assert.equal(sumarMeses("2026-01-15", -12), "2025-01-15");
  });
  it("cuenta días entre fechas sin depender del horario", () => {
    assert.equal(diasEntre("2024-01-01", "2026-09-25"), 998);
    assert.equal(diasDelRango("2024-01-01", "2026-09-25"), 999);
    assert.equal(diasDelRango("2026-03-01", "2026-03-01"), 1);
  });
  it("solape de rangos cerrados", () => {
    assert.equal(solapeDias("2024-01-01", "2026-09-25", "2026-01-01", "2026-12-31"), 268);
    assert.equal(solapeDias("2024-01-01", "2024-12-31", "2025-01-01", "2025-12-31"), 0);
    assert.equal(solapeDias("2024-12-31", "2025-01-01", "2025-01-01", "2025-12-31"), 1);
  });
  it("meses y último día del mes", () => {
    assert.deepEqual(mesesDelRango("2025-11-20", "2026-02-03"), ["2025-11", "2025-12", "2026-01", "2026-02"]);
    assert.equal(ultimoDiaDelMes(2024, 2), 29);
    assert.equal(ultimoDiaDelMes(2026, 2), 28);
  });
});

describe("edadEn", () => {
  it("cumple años exactamente el día del cumpleaños", () => {
    assert.equal(edadEn("1990-06-15", "2026-06-14"), 35);
    assert.equal(edadEn("1990-06-15", "2026-06-15"), 36);
  });
});

describe("formatoDia", () => {
  it("muestra el mismo día que está en la base, en cualquier zona", () => {
    assert.equal(formatoDia("2024-03-22"), "22/03/2024");
    assert.equal(formatoDia("2024-01-01"), "01/01/2024");
    assert.equal(formatoDia("2024-03-22", "largo"), "22 de marzo de 2024");
  });
});

describe("limitesInstante", () => {
  it("el último día del rango entra completo (medianoche de Colombia a medianoche)", () => {
    const l = limitesInstante("2026-09-01", "2026-09-25");
    assert.equal(l.desde, "2026-09-01T00:00:00-05:00");
    assert.equal(l.hastaExclusivo, "2026-09-26T00:00:00-05:00");
    // 23:30 de Colombia del 25 (= 04:30 UTC del 26) está dentro; 00:00 del 26 en Colombia, no
    assert.ok(Date.parse("2026-09-26T04:30:00Z") < Date.parse(l.hastaExclusivo));
    assert.ok(Date.parse("2026-09-26T05:00:00Z") >= Date.parse(l.hastaExclusivo));
  });
});
