import assert from "node:assert/strict";
import { test } from "node:test";

import { MODULOS, ROLES_CONFIGURABLES, moduloDeRuta, rolPuedeOcultar, rutaDeRespaldo, rutaOculta } from "./permisos";

test("cada ruta pertenece al módulo del menú más largo que la contiene", () => {
  assert.equal(moduloDeRuta("/servicios"), "/servicios");
  assert.equal(moduloDeRuta("/servicios/configuracion"), "/servicios");
  assert.equal(moduloDeRuta("/soporte/gestion/12"), "/soporte/gestion");
  assert.equal(moduloDeRuta("/soporte"), "/soporte");
  assert.equal(moduloDeRuta("/"), "/");
  // Un prefijo de texto no es un módulo: /serviciosx no es Servicios.
  assert.equal(moduloDeRuta("/serviciosx"), null);
  assert.equal(moduloDeRuta("/cambiar-password"), null);
});

test("ocultar el Dashboard no oculta todo lo demás", () => {
  assert.equal(rutaOculta("/", ["/"]), true);
  assert.equal(rutaOculta("/servicios", ["/"]), false);
  assert.equal(rutaOculta("/soporte/gestion", ["/soporte"]), false);
  assert.equal(rutaOculta("/servicios/123", ["/servicios"]), true);
});

test("solo se oculta lo que el código le da al rol, y nunca a ADMIN", () => {
  assert.ok(!ROLES_CONFIGURABLES.includes("ADMIN"));
  assert.ok(rolPuedeOcultar("MEDICO", "/pacientes"));
  assert.ok(!rolPuedeOcultar("MEDICO", "/vehiculos"));
  assert.ok(!rolPuedeOcultar("ADMIN", "/servicios"));
  assert.ok(!rolPuedeOcultar("MEDICO", "/no-existe"));
});

test("respaldo: el inicio del rol si lo sigue viendo; si no, su primer módulo visible", () => {
  assert.equal(rutaDeRespaldo("MEDICO", ["/servicios"], "/pacientes"), "/pacientes");
  const r = rutaDeRespaldo("MEDICO", ["/pacientes"], "/pacientes");
  assert.ok(r !== null && r !== "/pacientes");
  const todosDeVista = MODULOS.filter((m) => m.roles.includes("VISTA")).map((m) => m.href);
  assert.equal(rutaDeRespaldo("VISTA", todosDeVista, "/servicios"), null);
});
