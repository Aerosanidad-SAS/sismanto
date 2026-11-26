import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { faltaKm, fechaExcel, itemDelPlan, kmDelServicio, tareasDelServicio, trabajosDeLinea } from "./mapeo-plan.mjs";

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

test("las fechas del Excel se leen igual vengan como número o como texto día/mes/año", () => {
  assert.equal(fechaExcel(45622), "2024-11-26");
  assert.equal(fechaExcel("26/11/2024"), "2024-11-26");
  assert.equal(fechaExcel("2024-11-26"), "2024-11-26");
  assert.equal(fechaExcel("11/26/2024"), null);
  assert.equal(fechaExcel(""), null);
});

test("el km escrito en el Excel manda sobre el imputado, venga antes o después", () => {
  const inicio = { km: 0, kmReal: false };
  const imputado = kmDelServicio(inicio, 0, 120000);
  assert.deepEqual(imputado, { km: 120000, kmReal: false });
  assert.deepEqual(kmDelServicio(imputado, 100000, 100000), { km: 100000, kmReal: true });
  assert.deepEqual(kmDelServicio({ km: 100000, kmReal: true }, 0, 120000), { km: 100000, kmReal: true });
});

test("solo se enlaza la tarea del plan que le aplica al vehículo", () => {
  const plan = [{ id: 1, descripcion: "Cambio de llantas", aplica_a: "AIRPLAN" }];
  assert.equal(itemDelPlan(plan, "Cambio de llantas", { placa: "AAA000", centro_operativo: "AIRPLAN" })?.id, 1);
  assert.equal(itemDelPlan(plan, "Cambio de llantas", { placa: "AAA000", centro_operativo: "OTRO" }), undefined);
});

test("una tarea por kilómetros sin km no se enlaza; una por días sí", () => {
  assert.equal(faltaKm({ intervalo_km: 5000 }, 0), true);
  assert.equal(faltaKm({ intervalo_km: 5000 }, 80000), false);
  assert.equal(faltaKm({ intervalo_km: 0 }, 0), false);
});

test("todas las tareas del mapeo existen en el plan sembrado (migración 012)", () => {
  const plan = readFileSync(new URL("../migrations/012_preventive_maintenance_plan.sql", import.meta.url), "utf8");
  const mapeo = readFileSync(new URL("./mapeo-plan.mjs", import.meta.url), "utf8");
  const bloques = mapeo.slice(mapeo.indexOf("const KIT"), mapeo.indexOf("const tiene"));
  const tareas = Array.from(bloques.matchAll(/(?:\w+: |const (?:KIT|FRE) = )"([^"]+)"/g), (m) => m[1]);
  assert.ok(tareas.length > 30);
  assert.deepEqual(tareas.filter((t) => !plan.includes(`'${t}'`)), []);
});
