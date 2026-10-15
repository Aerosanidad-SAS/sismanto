import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esCiudadBogota, obligatoriosPaciente } from "./campos-obligatorios";
import { DEPARTAMENTOS_COLOMBIA, MUNICIPIOS_POR_DEPARTAMENTO } from "./colombia-geo";
import { ciudadRegistroDePerfil, ubicacionPacientePorCiudadRegistro } from "./servicios-lista";

describe("esCiudadBogota", () => {
  it("reconoce el catálogo y las variantes escritas a mano", () => {
    for (const c of ["Bogotá D.C.", "BOGOTA D.C.", "bogota", "Bogotá", " Bogotá D.C. "]) assert.equal(esCiudadBogota(c), true, c);
  });
  it("no confunde otras ciudades ni vacíos", () => {
    for (const c of ["Medellín", "Soacha", "Bogotazo", "", null, undefined]) assert.equal(esCiudadBogota(c), false, String(c));
  });
});

describe("obligatoriosPaciente (Localidad solo en Bogotá)", () => {
  const base = ["celular", "localidad", "eps"];
  it("en Bogotá conserva Localidad", () => {
    assert.deepEqual(obligatoriosPaciente(base, "Bogotá D.C."), base);
  });
  it("fuera de Bogotá, o sin ciudad, la quita y deja el resto", () => {
    assert.deepEqual(obligatoriosPaciente(base, "Medellín"), ["celular", "eps"]);
    assert.deepEqual(obligatoriosPaciente(base, ""), ["celular", "eps"]);
  });
  it("no modifica la lista original", () => {
    obligatoriosPaciente(base, "Medellín");
    assert.deepEqual(base, ["celular", "localidad", "eps"]);
  });
});

describe("ubicacionPacientePorCiudadRegistro", () => {
  it("Medellín → Antioquia / Medellín; Bogotá → Bogotá D.C.", () => {
    assert.deepEqual(ubicacionPacientePorCiudadRegistro("MEDELLÍN"), { departamento: "Antioquia", ciudad: "Medellín" });
    assert.deepEqual(ubicacionPacientePorCiudadRegistro("BOGOTA D.C."), { departamento: "Bogotá D.C.", ciudad: "Bogotá D.C." });
  });
  it("sin ciudad de registro o desconocida: null", () => {
    assert.equal(ubicacionPacientePorCiudadRegistro(""), null);
    assert.equal(ubicacionPacientePorCiudadRegistro(undefined), null);
    assert.equal(ubicacionPacientePorCiudadRegistro("CALI"), null);
  });
  it("lo propuesto existe en el catálogo del formulario (si no, el combo quedaría vacío)", () => {
    for (const c of ["MEDELLÍN", "BOGOTA D.C."]) {
      const u = ubicacionPacientePorCiudadRegistro(c);
      assert.ok(u, c);
      assert.ok((DEPARTAMENTOS_COLOMBIA as readonly string[]).includes(u.departamento), `departamento ${u.departamento}`);
      assert.ok((MUNICIPIOS_POR_DEPARTAMENTO[u.departamento] as string[]).includes(u.ciudad), `ciudad ${u.ciudad}`);
    }
  });
  it("encadena con el CRA del perfil", () => {
    const u = ubicacionPacientePorCiudadRegistro(ciudadRegistroDePerfil({ centro_codigo: "CRA_MEDELLIN", ciudad: null }));
    assert.deepEqual(u, { departamento: "Antioquia", ciudad: "Medellín" });
  });
});
