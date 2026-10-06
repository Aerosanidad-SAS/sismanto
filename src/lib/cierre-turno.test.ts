import assert from "node:assert/strict";
import { test } from "node:test";

import {
  bloqueoCierre,
  cruzarCierres,
  debeAbrirNovedad,
  descripcionNovedadDeCierre,
  estadoEntregaDe,
  horaCierreBogota,
  validarCierre,
  validarKmFinal,
  type CierreRegistrado,
  type EntradaCierre,
} from "./cierre-turno";

const ctx = { kmInicialHoy: 125_000, ultimoKm: 125_000 };
const valida: EntradaCierre = {
  kmFinal: 125_180,
  huboNovedades: false,
  nivelCombustible: "MEDIO",
  limpiezaOk: true,
};

test("el km final es obligatorio, entero y positivo", () => {
  assert.notEqual(validarKmFinal(undefined, ctx), null);
  assert.notEqual(validarKmFinal(Number.NaN, ctx), null);
  assert.notEqual(validarKmFinal(0, ctx), null);
  assert.notEqual(validarKmFinal(125_000.5, ctx), null);
  assert.equal(validarKmFinal(125_180, ctx), null);
});

test("el km final no puede ser menor al inicial de hoy ni al último registrado, y el error dice cuál", () => {
  const menorInicial = validarKmFinal(124_000, { kmInicialHoy: 125_000, ultimoKm: 120_000 });
  assert.match(menorInicial ?? "", /inicial de hoy/);
  const menorUltimo = validarKmFinal(125_100, { kmInicialHoy: 125_000, ultimoKm: 125_500 });
  assert.match(menorUltimo ?? "", /último registrado/);
  assert.match(menorUltimo ?? "", /125[.,\s ]?500/);
  // Igual al inicial es válido (turno sin recorrido).
  assert.equal(validarKmFinal(125_000, ctx), null);
  // Sin referencias no hay contra qué comparar.
  assert.equal(validarKmFinal(10, { kmInicialHoy: null, ultimoKm: null }), null);
});

test("una entrada completa es válida", () => {
  assert.equal(validarCierre(valida, ctx), null);
});

test("con novedades la nota es obligatoria (y no basta con espacios)", () => {
  assert.match(validarCierre({ ...valida, huboNovedades: true }, ctx) ?? "", /qué novedad/);
  assert.match(validarCierre({ ...valida, huboNovedades: true, novedadesNota: "   " }, ctx) ?? "", /qué novedad/);
  assert.equal(validarCierre({ ...valida, huboNovedades: true, novedadesNota: "Ruido en el freno delantero" }, ctx), null);
  // Sin novedades la nota no se exige.
  assert.equal(validarCierre({ ...valida, huboNovedades: false, novedadesNota: "" }, ctx), null);
  assert.match(validarCierre({ ...valida, huboNovedades: true, novedadesNota: "x".repeat(1001) }, ctx) ?? "", /máximo/);
});

test("el combustible, la limpieza y la pregunta de novedades no tienen valor por defecto", () => {
  assert.match(validarCierre({ ...valida, huboNovedades: undefined }, ctx) ?? "", /novedades/);
  assert.match(validarCierre({ ...valida, nivelCombustible: undefined }, ctx) ?? "", /combustible/);
  assert.match(validarCierre({ ...valida, nivelCombustible: "FULL" }, ctx) ?? "", /combustible/);
  assert.match(validarCierre({ ...valida, limpiezaOk: undefined }, ctx) ?? "", /limpio/);
  for (const n of ["LLENO", "TRES_CUARTOS", "MEDIO", "CUARTO", "RESERVA"]) {
    assert.equal(validarCierre({ ...valida, nivelCombustible: n }, ctx), null);
  }
});

test("el estado de la entrega sigue a la respuesta de novedades", () => {
  assert.equal(estadoEntregaDe(true), "CON_NOVEDADES");
  assert.equal(estadoEntregaDe(false), "SIN_NOVEDAD");
});

test("bloqueos: ya cerrado, sin preoperacional y servicio en curso", () => {
  const libre = { tienePreoperacionalHoy: true, yaCerrado: false, serviciosEnCurso: 0 };
  assert.equal(bloqueoCierre(libre), null);
  assert.match(bloqueoCierre({ ...libre, yaCerrado: true }) ?? "", /Ya cerraste/);
  assert.match(bloqueoCierre({ ...libre, tienePreoperacionalHoy: false }) ?? "", /preoperacional/);
  assert.equal(bloqueoCierre({ ...libre, serviciosEnCurso: 1 }), "Termina el servicio en curso primero.");
  // Si ya cerró, ese es el mensaje, aunque falte otra cosa.
  assert.match(bloqueoCierre({ tienePreoperacionalHoy: false, yaCerrado: true, serviciosEnCurso: 2 }) ?? "", /Ya cerraste/);
});

test("se abre novedad solo si dijo que sí y el vehículo no tiene una abierta", () => {
  assert.equal(debeAbrirNovedad(true, 0), true);
  assert.equal(debeAbrirNovedad(true, 2), false);
  assert.equal(debeAbrirNovedad(false, 0), false);
  assert.ok(descripcionNovedadDeCierre("Golpe").length >= 10);
  assert.equal(descripcionNovedadDeCierre(" Luz rota "), "Cierre de turno: Luz rota");
});

const cierre = (vehicleId: string, cerradoAt: string): CierreRegistrado => ({
  vehicleId,
  placa: vehicleId.toUpperCase(),
  ovem: "Ana",
  cerradoAt,
  estadoEntrega: "SIN_NOVEDAD",
  kmFinal: 100,
});

test("cruzarCierres separa los cerrados de los programados que faltan y ordena por hora", () => {
  const programados = [
    { vehicleId: "a", placa: "A", operadores: ["Ana"] },
    { vehicleId: "b", placa: "B", operadores: ["Beto"] },
    { vehicleId: "c", placa: "C", operadores: [] },
  ];
  const r = cruzarCierres(programados, [cierre("b", "2026-10-02T23:00:00Z"), cierre("a", "2026-10-02T22:00:00Z")]);
  assert.equal(r.esperados, 3);
  assert.deepEqual(r.cerrados.map((c) => c.vehicleId), ["a", "b"]);
  assert.deepEqual(r.faltantes.map((f) => f.vehicleId), ["c"]);
});

test("la hora del cierre se muestra en Colombia sin depender de la zona del equipo", () => {
  assert.equal(horaCierreBogota("2026-10-03T01:30:00Z"), "20:30");
  assert.equal(horaCierreBogota("2026-10-02T13:05:00Z"), "08:05");
});
