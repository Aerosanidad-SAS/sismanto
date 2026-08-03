# Cargar ~35.000 servicios históricos a staging

Herramienta ya existente: `scripts/etl-sisres.ts`. Se conecta directo por Postgres al
proyecto de Supabase de **staging** (`SISMANTO_Staging`) e inserta los datos exportados
de SISRES. No hay que programar nada nuevo — solo seguir estos pasos.

## 0. Antes de empezar

- Esto escribe en la base de **staging** (`SISMANTO_Staging`), la misma que usan `dev` y
  `staging` de la app. **Nunca** apuntes esto a producción.
- Necesitas acceso al Supabase Dashboard del proyecto `SISMANTO_Staging`.

## 1. Reunir los CSV exportados de SISRES

Desde phpMyAdmin: **Exportar → CSV, con fila de encabezados**. Guarda los archivos en una
carpeta nueva dentro del repo, por ejemplo `./etl-data/` (no la subas a git).

- `servicios.csv` — el que importa para esta carga (los 35 mil servicios ya prestados).
- `paciente.csv` — recomendado. Si un servicio trae `cedula` y esa cédula no aparece en
  `paciente.csv`, el servicio se carga igual (queda solo con el nombre, sin paciente
  enlazado) — no es bloqueante, pero enlazar es mejor.
- Opcionales (si no los tienes, el script los omite solo y sigue sin fallar):
  `clientes.csv`, `cie10.csv`, `movil.csv`, `valoraciones.csv`, `inventario.csv`,
  `mantenimiento.csv`.

## 2. Configurar `DATABASE_URL`

En tu `.env.local` (raíz del proyecto `aeromanto/`), agrega:

```
DATABASE_URL=postgresql://...
```

Ese valor lo sacas de: **Supabase Dashboard → proyecto `SISMANTO_Staging` → Project
Settings → Database → Connection string → modo "URI"** (con la contraseña incluida).

⚠️ **No es lo mismo que `NEXT_PUBLIC_SUPABASE_URL`** (ese es para el cliente JS de la app).
`DATABASE_URL` es la conexión directa de Postgres que usa este script — verifica dos veces
que el proyecto que copiaste sea `SISMANTO_Staging`, no producción.

## 3. Revisar si `medical_services` ya tiene datos en staging

El script tiene una guarda de seguridad: **si la tabla `medical_services` no está vacía, se
salta toda la carga de servicios** (solo imprime un aviso, no falla). Antes de correrlo, en
el SQL Editor de Supabase (proyecto staging) ejecuta:

```sql
select count(*) from medical_services;
```

- Si da `0` → puedes seguir directo al paso 4.
- Si da `> 0` → probablemente hay datos de prueba de la app. **Antes de vaciarla, confírmalo
  con Daniel** — vaciar significa:
  ```sql
  truncate medical_services;
  ```
  Esto borra lo que haya ahí en ese momento. No lo hagas sin luz verde de Daniel.

## 4. Ejecutar la carga

Desde la raíz del proyecto (`aeromanto/`):

```bash
npx tsx scripts/etl-sisres.ts ./etl-data
```

(cambia `./etl-data` por la ruta real de tu carpeta con los CSV).

El script carga en este orden: clientes → cie10 → pacientes → móviles → inventario →
**servicios** → valoraciones → mantenimientos, y al final imprime los conteos por tabla.

No tiene modo `--dry-run` — corre directo. Por eso el paso 3 (conteo antes) importa: te da
un punto de comparación.

## 5. Verificar después

```sql
select count(*) from medical_services;
```

Debería acercarse a los ~35.000 (puede ser un poco menos si hay filas del CSV sin `cedula`
válida u otros datos incompletos que el script descarta silenciosamente — el log de la
consola al final dice cuántas quedaron "sin match de paciente", que es distinto de
"descartadas").

Si algo sale mal o los números no cuadran, no vuelvas a correr el script sin antes vaciar
`medical_services` de nuevo — como no tiene clave natural en esa tabla, correrlo dos veces
sobre datos ya cargados duplicaría todo.

## 6. Avisar a Daniel

Cuando termine, repórtale el conteo final y cualquier advertencia que haya salido en
consola (placas huérfanas, servicios sin paciente, etc.) para que decida si hace falta
limpieza adicional.
