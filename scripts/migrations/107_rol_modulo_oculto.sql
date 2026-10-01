-- ============================================================
-- Migración 107: módulos del menú que el administrador le oculta a un rol
--
-- Administración → Permisos: el administrador marca qué módulos del menú lateral ve cada rol, sin desplegar.
-- El código (src/lib/navegacion.ts) sigue diciendo qué módulos PUEDE ver cada rol; esta tabla solo guarda las
-- excepciones (lo que se le quitó). Sin filas = todo como en el código. Por eso un módulo nuevo aparece visible
-- para sus roles hasta que alguien lo oculte, y no se siembra nada.
--
-- Alcance: el menú y la redirección de rutas de la interfaz. NO toca la RLS: ocultar un módulo nunca da ni quita
-- acceso a datos en la base; solo puede restringir lo que la interfaz muestra.
--
-- El rol ADMIN no se configura (CHECK): así nadie se queda sin acceso a esta misma pantalla.
--
-- Quién puede qué: leer, cualquier usuario autenticado (el menú de cada persona la necesita); cambiar, solo ADMIN.
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS rol_modulo_oculto (
  role_codigo VARCHAR(40)  NOT NULL CHECK (role_codigo <> 'ADMIN'),
  href        VARCHAR(120) NOT NULL CHECK (href LIKE '/%'),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES auth.users(id),
  PRIMARY KEY (role_codigo, href)
);

ALTER TABLE rol_modulo_oculto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rol_modulo_oculto_select ON rol_modulo_oculto;
CREATE POLICY rol_modulo_oculto_select ON rol_modulo_oculto
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS rol_modulo_oculto_write ON rol_modulo_oculto;
CREATE POLICY rol_modulo_oculto_write ON rol_modulo_oculto
  FOR ALL TO authenticated
  USING (get_user_role() = 'ADMIN') WITH CHECK (get_user_role() = 'ADMIN');

-- Igual que la 091: si existe la política restrictiva de TECNICO/AEROPUERTO (076), esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('rol_modulo_oculto');
  END IF;
END $$;
