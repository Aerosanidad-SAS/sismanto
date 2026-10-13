import assert from "node:assert/strict";
import { test } from "node:test";

import { cantidadEsperada, esItemDeInventario, unidadesFaltantes } from "./inventario-preop";

test("cantidadEsperada: solo enteros positivos; «OK» es un ítem de estado", () => {
  assert.equal(cantidadEsperada("2"), 2);
  assert.equal(cantidadEsperada("OK"), null);
  assert.equal(cantidadEsperada(null), null);
  assert.equal(cantidadEsperada("0"), null);
});

test("el equipo es inventario; las luces y la cabina son funcionamiento", () => {
  assert.equal(esItemDeInventario({ categoria: "EQUIPO_CARRETERA", cantidad_esperada: "2" }), true);
  assert.equal(esItemDeInventario({ categoria: "EQUIPO_BASICO", cantidad_esperada: "1" }), true);
  assert.equal(esItemDeInventario({ categoria: "LUCES", cantidad_esperada: "2" }), false);
  assert.equal(esItemDeInventario({ categoria: "EQUIPO_BASICO", cantidad_esperada: "OK" }), false);
});

test("unidadesFaltantes: 1 chaleco de 2 falta 1; completo o sin respuesta no falta nada", () => {
  const chaleco = { categoria: "EQUIPO_CARRETERA", cantidad_esperada: "2" };
  assert.equal(unidadesFaltantes(chaleco, 1), 1);
  assert.equal(unidadesFaltantes(chaleco, 0), 2);
  assert.equal(unidadesFaltantes(chaleco, 2), 0);
  assert.equal(unidadesFaltantes(chaleco, undefined), 0);
  assert.equal(unidadesFaltantes({ categoria: "LUCES", cantidad_esperada: "2" }, 1), 0);
});
