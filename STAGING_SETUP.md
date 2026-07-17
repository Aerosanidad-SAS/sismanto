# Entorno de staging — integración SISRES

Guía para levantar el entorno compartido donde Daniel y León prueban en paralelo sin tocar los datos reales de flota. Ver `PLAN_INTEGRACION_SISRES.md` §2 para el contexto completo — esto es la versión ejecutable, paso a paso.

## 1. Supabase — proyecto `SISMANTO_Staging`

1. En [supabase.com](https://supabase.com), dentro de la misma organización del proyecto de producción: **New project** → nombre `SISMANTO_Staging` → región igual a la de producción (evita latencia distinta entre ambientes) → contraseña fuerte, guardarla en el gestor de contraseñas del equipo (no en el repo).
2. Copiar `Project URL` y `anon public key` (Settings → API) — van a ser las variables de **Preview** en Vercel (paso 3).
3. Aplicar el esquema completo:
   ```bash
   # con DATABASE_URL apuntando al proyecto de staging (Settings → Database → Connection string)
   DATABASE_URL=postgresql://postgres.<ref-staging>:<password>@... npm run db:apply
   ```
   Esto corre `schema.sql` + todas las migraciones en orden, igual que en producción.
4. Crear un usuario Admin de prueba (Authentication → Users → Add user) y enlazarlo en `user_profiles` — mismo procedimiento que ya está documentado en `README.md` §"Primer deploy hasta producción".
5. **No copiar datos reales de pacientes/servicios** cuando lleguemos a esa parte — eso se define aparte cuando tengamos el dataset sintético (pregunta 10 a León).

## 2. Vercel — Preview Environment Variables

1. En el proyecto de Vercel: **Settings → Environment Variables**.
2. Agregar (o editar si ya existen) estas variables marcadas **solo para el entorno Preview** (no Production):
   - `NEXT_PUBLIC_SUPABASE_URL` → URL del proyecto `SISMANTO_Staging`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon key de `SISMANTO_Staging`
   - `SUPABASE_SERVICE_ROLE_KEY` → service role de `SISMANTO_Staging` (si se necesita alta de usuarios de prueba)
   - El resto de credenciales externas (Anthropic, Microsoft Graph, WhatsApp, ProTrack) van con valores de **sandbox/test** apenas los tengamos de León — hasta entonces, dejar vacías (las features que las usan simplemente no funcionan en staging, no rompe el resto de la app).
3. Con esto, **cualquier rama que abra un PR** (incluida `integration/sisres` y cada `feature/*`) despliega automáticamente contra `SISMANTO_Staging`, sin configuración adicional por rama.

## 3. URL de staging estable

- Vercel asigna un alias fijo por rama a los *branch deployments* (distinto del preview efímero por PR). Verificar en **Settings → Git → Deployments** que `integration/sisres` tenga un alias predecible (algo como `aeromanto-git-integration-sisres-<team>.vercel.app`).
- Esa URL es la que usan vos y León como "el estado acumulado de la integración" — no depende de que un PR individual siga abierto.

## 4. Qué falta antes de dar esto por completo operativo

- [ ] Proyecto `SISMANTO_Staging` creado y con schema aplicado
- [ ] Variables de Preview configuradas en Vercel
- [ ] Usuario Admin de prueba funcionando en staging
- [ ] Credenciales sandbox de WhatsApp/ProTrack (pendiente respuesta de León, preguntas 8-9)
- [ ] Dataset sintético de pacientes/servicios (pendiente respuesta de León, pregunta 10)

Ninguno de estos pasos requiere esperar la respuesta de León sobre roles (§5 del plan) — se puede hacer ya.
