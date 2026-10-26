import assert from "node:assert/strict";
import { test } from "node:test";

import { correoInterno, esFilaDeGuia, generarCodigo, motivoNoPuedeActivarse, validarClaveNueva, validarUsuario } from "./usuarios-carga";

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
  // GERENCIAL no necesita centro, pero tampoco entra con la cédula como clave: lleva clave propia (ver el test siguiente).
  assert.ok(validarUsuario({ cedula: "1020458300", nombre_completo: "X Y", rol: "GERENCIAL", password_inicial: "ClaveInicial1" }, CENTROS).ok);
});

test("ADMIN, ANALISTA y GERENCIAL no pueden entrar con la cédula como clave: la fila debe traer password_inicial", () => {
  for (const rol of ["ADMIN", "ANALISTA", "GERENCIAL"]) {
    const sin = validarUsuario({ cedula: "1020458300", nombre_completo: "X Y", rol }, CENTROS);
    assert.ok(!sin.ok, `${rol} sin clave propia debe rechazarse`);
    if (!sin.ok) assert.ok(sin.errores.some((e) => e.columna === "password_inicial" && /clave inicial propia/.test(e.mensaje)));
    const con = validarUsuario({ cedula: "1020458300", nombre_completo: "X Y", rol, password_inicial: "ClaveInicial1" }, CENTROS);
    assert.ok(con.ok, `${rol} con clave propia debe aceptarse`);
    if (con.ok) assert.equal(con.valor.passwordEsCedula, false);
  }
  // El resto de los roles sigue pudiendo entrar con la cédula.
  const ovem = validarUsuario({ cedula: "1020458300", nombre_completo: "X Y", rol: "MANTENIMIENTO" }, CENTROS);
  assert.ok(ovem.ok && ovem.valor.passwordEsCedula);
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

test("rol y centro escritos con tildes, espacios o guiones valen igual que el código", () => {
  const r = validarUsuario({ cedula: "1020458300", nombre_completo: "Ana Pérez", rol: "Coordinación", centro_operativo: "CRA Medellín" }, CENTROS);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.valor.rol, "COORDINACION");
  assert.equal(r.valor.centro, "CRA_MEDELLIN");
  const guion = validarUsuario({ cedula: "1020458300", nombre_completo: "Ana Pérez", rol: "auxiliar-enfermería", centro_operativo: "cra-bogota" }, CENTROS);
  assert.ok(guion.ok);
  if (guion.ok) assert.equal(guion.valor.rol, "AUXILIAR_ENFERMERIA");
});

test("cédula con puntos, espacios o guiones se normaliza; con letras se rechaza con el valor escrito", () => {
  const ok = validarUsuario({ cedula: " 1.020.458-300 ", nombre_completo: "Ana Pérez", rol: "VISTA" }, CENTROS);
  assert.ok(ok.ok);
  if (ok.ok) assert.equal(ok.valor.cedula, "1020458300");
  const mal = validarUsuario({ cedula: "C.C. 1020458300", nombre_completo: "Ana Pérez", rol: "VISTA" }, CENTROS);
  assert.ok(!mal.ok);
  if (!mal.ok) assert.ok(mal.errores[0].mensaje.includes("C.C. 1020458300"));
});

test("las filas de guía de la plantilla se reconocen por su contenido, no por su posición", () => {
  assert.ok(esFilaDeGuia(["Solo números. Ej: 1020458300", "Nombres y apellidos"]));
  assert.ok(esFilaDeGuia(["↓ datos desde aquí (filas 1–2 son encabezado y guía; no borrar)", null]));
  assert.ok(!esFilaDeGuia(["1020458300", "Ana Pérez"]));
  assert.ok(!esFilaDeGuia(["", ""]));
});

test("la columna activo es opcional: vacío = SI; NO crea la persona desactivada y no exige centro ni clave", () => {
  const base = { cedula: "1020458300", nombre_completo: "X Y", rol: "OVEM", centro_operativo: "CRA_BOGOTA" };
  const vacio = validarUsuario(base, CENTROS);
  assert.ok(vacio.ok && vacio.valor.activo === true && vacio.valor.passwordEsCedula);
  for (const si of ["SI", "sí", "Activo", "1", "true"]) {
    const v = validarUsuario({ ...base, activo: si }, CENTROS);
    assert.ok(v.ok && v.valor.activo === true, si);
  }
  for (const no of ["NO", "no", "Inactivo", "0", "false"]) {
    const v = validarUsuario({ cedula: "1020458300", nombre_completo: "X Y", rol: "OVEM", activo: no }, CENTROS);
    assert.ok(v.ok, `activo=${no} sin centro debe aceptarse (la cuenta no entra)`);
    if (v.ok) {
      assert.equal(v.valor.activo, false);
      assert.equal(v.valor.passwordEsCedula, false);
    }
  }
});

test("una persona inactiva puede ser de un rol de clave propia o tener una cédula corta sin escribir clave; una activa no", () => {
  const inactivo = validarUsuario({ cedula: "1234567", nombre_completo: "X Y", rol: "ADMIN", activo: "NO" }, CENTROS);
  assert.ok(inactivo.ok);
  const activo = validarUsuario({ cedula: "1234567", nombre_completo: "X Y", rol: "ADMIN" }, CENTROS);
  assert.ok(!activo.ok);
});

test("un valor raro en activo se rechaza con su columna", () => {
  const v = validarUsuario({ cedula: "1020458300", nombre_completo: "X Y", rol: "MANTENIMIENTO", activo: "tal vez" }, CENTROS);
  assert.ok(!v.ok);
  if (!v.ok) assert.ok(v.errores.some((e) => e.columna === "activo"));
});

test("activo llega de Excel como número o booleano: 0 y false son NO (inactiva), 1 y true son SI, y una celda vacía es SI", () => {
  const fila = (activo: unknown) => validarUsuario({ cedula: "1020458300", nombre_completo: "X Y", rol: "MANTENIMIENTO", activo }, CENTROS);
  for (const no of [0, false, "0", " no "]) {
    const v = fila(no);
    assert.ok(v.ok && v.valor.activo === false, `activo=${JSON.stringify(no)} debe ser inactivo`);
  }
  for (const si of [1, true, "1", " SI "]) {
    const v = fila(si);
    assert.ok(v.ok && v.valor.activo === true, `activo=${JSON.stringify(si)} debe ser activo`);
  }
  for (const vacio of [undefined, null, "", "   "]) {
    const v = fila(vacio);
    assert.ok(v.ok && v.valor.activo === true, `activo=${JSON.stringify(vacio)} (vacío) es SI`);
  }
});

test("motivoNoPuedeActivarse: un rol que ve solo su centro no se activa sin centro; el resto sí", () => {
  for (const rol of ["OVEM", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA", "COORDINACION"]) {
    assert.match(motivoNoPuedeActivarse(rol, null) ?? "", /necesita centro operativo/, rol);
    assert.equal(motivoNoPuedeActivarse(rol, 0), motivoNoPuedeActivarse(rol, null), `centro 0 = sin centro (${rol})`);
    assert.equal(motivoNoPuedeActivarse(rol, 2), null, `${rol} con centro`);
  }
  for (const rol of ["ADMIN", "ANALISTA", "GERENCIAL", "MANTENIMIENTO", "VISTA", "TECNICO", "AEROPUERTO"]) assert.equal(motivoNoPuedeActivarse(rol, null), null, rol);
  assert.equal(motivoNoPuedeActivarse(null, null), null);
  assert.equal(motivoNoPuedeActivarse(undefined, undefined), null);
});
