import assert from "node:assert/strict";
import { test } from "node:test";

import { correoInterno, generarCodigo, validarClaveNueva, validarUsuario } from "./usuarios-carga";

const CENTROS = new Set(["CRA_MEDELLIN", "CRA_BOGOTA", "AIRPLAN", "CTG", "ADO"]);

test("usuario válido: la clave por defecto es la cédula y se marca como tal", () => {
  const r = validarUsuario({ cedula: "1.020.458.300", nombre_completo: "Ana Pérez", rol: "ovem", centro_operativo: "cra medellin" }, CENTROS);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.valor.cedula, "1020458300");
  assert.equal(r.valor.rol, "OVEM");
  assert.equal(r.valor.centro, "CRA_MEDELLIN");
  assert.equal(r.valor.password, "1020458300");
  assert.equal(r.valor.passwordEsCedula, true);
  assert.equal(r.valor.email, null);
});

test("los roles que ven solo su centro exigen centro; los demás no", () => {
  for (const rol of ["OVEM", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA", "COORDINACION"]) {
    const r = validarUsuario({ cedula: "1020458300", nombre_completo: "X Y", rol }, CENTROS);
    assert.ok(!r.ok, rol);
  }
  assert.ok(validarUsuario({ cedula: "1020458300", nombre_completo: "X Y", rol: "MANTENIMIENTO" }, CENTROS).ok);
  assert.ok(validarUsuario({ cedula: "1020458300", nombre_completo: "X Y", rol: "GERENCIAL" }, CENTROS).ok);
});

test("errores con su columna: cédula, rol, centro, correo, código y clave corta", () => {
  const r = validarUsuario({ cedula: "12", nombre_completo: "", rol: "JEFE", centro_operativo: "MARTE", email: "no-es-correo", codigo_acceso: "123" }, CENTROS);
  assert.ok(!r.ok);
  if (r.ok) return;
  const cols = r.errores.map((e) => e.columna);
  for (const c of ["cedula", "nombre_completo", "rol", "centro_operativo", "email", "codigo_acceso"]) assert.ok(cols.includes(c), c);
});

test("cédula corta sin clave escrita pide una clave; con clave escrita pasa", () => {
  const corta = validarUsuario({ cedula: "1234567", nombre_completo: "X Y", rol: "VISTA" }, CENTROS);
  assert.ok(!corta.ok);
  if (!corta.ok) assert.ok(corta.errores.some((e) => e.columna === "password_inicial"));
  const ok = validarUsuario({ cedula: "1234567", nombre_completo: "X Y", rol: "VISTA", password_inicial: "Clave-2026" }, CENTROS);
  assert.ok(ok.ok);
  if (ok.ok) assert.equal(ok.valor.passwordEsCedula, false);
});

test("código de acceso: 6 dígitos, sin repetir los usados", () => {
  const usados = new Set<string>(["123456"]);
  const secuencia = [0.0, 0.0, 0.5];
  let i = 0;
  const azar = () => secuencia[Math.min(i++, secuencia.length - 1)];
  const c = generarCodigo(usados, azar);
  assert.equal(c, "100000");
  assert.ok(usados.has(c));
  const d = generarCodigo(usados, azar); // 0.0 repetiría 100000 (ya usado): reintenta hasta uno libre
  assert.notEqual(c, d);
  assert.match(d, /^\d{6}$/);
});

test("clave nueva: mínimo, confirmación, distinta de cédula y código, no trivial", () => {
  assert.ok(validarClaveNueva("corta", "corta", null, null));
  assert.ok(validarClaveNueva("claveLarga1", "otraClave1", null, null));
  assert.ok(validarClaveNueva("1020458300", "1020458300", "1020458300", null));
  assert.ok(validarClaveNueva("123456", "123456", null, "123456") !== null);
  assert.ok(validarClaveNueva("11111111", "11111111", null, null));
  assert.equal(validarClaveNueva("MiClave-2026", "MiClave-2026", "1020458300", "654321"), null);
});

test("correo interno con dominio .invalid", () => {
  assert.equal(correoInterno("1020458300"), "usuario.1020458300@sismanto.invalid");
});
