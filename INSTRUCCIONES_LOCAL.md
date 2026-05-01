# Instrucciones paso a paso para correr el sistema en tu máquina local

Sigue estos pasos en orden. Si algo falla, revisa la sección de **Problemas frecuentes** al final.

---

## Paso 1: Tener Node.js instalado

1. Abre **https://nodejs.org** y descarga la versión **LTS** (recomendado 20.x).
2. Instala Node.js (marca la opción para agregar al PATH si te la ofrece).
3. Abre **PowerShell** o **CMD** y verifica:
   ```bash
   node -v
   npm -v
   ```
   Debes ver números de versión (ej: `v20.x.x` y `10.x.x`).

---

## Paso 2: Abrir la carpeta del proyecto

1. Abre la carpeta del proyecto en tu PC:
   ```
   Aeromanto
   ```
   (La que contiene `package.json` y la carpeta `src`.)

2. Abre una terminal **dentro de esa carpeta**:
   - En VS Code/Cursor: menú **Terminal → Nueva terminal**.
   - O en Explorador de archivos: escribe `cmd` en la barra de ruta y Enter.

---

## Paso 3: Instalar dependencias del proyecto

En la terminal, ejecuta:

```bash
npm install
```

Espera a que termine (puede tardar 1–2 minutos). No debe haber errores en rojo.

---

## Paso 4: Crear un proyecto en Supabase (si aún no tienes uno)

1. Entra a **https://supabase.com** e inicia sesión (o crea cuenta).
2. Pulsa **“New project”**.
3. Elige tu organización (o crea una).
4. Completa:
   - **Name:** por ejemplo `aeromanto`.
   - **Database Password:** inventa una contraseña fuerte y **guárdala**.
   - **Region:** elige la más cercana (ej: South America).
5. Pulsa **“Create new project”** y espera 1–2 minutos.

---

## Paso 5: Obtener la URL y la clave anónima de Supabase

1. En el proyecto de Supabase, entra a **Project Settings** (icono de engranaje).
2. En el menú izquierdo, entra a **API**.
3. Copia y guarda en un bloc de notas:
   - **Project URL** (algo como `https://xxxxx.supabase.co`).
   - **anon public** (clave larga bajo “Project API keys”).

---

## Paso 6: Crear el archivo de variables de entorno

1. En la carpeta del proyecto (`Aeromanto`), busca el archivo **`.env.local.example`**.
2. Cópialo y renómbralo a **`.env.local`** (sin “.example”).
   - En PowerShell:
     ```bash
     copy .env.local.example .env.local
     ```
3. Abre **`.env.local`** con un editor de texto.
4. Sustituye los valores de ejemplo por los tuyos:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_public_aqui
   ```
5. Guarda el archivo.

---

## Paso 7: Crear las tablas en la base de datos (Supabase)

1. En Supabase, entra a **SQL Editor** (icono de “</>” en el menú).
2. Pulsa **“New query”**.
3. Abre en tu PC el archivo **`scripts/schema.sql`** (está dentro de la carpeta del proyecto).
4. Copia **todo** el contenido de `schema.sql`.
5. Pégalo en el editor SQL de Supabase.
6. Pulsa **“Run”** (o Ctrl+Enter).
7. Debe decir que la consulta se ejecutó correctamente. Si aparece un error, cópialo y revísalo (a veces hay que ejecutar solo una parte si ya existen algunos objetos).

---

## Paso 8: Poblar las categorías de mantenimiento (seed)

En la terminal, **dentro de la carpeta del proyecto**, ejecuta:

```bash
npx tsx scripts/seed-categorias.ts
```

Debe aparecer algo como: `Insertadas XX categorías` o `Seed completado exitosamente`.

Si sale error de variables de entorno, revisa que **`.env.local`** esté en la raíz del proyecto y que **NEXT_PUBLIC_SUPABASE_URL** y **NEXT_PUBLIC_SUPABASE_ANON_KEY** estén bien pegados.

---

## Paso 9: Arrancar el servidor de desarrollo

En la misma terminal ejecuta:

```bash
npm run dev
```

Deberías ver algo como:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

---

## Paso 10: Abrir el sistema en el navegador

1. Abre el navegador (Chrome, Edge, etc.).
2. Ve a: **http://localhost:3000**
3. Deberías ver el dashboard del sistema (sidebar a la izquierda y contenido principal).

Para **detener** el servidor: en la terminal pulsa **Ctrl + C**.

---

## Resumen rápido (cuando ya tengas todo configurado)

```bash
cd Aeromanto
npm install
# .env.local ya creado y schema.sql ya ejecutado en Supabase
npx tsx scripts/seed-categorias.ts
npm run dev
```

Luego abre **http://localhost:3000**.

---

## Problemas frecuentes

| Problema | Qué hacer |
|----------|-----------|
| `node` no se reconoce | Instala Node.js (Paso 1) y cierra/abre la terminal. |
| Error al hacer `npm install` | Asegúrate de estar en la carpeta donde está `package.json`. Prueba borrar la carpeta `node_modules` y volver a ejecutar `npm install`. |
| `NEXT_PUBLIC_SUPABASE_URL is undefined` | Crea o revisa `.env.local` en la raíz del proyecto (Pasos 5 y 6). Reinicia el servidor (`Ctrl+C` y luego `npm run dev`). |
| Error de RLS o permisos en Supabase | En Supabase → SQL Editor, ejecuta las políticas que están al final de `scripts/schema.sql`. Si usas solo anon key, las políticas deben permitir acceso (por ejemplo `USING (true)`). |
| La página en blanco o error 500 | Abre la consola del navegador (F12) y la terminal donde corre `npm run dev`; el mensaje de error suele indicar si falta tabla, variable de entorno o política en Supabase. |
| Puerto 3000 en uso | Puedes usar otro puerto: `npm run dev -- -p 3001` y abrir **http://localhost:3001**. |

Si sigues estos pasos y algo falla, indica en qué paso estás y el mensaje de error exacto (terminal o navegador) para poder afinar la solución.
