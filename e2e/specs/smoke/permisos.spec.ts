import { test, expect } from "@playwright/test";
import { RolClave } from "../../fixtures/roles";
import { usarRol } from "../../fixtures/usar-rol";

const rutaActual = (url: string) => new URL(url).pathname;

// Matriz rol × ruta prohibida. Oráculo: comportamiento observado en staging el 2026-10-21, pendiente de confirmar por
// Daniel (ver e2e/COBERTURA.md). Una ruta prohibida debe terminar en otra ruta, nunca mostrar su contenido.
const PROHIBIDAS: Partial<Record<RolClave, string[]>> = {
  REGULACION_MDE: ["/ovem", "/admin/usuarios", "/gerencial", "/configuracion"],
  REGULACION_BOG: ["/ovem", "/admin/usuarios", "/gerencial", "/configuracion"],
  OVEM_MDE: ["/servicios", "/regulacion", "/admin/usuarios"],
  OVEM_BOG: ["/servicios", "/regulacion", "/admin/usuarios"],
  MEDICO: ["/admin/usuarios"],
  AUXILIAR: ["/admin/usuarios"],
  MANTENIMIENTO: ["/admin/usuarios"],
};

for (const [clave, rutas] of Object.entries(PROHIBIDAS) as [RolClave, string[]][]) {
  test.describe(`${clave}`, () => {
    usarRol(clave);

    for (const ruta of rutas) {
      test(`A5: ${ruta} no muestra su contenido`, async ({ page }) => {
        await page.goto(ruta);
        // La redirección por rol llega unos segundos después de cargar («Cargando la pantalla»), por eso se reintenta.
        await expect(page, `terminó en ${ruta}`).not.toHaveURL((url) => rutaActual(url.href) === ruta, { timeout: 20_000 });
        await expect(page.getByRole("heading", { name: "Gestión de Usuarios" })).toHaveCount(0);
      });
    }
  });
}

test.describe("ADMIN", () => {
  usarRol("ADMIN");

  test("ve Gestión de Usuarios", async ({ page }) => {
    await page.goto("/admin/usuarios");
    await expect(page.getByRole("heading", { name: "Gestión de Usuarios" })).toBeVisible();
  });
});
