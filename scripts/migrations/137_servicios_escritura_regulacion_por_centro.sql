-- ============================================================
-- Migración 137: Regulación no puede crear ni mover un servicio fuera de lo que ve (hallazgo de auditoría de Regulación)
--
-- La 127 recortó la LECTURA de `medical_services` por centro y ciudad, pero las escrituras (046 para INSERT, 055 para
-- UPDATE) solo miran el rol. Un regulador de Medellín podía insertar un servicio con centro de Bogotá, o cambiar el
-- centro de uno existente, y la fila dejaba de verse sin que nadie lo bloqueara.
--
-- Regla: para REGULACION, el WITH CHECK exige que la fila resultante sea una que él mismo puede leer (la misma
-- condición de la 127). Así una escritura no puede sacar una fila de su alcance. Los demás roles no cambian.
-- ADMIN y ANALISTA siguen sin recorte. Las demás condiciones de 046 y 055 (candado de FINALIZADO, OVEM/MEDICO/AUXILIAR)
-- se copian tal cual.
--
-- Efecto en la aplicación: `centroDelServicio` ya asigna el centro del móvil si el regulador lo ve, y si no, el del
-- propio usuario. Un INSERT normal sigue pasando.
--
-- No destructiva (solo reemplaza políticas), idempotente. Rollback: recrear la política de la 046 (INSERT) y de la 055
-- (UPDATE) y `DROP FUNCTION public.servicio_visible_para_mi(integer, text)`.
-- ============================================================

-- Mismo criterio que la lectura de `medical_services` en la 127 (ver `prefijo_ciudad_de_mi_centro`).
CREATE OR REPLACE FUNCTION public.servicio_visible_para_mi(p_centro_id integer, p_ciudad_registro text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT (SELECT get_user_center()) IS NULL
    OR p_centro_id = (SELECT get_user_center())
    OR (
      p_centro_id IS NULL
      AND (
        (SELECT prefijo_ciudad_de_mi_centro()) IS NULL
        OR p_ciudad_registro ILIKE (SELECT prefijo_ciudad_de_mi_centro()) || '%'
      )
    );
$$;
REVOKE ALL ON FUNCTION public.servicio_visible_para_mi(integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.servicio_visible_para_mi(integer, text) TO authenticated, service_role;

DROP POLICY IF EXISTS medical_services_insert ON medical_services;
CREATE POLICY medical_services_insert ON medical_services
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('ADMIN','REGULACION','MEDICO','AUXILIAR_ENFERMERIA','ANALISTA')
    AND (
      get_user_role() <> 'REGULACION'
      OR servicio_visible_para_mi(operational_center_id, ciudad_registro)
    )
  );

-- USING igual al de la 055 (candado de FINALIZADO incluido). Solo cambia el WITH CHECK de ADMIN/REGULACION/ANALISTA.
DROP POLICY IF EXISTS medical_services_update ON medical_services;
CREATE POLICY medical_services_update ON medical_services
  FOR UPDATE TO authenticated
  USING (
    CASE
      WHEN etapa = 'FINALIZADO' THEN get_user_role() IN ('ADMIN','ANALISTA','REGULACION')
      ELSE (
        get_user_role() IN ('ADMIN','REGULACION','ANALISTA')
        OR (get_user_role() = 'OVEM' AND ovem_user_id = auth.uid())
        OR (get_user_role() = 'MEDICO' AND medico_user_id = auth.uid())
        OR (get_user_role() = 'AUXILIAR_ENFERMERIA' AND auxiliar_user_id = auth.uid())
      )
    END
  )
  WITH CHECK (
    (
      get_user_role() IN ('ADMIN','REGULACION','ANALISTA')
      AND (
        get_user_role() <> 'REGULACION'
        OR servicio_visible_para_mi(operational_center_id, ciudad_registro)
      )
    )
    OR (get_user_role() = 'OVEM' AND ovem_user_id = auth.uid())
    OR (get_user_role() = 'MEDICO' AND medico_user_id = auth.uid())
    OR (get_user_role() = 'AUXILIAR_ENFERMERIA' AND auxiliar_user_id = auth.uid())
  );
