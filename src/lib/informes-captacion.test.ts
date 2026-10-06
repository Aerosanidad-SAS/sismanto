import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calcularInformeAcm,
  calcularInformeAerocivil,
  calcularInformePae,
  calcularInformePme,
  edadAlAtender,
  type FilaInforme,
} from "./informes-captacion";

function fila(parcial: Partial<FilaInforme> = {}): FilaInforme {
  return {
    fecha_atencion: "2026-09-15T15:00:00Z",
    fecha_nacimiento: null,
    sexo: null,
    tipo_identificacion: "CC",
    tipo_atencion: null,
    resultado_autorizacion: null,
    lugar_atencion: null,
    condicion: null,
    accidente_especial: null,
    notificacion_obligatoria: null,
    tipo_vuelo: null,
    patologia_sistema: null,
    otra_patologia: null,
    post_operatorio: null,
    emergencia_tipo: null,
    procedimientos: [],
    aerolinea: null,
    ...parcial,
  };
}

describe("edadAlAtender", () => {
  it("usa el día de la atención en Colombia, no en UTC", () => {
    // 1 de octubre a las 02:00 UTC = 30 de septiembre en Bogotá: todavía no cumple.
    assert.equal(edadAlAtender({ fecha_nacimiento: "2000-10-01", fecha_atencion: "2026-10-01T02:00:00Z" }), 25);
    assert.equal(edadAlAtender({ fecha_nacimiento: "2000-10-01", fecha_atencion: "2026-10-01T06:00:00Z" }), 26);
  });

  it("devuelve null sin fecha de nacimiento o si nace después de la atención", () => {
    assert.equal(edadAlAtender({ fecha_nacimiento: null, fecha_atencion: "2026-09-15T15:00:00Z" }), null);
    assert.equal(edadAlAtender({ fecha_nacimiento: "2027-01-01", fecha_atencion: "2026-09-15T15:00:00Z" }), null);
  });
});

describe("calcularInformeAcm", () => {
  it("reparte por sexo y deja en T a quien no lo tiene", () => {
    const r = calcularInformeAcm([
      fila({ sexo: "M", tipo_atencion: "ACCIDENTE LABORAL" }),
      fila({ sexo: "F", tipo_atencion: "ACCIDENTE LABORAL" }),
      fila({ tipo_atencion: "ACCIDENTE LABORAL" }),
    ]);
    assert.deepEqual(r.tipoAtencion["ACCIDENTE DE TRABAJO"], { H: 1, M: 1, T: 3 });
    assert.equal(r.totalPacientes, 3);
  });

  it("separa la condición del aeropuerto de la de tránsito", () => {
    const r = calcularInformeAcm([fila({ condicion: "PASAJERO" }), fila({ condicion: "PEATÓN" })]);
    assert.equal(r.condicion.PASAJERO.T, 1);
    assert.equal(r.condicionTransito["PEATÓN"].T, 1);
    assert.equal(r.condicion.PEATÓN, undefined);
  });

  it("agrupa la identificación con las siglas del informe", () => {
    const r = calcularInformeAcm([
      fila({ tipo_identificacion: "NV" }),
      fila({ tipo_identificacion: "PA" }),
      fila({ tipo_identificacion: "CE" }),
    ]);
    assert.equal(r.identidad.RC.T, 1);
    assert.equal(r.identidad.PAS.T, 1);
    assert.equal(r.identidad.OTROS.T, 1);
  });

  it("no cuenta NINGUNO/NO APLICA y muestra las categorías vacías", () => {
    const r = calcularInformeAcm([fila({ accidente_especial: "NINGUNO", notificacion_obligatoria: "NO APLICA" })]);
    assert.equal(Object.values(r.accidentesEspeciales).reduce((a, c) => a + c.T, 0), 0);
    assert.equal(r.notificacionObligatoria["NO APLICA"], undefined);
    assert.deepEqual(r.tipoVuelo.CHARTER, { H: 0, M: 0, T: 0 });
  });

  it("clasifica el grupo etáreo en los bordes", () => {
    const r = calcularInformeAcm([
      fila({ fecha_nacimiento: "2008-09-15" }), // 18 → DE 12 A 18
      fila({ fecha_nacimiento: "2007-09-15" }), // 19 → DE 19 A 29
      fila({ fecha_nacimiento: "2026-01-01" }), // 0 → MENOS DE 1 AÑO
    ]);
    assert.equal(r.grupoEtareo["DE 12 A 18"].T, 1);
    assert.equal(r.grupoEtareo["DE 19 A 29"].T, 1);
    assert.equal(r.grupoEtareo["MENOS DE 1 AÑO"].T, 1);
  });
});

describe("calcularInformeAerocivil", () => {
  it("cuenta procedimientos como columnas del formato", () => {
    const r = calcularInformeAerocivil([
      fila({ procedimientos: ["ADMINISTRACIÓN DE MEDICAMENTOS IV  Y/O  IM", "AMBULANCIAS EXTERNAS"] }),
      fila({ procedimientos: ["SERVICIOS DE AMBULANCIAS DE SANIDAD", "AMBULANCIAS EXTERNAS"] }),
    ]);
    assert.equal(r.inyecciones, 1);
    assert.equal(r.ambulancia, 2); // una por captación, aunque tenga los dos procedimientos de ambulancia
  });

  it("suma accidentes, enfermos y remisiones por tipo de atención", () => {
    const r = calcularInformeAerocivil([
      fila({ tipo_atencion: "ACCIDENTE DE TRANSITO", sexo: "M", lugar_atencion: "SERVICIO" }),
      fila({ tipo_atencion: "ENFERMEDAD GENERAL", sexo: "F", lugar_atencion: "EXTERNO" }),
      fila({ tipo_atencion: "REMISION", tipo_vuelo: "COMERCIAL", sexo: "F" }),
    ]);
    assert.equal(r.accidentes, 1);
    assert.equal(r.enfermos, 1);
    assert.equal(r.remisiones, 1);
    assert.equal(r.hombres, 1);
    assert.equal(r.mujeres, 2);
    assert.equal(r.totalServicio + r.totalExterno, 2);
    assert.deepEqual(r.vueloComercial, { H: 0, M: 1, T: 1 });
  });
});

describe("calcularInformePme", () => {
  it("ignora los procedimientos que el formato oficial no incluye", () => {
    const r = calcularInformePme([
      fila({ procedimientos: ["GLUCOMETRIA", "REUNION DE PERSONAL Y ADMINISTRATIVAS", "NINGUNO"] }),
      fila({ procedimientos: ["GLUCOMETRIA"] }),
    ]);
    assert.equal(r.conteo.GLUCOMETRIA, 2);
    assert.equal(r.total, 2);
  });
});

describe("calcularInformePae", () => {
  it("cuenta por aerolínea del catálogo y deja fuera las que no están", () => {
    const r = calcularInformePae(
      [
        fila({ aerolinea: "AVIANCA", condicion: "PASAJERO" }),
        fila({ aerolinea: "AVIANCA", condicion: "TRIPULANTE" }),
        fila({ aerolinea: "LATAM", condicion: "EMPLEADO" }),
        fila({ aerolinea: "INEXISTENTE", condicion: "PASAJERO" }),
      ],
      ["AVIANCA", "LATAM", "WINGO"]
    );
    assert.deepEqual(r.conteo.AVIANCA, { EMPLEADOS: 0, PASAJEROS: 1, TOTAL: 2 });
    assert.deepEqual(r.conteo.WINGO, { EMPLEADOS: 0, PASAJEROS: 0, TOTAL: 0 });
    assert.deepEqual(r.totalGeneral, { EMPLEADOS: 1, PASAJEROS: 1, TOTAL: 3 });
  });
});
