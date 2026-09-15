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
| `dev` | `sisres-v2-dev.vercel.app` |
| `staging` | `sisres-v2-staging.vercel.app` (el que ya existía — se re-apunta de `integration/sisres` a `staging`) |
| `main` | dominio de producción de Aeromanto (el de siempre) |

**Por qué no es el Git-integration nativo de Vercel:** el plan Hobby bloquea despliegues disparados por un commit de alguien que no sea el dueño del proyecto, en un repo privado (esto es lo que le pasó a León hoy). En vez de pagar Vercel Pro, `dev` y `staging` se despliegan vía **Deploy Hook** (`.github/workflows/deploy-dev.yml` y `deploy-staging.yml`) — un webhook de Vercel que reconstruye la rama sin mirar quién hizo el commit. `main` sigue con el Git-integration nativo porque ahí, por ahora, solo commitea Daniel.

## Setup pendiente en Vercel (una sola vez)

1. **Deploy Hooks**: Project Settings → Git → Deploy Hooks → crear uno apuntando a `dev` y otro a `staging`. Cada uno da una URL — esas dos URLs van como secretos de GitHub (`VERCEL_DEPLOY_HOOK_DEV`, `VERCEL_DEPLOY_HOOK_STAGING`).
2. **Dominios**: Project Settings → Domains → agregar `sisres-v2-dev.vercel.app` apuntado a la rama `dev`; re-apuntar `sisres-v2-staging.vercel.app` de `integration/sisres` a `staging`.
3. **Deployment Protection**: confirmar que sigue deshabilitada (o con Preview Deployment Suite en modo "Only Preview Deployments" sin protección) para que León pueda abrir las URLs sin login de Vercel.

## Prioridad #1 ahora mismo

Objetivo: que el rol **REGULACIÓN** sea el primero en poder operar el sistema en su día a día (no un módulo nuevo — el flujo core de Aeromanto que ya existía). Antes de sumar más features nuevas, hay que auditar y cerrar cualquier hueco que le impida a Regulación trabajar en `dev` sin fricción.
