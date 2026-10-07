import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cedulaPacienteValida, puedeDesactivarPaciente } from "./pacientes-reglas";

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
