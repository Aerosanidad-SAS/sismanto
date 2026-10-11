import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { incidentSchema, patientSchema } from "./validations";
import { errorDeDocumento, normalizarCelularColombia } from "./documento-colombia";

const base = { tipo_documento: "CEDULA CIUDADANIA", cedula: "1020437165", nombre1: "Ana", apellido1: "Gómez" } as const;

function mensajeDe(datos: Record<string, unknown>, campo: string): string | undefined {
  const r = patientSchema.safeParse(datos);
  return r.success ? undefined : r.error.issues.find((i) => i.path[0] === campo)?.message;
}

describe("documento: formato según el tipo (Colombia)", () => {
  it("cédula de ciudadanía: solo números, 6 a 10 dígitos", () => {
    for (const cedula of ["1020437165", "12345678", "123456", "1.020.437.165"]) {
      assert.equal(patientSchema.safeParse({ ...base, cedula }).success, true, cedula);
    }
    for (const cedula of ["ABCDE12345", "12345", "12345678901", "102043716A", "abc!!"]) {
      assert.equal(patientSchema.safeParse({ ...base, cedula }).success, false, cedula);
    }
  });

  it("el mensaje dice la regla", () => {
    assert.match(mensajeDe({ ...base, cedula: "ABCDE12345" }, "cedula") ?? "", /solo números, entre 6 y 10 dígitos/);
  });

  it("tarjeta de identidad y registro de nacimiento: 8 a 11 dígitos", () => {
    for (const tipo of ["TARJETA DE IDENTIDAD", "REGISTRO DE NACIMIENTO"]) {
      assert.equal(patientSchema.safeParse({ ...base, tipo_documento: tipo, cedula: "1234567890" }).success, true, tipo);
      assert.equal(patientSchema.safeParse({ ...base, tipo_documento: tipo, cedula: "1234567" }).success, false, tipo);
    }
  });

  it("pasaporte: letras y números; NIT: 9 a 10 dígitos con dígito de verificación opcional", () => {
    assert.equal(patientSchema.safeParse({ ...base, tipo_documento: "PASAPORTE", cedula: "AB123456" }).success, true);
    assert.equal(patientSchema.safeParse({ ...base, tipo_documento: "PASAPORTE", cedula: "AB-1" }).success, false);
    assert.equal(patientSchema.safeParse({ ...base, tipo_documento: "NIT", cedula: "900123456-7" }).success, true);
    assert.equal(patientSchema.safeParse({ ...base, tipo_documento: "NIT", cedula: "12345" }).success, false);
  });

  it("se guarda sin puntos ni espacios", () => {
    const r = patientSchema.parse({ ...base, cedula: "1.020.437.165" });
    assert.equal(r.cedula, "1020437165");
  });

  it("un tipo sin formato propio solo exige un largo razonable", () => {
    assert.equal(errorDeDocumento("TIPO RARO", "AB-123"), null);
    assert.notEqual(errorDeDocumento("TIPO RARO", "a!"), null);
    assert.notEqual(errorDeDocumento("CEDULA CIUDADANIA", ""), null);
  });
});

describe("celular: formato colombiano", () => {
  it("es opcional", () => {
    for (const celular of [undefined, ""]) {
      assert.equal(patientSchema.safeParse({ ...base, celular }).success, true, String(celular));
    }
  });

  it("acepta móvil, con o sin +57 y separadores, y fijos", () => {
    for (const celular of ["3144913969", "+57 314 491 3969", "57 3144913969", "314-491-3969", "6044441234", "(604) 444-1234", "4441234"]) {
      assert.equal(patientSchema.safeParse({ ...base, celular }).success, true, celular);
    }
  });

  it("se guarda solo con dígitos y sin el +57", () => {
    assert.equal(patientSchema.parse({ ...base, celular: "+57 314 491 3969" }).celular, "3144913969");
    assert.equal(normalizarCelularColombia("(604) 444-1234"), "6044441234");
  });

  it("rechaza letras, cortos y móviles que no empiezan por 3, con la regla en el mensaje", () => {
    for (const celular of ["hola", "12345", "314abc3969", "2144913969", "31449139691", "0000000000"]) {
      assert.equal(patientSchema.safeParse({ ...base, celular }).success, false, celular);
    }
    assert.match(mensajeDe({ ...base, celular: "12345" }, "celular") ?? "", /10 dígitos y empieza por 3/);
  });
});

describe("incidentSchema: descripción", () => {
  const novedad = { vehicleId: "d03ac55e-6d69-4cba-923a-5b8d04a17ec4", reportadoPor: "Ana Gómez", afectaOperatividad: false };

  it("exige entre 10 y 2000 caracteres", () => {
    assert.equal(incidentSchema.safeParse({ ...novedad, descripcion: "x".repeat(9) }).success, false);
    assert.equal(incidentSchema.safeParse({ ...novedad, descripcion: "x".repeat(10) }).success, true);
    assert.equal(incidentSchema.safeParse({ ...novedad, descripcion: "x".repeat(2000) }).success, true);
    assert.equal(incidentSchema.safeParse({ ...novedad, descripcion: "x".repeat(2001) }).success, false);
  });
});
