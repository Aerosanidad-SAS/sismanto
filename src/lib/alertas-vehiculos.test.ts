import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { alertasDocumentosVehiculos, contarQuePidenAtencion, nivelAlerta, VENTANA_ALERTA_DIAS } from "./alertas-vehiculos";
import { sumarDias } from "./fechas";

const HOY = "2026-10-07" as const;
const en = (dias: number) => sumarDias(HOY, dias);

describe("nivelAlerta (semáforo de SISRES)", () => {
  it("rojo hasta 15 días y vencido; amarillo de 16 a 30; verde más de 30", () => {
    assert.equal(nivelAlerta(-40), "ROJO");
    assert.equal(nivelAlerta(0), "ROJO");
    assert.equal(nivelAlerta(15), "ROJO");
    assert.equal(nivelAlerta(16), "AMARILLO");
    assert.equal(nivelAlerta(30), "AMARILLO");
    assert.equal(nivelAlerta(31), "VERDE");
    assert.equal(nivelAlerta(365), "VERDE");
  });
});

describe("alertasDocumentosVehiculos", () => {
  it("solo entran los documentos que vencen dentro de un año o ya vencidos", () => {
    const r = alertasDocumentosVehiculos(
      [{ placa: "AAA111", vencimiento_soat: en(VENTANA_ALERTA_DIAS), vencimiento_tecnicomecanica: en(VENTANA_ALERTA_DIAS + 1), fecha_pase_aeroportuario: null }],
      HOY
    );
    assert.equal(r.length, 1);
    assert.deepEqual(r[0].docs.map((d) => d.documento), ["SOAT"]);
  });

  it("un vehículo sin documentos dentro de la ventana no aparece", () => {
    assert.deepEqual(alertasDocumentosVehiculos([{ placa: "AAA111", vencimiento_soat: en(400) }, { placa: "BBB222" }], HOY), []);
  });

  it("el nivel del vehículo es el peor de sus documentos, y los documentos van del más urgente al menos", () => {
    const [v] = alertasDocumentosVehiculos(
      [{ placa: "AAA111", vencimiento_soat: en(200), vencimiento_tecnicomecanica: en(-3), fecha_pase_aeroportuario: en(20) }],
      HOY
    );
    assert.equal(v.nivel, "ROJO");
    assert.deepEqual(v.docs.map((d) => [d.documento, d.dias, d.nivel]), [
      ["Técnico-mecánica", -3, "ROJO"],
      ["Pase aeroportuario", 20, "AMARILLO"],
      ["SOAT", 200, "VERDE"],
    ]);
  });

  it("ordena rojos, amarillos y verdes; dentro de cada nivel, el que vence antes y luego la placa", () => {
    const r = alertasDocumentosVehiculos(
      [
        { placa: "VERDE1", vencimiento_soat: en(100) },
        { placa: "ROJO_B", vencimiento_soat: en(5) },
        { placa: "AMARI1", vencimiento_soat: en(25) },
        { placa: "ROJO_A", vencimiento_soat: en(5) },
        { placa: "ROJO_C", vencimiento_soat: en(-2) },
      ],
      HOY
    );
    assert.deepEqual(r.map((a) => a.placa), ["ROJO_C", "ROJO_A", "ROJO_B", "AMARI1", "VERDE1"]);
  });

  it("usa la técnico-mecánica nueva y, si falta, la RTM antigua; ignora fechas inválidas", () => {
    const [a] = alertasDocumentosVehiculos([{ placa: "AAA111", vencimiento_rtm: en(10) }], HOY);
    assert.equal(a.docs[0].documento, "Técnico-mecánica");
    assert.deepEqual(alertasDocumentosVehiculos([{ placa: "AAA111", vencimiento_soat: "no es fecha" }], HOY), []);
  });

  it("acepta fechas con hora (timestamp) tomando solo el día", () => {
    const [a] = alertasDocumentosVehiculos([{ placa: "AAA111", vencimiento_soat: `${en(10)}T00:00:00+00:00` }], HOY);
    assert.equal(a.docs[0].dias, 10);
  });
});

describe("contarQuePidenAtencion", () => {
  it("no cuenta los verdes", () => {
    const r = alertasDocumentosVehiculos(
      [{ placa: "A", vencimiento_soat: en(100) }, { placa: "B", vencimiento_soat: en(20) }, { placa: "C", vencimiento_soat: en(-1) }],
      HOY
    );
    assert.equal(r.length, 3);
    assert.equal(contarQuePidenAtencion(r), 2);
  });
});
