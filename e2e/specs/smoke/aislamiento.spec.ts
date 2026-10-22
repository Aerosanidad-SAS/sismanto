import { test, expect } from "@playwright/test";
import { centros, VEHICULO_PRUEBA } from "../../fixtures/datos";
import { RolClave, centroDe } from "../../fixtures/roles";
import { usarRol } from "../../fixtures/usar-rol";

// R-02 y R-03: Regulación solo ve los vehículos de su ciudad. Solo lectura, por pantalla; la comprobación contra la
// API (RLS con el token del usuario) llega en la fase de aislamiento (ver e2e/COBERTURA.md).
for (const clave of ["REGULACION_MDE", "REGULACION_BOG"] as RolClave[]) {
  const propio = centroDe(clave)!;
  const ajenos = centros.filter((c) => c !== propio);

  test.describe(`${clave}`, () => {
    usarRol(clave);

    test(`/vehiculos lista solo ${propio}`, async ({ page }) => {
      await page.goto("/vehiculos");
      const filas = page.locator("main tbody tr");
      await expect(filas.first()).toBeVisible();

      const textos = await filas.allInnerTexts();
      expect(textos.length).toBeGreaterThan(0);
      for (const t of textos) {
        expect(t, `fila de otro centro: ${t.replace(/\s+/g, " ")}`).toContain(propio);
        for (const ajeno of ajenos) expect(t).not.toContain(ajeno);
      }
      await expect(page.locator("main")).toContainText(VEHICULO_PRUEBA[propio]);
    });
  });
}
