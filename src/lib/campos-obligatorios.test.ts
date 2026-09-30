import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { camposFaltantes, conAsterisco, esModuloCampos, filtrarConocidos, mensajeFaltantes } from "./campos-obligatorios";
import { clientSchema, patientSchema } from "./validations";
import { MODULOS_CAMPOS } from "./campos-obligatorios";

describe("camposFaltantes", () => {
  it("lista las etiquetas de los obligatorios vacíos (undefined, null o espacios)", () => {
    const datos = { celular: "  ", eps: null, correo: "a@b.co" };
    assert.deepEqual(camposFaltantes("pacientes", datos, ["celular", "eps", "correo", "barrio"]), ["Barrio", "EPS", "Celular"]);
  });

  it("no exige nada si no hay obligatorios", () => {
    assert.deepEqual(camposFaltantes("pacientes", {}, []), []);
  });
});

describe("filtrarConocidos / esModuloCampos", () => {
  it("ignora campos que el módulo no conoce y módulos inexistentes", () => {
    assert.deepEqual(filtrarConocidos("pacientes", ["celular", "cedula", "inventado"]), ["celular"]);
    assert.equal(esModuloCampos("pacientes"), true);
    assert.equal(esModuloCampos("toString"), false);
  });
});

describe("mensajes", () => {
  it("arma el mensaje y el asterisco", () => {
    assert.equal(mensajeFaltantes([]), null);
    assert.equal(mensajeFaltantes(["EPS", "Celular"]), "Faltan campos obligatorios: EPS, Celular");
    assert.equal(conAsterisco("EPS", "eps", ["eps"]), "EPS *");
    assert.equal(conAsterisco("EPS", "eps", []), "EPS");
  });
});

describe("catálogo de pacientes", () => {
  it("solo trae campos que existen en el esquema y que el esquema NO exige ya", () => {
    const forma = patientSchema.shape as Record<string, { isOptional: () => boolean }>;
    for (const campo of ["nombre2", "apellido2", "fecha_nacimiento", "sexo", "rh", "estatura", "departamento", "ciudad", "direccion", "barrio", "localidad", "eps", "celular", "correo"]) {
      assert.ok(forma[campo], `${campo} no está en patientSchema`);
      assert.equal(forma[campo].isOptional(), true, `${campo} ya es obligatorio en el esquema`);
    }
  });
});

describe("catálogo de clientes", () => {
  it("solo trae campos que existen en clientSchema y que el esquema NO exige ya", () => {
    const forma = clientSchema.shape as Record<string, { isOptional: () => boolean }>;
    for (const { campo } of MODULOS_CAMPOS.clientes.campos) {
      assert.ok(forma[campo], `${campo} no está en clientSchema`);
      assert.equal(forma[campo].isOptional(), true, `${campo} ya es obligatorio en el esquema`);
    }
  });
});
