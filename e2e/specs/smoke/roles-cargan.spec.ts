import { test, expect } from "@playwright/test";
import { ROLES, ROLES_CLAVES } from "../../fixtures/roles";
import { usarRol } from "../../fixtures/usar-rol";

// Cada rol aterriza en su ruta sin pantalla de error, excepción de página ni 5xx. Solo lectura.
for (const clave of ROLES_CLAVES) {
  test.describe(`${clave}`, () => {
    usarRol(clave);

    test("la ruta por defecto carga limpia", async ({ page }) => {
      const errores: string[] = [];
      page.on("pageerror", (e) => errores.push(`pageerror: ${e.message}`));
      page.on("response", (r) => {
        if (r.status() >= 500) errores.push(`${r.status()} ${r.url()}`);
      });

      await page.goto(ROLES[clave].ruta);
      await page.waitForLoadState("networkidle");

      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByText("No pudimos cargar esta pantalla")).toHaveCount(0);
      expect(errores, errores.join("\n")).toEqual([]);
    });
  });
}

test.describe("G5: ruta inexistente", () => {
  usarRol("REGULACION_MDE");

  test("muestra la página 404 propia, no un error técnico", async ({ page }) => {
    const respuesta = await page.goto("/ruta-que-no-existe-e2e");
    expect(respuesta?.status()).toBe(404);
    await expect(page.getByText("NO ENCONTRAMOS ESTA PÁGINA")).toBeVisible();
  });
});
