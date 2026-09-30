import assert from "node:assert/strict";
import { test } from "node:test";

import {
  analizarCarga,
  fechaDeSerial,
  leerFecha,
  leerVentas,
  localizarEncabezados,
  notasDeVenta,
  type VehiculoCombustible,
} from "./combustible-proveedor";

const ENCABEZADOS = [
  "Cliente", "Nro.Identificación", "Código SAP", "No. Venta ", "Fecha", "Estación", "Regional", "Id EDS", "Placa",
  "Conductor", "Combustible", "Cantidad", "Precio", "Unidad de Venta", "Total Venta", "Kilometraje ",
];

/** Fila en el formato del proveedor. */
function fila(venta: string, serial: number | string, placa: string, comb: string, galones: number | string, total: number | string, km: number | string | null): unknown[] {
  return ["AEROSANIDAD", "900236791", "123", venta, serial, "EDS LA 33", "ANTIOQUIA", "77", placa, "JUAN", comb, galones, 9000, "UGL", total, km ?? ""];
}

// Muestra de 20 filas: dos filas previas, encabezados con espacios sobrantes y una mezcla de casos.
const SERIAL = 46000; // 2025-12-... (serial de Excel)
const MUESTRA: unknown[][] = [
  ["Reporte de consumo", "", ""],
  [],
  ENCABEZADOS,
  fila("1001", SERIAL, "AAA111", "Diesel", 10, 90000, 1000),
  fila("1002", SERIAL + 1, "AAA111", "Diesel", "11,5", "103.500,00", 1100),
  fila("1003", SERIAL + 2, "AAA111", "Diesel", 10, 90000, 900), // retrocede
  fila("1004", SERIAL + 3, "AAA111", "Diesel", 10, 90000, 50000), // salto absurdo
  fila("1005", SERIAL + 4, "BBB222", "Gasolina Corriente", 8, 72000, 500),
  fila("1006", SERIAL + 5, "BBB222", "Diesel", 8, 72000, 600), // combustible distinto
  fila("1007", SERIAL + 6, "BBB222", "Gasolina Corriente", 8, 720000, 700), // precio atípico
  fila("1008", SERIAL + 7, "ZZZ999", "Diesel", 10, 90000, 10), // placa desconocida
  fila("1008", SERIAL + 7, "ZZZ999", "Diesel", 10, 90000, 10), // repetida en el archivo
  fila("1009", SERIAL + 8, "AAA111", "Diesel", 0, 90000, 1150), // galones 0 → error
  fila("1010", SERIAL + 9, "AAA111", "Diesel", 10, "", 1150), // total vacío → error
  fila("", SERIAL + 9, "AAA111", "Diesel", 10, 90000, 1150), // sin No. Venta → error
  fila("1011", "no es fecha", "AAA111", "Diesel", 10, 90000, 1150), // fecha inválida → error
  fila("1012", SERIAL + 10 + 0.5, "aaa-111", "Diesel", 10, 90000, 1200), // placa con guion y hora
  fila("1013", SERIAL + 11, "BBB222", "Gasolina Corriente", 8, 72000, null), // sin km
  fila("1014", SERIAL + 12, "AAA111", "Diesel", 10, 90000, 1300),
  fila("1015", "22/12/2025 14:30", "AAA111", "Diesel", 10, 90000, 1250),
  fila("1016", SERIAL + 14, "BBB222", "Gasolina Corriente", 8, 72000, 800),
];

const VEHICULOS = new Map<string, VehiculoCombustible>([
  ["AAA111", { id: "v-a", combustible: "DIESEL", kmActual: 950 }],
  ["BBB222", { id: "v-b", combustible: "GASOLINA", kmActual: null }],
]);

test("el encabezado se encuentra por nombre aunque haya filas previas y espacios sobrantes", () => {
  const enc = localizarEncabezados(MUESTRA);
  assert.ok(!("error" in enc));
  if ("error" in enc) return;
  assert.equal(enc.indiceFila, 2);
  assert.equal(enc.columnas.numero_venta, 3);
  assert.equal(enc.columnas.kilometraje, 15);
});

test("si falta una columna obligatoria, el mensaje dice cuál", () => {
  const sinKm = [ENCABEZADOS.filter((h) => !h.startsWith("Kilometraje"))];
  const r = localizarEncabezados(sinKm);
  assert.ok("error" in r);
  if ("error" in r) assert.match(r.error, /Kilometraje/);
});

test("fechas: serial de Excel con hora, ISO y DD/MM/AAAA", () => {
  assert.deepEqual(fechaDeSerial(45658), { dia: "2025-01-01", hora: null });
  assert.deepEqual(fechaDeSerial(45658.5), { dia: "2025-01-01", hora: "12:00" });
  assert.deepEqual(leerFecha("2026-09-30 08:15"), { dia: "2026-09-30", hora: "08:15" });
  assert.deepEqual(leerFecha("05/12/2025 14:30"), { dia: "2025-12-05", hora: "14:30" });
  assert.equal(leerFecha("nada"), null);
});

test("muestra de 20 filas: lectura y errores por fila", () => {
  const enc = localizarEncabezados(MUESTRA);
  if ("error" in enc) throw new Error(enc.error);
  const { ventas, errores } = leerVentas(MUESTRA, enc);
  assert.equal(errores.length, 4); // galones 0, total vacío, sin No. Venta, fecha inválida
  assert.equal(ventas.length, 14);
  const v = ventas.find((x) => x.numeroVenta === "1002")!;
  assert.equal(v.galones, 11.5);
  assert.equal(v.costo, 103500);
  const conPlaca = ventas.find((x) => x.numeroVenta === "1012")!;
  assert.equal(conPlaca.placa, "AAA111");
  assert.equal(conPlaca.hora, "12:00");
  assert.equal(ventas.find((x) => x.numeroVenta === "1013")!.km, 0);
  assert.equal(errores[0].fila, 13); // fila de Excel (1-based)
});

test("análisis: duplicadas, placas desconocidas, km sospechoso, precio y combustible", () => {
  const enc = localizarEncabezados(MUESTRA);
  if ("error" in enc) throw new Error(enc.error);
  const { ventas, errores } = leerVentas(MUESTRA, enc);
  const a = analizarCarga(ventas, errores, VEHICULOS, new Set(["1016"]));

  assert.equal(a.duplicadas, 2); // 1008 repetida en el archivo + 1016 ya en la base
  assert.deepEqual(a.placasDesconocidas, [{ placa: "ZZZ999", filas: 1 }]);
  assert.equal(a.nuevas.some((v) => v.placa === "ZZZ999"), false);

  const tipos = (t: string) => a.advertencias.filter((w) => w.tipo === t).map((w) => w.fila);
  assert.equal(tipos("KM_SOSPECHOSO").length, 3); // 900 retrocede; 50000 salta; 1250 retrocede frente a 1300
  assert.ok(tipos("PRECIO_ATIPICO").length >= 1);
  assert.equal(tipos("COMBUSTIBLE_DISTINTO").length, 1);

  // El km del vehículo solo avanza con lecturas válidas: lo más alto válido de AAA111 es 1300.
  const lecturaA = a.lecturasValidas.find((l) => l.placa === "AAA111")!;
  assert.equal(lecturaA.km, 1300);
  // Las lecturas sospechosas se cargan, marcadas.
  assert.equal(a.nuevas.find((v) => v.numeroVenta === "1004")!.kmSospechoso, true);
  assert.equal(a.nuevas.find((v) => v.numeroVenta === "1003")!.kmSospechoso, true);
  assert.ok(a.rango && a.rango.desde <= a.rango.hasta);
});

test("notas cortas: «Diesel | EDS LA 33»", () => {
  assert.equal(notasDeVenta({ combustible: "Diesel", estacion: "EDS LA 33" }), "Diesel | EDS LA 33");
  assert.equal(notasDeVenta({ combustible: null, estacion: null }), null);
});
