# Sistema de Gestión de Flotas de Ambulancias

Sistema completo de control de mantenimientos para flota de ambulancias desarrollado con Next.js 14, TypeScript, Tailwind CSS y Supabase. Incluye gestión de vehículos, mantenimientos, novedades, KPIs, consumo de combustible, carga masiva de datos y control de acceso por roles (RBAC).

**Documentación del proyecto:** este archivo (`README.md`) es la documentación principal. Aquí encontrarás la guía de ejecución, variables de entorno, módulos, tablas, estructura, arquitectura y stack tecnológico.

**Requisitos y roadmap vivo:** [PRD.md](PRD.md) (Product Requirement Document: capacidades del sistema, estado y registro de avance).

---

## 📌 Paso a paso: ejecutar la aplicación y testear

Sigue estos pasos cada vez que quieras levantar la app para ver cómo se ve y cómo funciona.

### 1. Abrir la carpeta del proyecto
Abre una terminal (PowerShell o CMD) y entra a la carpeta del proyecto:
```bash
cd "c:\Aeromanto"
```

### 2. Usar la versión correcta de Node.js (recomendado: 20 LTS o superior; mínimo según `package.json`: 20+)
Si usas **nvm-windows**:
```bash
nvm use 20
```
Comprueba con `node -v` (debe ser v20.x o superior).

### 3. Instalar dependencias (solo la primera vez o si cambió package.json)
```bash
npm install
```

### 4. Configurar variables de entorno (claves de Supabase)

La app se conecta a **Supabase** (base de datos en la nube). Esas claves van en un archivo que **no se sube a git**: `.env.local`.

**Opción A — Ya tienes un proyecto en Supabase**

1. **Crear el archivo `.env.local`** en la raíz del proyecto (misma carpeta donde está `package.json`).
   - En **Windows (PowerShell o CMD)**:
     ```powershell
     copy .env.local.example .env.local
     ```
   - Si estás en la carpeta del proyecto, eso crea `.env.local` a partir del ejemplo.

2. **Abrir `.env.local`** con el editor (Cursor, Notepad, etc.). Verás algo como:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Obtener los valores reales en Supabase:**
   - Entra a [supabase.com](https://supabase.com) e inicia sesión.
   - Abre tu proyecto (o crea uno nuevo).
   - Ve a **Settings** (engranaje) → **API**.
   - Ahí verás:
     - **Project URL** → ese valor va en `NEXT_PUBLIC_SUPABASE_URL`
     - **Project API keys** → **anon public** → ese valor va en `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Pegar en `.env.local`** (sin comillas, sin espacios extra):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   Guarda el archivo.

**Opción B — Aún no tienes Supabase (solo quieres ver la app)**

- Puedes **saltarte este paso** o dejar `.env.local` con los valores de ejemplo. La app **sí arrancará** y abrirá en el navegador; el dashboard mostrará números en cero y tablas vacías hasta que configures Supabase y ejecutes el esquema de la base de datos (ver sección *Instalación* más abajo).

**Comprobar que el archivo está bien**

- El archivo debe llamarse exactamente `.env.local` y estar en la raíz del proyecto (junto a `package.json`).
- No debe haber espacios antes del `=` ni después. Una sola variable por línea.

---

### 5. Levantar el servidor de desarrollo

1. Abre la **terminal** (PowerShell o CMD).
2. Ve a la **carpeta del proyecto** (donde está `package.json`):
   ```powershell
   cd "c:\Aeromanto"
   ```
   (Ajusta la ruta si tu proyecto está en otra ubicación.)
3. Ejecuta:
   ```powershell
   npm run dev
   ```
4. Espera a que aparezca en pantalla algo como:
   ```text
   ▲ Next.js 14.2.35
   - Local: http://localhost:3000
   ```
5. Si ves **"Port 3000 is in use"** y dice **3001**, usa entonces **http://localhost:3001** en el navegador.

### 6. Abrir en el navegador
- Abre **http://localhost:3000** (o el puerto que haya mostrado el paso 5).
- Si la página se queda cargando, espera hasta 8 segundos; si Supabase no responde, verás el dashboard con datos en cero.

### 7. Navegar y probar
- **Login:** inicio de sesión (requerido para acceder al sistema).
- **Dashboard:** resumen ejecutivo, costo por vehículo, disponibilidad, resolución de novedades.
- **Vehículos:** lista y detalle con perfil técnico completo.
- **Mantenimientos:** listado y formulario con selector de proveedores.
- **Novedades:** reportes e incidentes (Leve/Moderada/Severa).
- **KPIs:** métricas y gráficos.
- **Consumo:** km/gal y km recorridos por vehículo.
- **Regulación:** estado de flota en tiempo real, toggle Disponible/Fuera de servicio, asignar conductores.
- **Portal OVEM:** checklist preoperacional diario, kilometraje, reporte de novedades.
- **Configuración:** vehículos, centros de operaciones, proveedores, carga masiva.

### 8. Detener el servidor
En la terminal donde corre `npm run dev`, pulsa **Ctrl+C**.

### Comando alternativo si localhost no carga
Si el navegador no conecta a `localhost`, prueba:
```bash
npm run dev:host
```
Luego abre **http://127.0.0.1:3000**.

---

## Primer deploy hasta producción

Orden recomendado: **repo limpio sin secretos** → **Supabase alineado** → **Vercel con variables** → **smoke QA por rol**.

### 1. GitHub

- Confirmar que **`.gitignore`** excluye `.env.local`, `.env` y credenciales (ya configurado por defecto en este proyecto).
- Hacer commit del código y crear el remoto si aún no existe:
  ```bash
  git init
  git add -A
  git commit -m "chore: snapshot para deploy inicial"
  git branch -M main
  git remote add origin https://github.com/<org>/<repo>.git
  git push -u origin main
  ```
  Sustituir `<org>/<repo>` por tu organización y nombre del repositorio.

### 2. Supabase: migraciones y verificación rápida

- Con **PostgreSQL URI** (`DATABASE_URL` en `.env.local`, ver `.env.local.example`), aplicar desde la raíz del proyecto:
  ```bash
  npm run db:apply
  ```
  Eso ejecuta en orden `scripts/schema.sql`, `scripts/migrations/002_iteracion2.sql`, `scripts/migrations/003_rbac.sql` y `scripts/migrations/004_reserved_rls.sql` (placeholder sin cambios de RLS hasta que defináis políticas nuevas).
- Como alternativa equivalente al SQL Editor manual, podéis ejecutar cada archivo SQL en orden en Supabase (**desde estos archivos versionados**, sin duplicar reglas sólo desde el dashboard).
- **Verificación rápida RLS/perfiles**: en **SQL Editor** ejecutar [`scripts/supabase-verify-smoke.sql`](scripts/supabase-verify-smoke.sql) y comprobar que hay filas de políticas y que `roles` / `user_profiles` son coherentes.
- **Usuarios de prueba por rol**: crear cada usuario en **Authentication → Users** y enlazar perfil (`user_profiles.role_id`). Ejemplo (sustituir UUID y email tras crear el usuario en Auth):

  ```sql
  -- OVEM
  INSERT INTO user_profiles (user_id, role_id, nombre_completo, email, activo)
  VALUES ('<uuid-ovem>', (SELECT id FROM roles WHERE codigo = 'OVEM'), 'Usuario OVEM QA', 'ovem@test.local', true)
  ON CONFLICT (user_id) DO UPDATE SET role_id = EXCLUDED.role_id, activo = true;

  -- REGULACION
  INSERT INTO user_profiles (user_id, role_id, nombre_completo, email, activo)
  VALUES ('<uuid-reg>', (SELECT id FROM roles WHERE codigo = 'REGULACION'), 'Usuario Reg QA', 'regulacion@test.local', true)
  ON CONFLICT (user_id) DO UPDATE SET role_id = EXCLUDED.role_id, activo = true;

  -- GERENCIAL
  INSERT INTO user_profiles (user_id, role_id, nombre_completo, email, activo)
  VALUES ('<uuid-ger>', (SELECT id FROM roles WHERE codigo = 'GERENCIAL'), 'Usuario Gerencial QA', 'gerencial@test.local', true)
  ON CONFLICT (user_id) DO UPDATE SET role_id = EXCLUDED.role_id, activo = true;
  ```

- Para OVEM QA, asignar al menos un vehículo desde la app (**Regulación**) o mediante `vehicle_assignments` según tus datos seed.

### 3. Vercel

1. Crear proyecto en Vercel e importar el repositorio de GitHub (**rama producción**, normalmente `main`).
2. **Variables de entorno** (Production y Preview recomendadas):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Opcional pero necesaria si usáis alta de usuarios desde **Admin**: `SUPABASE_SERVICE_ROLE_KEY` (solo servidor de Vercel; nunca exponerla al cliente ni commitearla).
3. **Deploy**: el primer build debe estar en verde. El repositorio incluye [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (`lint` + `build`) con valores públicos ficticios sólo para CI; los entornos reales usan las claves de vuestro proyecto Supabase.

### 4. Checklist QA manual en producción (por rol)

Ejecutad sobre la URL de producción de Vercel con un usuario Auth + `user_profiles` por cada rol:

| Paso | OVEM | Regulación | Gerencial | Admin / SUPERADMIN |
|------|:----:|:----------:|:---------:|:------------------:|
| Login | ✓ | ✓ | ✓ | ✓ |
| Redirección inicial coherente (layout: OVEM fuerza `/ovem`) | ✓ | — | `/` sólo ejecutivo | — |
| Sidebar: elementos esperados según [PRD sección 6 — Matriz de acceso UI](PRD.md#6-matriz-de-acceso-ui-sidebar) | ✓ | ✓ | ✓ | ✓ |
| Escritura mínima propia del rol (checklist OVEM / toggle regulación / ver KPIs gerencial / alta usuario Admin con service_role) | ✓ | ✓ | lecturas | ✓ |

Si algo falla con **policy** o sin filas cuando deberían verse datos, revisar antes los datos (`user_profiles`, asignaciones) y sólo después las políticas RLS en staging.

---

## 🚀 Stack tecnológico, lenguajes y entornos

| Área | Tecnología |
|------|------------|
| **Framework** | Next.js 14.2+ (App Router, Server Components, Server Actions) |
| **Lenguaje** | TypeScript (strict mode) |
| **Estilos** | Tailwind CSS 3.4+ |
| **Base de datos** | Supabase (PostgreSQL 15+) |
| **Autenticación** | Supabase Auth (preparado; sesión refrescada en middleware) |
| **UI** | Shadcn/ui (Radix UI), Lucide React (iconos) |
| **Gráficos** | Recharts |
| **Validación** | Zod + React Hook Form + @hookform/resolvers |
| **Fechas** | date-fns |
| **Entorno desarrollo** | Node.js 20+ recomendado; npm |
| **Producción** | `next build` + `next start` |

## 🔧 Variables de entorno

Todas las variables se definen en **`.env.local`** (no se sube a git). Plantilla: **`.env.local.example`**.

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí (para datos) | URL del proyecto en Supabase (ej. `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí (para datos) | Clave anónima pública del proyecto (Supabase → Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | No (para crear usuarios) | Clave service_role para que Admin pueda crear usuarios desde la app (Supabase → Settings → API) |

- Si faltan o son incorrectas, la app arranca pero el dashboard puede mostrar ceros y tablas vacías; el middleware y las páginas tienen timeout para no colgar.
- El prefijo `NEXT_PUBLIC_` hace que la variable esté disponible en el navegador (cliente).

## 📦 Módulos y cómo se conectan

| Módulo | Ubicación | Conecta con |
|--------|-----------|-------------|
| **Middleware** | `src/middleware.ts` | Supabase Auth (refresco de sesión); redirige a `/login` si no hay sesión |
| **Supabase servidor** | `src/lib/supabase/server.ts` | Cookies (Next), `.env`; usado por Server Components y Server Actions |
| **Supabase cliente** | `src/lib/supabase/client.ts` | Navegador; para uso en componentes cliente |
| **Supabase admin** | `src/lib/supabase/admin.ts` | Service role key; para crear usuarios (Admin) |
| **Auth** | `src/app/api/actions/auth.ts` | Sesión, perfil, roles, signIn/signOut, gestión de usuarios |
| **Dashboard** | `src/app/(dashboard)/page.tsx` | Métricas: costo por vehículo, disponibilidad, resolución de novedades |
| **Vehículos** | `src/app/(dashboard)/vehiculos/` | CRUD con perfil completo; Server Actions en `vehiculos.ts` |
| **Mantenimientos** | `src/app/(dashboard)/mantenimientos/` | `mantenimientos.ts`; selector de proveedores |
| **Novedades** | `src/app/(dashboard)/novedades/` | `incidents.ts`; severidad Leve/Moderada/Severa |
| **KPIs** | `src/app/(dashboard)/kpis/` | Supabase + `kpi-dashboard.tsx` (Recharts) |
| **Consumo** | `src/app/(dashboard)/consumo/` | `consumo.ts`; km/gal, km recorridos, fuel_logs |
| **Regulación** | `src/app/(dashboard)/regulacion/` | Toggle estado flota, asignar OVEM a vehículos |
| **Portal OVEM** | `src/app/(dashboard)/ovem/` | Checklist diario, kilometraje, novedades (vehículos asignados) |
| **Admin usuarios** | `src/app/(dashboard)/admin/usuarios/` | Crear usuarios, asignar roles, habilitar/deshabilitar |
| **Configuración** | `src/app/(dashboard)/configuracion/` | Vehículos, centros, proveedores, carga masiva (Excel/CSV) |
| **Validaciones** | `src/lib/validations.ts` | Schemas Zod (vehicle, supplier, maintenance, incident, etc.) |

Flujo típico: **Navegador** → **Next.js (middleware → layout → page)** → **Server Actions o fetch en Server Component** → **Supabase (PostgreSQL)**.

## 📋 Requisitos previos

- Node.js 20+ 
- npm o yarn
- Cuenta de Supabase

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd Aeromanto
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.local.example .env.local
```

Editar `.env.local` y agregar tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

4. **Crear la base de datos**
   - Opción recomendada: **desde la raíz del proyecto**, con `DATABASE_URL` en `.env.local`, ejecutar `npm run db:apply` (aplica `schema.sql`, `002`, `003` y `004_reserved_rls.sql` en orden).
   - Opción manual: en Supabase Dashboard > SQL Editor, ejecutar en orden el contenido de:
     1. `scripts/schema.sql` — tablas base
     2. `scripts/migrations/002_iteracion2.sql` — centros operativos, proveedores, fuel_logs, perfil vehículos
     3. `scripts/migrations/003_rbac.sql` — roles, user_profiles, vehicle_assignments, daily_checks
     4. `scripts/migrations/004_reserved_rls.sql` — placeholder (sin políticas nuevas por ahora; reserva el hueco para una futura reescritura RLS revisada).
   - Tras aplicar migraciones podéis usar [`scripts/supabase-verify-smoke.sql`](scripts/supabase-verify-smoke.sql) en SQL Editor como comprobación rápida.

5. **Crear el primer usuario Admin**
   - En Supabase: Authentication > Users > Add user (email + contraseña)
   - Copiar el UUID del usuario creado
   - Ejecutar en SQL Editor:
     ```sql
     INSERT INTO user_profiles (user_id, role_id, nombre_completo, email, activo)
     VALUES ('<UUID>', (SELECT id FROM roles WHERE codigo='ADMIN'), 'Administrador', 'admin@ejemplo.com', true);
     ```

6. **Poblar categorías de mantenimiento**
```bash
npx tsx scripts/seed-categorias.ts
```

7. **Ejecutar el servidor de desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del proyecto y arquitectura

- **App Router (Next.js 14):** rutas en `src/app/`. `layout.tsx` envuelve toda la app; `(dashboard)` es un *route group* con su propio layout (sidebar dinámico por rol).
- **Rutas públicas:** `/login` (inicio de sesión), `/pending` (usuario sin rol asignado).
- **Rutas protegidas:** `/`, `/vehiculos`, `/vehiculos/[id]`, `/mantenimientos`, `/mantenimientos/nuevo`, `/novedades`, `/kpis`, `/consumo`, `/regulacion`, `/ovem`, `/configuracion`, `/admin/usuarios`.
- **Navegación por rol:** OVEM no ve Dashboard gerencial; Gerencial solo ve Dashboard, KPIs y Consumo (read-only); Regulación ve flota y asignaciones; Admin ve todo.
- **Server vs Client:** la mayoría de páginas son Server Components; formularios y partes interactivas usan `"use client"` y llaman Server Actions en `src/app/api/actions/`.
- **Estilos:** Tailwind; componentes en `src/components/ui/` (Shadcn); utilidad `cn()` en `src/lib/utils.ts`.

```
src/
  app/
    layout.tsx                 # Layout raíz (fuente Inter, metadata)
    login/page.tsx             # Inicio de sesión
    pending/page.tsx           # Usuario sin rol asignado
    (dashboard)/
      layout.tsx               # Sidebar dinámico por rol + logout
      page.tsx                 # Dashboard principal (/)
      vehiculos/, mantenimientos/, novedades/, kpis/, consumo/
      regulacion/page.tsx      # Estado flota + asignar OVEM
      ovem/page.tsx            # Portal conductores
      configuracion/page.tsx   # Tabs: vehículos, centros, proveedores, carga masiva
      admin/usuarios/page.tsx  # Gestión de usuarios (Admin)
    api/actions/               # auth, mantenimientos, incidents, vehiculos, centros,
                               # proveedores, carga-masiva, consumo, dashboard-metrics,
                               # ovem, regulacion
  components/
    ui/                        # Shadcn: button, card, table, dialog, select...
    dashboard/                 # vehicle-status-card, incident-form, costo-por-vehiculo-card...
    forms/                     # maintenance-form, vehicle-form
    configuracion/             # configuracion-tabs, vehiculos-tab, centros-tab...
    consumo/                   # consumo-cliente
    regulacion/                # regulacion-fleet
    ovem/                      # ovem-portal
    admin/                     # admin-usuarios
    charts/                    # kpi-dashboard (Recharts)
  lib/
    supabase/                  # server.ts, client.ts, admin.ts, middleware.ts, database.types.ts
    utils.ts, validations.ts, constants.ts
  types/index.ts
  middleware.ts                # Refresco sesión + redirección a /login si no autenticado
```

## 🎯 Funcionalidades principales

### Autenticación y RBAC
- Login con Supabase Auth
- Roles: **OVEM** (conductores), **Admin**, **Regulación**, **Gerencial**
- Navegación y permisos diferenciados por rol
- Página `/pending` para usuarios sin rol asignado

### Dashboard
- Resumen ejecutivo con métricas clave
- Costo por vehículo, disponibilidad (95 %), resolución de novedades
- Tabla de estado de flota
- Alertas de documentos próximos a vencer
- Alertas de mantenimientos próximos

### Gestión de Vehículos
- CRUD completo con perfil técnico (placa, centro, proveedor, combustible)
- Lista con filtros por estado y búsqueda
- Detalle con historial de mantenimientos y novedades
- Cambio de estado operativo (Regulación)

### Centros de operaciones y proveedores
- CRUD de centros operativos
- CRUD de proveedores (asociados a mantenimientos)
- Carga masiva Excel/CSV

### Mantenimientos
- Registro preventivos y correctivos con categorías dinámicas
- Selector de proveedores (incluye opción "Crear nuevo")
- Validación de kilometraje incremental
- Cierre automático de novedades
- Historial completo con filtros

### Novedades e Incidentes
- Reporte con severidad Leve/Moderada/Severa
- Gestión de estados (Abierto, En Proceso, Cerrado)
- Métricas de tiempo de resolución
- Impacto en operatividad

### Consumo de combustible
- Registro de fuel_logs (km/gal, km recorridos)
- Gráficos y filtros por vehículo y período

### Portal OVEM (conductores)
- Checklist preoperacional diario
- Registro de kilometraje
- Reporte de novedades (solo vehículos asignados)

### Regulación
- Vista de flota en tiempo real
- Toggle Disponible / Fuera de servicio
- Asignación de conductores OVEM a vehículos

### Admin
- Gestión de usuarios (crear, cambiar rol, habilitar/deshabilitar)
- Requiere `SUPABASE_SERVICE_ROLE_KEY` para crear usuarios

### KPIs y Métricas
- Tasa de Disponibilidad (Uptime)
- TCO (Total Cost of Ownership)
- Ratio Preventivo/Correctivo
- Tiempo Medio de Resolución
- Gráficos interactivos con Recharts

## 🔒 Seguridad

El proyecto utiliza Row Level Security (RLS) de Supabase. Las políticas están configuradas en el script `schema.sql`. Ajustar según los requisitos de autenticación y roles de usuario.

## 📝 Scripts disponibles

| Comando | Uso |
|--------|-----|
| `npm run dev` | Servidor de desarrollo (http://localhost:3000) |
| `npm run dev:host` | Igual que dev pero escuchando en 0.0.0.0 (usar si localhost no conecta) |
| `npm run build` | Construir para producción |
| `npm run start` | Servidor de producción (tras `npm run build`) |
| `npm run lint` | Ejecutar ESLint |

## 🗄️ Base de datos y tablas

Esquema definido en **`scripts/schema.sql`** y migraciones **`scripts/migrations/002_iteracion2.sql`**, **`003_rbac.sql`** (ejecutar en orden en Supabase SQL Editor). Tipos TypeScript en **`src/lib/supabase/database.types.ts`**.

| Tabla | Descripción | Relaciones principales |
|-------|-------------|------------------------|
| **vehicles** | Maestro de vehículos (placa, modelo, centro, proveedor, combustible, estado, vencimientos SOAT/RTM) | FK a operational_centers, suppliers; referenciada por maintenance_records, incidents, mileage_logs, fuel_logs |
| **operational_centers** | Centros de operaciones | Referenciada por vehicles |
| **suppliers** | Proveedores de mantenimiento | Referenciada por vehicles, maintenance_records |
| **maintenance_categories** | Categorías de mantenimiento (nombre, grupo, tipo preventivo/correctivo) | Referenciada por maintenance_records, maintenance_schedule |
| **maintenance_records** | Historial de mantenimientos (vehículo, fecha, km, tipo, valor, proveedor, incidente asociado) | FK a vehicles, maintenance_categories, suppliers, incidents (opcional) |
| **incidents** | Novedades/incidentes (vehículo, descripción, severidad, estado, tiempo_resolucion_horas, mantenimiento de cierre) | FK a vehicles; maintenance_records puede referir incident_id |
| **mileage_logs** | Registro de kilometrajes por vehículo y fecha (una lectura por día) | FK a vehicles |
| **fuel_logs** | Registro de combustible (litros, km, km/gal) | FK a vehicles |
| **maintenance_schedule** | Plantilla de tareas (nombre, categoría, frecuencia km/meses) | FK a maintenance_categories |
| **roles** | Roles del sistema (OVEM, Admin, Regulación, Gerencial) | Referenciada por user_profiles |
| **user_profiles** | Perfil extendido (user_id, role_id, nombre, email, activo) | FK a auth.users, roles |
| **vehicle_assignments** | Asignación OVEM ↔ vehículo | FK a user_profiles, vehicles |
| **daily_checks** | Checklist preoperacional diario | FK a vehicles, user_profiles |

**Enums:** `vehicle_status`, `maintenance_type`, `severity_level`, `incident_status`, `operational_center`.

### Triggers importantes

1. **Actualización automática de estado**: Cuando se crea un incidente que afecta la operatividad, el vehículo se marca como FUERA_DE_SERVICIO automáticamente.

2. **Validación de kilometraje**: Previene registros de kilometraje menores al último registrado.

## 🚧 Próximas Mejoras

- [x] Autenticación con Supabase Auth
- [x] Roles y permisos (RBAC: OVEM, Admin, Regulación, Gerencial)
- [ ] Notificaciones de vencimientos
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Programa de mantenimiento configurable
- [ ] Alertas de mantenimiento próximo por kilometraje

## 📄 Licencia

Este proyecto es privado y de uso interno.

## 👥 Soporte

Para soporte técnico, contactar al equipo de desarrollo.
