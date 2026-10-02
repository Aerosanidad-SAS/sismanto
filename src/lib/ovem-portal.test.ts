import assert from "node:assert/strict";
import { test } from "node:test";

import {
  claveBorrador,
  evaluarKilometraje,
  idsNuevos,
  leerBorrador,
  marcarSinResponderComoOk,
  parseKilometraje,
  parseNumeroDecimal,
  resumirRespuestas,
  serializarBorrador,
  textoResumen,
} from "./ovem-portal";

test("parseNumeroDecimal acepta coma y punto", () => {
  assert.equal(parseNumeroDecimal("12,5"), 12.5);
  assert.equal(parseNumeroDecimal("12.5"), 12.5);
  assert.equal(parseNumeroDecimal(" "), undefined);
  assert.equal(parseNumeroDecimal("abc"), undefined);
});

test("parseKilometraje ignora separadores de miles", () => {
  assert.equal(parseKilometraje("125.430"), 125430);
  assert.equal(parseKilometraje("125430"), 125430);
  assert.equal(parseKilometraje("125 430"), 125430);
  assert.equal(parseKilometraje(""), undefined);
  assert.equal(parseKilometraje("x"), undefined);
});

test("evaluarKilometraje avisa si es menor o salta más de 1.000 km", () => {
  assert.equal(evaluarKilometraje(125500, 125430).nivel, "ok");
  assert.equal(evaluarKilometraje(125430, 125430).nivel, "ok");
  assert.equal(evaluarKilometraje(125000, 125430).nivel, "menor");
  assert.equal(evaluarKilometraje(126430, 125430).nivel, "ok");
  assert.equal(evaluarKilometraje(126431, 125430).nivel, "salto");
  assert.ok((evaluarKilometraje(100, 125430).mensaje ?? "").includes("km"));
});

test("evaluarKilometraje no avisa sin dato previo o sin lectura", () => {
  assert.equal(evaluarKilometraje(100, null).mensaje, null);
  assert.equal(evaluarKilometraje(100, 0).mensaje, null);
  assert.equal(evaluarKilometraje(undefined, 5000).mensaje, null);
});

test("resumirRespuestas: lo no respondido no cuenta como OK", () => {
  const r = resumirRespuestas([1, 2, 3, 4, 5], {
    1: { estado: "OK" },
    2: { estado: "FALLA", observacion: "x" },
    3: { estado: "NO_APLICA" },
    4: { estado: "OK" },
  });
  assert.deepEqual(r, { total: 5, ok: 2, falla: 1, noAplica: 1, sinResponder: 1 });
  assert.equal(textoResumen(r), "2 OK · 1 Falla · 1 N/A · 1 sin responder");
  assert.equal(textoResumen({ total: 41, ok: 38, falla: 1, noAplica: 2, sinResponder: 0 }), "38 OK · 1 Falla · 2 N/A");
  assert.equal(textoResumen({ total: 3, ok: 1, falla: 2, noAplica: 0, sinResponder: 0 }), "1 OK · 2 Fallas · 0 N/A");
});

test("marcarSinResponderComoOk respeta lo ya respondido y completa cantidades", () => {
  const items = [
    { id: 1, cantidad_esperada: null },
    { id: 2, cantidad_esperada: "2" },
    { id: 3, cantidad_esperada: null },
  ];
  const antes = { 3: { estado: "FALLA" as const, observacion: "roto" } };
  const despues = marcarSinResponderComoOk(items, antes);
  assert.deepEqual(despues[1], { estado: "OK" });
  assert.deepEqual(despues[2], { estado: "OK", cantidadOk: 2 });
  assert.equal(despues[3].estado, "FALLA");
  assert.equal(Object.keys(antes).length, 1, "no muta el original");
});

test("borrador: ida y vuelta y clave por vehículo y día", () => {
  const b = {
    km: "125430",
    observaciones: "ok",
    items: { 7: { estado: "FALLA" as const, observacion: "luz" }, 2: { estado: "OK" as const } },
  };
  const leido = leerBorrador(serializarBorrador(b));
  assert.ok(leido);
  assert.equal(leido.km, "125430");
  assert.equal(leido.observaciones, "ok");
  assert.equal(leido.items[7].observacion, "luz");
  assert.equal(leido.items[2].estado, "OK");
  assert.equal(claveBorrador("v1", "2026-10-02"), "sismanto_ovem_borrador_v1_2026-10-02");
});

test("serializarBorrador es estable sin importar el orden de inserción", () => {
  const a = serializarBorrador({ km: "", observaciones: "", items: { 1: { estado: "OK" }, 2: { estado: "OK" } } });
  const b = serializarBorrador({ km: "", observaciones: "", items: { 2: { estado: "OK" }, 1: { estado: "OK" } } });
  assert.equal(a, b);
});

test("leerBorrador descarta texto dañado o con forma inválida", () => {
  assert.equal(leerBorrador(null), null);
  assert.equal(leerBorrador("{no es json"), null);
  assert.equal(leerBorrador(JSON.stringify({ km: 1 })), null);
  assert.equal(leerBorrador(JSON.stringify({ km: "", observaciones: "", items: { 1: { estado: "TAL VEZ" } } })), null);
});

test("idsNuevos: la primera carga no genera avisos", () => {
  assert.deepEqual(idsNuevos(null, [1, 2]), []);
  assert.deepEqual(idsNuevos([1, 2], [1, 2]), []);
  assert.deepEqual(idsNuevos([1], [1, 2, 3]), [2, 3]);
  assert.deepEqual(idsNuevos([1, 2], [2]), []);
});
