import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { incidentSchema, patientSchema } from "./validations";

const base = { tipo_documento: "CEDULA CIUDADANIA", cedula: "1020437165", nombre1: "Ana", apellido1: "Gómez" } as const;

describe("patientSchema: documento", () => {
  it("acepta números, letras (pasaporte) y guion", () => {
    for (const cedula of ["1020437165", "AB123456", "900123-4"]) {
      assert.equal(patientSchema.safeParse({ ...base, cedula }).success, true, cedula);
    }
  });

  it("rechaza símbolos y puntos", () => {
    for (const cedula of ["abc!!", "1113041060.", "10 20 30"]) {
      assert.equal(patientSchema.safeParse({ ...base, cedula }).success, false, cedula);
    }
  });
});

describe("patientSchema: celular", () => {
  it("es opcional y acepta formatos habituales", () => {
    for (const celular of [undefined, "", "3144913969", "+57 314 491 3969", "(604) 444-1234"]) {
      assert.equal(patientSchema.safeParse({ ...base, celular }).success, true, String(celular));
    }
  });

  it("rechaza letras y números demasiado cortos", () => {
    for (const celular of ["hola", "123", "314abc3969"]) {
      assert.equal(patientSchema.safeParse({ ...base, celular }).success, false, celular);
    }
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
