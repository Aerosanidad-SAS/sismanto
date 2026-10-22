# E2E con Playwright

Pruebas de extremo a extremo de SISMANTO. Un login por rol (`auth.setup.ts`) se reutiliza en todas las pruebas; el rol sin credenciales se omite con un motivo claro.

Plan completo, reglas de construcción y orden de trabajo: `REVISION_Y_PLAN_E2E_PLAYWRIGHT.md` (fuera del repo) y `e2e/COBERTURA.md` (qué caso del plan ya tiene prueba).

## Primera vez

```powershell
npx playwright install chromium
```

## Variables de entorno (PowerShell)

Las credenciales van en variables de entorno, nunca en archivos.

```powershell
$env:E2E_BASE_URL = "https://sismanto-staging.vercel.app"   # omítela para usar la app local (localhost:3000)
$env:E2E_ADMIN_USER = "..."; $env:E2E_ADMIN_PASS = "..."
$env:E2E_REGULACION_MDE_USER = "..."; $env:E2E_REGULACION_MDE_PASS = "..."
$env:E2E_REGULACION_BOG_USER = "..."; $env:E2E_REGULACION_BOG_PASS = "..."
$env:E2E_OVEM_MDE_USER = "..."; $env:E2E_OVEM_MDE_PASS = "..."
$env:E2E_OVEM_BOG_USER = "..."; $env:E2E_OVEM_BOG_PASS = "..."
```

Roles disponibles: `ADMIN`, `REGULACION_MDE`, `REGULACION_BOG`, `OVEM_MDE`, `OVEM_BOG`, `MEDICO`, `AUXILIAR`, `MANTENIMIENTO` (variables `E2E_<ROL>_USER` y `E2E_<ROL>_PASS`).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run e2e` | Todo, sin ventana (CLI, para CI) |
| `npm run e2e:smoke` | Solo lectura: no crea ni modifica datos |
| `npm run e2e:ui` | Modo UI: lista de pruebas, navegador a la vista y línea de tiempo |
| `npm run e2e:headed` | Con el navegador visible |
| `npm run e2e:debug` | Paso a paso con el Inspector |
| `npm run e2e:report` | Abre el último reporte HTML (capturas y trazas de lo que falló) |

Para una sola prueba o archivo: `npx playwright test e2e/specs/smoke/aislamiento.spec.ts`, o `-g "O-33"` para filtrar por el ID del caso.

## Reglas para escribir pruebas

- El título lleva el ID del caso del plan (`O-33: …`) y cada caso nuevo se registra en `COBERTURA.md`.
- Los selectores van por rol y texto accesible; nada de coordenadas ni clases de CSS.
- Se afirma sobre el estado final (la fila, el vehículo correcto), no solo sobre un mensaje.
- Todo dato que una prueba cree lleva el prefijo `TEST-` y usa solo los vehículos de prueba de `fixtures/datos.ts` (KQX040 en Medellín, LHV349 en Bogotá).
- Las pruebas de `specs/smoke/` son de solo lectura. Lo que escribe datos va en otra carpeta y no corre en cada push.
- Un solo intento de login por rol: una contraseña mala repetida bloquea la cuenta de prueba.

## Mobile

Los archivos `*@mobile.spec.ts` corren en los proyectos `mobile-390` (390×844) y `mobile-360` (360×640). El resto corre en `desktop` (1440×900).
