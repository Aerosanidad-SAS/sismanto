import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

import { NAV_GROUPS, rolesDeRuta } from "./navegacion";

// El menú oculta lo que un rol no usa, pero escribir la dirección abría la página igual (#389: el OVEM entraba a
// /pacientes y /vehiculos). Cada módulo del menú tiene que tener una guarda de rol en su página.
// Soporte es la excepción a propósito: todo usuario con perfil puede pedir soporte (ver el comentario de la página).
const SIN_GUARDA_DE_ROL = ["/soporte"];

const rutaDePagina = (href: string) => `src/app/(dashboard)${href === "/" ? "" : href}/page.tsx`;

test("la página de cada módulo del menú valida el rol (requireRole o redirect)", () => {
  const hrefs = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href)).filter((h) => !SIN_GUARDA_DE_ROL.includes(h));
  assert.ok(hrefs.length > 20, "no se leyó el menú: ¿se corre desde la raíz del repo?");
  const sinGuarda: string[] = [];
  for (const href of hrefs) {
    const archivo = rutaDePagina(href);
    assert.ok(existsSync(archivo), `no existe ${archivo}`);
    if (!/requireRole\(|\bredirect\(/.test(readFileSync(archivo, "utf8"))) sinGuarda.push(href);
  }
  assert.deepEqual(sinGuarda, [], `Páginas del menú sin guarda de rol (usar requireRole(rolesDeRuta(...))): ${sinGuarda.join(", ")}`);
});

test("el OVEM no tiene ninguno de los módulos de oficina que antes se abrían por URL", () => {
  for (const ruta of ["/", "/servicios", "/clientes", "/proveedores", "/novedades"]) {
    assert.ok(rolesDeRuta(ruta).length > 0, `${ruta} debe estar en el menú`);
    assert.equal(rolesDeRuta(ruta).includes("OVEM"), false, ruta);
  }
});
