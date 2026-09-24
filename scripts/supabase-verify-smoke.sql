-- Verificación rápida en Supabase SQL Editor (solo lectura / metadatos).
-- Ejecutar después de npm run db:apply o de aplicar migraciones manualmente.

-- 1) Políticas RLS en public (debe devolver filas si RLS está definido)
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 2) Roles de aplicación esperados
SELECT id, codigo, nombre FROM public.roles ORDER BY codigo;

-- 3) Perfiles de usuario (ajustar límite si hay muchos)
SELECT up.id, up.user_id, r.codigo AS rol, up.email, up.activo
FROM public.user_profiles up
JOIN public.roles r ON r.id = up.role_id
ORDER BY up.id
LIMIT 50;

-- 4) Blindaje de los roles restringidos (TECNICO y AEROPUERTO, migración 076).
--    Tablas con RLS que NO tienen la política restrictiva `zz_rol_restringido`: debe devolver 0 filas.
--    Si sale alguna, un rol restringido podría leerla: correr SELECT aplicar_politica_rol_restringido('<tabla>');
SELECT * FROM public.tablas_sin_politica_rol_restringido();

-- 5) Tablas de public SIN RLS (PostgREST las expone a cualquier usuario autenticado). Debe devolver 0 filas,
--    salvo las que se hayan decidido públicas a propósito.
SELECT * FROM public.tablas_publicas_sin_rls();
