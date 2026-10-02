# Auditoría de seguridad e integridad — 2026-10-01

**Alcance:** solo lectura — no se modificó código de producto ni datos. Todas las consultas contra `SISMANTO_Staging`
(dev/staging comparten esa base) se corrieron dentro de `BEGIN READ ONLY` o con `ROLLBACK` al final; ninguna imprimió
datos reales de pacientes o personal, solo conteos y, en un caso, el nombre de una cuenta de prueba sembrada por
`npm run db:seed-role-users`.

**Cómo se hizo:** revisión de dependencias (`npm audit`), rastreo de secretos en el repo y su historial, consultas
directas a Postgres (`pg_policies`, `pg_proc`, `information_schema`) simulando distintos roles con
`set_config('request.jwt.claims', …)` / `SET LOCAL ROLE`, lectura del código de `src/app/api/actions/` y
`src/lib/`, y una llamada real a `GET /auth/v1/settings` de Supabase Auth.

**Resumen:** la capa de aplicación (Server Actions, validación con Zod, manejo de tokens y sesiones) está, en
general, bien construida — varios mecanismos que parecían sospechosos a primera vista resultaron, al verificarlos,
correctamente implementados (ver «Controles verificados» al final). Los hallazgos reales se concentran en: señales
de SISRES/Supabase que quedaron abiertas (registro público, RPC sin filtrar), dependencias desactualizadas, y un
patrón de RLS mucho más extendido de lo que se pensaba.

---

## Hallazgos

### 🔴 Alto

#### 1. Dos funciones RPC filtran nombre y rol de cualquier usuario sin autenticar

`ticket_nombre_usuario(uuid)` y `get_user_role(uuid)` son `SECURITY DEFINER`, propiedad de `postgres`
(`rolbypassrls = true`, así que ignoran la RLS de `user_profiles`), y PostgREST las expone como RPC con `EXECUTE`
otorgado a `anon`. Ni una ni otra comprueban quién las llama.

Verificado llamándolas como `anon` (sin sesión) con el UUID de una cuenta de prueba real:

```
ticket_nombre_usuario(uuid real) como anon: [{"nombre":"Coordinación de Prueba"}]
get_user_role(uuid real) como anon: [{"rol":"COORDINACION"}]
```

Un UUID v4 no se adivina por fuerza bruta, pero sí se filtra por otros caminos: aparece en enlaces compartidos, en
la bitácora, en exportaciones, en el DOM de páginas internas, etc. Quien tenga uno puede confirmar nombre completo
y rol de esa persona sin iniciar sesión. Ya estaba anotado como hallazgo menor en la memoria del 2026-09-29; esta
auditoría lo reprodujo con datos reales y confirma que sigue abierto.

Las funciones de **escritura** con el mismo patrón (`cambiar_estado_ticket`, `tomar_ticket`, `reabrir_ticket`,
`registrar_costo_anual`, etc.) **sí están bien protegidas**: todas comprueban `es_gestor_tickets()` o
`auth.uid()`/`get_user_role()` adentro y lanzan excepción si quien llama no califica. Se confirmó llamando
`cambiar_estado_ticket` como `anon`: `ERROR: Sin permiso para gestionar tickets`.

**Recomendación:** `REVOKE EXECUTE ON FUNCTION ticket_nombre_usuario(uuid), get_user_role(uuid) FROM anon;` (y
revisar si además conviene revocárselo a `authenticated` sin perfil). Es una migración de una línea, sin romper
nada: ningún código de la app las llama como `anon` a propósito.

#### 2. El registro de cuentas sigue abierto en Supabase Auth

Confirmado en vivo: `GET /auth/v1/settings` → `disable_signup: false`. Cualquiera puede crearse una cuenta con
confirmación de correo, sin que nadie le asigne rol ni fila en `user_profiles`.

Se simuló esa cuenta (JWT válido, `role: authenticated`, sin fila en `user_profiles`) y se confirmó qué puede leer:

| Tabla | Filas visibles | Riesgo |
|---|---|---|
| `medical_providers` | 1.332 | Directorio de prestadores con teléfono/correo |
| `maintenance_plan_items` | 82 | Plan de mantenimiento de la flota |
| `vehicle_status_history` | 4 | Historial de estado de vehículos |
| `rtm_historico` | 3 | Historial de RTM |
| `company_settings` | 1 | Configuración de la empresa |
| `eps`, `cie10` | 30 / 12.634 | Catálogos públicos — sin riesgo real |
| `clients`, `airports`, `airlines` | 0 | Sin exposición (RLS exige rol con perfil) |

Esto ya se había reportado a Daniel el 2026-09-29, sin confirmación de que se haya corregido. Se cierra
desactivando «Allow new users to sign up» en el panel de Supabase Auth del proyecto — no requiere cambio de código
ni migración. Mientras tanto, cualquiera con un correo real puede registrarse y leer esas tablas.

#### 3. Dependencias con vulnerabilidades publicadas, una crítica

`npm audit`: **8 vulnerabilidades (1 crítica, 5 altas, 2 bajas)**.

- **`next@14.2.35`** (línea 14, la última; subir implica saltar a la 15/16 — cambio disruptivo): entre los avisos,
  uno es **RCE no autenticado en servidores Windows** y otro **RCE no autenticado en la Optimización de Imágenes
  con archivos AVIF**; además SSRF en Server Actions y en `rewrites`, envenenamiento de caché, DoS en Server
  Actions, y exposición de endpoints internos de Server Functions.
- **`postcss`** (dependencia transitiva de `next`): XSS en la salida de CSS y lectura de archivos arbitrarios vía
  `sourceMappingURL` manipulado.
- **`xlsx@0.18.5`**: Prototype Pollution y ReDoS. **Sin arreglo publicado** — ya estaba anotado en la memoria del
  2026-09-29.

**Recomendación:** la subida de Next.js es un PR propio y disruptivo (como ya estaba anotado), no algo para
resolver dentro de una rama de feature. Para `xlsx`, sin parche disponible, la mitigación es acotar qué datos pasan
por él (no se usa con entrada no confiable hoy: solo exporta datos propios y carga el histórico inicial) y vigilar
si aparece un parche.

### 🟡 Medio

#### 4. El patrón de RLS evaluada por fila está en 78 tablas, no es un riesgo aislado

La migración 087 (PR #109) corrigió el problema real que tumbó la lista de Servicios por `statement_timeout`
(`medical_services`, 41.523 filas): envolvió las llamadas a `get_user_role()`/`es_rol_restringido()` en
`(SELECT …)` — necesario para que Postgres las evalúe una vez por consulta en vez de una vez por fila — y reaplicó
el generador de la política restrictiva `zz_rol_restringido` a las 61 tablas que la tenían.

Lo que no se corrigió: **las políticas propias de cada tabla**, escritas a mano (no por el generador), siguen sin
envolver. Confirmado consultando `pg_policies` directamente: de las tablas con RLS, **78 tienen al menos una
política propia con la llamada sin envolver** — prácticamente todo el esquema, fuera de `medical_services` (que sí
se reescribió en la 087) y las pocas tablas sin política propia de lectura por rol.

Esto no es una fuga de datos — las funciones son `STABLE` y el resultado es correcto, solo más lento — pero es
exactamente el patrón que causó el incidente original, y las tablas más grandes después de `medical_services` ya
no son pequeñas: `airports` (85.818 filas, aunque es catálogo de solo lectura poco filtrado por rol), `patients`
(20.038), `cie10` (12.634). `patients` en particular está en la misma situación que tenía `medical_services` antes
del incidente: una tabla de decenas de miles de filas con política por rol sin envolver.

**Recomendación:** generalizar el arreglo de la 087 más allá de `zz_rol_restringido` — reescribir las políticas
propias de las tablas con más de unas pocas miles de filas (empezando por `patients`) para envolver las llamadas en
`(SELECT …)`, antes de que alguna golpee el timeout de 8 s como pasó con `medical_services`. Candidato a una
migración dedicada, probablemente la más valiosa de este informe por tratarse de una repetición conocida.

#### 5. Validación de archivos subidos: dos de cuatro rutas confían en metadatos que el cliente controla

`tickets.ts` (adjunto de ticket) y `biomedico-documentos.ts` (documentos de equipo) comprueban los **bytes reales**
del archivo (cabecera/"magic bytes") antes de aceptarlo — así un `.html` renombrado a `.pdf` se rechaza, como ya
documenta `CLAUDE.md`.

`servicios-medicos.ts` (`subirBoletaSalida`) y `company-settings.ts` (`updateCompanyLogo`) en cambio solo
comprueban `file.type` (el MIME que declara el cliente al armar el `FormData`, trivial de falsificar) y la
extensión de `file.name` (también la pone quien sube el archivo). Nada impide subir un archivo cuyo contenido real
no coincida con lo declarado.

Mitigantes: `subirBoletaSalida` exige `requireRole(ROLES_BOLETA_SALIDA)` y el bucket `servicios-boletas` es
privado; `updateCompanyLogo` exige `requireRole(["ADMIN"])`. No es explotable por cualquiera, pero si cualquiera de
esas dos cuentas se compromete, la validación no ayuda.

Más puntual: `company-settings.ts` permite **SVG** (`TIPOS_PERMITIDOS` incluye `image/svg+xml`) en el bucket
`branding`, que es **público**. El logo se renderiza con `<Image unoptimized>` (como `<img>`, que no ejecuta script
embebido en un SVG), así que no hay XSS contra la propia app — pero la URL pública del archivo igual queda
navegable directamente, y un SVG puede llevar `<script>`. Bajo impacto (requiere ser ADMIN para subirlo), pero fácil
de cerrar quitando `image/svg+xml` de la lista, igual que ya se hace en las otras dos rutas.

**Recomendación:** reutilizar `tipoImagenReal()` (ya existe, usado en `tickets.ts`) en las otras dos rutas, y quitar
SVG de `TIPOS_PERMITIDOS` en `company-settings.ts`.

### 🔵 Bajo / informativo

- **Comparación del `CRON_SECRET` con `!==`** en las 4 rutas `/api/cron/*`, en vez de `timingSafeEqual`. Riesgo
  teórico (ataque de tiempo sobre un secreto largo, por red, con jitter real) — no se considera explotable en la
  práctica, se anota por si en algún momento se endurece junto a otra cosa.
- **Reutilización de `SUPABASE_SERVICE_ROLE_KEY` como secreto HMAC** para firmar la cookie de origen del selector de
  roles (`role-switcher.ts`). No es una vulnerabilidad (la clave es larga, secreta y solo vive en el servidor), solo
  una nota de higiene: si esa clave rota, las cookies de origen vigentes se invalidan solas (efecto colateral
  inofensivo, incluso conveniente).
- **Rotación de credenciales pendiente de confirmar:** la contraseña de `DATABASE_URL` y el JWT completo de
  `SUPABASE_SERVICE_ROLE_KEY` de `SISMANTO_Staging` se imprimieron por error en una sesión de chat el 2026-09-25.
  Se recomendó rotar ambas varias veces desde entonces; **no hay confirmación de que se haya hecho.** Esta
  auditoría no verifica si siguen siendo las mismas — se arrastra como pendiente.
- **`024_ai_usage_log.sql`** nunca se registró en `scripts/apply-database.ts` (hallazgo del PR #157, no nuevo
  aquí) — sigue sin decidirse si fue a propósito.

---

## Controles verificados (sin hallazgo — para no reabrirlos después)

Cosas que, al revisarlas con la misma profundidad que los hallazgos de arriba, resultaron bien construidas:

- **Todas** las tablas de `public` tienen RLS habilitada y al menos una política — ninguna tabla quedó abierta por
  omisión.
- **El selector de roles** («Ver como», `role-switcher.ts`): cookie de origen firmada con HMAC-SHA256 y comparada
  con `timingSafeEqual`, con expiración, revalidación contra la base de que el origen sigue siendo ADMIN activo, el
  destino debe estar marcado como usuario de prueba en `app_metadata` (que el propio usuario no puede editar), y
  apagado a la fuerza en producción (`VERCEL_ENV !== "production"`, no solo por variable de entorno) — más la
  bitácora de cada cambio. No se encontró manera de forjarlo ni de usarlo para escalar a una cuenta real.
- **Tokens de un solo uso:** el enlace público de seguimiento GPS (`randomBytes(32)`, 256 bits) y el de firma
  remota de formatos TI (`randomBytes(32)` en hexadecimal, hash SHA-256 guardado en vez del token — el token en
  claro solo existe en el correo) son generados con entropía criptográfica real, no son adivinables.
- **`audit_log` es de solo escritura por el servidor:** solo existe una política de `SELECT` para `authenticated`
  (más la restrictiva genérica); no hay ninguna política de `INSERT`/`UPDATE`/`DELETE` para ningún rol autenticado,
  ni siquiera ADMIN — la bitácora solo se escribe desde `auditar()` con la clave de servicio, server-side. Ni una
  sesión de ADMIN comprometida puede alterar o borrar el rastro.
- **Sin CSRF:** las Server Actions de Next.js siguen con la verificación de `Origin` por defecto —
  `next.config.mjs` no toca `experimental.serverActions.allowedOrigins`.
- **Sin SSRF obvio:** las llamadas `fetch()` salientes (ProTrack365, Microsoft Graph, WhatsApp/Meta, correo) van a
  hosts fijos o configurados por variable de entorno, ninguna construye la URL a partir de un dato que entra el
  usuario.
- **Sin sumideros de XSS:** no hay `dangerouslySetInnerHTML` ni `eval`/`new Function` en `src/`. El HTML armado a
  mano (correo de firma remota) escapa el texto del usuario (`escaparHtml`).
- **Sin secretos en el repo ni en su historial:** `.env*` está en `.gitignore`, no hay archivos de credenciales
  trackeados (solo `.env.local.example`), `SUPABASE_SERVICE_ROLE_KEY` solo se usa server-side y ninguna variable
  `NEXT_PUBLIC_*` expone algo sensible.
- **GitHub Actions** no usa `pull_request_target` (evita el vector clásico de ejecutar código no confiable de un PR
  con los secretos del repo).
- **Cabeceras de seguridad** presentes en todas las rutas (`HSTS`, `X-Frame-Options`, `X-Content-Type-Options:
  nosniff`, `Permissions-Policy` cerrando cámara/micrófono/geolocalización). La CSP sigue en modo
  `Report-Only` — es la etapa intermedia intencional documentada en el propio `next.config.mjs`, no un olvido.

---

## Priorización sugerida

| # | Hallazgo | Esfuerzo | Quién actúa |
|---|---|---|---|
| 2 | Cerrar registro público en Supabase Auth | Un clic en el panel | Daniel (fuera del repo) |
| 1 | `REVOKE EXECUTE` de las 2 funciones RPC | Migración de una línea | PR normal |
| 5 | Magic bytes en los 2 uploads que faltan + quitar SVG del logo | Pequeño, reutiliza código existente | PR normal |
| 4 | Envolver `get_user_role()`/`es_rol_restringido()` en las políticas propias, empezando por `patients` | Mediano — tocar políticas de varias tablas | PR dedicado, con el mismo ensayo contra staging que ya se usa para toda migración |
| 3 | Subir Next.js 14 → 15/16 | Grande, disruptivo | PR propio, fuera de cualquier feature |
| — | Confirmar rotación de credenciales del 2026-09-25 | — | Daniel |
| — | Decidir `024_ai_usage_log.sql` | — | Daniel |

Ningún hallazgo de este informe se corrigió en esta rama — es solo el diagnóstico, como se pidió.
