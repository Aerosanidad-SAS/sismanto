import { test } from "node:test";
import assert from "node:assert/strict";
import { tareasDelServicio, trabajosDeLinea } from "./mapeo-plan.mjs";

const L = (categoria, descripcion = "") => ({ categoria, descripcion });

test("el cambio de aceite reinicia la tarea de flota y, en AIRPLAN, la de días", () => {
  assert.deepEqual(tareasDelServicio([L("CAMBIO DE ACEITE")], false), ["Cambio de Aceite de Motor (Sintético)"]);
  assert.ok(tareasDelServicio([L("CAMBIO DE ACEITE")], true).includes("Cambio de aceite y filtro de aceite"));
});

test("el kit de filtros exige aceite + aire + combustible en la misma visita", () => {
  const kit = "Cambio Kit Filtros (Aire, Combustible, Aceite)";
  assert.ok(!tareasDelServicio([L("CAMBIO DE ACEITE"), L("CAMBIO DE FILTRO DE AIRE DE MOTOR")], false).includes(kit));
  assert.ok(tareasDelServicio([L("CAMBIO DE ACEITE"), L("CAMBIO DE FILTRO DE AIRE DE MOTOR"), L("CAMBIO DE FILTRO DE COMBUSTIBLE")], false).includes(kit));
});

test("frenos y refrigerante: ambos o ninguno", () => {
  const t = "Sustitución Líquido de Frenos y Refrigerante";
  assert.ok(!tareasDelServicio([L("CAMBIO DE LIQUIDO DE FRENOS")], false).includes(t));
  assert.ok(tareasDelServicio([L("CAMBIO DE LIQUIDO DE FRENOS"), L("Radiador y refrigeracion", "LIQUIDO DE REFRIGERANTE POTRO")], false).includes(t));
});

test("las reglas por descripción distinguen cambio de reparación", () => {
  assert.deepEqual(trabajosDeLinea("Bateria", "Carga de batería"), []);
  assert.equal(trabajosDeLinea("Bateria", "INSTALACION DE BATERIAS").length, 1);
  assert.deepEqual(trabajosDeLinea("Llantas", "Parche #1 al #7"), []);
  assert.deepEqual(trabajosDeLinea("Frenos preventivo", "LIQUIDO LIMPIADOR FRENOS LOCTITE"), []);
  assert.equal(trabajosDeLinea("Frenos preventivo", "MANO DE OBRA FRENOS PASTAS-BANDAS").length, 1);
});

test("categorías de reparación o desconocidas solo quedan en el historial", () => {
  assert.deepEqual(tareasDelServicio([L("MO Mano de obra", "MANO DE OBRA MECANICA"), L("Motor y relacionados", "Empaque tapa valvulas")], true), []);
  assert.deepEqual(trabajosDeLinea("CATEGORIA QUE NO EXISTE", "x"), []);
});

test("la correa de distribución cumple su tarea sola", () => {
  assert.ok(tareasDelServicio([L("CAMBIAR CORREA DE DISTRIBUCION")], false).includes("Kit Distribución + Bomba de Agua + Termostato"));
});
