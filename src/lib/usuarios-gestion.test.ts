import assert from "node:assert/strict";
import { test } from "node:test";

import {
  confirmacionEliminarValida,
  esCorreoDuplicado,
  motivoBloqueoCorreo,
  motivoBloqueoEliminar,
  textoConfirmacionEliminar,
  validarCorreoNuevo,
  type EntradaBloqueoEliminar,
} from "./usuarios-gestion";

const base: EntradaBloqueoEliminar = {
  actorId: "a",
  actorRol: "ADMIN",
  objetivoId: "b",
  objetivoRol: "OVEM",
  objetivoActivo: false,
  otrosAdminsActivos: 1,
  historial: [],
};

test("se puede eliminar a quien no tiene historial", () => {
  assert.equal(motivoBloqueoEliminar(base), null);
});

test("solo un ADMIN elimina, nadie se elimina a sí mismo y no se elimina al último ADMIN", () => {
  assert.match(motivoBloqueoEliminar({ ...base, actorRol: "ANALISTA" })!, /Solo un Administrador/);
  assert.match(motivoBloqueoEliminar({ ...base, objetivoId: "a" })!, /tu propio usuario/);
  assert.match(motivoBloqueoEliminar({ ...base, objetivoRol: "ADMIN", otrosAdminsActivos: 0 })!, /último Administrador/);
  assert.equal(motivoBloqueoEliminar({ ...base, objetivoRol: "ADMIN", otrosAdminsActivos: 1 }), null);
});

test("un usuario activo se deshabilita antes de eliminarlo", () => {
  assert.match(motivoBloqueoEliminar({ ...base, objetivoActivo: true })!, /Deshabilita primero/);
});

test("nadie cambia el correo de otro ADMIN, pero sí el propio", () => {
  assert.match(motivoBloqueoCorreo({ actorId: "a", objetivoId: "b", objetivoRol: "ADMIN" })!, /otro Administrador/);
  assert.equal(motivoBloqueoCorreo({ actorId: "a", objetivoId: "a", objetivoRol: "ADMIN" }), null);
  assert.equal(motivoBloqueoCorreo({ actorId: "a", objetivoId: "b", objetivoRol: "OVEM" }), null);
});

test("con historial se bloquea y se ofrece Deshabilitar, nombrando las tablas", () => {
  const msg = motivoBloqueoEliminar({
    ...base,
    historial: [
      { tabla: "daily_checks", filas: 12 },
      { tabla: "public.medical_services", filas: 3 },
      { tabla: "tabla_nueva", filas: 1 },
    ],
  })!;
  assert.match(msg, /preoperacionales, servicios, tabla_nueva/);
  assert.match(msg, /Deshabilitar/);
});

test("la confirmación pide el correo (sin importar mayúsculas) o ELIMINAR si no hay correo", () => {
  assert.equal(textoConfirmacionEliminar("  Ana@X.co "), "Ana@X.co");
  assert.equal(textoConfirmacionEliminar(null), "ELIMINAR");
  assert.equal(confirmacionEliminarValida(" ana@x.CO", "Ana@X.co"), true);
  assert.equal(confirmacionEliminarValida("ana@x.com", "ana@x.co"), false);
  assert.equal(confirmacionEliminarValida("eliminar", ""), true);
});

test("el correo nuevo se normaliza, se valida y no puede ser el actual", () => {
  assert.deepEqual(validarCorreoNuevo("  Ana.Perez@Empresa.CO ", "otro@x.co"), { ok: true, correo: "ana.perez@empresa.co" });
  assert.equal(validarCorreoNuevo("sin-arroba", null).ok, false);
  assert.equal(validarCorreoNuevo("", null).ok, false);
  assert.equal(validarCorreoNuevo("ANA@X.CO", "ana@x.co").ok, false);
});

test("reconoce el error de correo repetido de Auth", () => {
  assert.equal(esCorreoDuplicado("A user with this email address has already been registered"), true);
  assert.equal(esCorreoDuplicado("x", "email_exists"), true);
  assert.equal(esCorreoDuplicado("Database error"), false);
});
