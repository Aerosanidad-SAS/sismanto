# Versionamiento de SISMANTO

Objetivo: que cada cambio quede registrado y que cualquier usuario vea en la app **qué versión usa y qué cambió**.
Reglas aprobadas por Daniel (24/09/2026). Las verifica el CI (`.github/workflows/changelog-check.yml`).

## 1. Formato de versión
`MAJOR.MINOR.PATCH` (SemVer). Mientras no salgamos a producción es `0.MINOR.PATCH`; **1.0.0 = go-live**.

| Tipo del cambio | Sube |
|---|---|
| `feat` (funcionalidad nueva) | MINOR |
| `fix`, `chore`, `docs` | PATCH |
| Cambio incompatible o migración `[DB-DESTRUCTIVE]` (`breaking: true`) | MINOR en 0.x; MAJOR desde 1.0 |

## 2. Nadie sube la versión en su PR
No se edita `package.json` (campo `version`) ni `CHANGELOG.md` en un PR normal: genera conflictos entre los tres. Solo quien hace el release, con `npm run release`. El CI lo rechaza.

## 3. Lo que SÍ hace cada PR: un archivo de changelog
Crea **`changelog/unreleased/<tema>.md`** (un archivo por PR; el nombre es el tema, p. ej. `tickets-correo.md`, sin número de PR):

```
---
type: feat            # feat | fix | chore | docs
area: soporte         # minúsculas, sin espacios: soporte, captacion, formatos-ti…
roles: ADMIN, ANALISTA   # o «ninguno» / «todos»
migration: 065           # opcional; varias: 065, 066
breaking: true           # opcional
---
Una sola línea, en español, escrita para el usuario final (no para el desarrollador).
```

Escribe qué **puede hacer ahora el usuario**, no qué archivos cambiaste. El CI falla si falta el archivo o si el formato es inválido.
- PR **solo de documentación**: pon la etiqueta `no-changelog` y no hace falta el archivo.
- PR de **integración** de varios PR: un archivo por cada cambio de usuario, o uno solo que los resuma.

## 4. Publicar una versión (release)
Lo hace quien promueve `dev → staging`, en este orden:

1. Desde `origin/dev` actualizado: `git checkout -b chore/release-v<X.Y.Z>` (la versión la calcula el script; usa `--dry-run` para verla).
2. `npm run release -- --dry-run` → revisa la versión y el texto. Después `npm run release`: calcula la versión según los tipos pendientes, los pasa a `CHANGELOG.md` bajo la versión nueva con la fecha y la lista de migraciones incluidas, sube `package.json` y `package-lock.json` y **borra** los archivos pendientes.
3. PR `chore(release): vX.Y.Z` hacia `dev` (el CI lo deja tocar la versión) y merge.
4. Promoción `dev → staging`. Al mergear a `staging`, `.github/workflows/tag-release.yml` crea el tag `vX.Y.Z`.
5. `main` solo promueve **ese mismo commit** (`staging → main`): la versión de producción es la del tag que ya pasó por staging.

La lista «Migraciones incluidas» de cada versión es lo que hay que aplicar en producción antes de desplegar (ver `docs/PRODUCCION_PASO_A_PASO.md`).

## 5. En la app
Al pie del menú lateral: **`v0.8.0 · a1b2c3d`** (versión + commit que se sirve). Al pulsarlo se abre el historial de versiones con el changelog completo. En `dev` y `staging` aparece además **«Pendiente de publicar»**: los cambios que ya están en ese entorno pero aún no tienen versión. En producción no se muestran los pendientes.
El commit y el entorno los inyectan los workflows de despliegue (`NEXT_PUBLIC_COMMIT_SHA`, `NEXT_PUBLIC_APP_ENV`); la versión sale de `package.json`.

## 6. Todo lo anterior sigue vigente
Título del PR en Conventional Commits, un PR = una preocupación, nadie pushea directo a `dev`/`staging`/`main`, y las migraciones no las aplica nadie a mano: las aplica el workflow al mergear.
