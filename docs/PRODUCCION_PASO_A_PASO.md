# Producción de SISMANTO — paso a paso para Daniel

Escrito el 2026-09-24 por David (con Claude Code). Complementa `ENTORNOS.md` y no lo reemplaza.
**Nada de este documento se ejecuta solo:** todo lo de producción es manual, con revisor y confirmación escrita.

---

## 0. Lo primero: ¿qué base usa hoy «Production»?

Hay una contradicción entre los documentos y hay que resolverla **antes de tocar nada**:

- `CLAUDE.md` y `ENTORNOS.md` (tabla de ramas) dicen que `main` usa «la Supabase de producción».
- `ENTORNOS.md` (sección *Setup*, punto 1) dice: *«Hoy Production también apunta a staging porque aún no existe la base de producción.»*

Yo no puedo comprobarlo (no tengo acceso a Vercel ni a Supabase). **Daniel, confirma cuál de los dos casos es** mirando en Vercel → proyecto `sismanto` → Settings → Environment Variables → filtra por *Production* → `NEXT_PUBLIC_SUPABASE_URL`, y compara el ref (`https://<ref>.supabase.co`) con el de `SISMANTO_Staging` (`oanbqlfvdmdpckrcwfqi`).

| Caso | Qué significa | Qué hacer |
|---|---|---|
| **A.** El ref es el de staging (`oanbqlfvdmdpckrcwfqi`) | No hay base de producción. Production comparte la base de staging, que **ya tiene todas las migraciones** (035–083). | **No hay migraciones que aplicar.** Salta a la sección 3 (desplegar). |
| **B.** El ref es otro | Existe una base de producción propia, con datos reales. Le faltan las migraciones nuevas. | Sigue las secciones 1 → 2 → 3 en orden. |

Advertencia: en el caso A, «producción» y «staging» son **la misma base**. Cualquier dato real que se cargue en producción también aparece en staging/dev, y cualquier prueba en staging toca datos de producción. Eso es aceptable solo mientras no haya usuarios reales (ver el checklist de go-live de `ENTORNOS.md`).

---

## 1. Antes de migrar (solo caso B)

1. **Respaldo verificado.** Supabase Free no tiene backups ni PITR (`ENTORNOS.md`). Antes de migrar, haz un volcado completo (`pg_dump` con la URI directa, o *Database → Backups* si el proyecto es Pro) y **comprueba que se puede abrir**. Sin respaldo, no se migra.
2. **Ventana sin usuarios.** Las migraciones toman bloqueos cortos, y `076` agrega una política a todas las tablas.
3. **Revisa el registro de migraciones de producción.** En el SQL Editor de producción:
   ```sql
   SELECT count(*) FROM public.schema_migrations;                 -- ¿existe la tabla?
   SELECT name FROM public.schema_migrations ORDER BY name;       -- debe llegar hasta 034_corregir_historial_fds.sql
   ```
   - **Si la tabla NO existe → PARA.** Ver la sección 4 (trampa del tracker): correr `db:apply` así **marca todo como aplicado sin ejecutar nada**.
   - Si existe y llega hasta la 034: continúa.

---

## 2. Aplicar las migraciones (solo caso B)

### 2.1 Configuración única (Daniel, en GitHub → Settings → Environments → `Production`)
El entorno `Production` ya existe pero está vacío y sin protecciones. El repo es público, así que **las reglas de entorno son gratuitas**:

- **Required reviewers:** agrega a Daniel (y a quien deba aprobar). Así nadie dispara producción sin un segundo clic.
- **Secretos del entorno** (Environment secrets, no los del repo):
  - `DATABASE_URL_PROD` → URI de **Session pooler** de la base de producción (Supabase → Connect). El host directo es solo IPv6 y los runners no lo alcanzan.
- **Variables del entorno:**
  - `PRODUCTION_SUPABASE_REF` → el ref del proyecto de producción. La comprobación se niega a seguir si la URI no lo contiene o si contiene el de staging.
  - `ADMIN_SETUP_EMAIL` → **ver la sección 5** (importante).

Nadie más que Daniel debe ver esos valores. Quien prepara el código (David, Claude) no los necesita ni los toca.

### 2.2 Ejecutar
GitHub → Actions → **«DB migrate PROD (manual)»** → *Run workflow* → rama `main`:

1. `modo = revisar` → solo lectura. El resumen del job lista las migraciones pendientes (deben ser ~53: de la `035_sisres_roles` a la `083_sispro_cie10`; la lista exacta está en la descripción del PR #77). Si algo no cuadra, aquí se detiene.
2. `modo = aplicar`, `confirmacion = APLICAR-PRODUCCION` → aplica las pendientes **en el orden del array `MIGRATIONS`**. Cada migración es atómica; si una falla, el job se detiene en ella y las anteriores quedan aplicadas (se corrige y se vuelve a correr: las aplicadas se saltan).
3. Al final el propio job vuelve a comprobar que quedaron **0 pendientes**.

### 2.3 Verificación después de migrar
En el SQL Editor de producción (`scripts/supabase-verify-smoke.sql` trae más):
```sql
SELECT * FROM public.tablas_sin_politica_rol_restringido();   -- debe devolver 0 filas (migración 076)
SELECT * FROM public.tablas_publicas_sin_rls();               -- debe devolver 0 filas
SELECT count(*) FROM public.cie10;                            -- ~12 634 (migración 083)
```

---

## 3. Desplegar `main` a producción

GitHub → Actions → **«Deploy PROD (manual)»** → *Run workflow* → rama `main`, `confirmacion = DESPLEGAR-PRODUCCION`. Pide aprobación del revisor.

- Con `DATABASE_URL_PROD` configurado, **se niega a desplegar si quedan migraciones pendientes** (evita código nuevo sobre esquema viejo).
- Sin ese secreto (caso A), solo avisa de que no comprobó el esquema.
- Usa las variables de entorno **Production** de Vercel (`vercel pull --environment=production`) y el mismo mecanismo de `deploy.yml` (sin `.git`, para que Hobby no bloquee por el autor).

Si prefieres seguir desplegando a mano desde Vercel, el orden es el mismo: **primero la base, después el código**.

### Variables de Vercel (Production) que la app usa
Solo nombres; los valores los pone Daniel en Vercel:

| Obligatorias | Opcionales según el módulo |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo servidor), `NEXT_PUBLIC_APP_URL`, `CRON_SECRET` | Facturas/IA: `ANTHROPIC_API_KEY`, `AI_DAILY_BUDGET_USD`, `AI_MONTHLY_BUDGET_USD`, `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `ONEDRIVE_USER`, `ONEDRIVE_INPUT_FOLDER`, `ONEDRIVE_REVIEW_FOLDER`, `GRAPH_WEBHOOK_SECRET` · Correos: `NOTIFICATIONS_MAIL_FROM` · WhatsApp: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` (obligatorio para el webhook: sin él responde 503) |

### Prueba después de desplegar (10 minutos, con un ADMIN)
`/login` → menú completo → `/soporte` (crear un ticket) → `/soporte/gestion` → `/captacion/nueva` (registrar y descargar el Excel SISPRO del mes) → `/auditoria` → `/formatos-ti` → `/pacientes`. Si algo falla, no hay `rollback` automático: en Vercel → Deployments → el despliegue anterior → *Promote to Production*.

---

## 4. Trampa del tracker (`schema_migrations`) — leer antes de tocar `db:apply`

`scripts/apply-database.ts`, cuando la base **ya tiene esquema** (`vehicles` existe) pero **no** la tabla `schema_migrations`, entra en modo «sembrar»: marca **todas** las migraciones del array como aplicadas **sin ejecutarlas** y termina con éxito. En una base de producción vieja sin tracker eso significaría «éxito» sin crear ni una tabla nueva, y las pantallas nuevas fallarían con *relation does not exist*.

Por eso el workflow ejecuta antes `scripts/prod-preflight.mjs`, que **aborta** si falta la tabla o si el registro no llega hasta la línea base (`schema.sql` y `002`–`034`).

Si producción no tiene `schema_migrations` (caso B):
1. Averigua cuáles migraciones de la línea base están realmente aplicadas en esa base.
2. Crea la tabla e inserta **solo esas**:
   ```sql
   CREATE TABLE IF NOT EXISTS public.schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
   INSERT INTO public.schema_migrations (name) VALUES ('schema.sql'), ('002_iteracion2.sql') /* … hasta 034_corregir_historial_fds.sql */ ON CONFLICT DO NOTHING;
   ```
   (los nombres exactos están en `scripts/apply-database.ts`, del `schema.sql` al `034_...`).
3. Vuelve a correr el modo `revisar`: ahora debe listar las ~53 pendientes.

---

## 5. Otra trampa: `db:apply` promueve a un ADMIN

Al terminar, `db:apply` ejecuta `ensureAdminProfile`: busca en `auth.users` el correo `ADMIN_SETUP_EMAIL` (si no está definido, **`innovizar@aerosanidadsas.com`**) y, si existe, le **crea o restablece** el perfil con rol ADMIN, activo y nombre «Administrador». En producción, define `ADMIN_SETUP_EMAIL` con el correo del administrador real (variable del entorno `Production`) o confirma que aceptas ese valor por defecto.

---

## 6. Lo que este flujo NO hace
- **No crea** la base de producción, ni activa backups/PITR, ni pasa a Supabase Pro / Vercel Pro (checklist de go-live de `ENTORNOS.md`).
- **No carga datos de SISRES** (ETL de pacientes, servicios, usuarios): es aparte (`scripts/etl-sisres.ts`, de León).
- **No configura** branch protection ni las reglas del entorno: son ajustes de GitHub que solo el administrador del repo puede aplicar.

## Recomendado ahora mismo (repo público → gratis)
1. Branch protection en `main`, `staging` y `dev` (PR + CI + una aprobación; en `main`, solo Daniel).
2. Reglas del entorno `Production` (sección 2.1), aunque hoy esté vacío.
3. Decidir si el repo debe seguir público antes de cargar cualquier dato real.
