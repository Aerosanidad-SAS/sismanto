import assert from "node:assert/strict";
import { test } from "node:test";

import { COLUMNAS_SISPRO } from "./captacion";
import {
  EXPORT_INFORMES_MAX_DIAS,
  INFORMES_EXPORTABLES,
  detalleAuditoriaExport,
  hojasInformes,
  hojaAcm,
  hojaAerocivil,
  hojaPae,
  hojaPme,
  hojaSispro,
  mesesDelRango,
  nombreHojaSispro,
  parsearInformes,
  validarRangoExport,
  type Hoja,
} from "./informes-captacion-export";
import {
  calcularInformeAcm,
  calcularInformeAerocivil,
  calcularInformePae,
  calcularInformePme,
  type FilaInforme,
} from "./informes-captacion";

function fila(p: Partial<FilaInforme> = {}): FilaInforme {
  return {
    fecha_atencion: "2026-11-10T15:00:00-05:00",
    fecha_nacimiento: "1990-01-01",
    sexo: "M",
    tipo_identificacion: "CC",
    tipo_atencion: "ENFERMEDAD GENERAL",
    resultado_autorizacion: null,
    lugar_atencion: "SERVICIO",
    condicion: "PASAJERO",
    accidente_especial: null,
    notificacion_obligatoria: null,
    tipo_vuelo: "COMERCIAL",
    patologia_sistema: null,
    otra_patologia: null,
    post_operatorio: null,
    emergencia_tipo: null,
    procedimientos: null,
    aerolinea: null,
    ...p,
  };
}

const FILAS: FilaInforme[] = [
  fila({ sexo: "M", tipo_atencion: "ACCIDENTE LABORAL", condicion: "EMPLEADO", aerolinea: "AVIANCA", procedimientos: ["GLUCOMETRIA", "SUTURAS, CURACIONES Y LAVADOS"] }),
  fila({ sexo: "F", tipo_atencion: "REMISION", condicion: "PASAJERO", aerolinea: "AVIANCA", lugar_atencion: "EXTERNO", tipo_vuelo: "AMBULANCIA", procedimientos: ["GLUCOMETRIA"] }),
  fila({ sexo: "F", condicion: "TRIPULANTE", aerolinea: "LATAM", fecha_nacimiento: "1950-05-05", tipo_identificacion: "NV" }),
  fila({ sexo: null, tipo_atencion: null, condicion: "VISITANTE", aerolinea: "NO EXISTE EN CATALOGO", fecha_nacimiento: null }),
];

/** Filas de una sección: desde el rótulo (primera celda) hasta la fila vacía siguiente. */
function seccion(hoja: Hoja, titulo: string): Hoja {
  const i = hoja.findIndex((f) => f[0] === titulo);
  assert.ok(i >= 0, `no hay sección «${titulo}»`);
  const out: Hoja = [];
  for (let j = i + 1; j < hoja.length && hoja[j].length > 0; j++) out.push(hoja[j]);
  return out;
}

const PERIODO = "Del 2026-11-01 al 2026-11-25 — todos los aeropuertos";

test("hojaAcm: cada tabla trae las mismas cifras que calcularInformeAcm, con su TOTAL", () => {
  const acm = calcularInformeAcm(FILAS);
  const hoja = hojaAcm(acm, PERIODO);

  const tipos = seccion(hoja, "Tipo de atención");
  for (const [etiqueta, c] of Object.entries(acm.tipoAtencion)) {
    assert.deepEqual(tipos.find((f) => f[0] === etiqueta), [etiqueta, c.H, c.M, c.T]);
  }
  const totalTipos = tipos.find((f) => f[0] === "TOTAL");
  const suma = Object.values(acm.tipoAtencion).reduce((a, c) => a + c.T, 0);
  assert.equal(totalTipos?.[3], suma);
  assert.equal(suma, 3); // el visitante sin tipo de atención reconocido no suma aquí; los otros tres sí

  const identidad = seccion(hoja, "Identidad");
  assert.deepEqual(identidad.find((f) => f[0] === "RC"), ["RC", 0, 1, 1]); // NV cuenta como RC
  assert.deepEqual(seccion(hoja, "Grupo etáreo").find((f) => f[0] === "MAYOR DE 60 AÑOS"), ["MAYOR DE 60 AÑOS", 0, 1, 1]);
  assert.equal(hoja.flat().includes("Pacientes atendidos"), true);
  assert.equal(hoja.find((f) => f[0] === "Pacientes atendidos")?.[1], acm.totalPacientes);
  assert.equal(hoja[1][0], PERIODO);
});

test("hojaAcm: las tablas de conteo (patologías, emergencias) salen con su total", () => {
  const acm = calcularInformeAcm([fila({ patologia_sistema: "OTROS", emergencia_tipo: "CONTINGENCIAS" }), fila({ emergencia_tipo: "CONTINGENCIAS" })]);
  const hoja = hojaAcm(acm, PERIODO);
  const emergencias = seccion(hoja, "Emergencias");
  assert.deepEqual(emergencias.find((f) => f[0] === "CONTINGENCIAS"), ["CONTINGENCIAS", 2]);
  assert.deepEqual(emergencias.find((f) => f[0] === "TOTAL"), ["TOTAL", 2]);
});

test("hojaAerocivil: coincide con calcularInformeAerocivil", () => {
  const a = calcularInformeAerocivil(FILAS);
  const hoja = hojaAerocivil(a, PERIODO);
  const resumen = seccion(hoja, "Resumen");
  const valor = (rotulo: string) => resumen.find((f) => f[0] === rotulo)?.[1];
  assert.equal(valor("Servicio médico"), a.totalServicio);
  assert.equal(valor("Externos"), a.totalExterno);
  assert.equal(valor("Total"), a.totalServicio + a.totalExterno);
  assert.equal(valor("Hombres"), a.hombres);
  assert.equal(valor("Mujeres"), a.mujeres);
  assert.equal(valor("Pasajeros"), a.pasajeros);
  assert.equal(valor("Tripulantes"), a.tripulantes);
  assert.equal(valor("Empleados aeropuerto"), a.empleados);
  assert.equal(valor("Accidentes"), a.accidentes);
  assert.equal(valor("Enfermos"), a.enfermos);
  assert.equal(valor("Remisiones"), a.remisiones);
  assert.equal(valor("Visitantes"), a.visitantes);
  assert.equal(valor("Curaciones"), a.curaciones);
  assert.equal(valor("Inyecciones"), a.inyecciones);

  const vuelos = seccion(hoja, "Tipo de vuelo");
  assert.deepEqual(vuelos.find((f) => f[0] === "Vuelo comercial"), ["Vuelo comercial", a.vueloComercial.H, a.vueloComercial.M, a.vueloComercial.T]);
  assert.deepEqual(vuelos.find((f) => f[0] === "Vuelo ambulancia"), ["Vuelo ambulancia", 0, 1, 1]);
  for (const [g, c] of Object.entries(a.grupoEtareo)) {
    assert.deepEqual(seccion(hoja, "Grupo etáreo").find((f) => f[0] === g), [g, c.H, c.M, c.T]);
  }
});

test("hojaPme: un renglón por procedimiento y el total del informe", () => {
  const pme = calcularInformePme(FILAS);
  const hoja = hojaPme(pme, PERIODO);
  const rows = seccion(hoja, "Procedimiento");
  assert.deepEqual(rows.find((f) => f[0] === "GLUCOMETRIA"), ["GLUCOMETRIA", 2]);
  assert.equal(rows.length, Object.keys(pme.conteo).length + 1);
  assert.deepEqual(rows.at(-1), ["TOTAL", pme.total]);
  assert.equal(pme.total, 3);
});

test("hojaPae: cifras por empresa y total general; neutraliza fórmulas en el nombre de la empresa", () => {
  const pae = calcularInformePae(FILAS, ["AVIANCA", "LATAM", "=CMD()"]);
  const hoja = hojaPae(pae, PERIODO);
  const rows = seccion(hoja, "Aerolínea / entidad");
  assert.deepEqual(rows.find((f) => f[0] === "AVIANCA"), ["AVIANCA", 1, 1, 2]);
  assert.deepEqual(rows.find((f) => f[0] === "LATAM"), ["LATAM", 0, 0, 1]);
  assert.deepEqual(rows.at(-1), ["TOTAL", pae.totalGeneral.EMPLEADOS, pae.totalGeneral.PASAJEROS, pae.totalGeneral.TOTAL]);
  assert.ok(rows.some((f) => f[0] === "'=CMD()"));
  assert.ok(!rows.some((f) => f[0] === "=CMD()"));
});

test("hojaPae: sin aerolíneas en el catálogo lo dice en la hoja", () => {
  const hoja = hojaPae(calcularInformePae([], []), PERIODO);
  assert.ok(hoja.flat().some((c) => typeof c === "string" && c.startsWith("No hay aerolíneas")));
});

test("hojaSispro: encabezados del reporte y celdas de texto a salvo de fórmulas", () => {
  const hoja = hojaSispro([[1, "=1+1", "-cmd", "normal", 5]]);
  assert.deepEqual(hoja[0], [...COLUMNAS_SISPRO]);
  assert.deepEqual(hoja[1], [1, "'=1+1", "'-cmd", "normal", 5]);
});

test("nombreHojaSispro cabe en los 31 caracteres de Excel", () => {
  assert.equal(nombreHojaSispro("2026-09"), "SISPRO 2026-09");
  assert.ok(nombreHojaSispro("2026-09").length <= 31);
});

test("parsearInformes: lista blanca, sin repetidos y en orden fijo", () => {
  assert.deepEqual(parsearInformes("pae,acm,ACM"), ["acm", "pae"]);
  assert.deepEqual(parsearInformes(" pme , sispro "), ["pme", "sispro"]);
  assert.deepEqual(parsearInformes(INFORMES_EXPORTABLES.join(",")), [...INFORMES_EXPORTABLES]);
  assert.equal(parsearInformes(""), null);
  assert.equal(parsearInformes(null), null);
  assert.equal(parsearInformes("acm,otro"), null);
  assert.equal(parsearInformes("acm,,pae"), null);
  assert.equal(parsearInformes("acm;DROP"), null);
});

test("validarRangoExport: fechas reales, orden y tope de días", () => {
  assert.equal(validarRangoExport("2026-11-01", "2026-11-25"), null);
  assert.match(validarRangoExport("2026-02-30", "2026-11-25") ?? "", /fecha/i);
  assert.match(validarRangoExport("2026-11-01", null) ?? "", /fecha/i);
  assert.match(validarRangoExport("2026-11-25", "2026-11-01") ?? "", /posterior/);
  assert.equal(validarRangoExport("2026-01-01", "2026-12-31"), null);
  assert.match(validarRangoExport("2025-01-01", "2026-12-31") ?? "", new RegExp(String(EXPORT_INFORMES_MAX_DIAS)));
});

test("mesesDelRango: todos los meses que toca el rango, de enero a diciembre y cruzando año", () => {
  assert.deepEqual(mesesDelRango("2026-11-05", "2026-11-25"), ["2026-11"]);
  assert.deepEqual(mesesDelRango("2026-10-31", "2026-12-01"), ["2026-10", "2026-11", "2026-12"]);
  assert.deepEqual(mesesDelRango("2026-12-15", "2027-01-02"), ["2026-12", "2027-01"]);
});

// «Solo procedimiento» (PR #415): la forma que entrega getDatosInformeCaptacion en `externos`.
const EXTERNOS = [{ lote: "a", procedimiento: "AMBULANCIAS EXTERNAS", cantidad: 3, emergencia_tipo: "ALISTAMIENTOS" }];

test("hojasInformes: una hoja por informe pedido, sin SISPRO, en el mismo orden", () => {
  const r = hojasInformes(["acm", "pae", "sispro"], { filas: FILAS, aerolineas: ["AVIANCA"] }, "p");
  assert.deepEqual(r.map((h) => h.nombre), ["ACM", "PAE"]);
  assert.deepEqual(r[0].hoja, hojaAcm(calcularInformeAcm(FILAS), "p"));
  assert.deepEqual(hojasInformes(["sispro"], { filas: FILAS, aerolineas: [] }, "p"), []);
});

test("hojasInformes: entrega los registros sin paciente a las mismas funciones que la pantalla", () => {
  // Vale antes y después de #415: se compara con lo que la función calcula recibiendo `externos`.
  type Calc<R> = (filas: FilaInforme[], externos?: unknown) => R;
  const [acm, aerocivil, pme] = hojasInformes(["acm", "aerocivil", "pme"], { filas: FILAS, aerolineas: [], externos: EXTERNOS }, "p");
  assert.deepEqual(acm.hoja, hojaAcm((calcularInformeAcm as Calc<ReturnType<typeof calcularInformeAcm>>)(FILAS, EXTERNOS), "p"));
  assert.deepEqual(
    aerocivil.hoja,
    hojaAerocivil((calcularInformeAerocivil as Calc<ReturnType<typeof calcularInformeAerocivil>>)(FILAS, EXTERNOS), "p"),
  );
  assert.deepEqual(pme.hoja, hojaPme((calcularInformePme as Calc<ReturnType<typeof calcularInformePme>>)(FILAS, EXTERNOS), "p"));
});

test("hojaAerocivil: repite la nota de la pantalla cuando «Ambulancia» incluye registros sin paciente", () => {
  const base = calcularInformeAerocivil(FILAS);
  const conNota = hojaAerocivil({ ...base, ambulanciaExternaSinPaciente: 3 } as typeof base, "p");
  assert.ok(conNota.some((f) => /incluye 3 ambulancia/.test(String(f[0]))));
  const sinNota = hojaAerocivil({ ...base, ambulanciaExternaSinPaciente: 0 } as typeof base, "p");
  assert.ok(!sinNota.some((f) => String(f[0]).startsWith("Nota:")));
});

test("detalleAuditoriaExport: separa SISPRO, que sale con meses completos y sin filtrar aeropuerto", () => {
  const base = { desde: "2026-01-15", hasta: "2026-02-10", aeropuerto: "AEROPUERTO PRUEBA", captaciones: 7 };
  assert.equal(
    detalleAuditoriaExport({ ...base, informes: ["acm", "sispro"], mesesSispro: ["2026-01", "2026-02"], filasSispro: 20 }),
    "Informes de captación (ACM, SISPRO) del 2026-01-15 al 2026-02-10; aeropuerto AEROPUERTO PRUEBA: 7 captaciones; " +
      "SISPRO con datos personales, meses completos 2026-01 a 2026-02, todos los aeropuertos: 20 filas",
  );
  const soloSispro = detalleAuditoriaExport({ ...base, informes: ["sispro"], captaciones: 0, mesesSispro: ["2026-01"], filasSispro: 2 });
  assert.doesNotMatch(soloSispro, /AEROPUERTO PRUEBA|captaciones:/);
  const sinSispro = detalleAuditoriaExport({ ...base, aeropuerto: "", informes: ["pme"], mesesSispro: [], filasSispro: 0 });
  assert.equal(sinSispro, "Informes de captación (PME) del 2026-01-15 al 2026-02-10; todos los aeropuertos: 7 captaciones");
});
