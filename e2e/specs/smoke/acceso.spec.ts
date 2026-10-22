import { test, expect } from "@playwright/test";

// Sin sesión. Solo lectura: no usa cuentas reales (un login fallido repetido las bloquearía).
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("acceso sin sesión", () => {
  for (const ruta of ["/vehiculos", "/servicios", "/ovem", "/regulacion", "/admin/usuarios"]) {
    test(`A3: ${ruta} redirige a /login`, async ({ page }) => {
      await page.goto(ruta);
      await expect(page).toHaveURL(/\/login/);
    });
  }

  test("A2: usuario inexistente muestra un mensaje claro, sin detalles técnicos", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("textbox", { name: "Cédula o correo" }).fill("no-existe@prueba.local");
    await page.getByRole("textbox", { name: "Contraseña" }).fill("clave-incorrecta-e2e");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Usuario o contraseña incorrectos" })).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
