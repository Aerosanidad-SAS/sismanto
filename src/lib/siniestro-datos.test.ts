import assert from "node:assert/strict";
import { test } from "node:test";

import { roadAccidentSchema } from "./validations";
import {
  abogadoDeclarado,
  cedulaValida,
  correoValido,
  esNovedadSiniestro,
  normalizarCedula,
  normalizarPlaca,
  placaValida,
  resumirFotos,
  validarObligatoriosSiniestro,
  type DatosObligatoriosSiniestro,
} from "./siniestro-datos";

const completo: DatosObligatoriosSiniestro = {
  hayTerceros: true,
  terceroPlaca: "abc-123",
  terceroNombre: "Pedro Pérez",
  terceroCedula: "1.020.304.050",
  abogadoNombre: "Ana Gómez",
  abogadoTelefono: "300 123 4567",
  abogadoCedula: "52123456",
  abogadoCorreo: "ana@bufete.co",
  fotosHechos: 2,
  fotosDocumentos: 1,
};

const campos = (d: DatosObligatoriosSiniestro) => validarObligatoriosSiniestro(d).map((e) => e.path);

test("un siniestro con todos los datos y fotos no tiene errores", () => {
  assert.deepEqual(validarObligatoriosSiniestro(completo), []);
});

test("con tercero: placa, nombre y cédula son obligatorios", () => {
  const e = campos({ ...completo, terceroPlaca: "", terceroNombre: " ", terceroCedula: undefined });
  assert.deepEqual(e.sort(), ["terceroCedula", "terceroNombre", "terceroPlaca"]);
});

test("placa y cédula se validan y normalizan", () => {
  assert.equal(normalizarPlaca(" abc-123 "), "ABC123");
  assert.ok(placaValida("ABC12D"));
  assert.ok(!placaValida("AB1"));
  assert.ok(!placaValida("ABC 1234567"));
  assert.equal(normalizarCedula("1.020.304-050"), "1020304050");
  assert.ok(cedulaValida("1.020.304.050"));
  assert.ok(!cedulaValida("123"));
});

test("sin tercero exige una explicación escrita y entonces no pide placa", () => {
  const base = { ...completo, hayTerceros: false, terceroPlaca: undefined, terceroNombre: undefined, terceroCedula: undefined };
  assert.deepEqual(campos(base), ["sinTerceroMotivo"]);
  assert.deepEqual(campos({ ...base, sinTerceroMotivo: "corto" }), ["sinTerceroMotivo"]);
  assert.deepEqual(validarObligatoriosSiniestro({ ...base, sinTerceroMotivo: "Choque contra un poste de la vía" }), []);
});

test("abogado: los cuatro datos son obligatorios", () => {
  const sin = { ...completo, abogadoNombre: undefined, abogadoTelefono: undefined, abogadoCedula: undefined, abogadoCorreo: undefined };
  assert.deepEqual(campos(sin).sort(), ["abogadoCedula", "abogadoCorreo", "abogadoNombre", "abogadoTelefono"]);
  assert.deepEqual(campos({ ...completo, abogadoCorreo: "no-es-correo" }), ["abogadoCorreo"]);
  assert.deepEqual(campos({ ...completo, abogadoTelefono: "123" }), ["abogadoTelefono"]);
  assert.ok(correoValido("a@b.co"));
  assert.ok(abogadoDeclarado({ abogadoNombre: "x" }));
  assert.ok(!abogadoDeclarado({ abogadoNombre: " " }));
});

test("sin abogado solo vale con explicación; con datos de abogado la excepción no los exime", () => {
  const sin = { ...completo, abogadoNombre: undefined, abogadoTelefono: undefined, abogadoCedula: undefined, abogadoCorreo: undefined };
  assert.deepEqual(validarObligatoriosSiniestro({ ...sin, sinAbogadoMotivo: "Nadie del bufete llegó al sitio" }), []);
  assert.ok(campos({ ...sin, sinAbogadoMotivo: "ya" }).includes("abogadoNombre"));
  assert.deepEqual(campos({ ...completo, abogadoCorreo: "mal", sinAbogadoMotivo: "Nadie del bufete llegó al sitio" }), ["abogadoCorreo"]);
});

test("mínimo 2 fotos de los hechos", () => {
  assert.deepEqual(campos({ ...completo, fotosHechos: 1 }), ["fotosHechos"]);
  assert.deepEqual(campos({ ...completo, fotosHechos: 0 }), ["fotosHechos"]);
});

test("mínimo 1 foto de documentos, salvo explicación escrita", () => {
  assert.deepEqual(campos({ ...completo, fotosDocumentos: 0 }), ["fotosDocumentos"]);
  assert.deepEqual(campos({ ...completo, fotosDocumentos: 0, sinDocumentosMotivo: "poco" }), ["fotosDocumentos"]);
  assert.deepEqual(validarObligatoriosSiniestro({ ...completo, fotosDocumentos: 0, sinDocumentosMotivo: "No llegó tránsito ni se firmó acta" }), []);
});

test("resumirFotos cuenta lo que falta y respeta la excepción de documentos", () => {
  assert.deepEqual(resumirFotos(1, 0, null), { hechos: 1, documentos: 0, faltanHechos: 1, faltanDocumentos: 1, completo: false });
  assert.equal(resumirFotos(2, 1, null).completo, true);
  assert.equal(resumirFotos(2, 0, "No se generaron documentos").completo, true);
});

test("las novedades de siniestro se reconocen por su descripción", () => {
  assert.ok(esNovedadSiniestro("Siniestro vial en Calle 10. Choque"));
  assert.ok(!esNovedadSiniestro("Llanta pinchada"));
  assert.ok(!esNovedadSiniestro(null));
});

const base = {
  vehicleId: "11111111-1111-4111-8111-111111111111",
  fechaHora: new Date(Date.now() - 3600_000).toISOString(),
  lugar: "Calle 10 con carrera 5",
  descripcion: "Choque por alcance en la vía",
  pacienteABordo: false,
  hayLesionados: false,
  intervinoAutoridad: false,
  vehiculoOperativo: true,
  ...completo,
};

test("el esquema del servidor acepta el siniestro completo y rechaza el incompleto con el campo en el path", () => {
  assert.ok(roadAccidentSchema.safeParse(base).success);
  const r = roadAccidentSchema.safeParse({ ...base, terceroCedula: "", fotosHechos: 0 });
  assert.ok(!r.success);
  if (!r.success) {
    const paths = r.error.issues.map((i) => i.path[0]);
    assert.ok(paths.includes("terceroCedula"));
    assert.ok(paths.includes("fotosHechos"));
  }
});
