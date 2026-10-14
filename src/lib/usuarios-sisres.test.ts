import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DATOS_PERSONALES_VACIOS,
  datosDesdeFila,
  datosPersonalesSchema,
  filaExtra,
  nombreCompletoDe,
  tieneDatos,
} from "./usuarios-sisres";

const ok = {
  ...DATOS_PERSONALES_VACIOS,
  tipoDocumento: "CEDULA CIUDADANIA",
  primerNombre: "María",
  segundoNombre: "José",
  primerApellido: "Muñoz",
  segundoApellido: "O'Brien-Pérez",
  fechaNacimiento: "1988-03-09",
  rh: "O+",
  celular: "+57 300 111 2233",
  departamento: "Antioquia",
};

describe("datosPersonalesSchema", () => {
  it("acepta datos completos, con tildes, apóstrofo y guion", () => {
    assert.equal(datosPersonalesSchema.safeParse(ok).success, true);
  });

  it("acepta todo vacío (los datos personales son opcionales)", () => {
    assert.equal(datosPersonalesSchema.safeParse(DATOS_PERSONALES_VACIOS).success, true);
  });

  it("rechaza tipo de documento fuera del catálogo, RH inválido y celular con letras", () => {
    assert.equal(datosPersonalesSchema.safeParse({ ...ok, tipoDocumento: "CC" }).success, false);
    assert.equal(datosPersonalesSchema.safeParse({ ...ok, rh: "C+" }).success, false);
    assert.equal(datosPersonalesSchema.safeParse({ ...ok, celular: "tres cero cero" }).success, false);
    assert.equal(datosPersonalesSchema.safeParse({ ...ok, celular: "12345" }).success, false);
  });

  it("rechaza números y símbolos en los nombres", () => {
    assert.equal(datosPersonalesSchema.safeParse({ ...ok, primerNombre: "Ana3" }).success, false);
    assert.equal(datosPersonalesSchema.safeParse({ ...ok, primerApellido: "<script>" }).success, false);
  });

  it("valida la fecha de nacimiento como día real, pasado y razonable", () => {
    for (const mala of ["2020-02-31", "0000-00-00", "1899-12-31", "3000-01-01", "09/03/1988", "1988-3-9"]) {
      assert.equal(datosPersonalesSchema.safeParse({ ...ok, fechaNacimiento: mala }).success, false, mala);
    }
    assert.equal(datosPersonalesSchema.safeParse({ ...ok, fechaNacimiento: "1900-01-01" }).success, true);
  });
});

describe("nombreCompletoDe", () => {
  it("une las partes sin espacios dobles ni vacíos", () => {
    assert.equal(nombreCompletoDe(ok), "María José Muñoz O'Brien-Pérez");
    assert.equal(
      nombreCompletoDe({ primerNombre: " Ana ", segundoNombre: "", primerApellido: "Gómez", segundoApellido: "  " }),
      "Ana Gómez"
    );
    assert.equal(nombreCompletoDe(DATOS_PERSONALES_VACIOS), "");
  });
});

describe("filaExtra y datosDesdeFila", () => {
  it("lo vacío va como NULL y no se inventa sisres_id", () => {
    const f = filaExtra("u-1", { ...ok, segundoNombre: "  ", rh: "" });
    assert.equal(f.user_id, "u-1");
    assert.equal(f.segundo_nombre, null);
    assert.equal(f.rh, null);
    assert.equal(f.primer_nombre, "María");
    assert.equal(f.fecha_nacimiento, "1988-03-09");
    assert.equal("sisres_id" in f, false);
  });

  it("ida y vuelta: base → formulario conserva los datos y pone cadenas vacías donde hay NULL", () => {
    const f = filaExtra("u-1", ok);
    const d = datosDesdeFila(f as unknown as Record<string, string | null>);
    assert.deepEqual(d, ok);
    assert.deepEqual(datosDesdeFila(null), DATOS_PERSONALES_VACIOS);
    assert.deepEqual(datosDesdeFila({ rh: null, celular: undefined }), DATOS_PERSONALES_VACIOS);
  });

  it("tieneDatos distingue vacío de relleno", () => {
    assert.equal(tieneDatos(DATOS_PERSONALES_VACIOS), false);
    assert.equal(tieneDatos({ ...DATOS_PERSONALES_VACIOS, rh: "A-" }), true);
    assert.equal(tieneDatos({ ...DATOS_PERSONALES_VACIOS, celular: "   " }), false);
  });
});
