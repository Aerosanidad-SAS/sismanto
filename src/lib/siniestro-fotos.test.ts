import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LADO_MAXIMO_FOTO,
  TAMANO_MAXIMO_ORIGINAL,
  calcularDimensiones,
  esTipoFoto,
  rutaFotoSiniestro,
  rutaPerteneceASiniestro,
  validarArchivoFoto,
} from "./siniestro-fotos";

test("calcularDimensiones recorta el lado mayor a 1600 conservando la proporción", () => {
  assert.deepEqual(calcularDimensiones(4000, 3000), { ancho: 1600, alto: 1200 });
  assert.deepEqual(calcularDimensiones(3000, 4000), { ancho: 1200, alto: 1600 });
  assert.deepEqual(calcularDimensiones(1600, 1600), { ancho: 1600, alto: 1600 });
});

test("calcularDimensiones nunca agranda y rechaza medidas inválidas", () => {
  assert.deepEqual(calcularDimensiones(800, 600), { ancho: 800, alto: 600 });
  assert.deepEqual(calcularDimensiones(0, 600), { ancho: 0, alto: 0 });
  assert.deepEqual(calcularDimensiones(NaN, 600), { ancho: 0, alto: 0 });
  const extrema = calcularDimensiones(100000, 10);
  assert.equal(extrema.ancho, LADO_MAXIMO_FOTO);
  assert.equal(extrema.alto, 1);
});

test("validarArchivoFoto acepta imágenes y rechaza lo demás", () => {
  assert.equal(validarArchivoFoto({ type: "image/jpeg", size: 2_000_000 }), null);
  assert.equal(validarArchivoFoto({ type: "image/heic", size: 2_000_000 }), null);
  assert.ok(validarArchivoFoto({ type: "application/pdf", size: 1000 }));
  assert.ok(validarArchivoFoto({ type: "image/png", size: 0 }));
  assert.ok(validarArchivoFoto({ type: "image/png", size: TAMANO_MAXIMO_ORIGINAL + 1 }));
});

test("tipos de foto y rutas del bucket", () => {
  assert.ok(esTipoFoto("HECHOS"));
  assert.ok(esTipoFoto("DOCUMENTOS"));
  assert.ok(!esTipoFoto("OTRO"));
  assert.ok(!esTipoFoto(undefined));
  const ruta = rutaFotoSiniestro(42, "HECHOS", "0b9f3c1e-aaaa-4bbb-8ccc-123456789abc");
  assert.equal(ruta, "42/HECHOS/0b9f3c1e-aaaa-4bbb-8ccc-123456789abc.jpg");
  assert.ok(rutaPerteneceASiniestro(ruta, 42, "HECHOS"));
  assert.ok(!rutaPerteneceASiniestro(ruta, 43, "HECHOS"));
  assert.ok(!rutaPerteneceASiniestro(ruta, 42, "DOCUMENTOS"));
  assert.ok(!rutaPerteneceASiniestro("42/HECHOS/../1/x.jpg", 42, "HECHOS"));
});
