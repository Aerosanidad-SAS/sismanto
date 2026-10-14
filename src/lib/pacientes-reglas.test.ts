import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cedulaPacienteValida, puedeDesactivarPaciente, puedeEscribirPaciente, ROLES_ESCRIBIR_PACIENTE } from "./pacientes-reglas";

describe("cedulaPacienteValida", () => {
  it("exige mínimo 5 caracteres, sin contar espacios de los bordes", () => {
    assert.equal(cedulaPacienteValida("1234"), false);
    assert.equal(cedulaPacienteValida("12345"), true);
    assert.equal(cedulaPacienteValida("  1234  "), false);
    assert.equal(cedulaPacienteValida(""), false);
  });
});

describe("puedeDesactivarPaciente", () => {
  it("solo ADMIN", () => {
    assert.equal(puedeDesactivarPaciente("ADMIN"), true);
    for (const rol of ["REGULACION", "ANALISTA", "MEDICO", "AUXILIAR_ENFERMERIA", "VISTA", "COORDINACION"]) {
      assert.equal(puedeDesactivarPaciente(rol), false, rol);
    }
    assert.equal(puedeDesactivarPaciente(null), false);
    assert.equal(puedeDesactivarPaciente(undefined), false);
    assert.equal(puedeDesactivarPaciente(""), false);
  });
});

describe("puedeEscribirPaciente", () => {
  it("coincide con las políticas patients_insert y patients_update de la base", () => {
    assert.deepEqual([...ROLES_ESCRIBIR_PACIENTE].sort(), ["ADMIN", "ANALISTA", "AUXILIAR_ENFERMERIA", "MEDICO", "REGULACION"]);
    for (const rol of ROLES_ESCRIBIR_PACIENTE) assert.equal(puedeEscribirPaciente(rol), true, rol);
  });
  it("no deja escribir a los roles de solo lectura ni sin sesión", () => {
    for (const rol of ["VISTA", "COORDINACION", "GERENCIAL", "OVEM", "MANTENIMIENTO", "TECNICO", "AEROPUERTO"]) {
      assert.equal(puedeEscribirPaciente(rol), false, rol);
    }
    assert.equal(puedeEscribirPaciente(null), false);
    assert.equal(puedeEscribirPaciente(undefined), false);
    assert.equal(puedeEscribirPaciente(""), false);
  });
});
