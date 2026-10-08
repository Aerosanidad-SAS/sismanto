import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ciudadRegistroCanonica, OPCIONES_CIUDAD_REGISTRO, prefijoCiudad } from "./servicios-lista";

describe("OPCIONES_CIUDAD_REGISTRO", () => {
  it("ofrece CRA Medellín y CRA Bogotá, y guarda el texto canónico de los servicios de SISRES", () => {
    assert.deepEqual(
      OPCIONES_CIUDAD_REGISTRO.map((o) => [o.etiqueta, o.valor]),
      [
        ["CRA MEDELLÍN", "MEDELLÍN"],
        ["CRA BOGOTÁ", "BOGOTA D.C."],
      ]
    );
  });

  it("el valor guardado sigue entrando en el filtro por ciudad de la lista", () => {
    for (const o of OPCIONES_CIUDAD_REGISTRO) {
      const prefijo = prefijoCiudad(o.valor.toLowerCase().startsWith("bog") ? "bogota" : "medellin");
      assert.ok(prefijo);
      assert.ok(
        o.valor
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toLowerCase()
          .startsWith(prefijo as string),
        o.valor
      );
    }
  });
});

describe("ciudadRegistroCanonica", () => {
  it("reconoce los valores guardados y las variantes escritas a mano", () => {
    for (const v of ["BOGOTA D.C.", "Bogotá", "bogota", "CRA BOGOTÁ", "CRA_BOGOTA", " cra bogota "]) {
      assert.equal(ciudadRegistroCanonica(v), "BOGOTA D.C.", v);
    }
    for (const v of ["MEDELLÍN", "Medellin", "medellín", "CRA MEDELLÍN", "cra-medellin"]) {
      assert.equal(ciudadRegistroCanonica(v), "MEDELLÍN", v);
    }
  });

  it("vacío o cualquier otra ciudad no es válido", () => {
    for (const v of [null, undefined, "", "   ", "Cali", "CRA CALI", "Barranquilla"]) assert.equal(ciudadRegistroCanonica(v), null, String(v));
  });
});
