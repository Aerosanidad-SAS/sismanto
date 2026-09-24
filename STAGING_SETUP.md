# Entorno de staging — integración SISRES

Guía para levantar el entorno compartido donde Daniel y León prueban en paralelo sin tocar los datos reales de flota. Ver `PLAN_INTEGRACION_SISRES.md` §2 para el contexto completo — esto es la versión ejecutable, paso a paso.

## 1. Supabase — proyecto `SISRES_V2_Staging`

1. En [supabase.com](https://supabase.com), dentro de la misma organización del proyecto de producción: **New project** → nombre `SISRES_V2_Staging` → región igual a la de producción (evita latencia distinta entre ambientes) → contraseña fuerte, guardarla en el gestor de contraseñas del equipo (no en el repo).
2. Copiar `Project URL` y `anon public key` (Settings → API) — van a ser las variables de **Preview** en Vercel (paso 3).
3. Aplicar el esquema completo:
   ```bash
   # con DATABASE_URL apuntando al proyecto de staging (Settings → Database → Connection string)
   DATABASE_URL=postgresql://postgres.<ref-staging>:<password>@... npm run db:apply
   ```
   Esto corre `schema.sql` + todas las migraciones en orden, igual que en producción.
4. **Paso obligatorio si al crear el proyecto destildaste "Automatically expose new tables"** (recomendado en el paso de creación, para no exponer tablas sin RLS por accidente): sin ese checkbox, los roles `anon`/`authenticated` no tienen el permiso base para leer las tablas vía la API, aunque las políticas RLS estén perfectas — la API devuelve `permission denied` antes de llegar a evaluar RLS. Corré esto una sola vez en el **SQL Editor** del proyecto de staging, después de aplicar el esquema:
   ```sql
   GRANT USAGE ON SCHEMA public TO anon, authenticated;
   GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
   GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
   GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;
   ```
   Esto solo habilita el permiso base — la seguridad real la siguen manejando las políticas RLS de cada migración, sin cambios ahí. (Descubierto y confirmado 2026-07-17 al validar `SISRES_V2_Staging`: sin este paso, el login funciona pero la app se queda mostrando "Cuenta pendiente" para cualquier usuario, porque la consulta al perfil falla en silencio por falta de permiso, no por falta de rol.)
5. Crear un usuario Admin de prueba (Authentication → Users → Add user) y enlazarlo en `user_profiles` — mismo procedimiento que ya está documentado en `README.md` §"Primer deploy hasta producción".
6. **No copiar datos reales de pacientes/servicios** cuando lleguemos a esa parte — eso se define aparte cuando tengamos el dataset sintético (pregunta 10 a León).

## 2. Vercel — Preview Environment Variables

1. En el proyecto de Vercel: **Settings → Environment Variables**.
2. Agregar (o editar si ya existen) estas variables marcadas **solo para el entorno Preview** (no Production):
   - `NEXT_PUBLIC_SUPABASE_URL` → URL del proyecto `SISRES_V2_Staging`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon key de `SISRES_V2_Staging`
   - `SUPABASE_SERVICE_ROLE_KEY` → service role de `SISRES_V2_Staging` (si se necesita alta de usuarios de prueba)
   - El resto de credenciales externas (Anthropic, Microsoft Graph, WhatsApp, ProTrack) van con valores de **sandbox/test** apenas los tengamos de León — hasta entonces, dejar vacías (las features que las usan simplemente no funcionan en staging, no rompe el resto de la app).
3. Con esto, **cualquier rama que abra un PR** (incluida `integration/sisres` y cada `feature/*`) despliega automáticamente contra `SISRES_V2_Staging`, sin configuración adicional por rama.

## 3. URL de staging estable

- Vercel asigna un alias fijo por rama a los *branch deployments* (distinto del preview efímero por PR). Verificar en **Settings → Git → Deployments** que `integration/sisres` tenga un alias predecible (algo como `aeromanto-git-integration-sisres-<team>.vercel.app`).
- Esa URL es la que usan vos y León como "el estado acumulado de la integración" — no depende de que un PR individual siga abierto.

## 4. Qué falta antes de dar esto por completo operativo

- [x] Proyecto `SISRES_V2_Staging` creado y con schema aplicado (2026-07-17)
- [x] GRANT de permisos base aplicado (paso 4 de esta sección)
- [x] Variables de Preview configuradas en Vercel (2026-07-17)
- [x] Usuario Admin de prueba funcionando en staging — login verificado end-to-end contra un Preview Deployment real (2026-07-17)
- [ ] Credenciales sandbox de WhatsApp/ProTrack (pendiente respuesta de León, preguntas 8-9 — ya respondidas parcialmente en `RESPUESTAS_LEON.md`, falta gestionar el número de prueba de Meta)
- [ ] Dataset sintético de pacientes/servicios — ya generado por León (`sisres/sql/dataset_sintetico_ejemplo.csv`, `generar_dataset_sintetico.php`), falta adaptarlo al esquema final de Postgres en la Fase 3
- [ ] Alias estable de `integration/sisres` confirmado en Vercel (§3 — pendiente pushear esa rama por primera vez)

**Entorno de staging operativo de punta a punta.** Lo que sigue depende del plan general (`PLAN_INTEGRACION_SISRES.md`), no de nada de esta guía.
