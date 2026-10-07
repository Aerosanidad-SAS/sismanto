import assert from "node:assert/strict";
import { test } from "node:test";

import { inicioVentanaAbiertos, textoRetraso, VENTANA_ABIERTOS_DIAS } from "./servicios-abiertos";

test("la ventana de abiertos arranca %d días antes de hoy".replace("%d", String(VENTANA_ABIERTOS_DIAS)), () => {
  assert.equal(inicioVentanaAbiertos("2026-10-07"), "2026-10-04");
  assert.equal(inicioVentanaAbiertos("2026-03-02"), "2026-02-27");
});

test("el retraso se escribe en minutos, horas o «más de 1 día»", () => {
  assert.equal(textoRetraso(5), "+5 min");
  assert.equal(textoRetraso(60), "+1 h");
  assert.equal(textoRetraso(200), "+3 h 20 min");
  assert.equal(textoRetraso(1440), "+24 h");
  assert.equal(textoRetraso(1441), "más de 1 día");
  assert.equal(textoRetraso(30377079), "más de 1 día");
});
