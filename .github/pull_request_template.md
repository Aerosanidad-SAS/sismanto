## Qué y por qué

<!-- Una sola preocupación por PR. Enlaza el hallazgo, issue o conversación que lo origina. -->

## Roles afectados

<!-- ADMIN · ANALISTA · REGULACION · COORDINACION · GERENCIAL · MANTENIMIENTO · OVEM · MEDICO · AUXILIAR_ENFERMERIA · VISTA -->

## Migraciones

- [ ] No incluye migraciones
- [ ] Incluye migración `0NN_...sql`, número verificado contra `origin/dev` justo antes de abrir el PR
- [ ] Registrada en `scripts/apply-database.ts`
- [ ] Destructiva (DROP / cambio de tipo) → el título lleva `[DB-DESTRUCTIVE]`

> `dev` y `staging` comparten la misma Supabase: no se aplica `npm run db:apply` hasta que el PR esté mergeado.

## Verificación

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npx tsc --noEmit` sin errores **nuevos** en los archivos tocados (pega el filtro)
- [ ] Cambio visual: captura del resultado renderizado
- [ ] Probado con un usuario de cada rol afectado

## Checklist

- [ ] Rama `feat/<nombre>-<tema>` o `fix/<nombre>-<tema>` creada desde `dev` y rebaseada hoy
- [ ] Sin datos reales de pacientes ni de personal (CSV del ETL, cédulas, correos)
