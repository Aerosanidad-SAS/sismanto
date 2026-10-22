import fs from "node:fs";
import path from "node:path";
import { test as setup, expect } from "@playwright/test";
import { ROLES_CLAVES, archivoSesion, credenciales, tieneCredenciales } from "./fixtures/roles";

// Un solo intento de login por rol: reintentar una contraseña mala bloquea la cuenta de prueba.
for (const clave of ROLES_CLAVES) {
  setup(`login ${clave}`, async ({ page }) => {
    setup.skip(!tieneCredenciales(clave), `sin credenciales para ${clave}`);
    const { usuario, clave: pass } = credenciales(clave);

    await page.goto("/login");
    await page.getByRole("textbox", { name: "Cédula o correo" }).fill(usuario!);
    await page.getByRole("textbox", { name: "Contraseña" }).fill(pass!);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page, `el login de ${clave} no llegó a una pantalla interna`).not.toHaveURL(/\/login/, { timeout: 30_000 });

    fs.mkdirSync(path.dirname(archivoSesion(clave)), { recursive: true });
    await page.context().storageState({ path: archivoSesion(clave) });
  });
}
