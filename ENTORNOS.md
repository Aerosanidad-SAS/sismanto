# Entornos: dev → staging → production

Decisión de Daniel (2026-07-21): dejar de trabajar todo sobre `integration/sisres` sin gate y pasar a tres niveles.

## Las tres ramas

| Rama | Quién pushea | Para qué | Base de datos |
|---|---|---|---|
| `dev` | Nadie directo: entra por PR desde `feat/<nombre>-<tema>` (Daniel, León y David en paralelo — reglas en `CLAUDE.md` → "Team workflow") | Trabajo activo del día a día. Se prueba acá primero. | Supabase de staging (la misma que se venía usando) |
| `staging` | Solo por promoción desde `dev` (merge), nunca commits directos | Gate de QA antes de producción — cuando algo en `dev` ya se probó y se dio por bueno | Misma Supabase de staging |
| `main` | Solo por promoción desde `staging`, cuando hay un lote de cambios sustanciales validados | Producción real, usuarios reales | Supabase de producción |

`integration/sisres` queda congelada — todo lo que tenía ya está en `dev` y `staging` (las tres ramas arrancan iguales, del mismo punto). De acá en adelante el trabajo nuevo va a `dev`, no a `integration/sisres`.

## Cómo se promueve

```
dev → (QA da bien) → merge a staging → (QA da bien en staging) → merge a main
```

Promoción = Pull Request de una rama a la siguiente (`dev→staging`, `staging→main`), no un push directo. Así queda registro de qué se promovió y cuándo, y `Aegis` (el agente revisor) puede revisar el PR antes de aprobar.

## Despliegues

Cada rama tiene su propio dominio estable de Vercel:

| Rama | Dominio |
|---|---|
| `dev` | `sismanto-dev.vercel.app` |
| `staging` | `sismanto-staging.vercel.app` (el que ya existía — se re-apunta de `integration/sisres` a `staging`) |
| `main` | dominio de producción de Aeromanto (el de siempre) |

**Por qué no es el Git-integration nativo de Vercel:** el proyecto de Vercel (`aeromanto`, cuenta personal de Daniel, plan Hobby) sigue conectado al repo anterior, y reconectarlo a `Aerosanidad-SAS/sismanto` exige que un **owner** de la organización instale la app de Vercel en GitHub. Además, el plan Hobby bloquea despliegues disparados por un commit de alguien que no sea el dueño del proyecto. Por eso `dev` y `staging` se despliegan desde GitHub Actions con la **CLI de Vercel** (`.github/workflows/deploy.yml`): despliega el token del proyecto, sin importar quién hizo el commit, y **León y David no necesitan cuenta de Vercel**.

## Setup en Vercel (una sola vez)

1. **Token**: https://vercel.com/account/settings/tokens → crear uno (`github-actions-sismanto`) y guardarlo como secreto del repo: `gh secret set VERCEL_TOKEN --repo Aerosanidad-SAS/sismanto`. Los otros dos secretos que usa el workflow (`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) ya están cargados.
2. **Variables de entorno**: el workflow usa las de *Preview* del proyecto (`vercel pull --environment=preview`), que deben apuntar a `SISMANTO_Staging`. Las de *Production* apuntan a la Supabase de producción.
3. **Dominios**: `sismanto-dev.vercel.app` y `sismanto-staging.vercel.app` ya existen; el workflow los re-apunta a cada despliegue con `vercel alias set`.
4. **Deployment Protection**: confirmar que sigue deshabilitada, para que cualquiera del equipo pueda abrir esas URLs sin login de Vercel.
5. **`main`**: lo despliega Daniel a mano (dashboard o `vercel --prod`) hasta que el proyecto quede reconectado a este repo.

## Prioridad #1 ahora mismo

Objetivo: que el rol **REGULACIÓN** sea el primero en poder operar el sistema en su día a día (no un módulo nuevo — el flujo core de Aeromanto que ya existía). Antes de sumar más features nuevas, hay que auditar y cerrar cualquier hueco que le impida a Regulación trabajar en `dev` sin fricción.
