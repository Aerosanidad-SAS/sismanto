import { defineConfig, devices } from "@playwright/test";

// Objetivo: E2E_BASE_URL (staging, dev, preview) o, si no se define, la app local (localhost:3000).
// Las credenciales salen de variables de entorno (ver e2e/fixtures/roles.ts); nunca se guardan en archivos.
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const enCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.(spec|setup)\.ts/,
  fullyParallel: true,
  forbidOnly: enCI,
  retries: enCI ? 1 : 0,
  workers: enCI ? 2 : 3,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    locale: "es-CO",
    timezoneId: "America/Bogota",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
      dependencies: ["setup"],
      testIgnore: [/auth\.setup\.ts/, /@mobile/],
    },
    {
      // OVEM trabaja desde el celular: 390×844 y el tamaño pequeño de 360×640.
      name: "mobile-390",
      use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } },
      dependencies: ["setup"],
      testMatch: /@mobile\.spec\.ts/,
    },
    {
      name: "mobile-360",
      use: { ...devices["Pixel 5"], viewport: { width: 360, height: 640 } },
      dependencies: ["setup"],
      testMatch: /@mobile\.spec\.ts/,
    },
  ],
  // Solo cuando se corre contra la app local: en CI se construye antes y se arranca con `npm run start`.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: process.env.E2E_WEB_COMMAND ?? "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 180_000,
      },
});
