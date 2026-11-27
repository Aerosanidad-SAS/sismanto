import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calcularInformeAcm,
  calcularInformeAerocivil,
  calcularInformePme,
  type FilaInforme,
  type FilaProcedimientoExterno,
} from "./informes-captacion";

// Registros «solo procedimiento» (migración 144): cuentan en PME (con cantidad), en las emergencias de ACM y en la
// columna «Ambulancia» de Aerocivil, pero nunca como pacientes.

function fila(parcial: Partial<FilaInforme> = {}): FilaInforme {
  return {
    fecha_atencion: "2026-09-15T15:00:00Z",
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
    procedimientos: [],
    aerolinea: null,
    ...parcial,
  };
}

function externo(parcial: Partial<FilaProcedimientoExterno> = {}): FilaProcedimientoExterno {
  return { lote: "lote-1", procedimiento: "AMBULANCIAS EXTERNAS", cantidad: 1, emergencia_tipo: null, ...parcial };
}

describe("calcularInformePme con procedimientos externos", () => {
  it("suma la cantidad de cada línea a la de las captaciones", () => {
    const r = calcularInformePme(
      [fila({ procedimientos: ["AMBULANCIAS EXTERNAS", "GLUCOMETRIA"] })],
      [externo({ cantidad: 3 }), externo({ lote: "lote-2", cantidad: 2 }), externo({ procedimiento: "GLUCOMETRIA", cantidad: 4 })],
    );
    assert.equal(r.conteo["AMBULANCIAS EXTERNAS"], 6);
    assert.equal(r.conteo.GLUCOMETRIA, 5);
    assert.equal(r.total, 11);
  });

  it("ignora los procedimientos que el formato no incluye", () => {
    const r = calcularInformePme([], [externo({ procedimiento: "REUNION DE PERSONAL Y ADMINISTRATIVAS", cantidad: 5 })]);
    assert.equal(r.total, 0);
  });

  it("sin el segundo parámetro da lo mismo que antes", () => {
    const filas = [fila({ procedimientos: ["GLUCOMETRIA"] })];
    assert.deepEqual(calcularInformePme(filas), calcularInformePme(filas, []));
    assert.equal(calcularInformePme(filas).total, 1);
  });
});

describe("calcularInformeAcm con procedimientos externos", () => {
  it("no los cuenta como pacientes ni en ninguna tabla de pacientes", () => {
    const filas = [fila({ sexo: "F", tipo_atencion: "REMISION", fecha_nacimiento: "1990-01-01" })];
    const sin = calcularInformeAcm(filas);
    const con = calcularInformeAcm(filas, [externo({ emergencia_tipo: "ALISTAMIENTOS", cantidad: 5 })]);
    assert.equal(con.totalPacientes, 1);
    assert.deepEqual({ ...con, emergencias: null }, { ...sin, emergencias: null });
  });

  it("cuenta cada registro una vez por tipo de emergencia, sin importar cuántas líneas ni qué cantidad", () => {
    const r = calcularInformeAcm(
      [fila({ emergencia_tipo: "CONTINGENCIAS" })],
      [
        externo({ lote: "a", emergencia_tipo: "ALISTAMIENTOS", cantidad: 9 }),
        externo({ lote: "a", procedimiento: "GLUCOMETRIA", emergencia_tipo: "ALISTAMIENTOS", cantidad: 2 }),
        externo({ lote: "b", emergencia_tipo: "ALISTAMIENTOS" }),
        externo({ lote: "c", emergencia_tipo: "CONTINGENCIAS" }),
        externo({ lote: "d", emergencia_tipo: null }),
      ],
    );
    assert.equal(r.emergencias.ALISTAMIENTOS, 2);
    assert.equal(r.emergencias.CONTINGENCIAS, 2);
    assert.equal(r.emergencias["ACCIDENTES AEREOS"], 0);
    assert.equal(r.totalPacientes, 1);
  });

  it("sin el segundo parámetro da lo mismo que antes", () => {
    const filas = [fila({ emergencia_tipo: "ALISTAMIENTOS" })];
    assert.deepEqual(calcularInformeAcm(filas), calcularInformeAcm(filas, []));
  });
});

describe("calcularInformeAerocivil con procedimientos externos", () => {
  it("suma la cantidad a «Ambulancia» y no toca pacientes, sexo, condición ni otras columnas", () => {
    const filas = [fila({ procedimientos: ["AMBULANCIAS EXTERNAS"] })];
    const sin = calcularInformeAerocivil(filas);
    const con = calcularInformeAerocivil(filas, [
      externo({ cantidad: 3 }),
      externo({ lote: "lote-2", procedimiento: "SERVICIOS DE AMBULANCIAS DE SANIDAD", cantidad: 2 }),
      externo({ lote: "lote-3", procedimiento: "ADMINISTRACIÓN DE MEDICAMENTOS IV  Y/O  IM", cantidad: 7 }),
    ]);
    assert.equal(sin.ambulancia, 1);
    assert.equal(con.ambulancia, 6);
    assert.equal(con.ambulanciaExternaSinPaciente, 5);
    assert.equal(sin.ambulanciaExternaSinPaciente, 0);
    assert.equal(con.totalPacientes, 1);
    assert.equal(con.inyecciones, 0);
    assert.deepEqual({ ...con, ambulancia: 0, ambulanciaExternaSinPaciente: 0 }, { ...sin, ambulancia: 0, ambulanciaExternaSinPaciente: 0 });
  });

  it("sin el segundo parámetro da lo mismo que antes", () => {
    const filas = [fila({ procedimientos: ["AMBULANCIAS EXTERNAS"] })];
    assert.deepEqual(calcularInformeAerocivil(filas), calcularInformeAerocivil(filas, []));
  });
});
