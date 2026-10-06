import assert from "node:assert/strict";
import { test } from "node:test";

import { getRedirectFor, getRoleRedirect } from "./role-redirects";

test("OVEM va a su portal desde las pantallas de gerencia", () => {
  for (const p of ["/", "/kpis", "/consumo", "/combustible"]) assert.equal(getRoleRedirect("OVEM", p), "/ovem");
  assert.equal(getRoleRedirect("OVEM", "/ovem"), null);
  assert.equal(getRoleRedirect("OVEM", "/capacitaciones"), null);
});

test("roles de soporte solo salen de /soporte hacia /soporte", () => {
  assert.equal(getRoleRedirect("TECNICO", "/servicios"), "/soporte");
  assert.equal(getRoleRedirect("AEROPUERTO", "/soporte/gestion"), null);
});

test("MANTENIMIENTO no entra a las rutas bloqueadas ni a sus subrutas", () => {
  assert.equal(getRoleRedirect("MANTENIMIENTO", "/admin/usuarios"), "/vehiculos");
  assert.equal(getRoleRedirect("MANTENIMIENTO", "/regulacion"), "/vehiculos");
  assert.equal(getRoleRedirect("MANTENIMIENTO", "/vehiculos"), null);
  assert.equal(getRoleRedirect("MANTENIMIENTO", "/administrativo"), null);
});

test("GERENCIAL y COORDINACION vuelven al inicio fuera de su lista", () => {
  assert.equal(getRoleRedirect("GERENCIAL", "/servicios"), "/");
  assert.equal(getRoleRedirect("GERENCIAL", "/admin/permisos"), null);
  assert.equal(getRoleRedirect("COORDINACION", "/vehiculos"), "/");
  assert.equal(getRoleRedirect("COORDINACION", "/servicios/abc"), null);
});

test("roles clínicos y REGULACION aterrizan en su pantalla; ANALISTA y ADMIN se quedan", () => {
  assert.equal(getRoleRedirect("REGULACION", "/"), "/servicios");
  assert.equal(getRoleRedirect("MEDICO", "/"), "/pacientes");
  assert.equal(getRoleRedirect("ANALISTA", "/"), null);
  assert.equal(getRoleRedirect("ADMIN", "/"), null);
});

test("módulo oculto: va al respaldo; nunca redirige a la misma ruta", () => {
  assert.equal(getRedirectFor("MEDICO", "/pacientes", []), null);
  const r = getRedirectFor("MEDICO", "/pacientes", ["/pacientes"]);
  assert.ok(r !== null && r !== "/pacientes");
  assert.equal(getRedirectFor("OVEM", "/ovem", []), null);
});
