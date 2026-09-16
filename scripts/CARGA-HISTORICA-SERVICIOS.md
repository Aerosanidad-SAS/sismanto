# Cargar la base de datos de SISRES a SISRES V2

Herramienta: `scripts/etl-sisres.ts`. Se conecta directo por Postgres al proyecto de
Supabase indicado en `DATABASE_URL` e inserta los datos exportados de SISRES. Es la
misma herramienta para los ensayos en staging y para el corte final.

## 0. Antes de empezar

- La base de destino debe tener aplicada la migración **058** (`npm run db:apply`).
  Sin ella el ETL falla al primer upsert (no existe `sisres_id`).
- Para ensayos, `DATABASE_URL` apunta a **staging** (`SISRES_V2_Staging`). Producción
  solo el día del corte, según el runbook del plan.
- Los CSV y los archivos de rechazos/avisos contienen **datos clínicos y personales
  reales**: no se suben a git ni se dejan en carpetas compartidas.

## 1. Exportar desde SISRES

León corre en el servidor de SISRES:

```bash
php sql/generar_csv_etl.php <carpeta_salida>
```

Genera los CSV con los nombres que espera el ETL: `clientes`, `cie10`, `eps`,
`proveedores`, `paciente`, `movil`, `inventario`, `servicios`, `valoraciones`,
`mantenimiento`. Si falta alguno, el ETL omite esa tabla y sigue.

`servicios`, `proveedores`, `valoraciones` y `mantenimiento` **deben traer la columna
`id`**: sin ella la fila se rechaza, porque no se podría re-ejecutar sin duplicar.

## 2. Configurar `DATABASE_URL`

En `.env.local` (raíz de `aeromanto/`):

```
DATABASE_URL=postgresql://...
```

Sale de **Supabase Dashboard → proyecto → Project Settings → Database → Connection
string → URI**. No es lo mismo que `NEXT_PUBLIC_SUPABASE_URL`. El ETL imprime el host
de destino al arrancar: confírmalo antes de dejarlo seguir.

## 3. Ensayo en seco

```bash
npx tsx scripts/etl-sisres.ts ./etl-data --validar
```

Corre la carga completa dentro de una transacción y la revierte al final: valida
contra las restricciones reales de la base sin dejar nada escrito. Revisa:

- los conteos por tabla;
- `etl-rechazos-<tabla>.csv`: filas que no se cargarían, con el motivo;
- `etl-avisos-<tabla>.csv`: filas que sí se cargan pero con algún campo vacío porque
  el valor original no se pudo leer (fechas o números en formatos no reconocidos);
- las placas sin vehículo en V2 y los servicios sin paciente en el maestro.

Si aparece el aviso de *servicios sin sisres_id ni created_by*, en esa base quedaron
filas de una carga con la versión anterior del ETL: se duplicarían. Confírmalo con
Daniel antes de borrarlas.

## 4. Carga real

```bash
npx tsx scripts/etl-sisres.ts ./etl-data
```

Orden: clientes → cie10 → eps → proveedores → pacientes → móviles → inventario →
servicios → valoraciones → mantenimientos. Cada tabla va en su propia transacción: si
algo falla fuera de una fila, esa tabla se revierte completa.

Se puede **correr las veces que haga falta**: cada tabla actualiza por `sisres_id` o
por su clave natural. Un segundo export más reciente solo actualiza lo que cambió.

## 5. Verificar

Compara contra MySQL:

```sql
select count(*) from medical_services where sisres_id is not null;
select etapa, count(*) from medical_services group by etapa order by 2 desc;
select tipo_servicio, count(*) from medical_services group by tipo_servicio order by 2 desc;
```

Las distribuciones deben coincidir con las de SISRES (`RESPUESTAS_LEON.md`, Ronda 2).
Revisa también la hora: un servicio programado a las 08:00 en SISRES debe verse a las
08:00 en V2.

## 6. Avisar a Daniel

Repórtale los conteos finales y el número de filas en rechazos y avisos, para decidir
si hace falta limpieza antes del siguiente ensayo.
