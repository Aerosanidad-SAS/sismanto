import { test, expect } from "@playwright/test";
import { VEHICULO_PRUEBA } from "../../fixtures/datos";
import { RolClave, centroDe } from "../../fixtures/roles";
import { usarRol } from "../../fixtures/usar-rol";

const ACCIONES = ["Mis servicios", "Iniciar preoperacional", "Registrar tanqueo", "Reportar novedad", "Reportar siniestro", "Cerrar turno"];

const desborde = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

// Corre en los proyectos mobile-390 y mobile-360. Solo abre pantallas: no envía nada.
for (const clave of ["OVEM_MDE", "OVEM_BOG"] as RolClave[]) {
  const propio = centroDe(clave)!;
  const otro = propio === "CRA_MEDELLIN" ? "CRA_BOGOTA" : "CRA_MEDELLIN";

  test.describe(`${clave}`, () => {
    usarRol(clave);

    for (const accion of ACCIONES) {
      test(`O-33: «${accion}» sin scroll horizontal`, async ({ page }) => {
        await page.goto("/ovem");
        await page.getByRole("button", { name: new RegExp(`^${accion}`) }).first().click();
        await page.waitForLoadState("networkidle");
        expect(await desborde(page)).toBeLessThanOrEqual(0);
      });
    }

    test(`O-02/O-03: el selector de vehículo solo ofrece ${propio}`, async ({ page }) => {
      await page.goto("/ovem");
      await page.getByRole("button", { name: /^Iniciar preoperacional/ }).first().click();
      // Su nombre accesible es la etiqueta «Vehículo»; el texto visible cambia según haya vehículo del día o no.
      await page.getByRole("button", { name: "Vehículo", exact: true }).click();

      const opciones = page.locator("[cmdk-item]");
      await expect(opciones.first()).toBeVisible();
      const textos = await opciones.allInnerTexts();
      expect(textos.some((t) => t.includes(VEHICULO_PRUEBA[propio])), `falta ${VEHICULO_PRUEBA[propio]}`).toBe(true);
      expect(textos.some((t) => t.includes(VEHICULO_PRUEBA[otro])), `aparece ${VEHICULO_PRUEBA[otro]} de ${otro}`).toBe(false);
    });
  });
}
