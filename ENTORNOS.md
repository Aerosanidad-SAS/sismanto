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

`dev` y `staging` se despliegan desde GitHub Actions (`.github/workflows/deploy.yml`) con la CLI de Vercel, al proyecto `sismanto` del team `tecnicoaerosanidad` (cuenta de la empresa, plan Hobby mientras sea pre-producción). **No** se usa la integración nativa de Vercel con GitHub: en Hobby rechaza los repos privados de una organización.

| Rama | Entorno Vercel | URL |
|---|---|---|
| `dev` | Preview | `sismanto-dev.vercel.app` |
| `staging` | Preview | `sismanto-staging.vercel.app` |
| `main` | Production | lo despliega Daniel a mano hasta el go-live (dominio final por definir) |

La base de datos se migra aparte, en GitHub Actions: `.github/workflows/db-migrate.yml` corre `npm run db:apply` contra `SISMANTO_Staging` en cada push a `dev` o `staging` (o sea, solo tras mergear un PR). Ya nadie aplica migraciones a mano sobre staging. Producción **no** se migra desde GitHub: no hay credenciales de producción en el repo hasta el go-live.

## Setup (una sola vez)

1. **Supabase**: proyecto `SISMANTO_Staging` en `aerosanidad's Org`. La integración Supabase↔Vercel sincroniza `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` a Production y Preview. Hoy Production también apunta a staging porque aún no existe la base de producción.
2. **Secretos del repo**: `VERCEL_TOKEN` (token creado en el team `tecnicoaerosanidad`), `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, y `DATABASE_URL_STAGING`: URI de *Session pooler* de `SISMANTO_Staging` (Supabase → Connect). El host directo es solo IPv6 y los runners de GitHub no lo alcanzan.
3. **Deployment Protection**: *Vercel Authentication* desactivada. Hobby solo admite un miembro en el team, así que con la protección activa León y David no podrían abrir las previews. Se vuelve a activar en el go-live. Mientras tanto no compartas esas URLs fuera del equipo.
4. **Variables pendientes en Vercel**: `AZURE_*`, `ONEDRIVE_*`, `ANTHROPIC_API_KEY` (facturas y chat de IA), `NOTIFICATIONS_MAIL_FROM` (correos de vencimientos) y `CRON_SECRET`. Sin ellas esas funciones no operan; el resto de la app sí.
5. **Supabase Free**: pausa los proyectos tras 7 días sin actividad; `.github/workflows/supabase-keepalive.yml` los mantiene activos (variable del repo `SUPABASE_KEEPALIVE_TARGETS`: una línea `<url> <anon key>` por proyecto).

## Checklist de go-live

Antes de recibir usuarios reales:

- **Vercel Pro**: uso comercial, más miembros y protección de despliegues activa de nuevo.
- **Supabase Pro para producción**: el plan Free no tiene backups ni PITR y el sistema guarda datos de pacientes.
- **GitHub Team**: branch protection sobre `dev`/`staging`/`main` (PR + CI + aprobación) y environment `production` con aprobación de Daniel; recién entonces se agrega `DATABASE_URL_PRODUCTION` y su workflow.
- Apuntar Azure/Microsoft Graph (redirect URIs y webhook de OneDrive) a la URL final.
- Apagar las cuentas personales: proyecto Vercel `aeromanto` de `daniel891025`, org `innovizar@…` de Supabase y el remote `aeromanto-legacy`.

## Prioridad #1 ahora mismo

Objetivo: que el rol **REGULACIÓN** sea el primero en poder operar el sistema en su día a día (no un módulo nuevo — el flujo core de Aeromanto que ya existía). Antes de sumar más features nuevas, hay que auditar y cerrar cualquier hueco que le impida a Regulación trabajar en `dev` sin fricción.
