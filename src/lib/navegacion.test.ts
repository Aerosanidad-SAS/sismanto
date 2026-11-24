import assert from "node:assert/strict";
import { test } from "node:test";

import { NAV_GROUPS, rolesDeRuta } from "./navegacion";

test("el OVEM no tiene Pacientes ni Vehículos (decisión de Daniel 2026-11-23)", () => {
  for (const ruta of ["/pacientes", "/vehiculos"]) {
    const roles = rolesDeRuta(ruta);
    assert.ok(roles.length > 0, `${ruta} debe estar en el menú`);
    assert.equal(roles.includes("OVEM"), false, ruta);
  }
});

test("las guardas de las páginas siguen dejando entrar a quien el menú incluye", () => {
  assert.ok(rolesDeRuta("/pacientes").includes("MEDICO"));
  assert.ok(rolesDeRuta("/pacientes").includes("REGULACION"));
  assert.ok(rolesDeRuta("/vehiculos").includes("MANTENIMIENTO"));
  assert.ok(rolesDeRuta("/vehiculos").includes("REGULACION"));
  assert.ok(rolesDeRuta("/vehiculos").includes("ADMIN"));
});

test("una ruta que no está en el menú no deja entrar a nadie", () => {
  assert.deepEqual(rolesDeRuta("/ruta-que-no-existe"), []);
});

test("ninguna ruta del menú se repite (rolesDeRuta toma la primera)", () => {
  const hrefs = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));
  assert.equal(new Set(hrefs).size, hrefs.length);
});
