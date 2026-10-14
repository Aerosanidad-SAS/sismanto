-- ============================================================
-- Migración 133: todos los campos de usuario de SISRES en SISMANTO (`user_profile_extra`)
--
-- SISRES guarda en `usuarios`: usuario, passwords, tipoDocumento, identificacion, nombre1, nombre2, apellido1, apellido2,
-- fechaNacimiento, rh, cargo, registro, celular, correo, departamento, ciudad, estado.
-- `user_profiles` ya cubre cédula, nombre completo, correo, ciudad, rol (cargo) y activo (estado). Esta tabla agrega lo
-- que no tenía dónde vivir: tipo de documento, nombres y apellidos por separado, fecha de nacimiento, RH, celular,
-- departamento y fecha de registro, más el id y el usuario de SISRES para trazabilidad e idempotencia del ETL.
--
-- Por qué una tabla aparte y no más columnas en `user_profiles`: la política de lectura de `user_profiles` deja ver
-- TODAS las filas a ADMIN, ANALISTA y REGULACION. RH, fecha de nacimiento y celular son datos personales sensibles que
-- no deben quedar a la vista de Regulación. Aquí solo leen el propio usuario y el ADMIN.
--
-- No se migra `passwords` (decisión de León/David: entran por «olvidé mi contraseña») ni los contadores de intentos de
-- SISRES (`intentos_fallidos`, `bloqueado_hasta`): Supabase Auth tiene los suyos.
--
-- No destructiva, idempotente. Rollback: DROP TABLE IF EXISTS public.user_profile_extra;
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_profile_extra (
  user_id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sisres_id             integer UNIQUE,
  sisres_usuario        varchar(50),
  tipo_documento        varchar(60),
  primer_nombre         varchar(100),
  segundo_nombre        varchar(100),
  primer_apellido       varchar(100),
  segundo_apellido      varchar(100),
  fecha_nacimiento      date,
  rh                    varchar(10),
  celular               varchar(30),
  departamento          varchar(100),
  fecha_registro_sisres date,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_profile_extra IS
  'Campos de usuario de SISRES sin columna en user_profiles. Datos personales sensibles: solo el propio usuario y ADMIN.';

ALTER TABLE public.user_profile_extra ENABLE ROW LEVEL SECURITY;

-- Sin sesión no se ve ni se escribe nada (la 132 ya quita la escritura de `anon` por defecto; aquí también la lectura).
REVOKE ALL ON public.user_profile_extra FROM anon;

DROP POLICY IF EXISTS user_profile_extra_select ON public.user_profile_extra;
CREATE POLICY user_profile_extra_select ON public.user_profile_extra
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (SELECT get_user_role()) = 'ADMIN'
  );

-- Escribe solo el ADMIN (y el ETL con la llave de servicio, que no pasa por RLS).
DROP POLICY IF EXISTS user_profile_extra_admin ON public.user_profile_extra;
CREATE POLICY user_profile_extra_admin ON public.user_profile_extra
  FOR ALL TO authenticated
  USING ((SELECT get_user_role()) = 'ADMIN')
  WITH CHECK ((SELECT get_user_role()) = 'ADMIN');

-- Igual que las demás tablas nuevas: que la política restrictiva de TECNICO/AEROPUERTO (076) también la cubra.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('user_profile_extra');
  END IF;
END $$;
