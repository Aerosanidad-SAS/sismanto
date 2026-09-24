-- ============================================================
-- Migración 066: Soporte técnico (tickets) — gestión por técnicos
--
-- Continúa la 065. Porta las acciones de includes/actualizarTicket.php de
-- SISRES (tomar, contacto, cambio de estado, cambio de prioridad), la búsqueda
-- de usuarios para registrar un ticket a nombre de otra persona
-- (buscarUsuarioTicketAjax.php) y el borrado de tickets (act_eliminar_ticket).
--
-- Cada acción es una función SECURITY DEFINER que valida el rol y las reglas
-- del flujo, cambia el ticket y escribe el historial en UNA transacción. Los
-- usuarios siguen sin UPDATE directo sobre tickets (ver 065): no hay forma de
-- saltarse el flujo llamando la API a mano.
--
-- Reglas (idénticas a SISRES):
--   · Gestor = es_gestor_tickets() (ADMIN, ANALISTA, COORDINACION).
--   · Tomar: cualquier gestor, solo si nadie lo ha tomado.
--   · Contacto y cambio de estado: SOLO el técnico asignado.
--   · ABIERTO → EN_PROCESO → RESUELTO. Resolver exige solución y CIERRA el
--     ticket en el acto (el solicitante puede reabrirlo). No hay RESUELTO
--     "esperando confirmación": es un vestigio de SISRES que ya no se usa.
--   · Prioridad: cualquier gestor, mientras no esté RESUELTO/CERRADO.
--   · Borrar: solo ADMIN.
--
-- Idempotente.
-- ============================================================

-- Nombre visible de un usuario para el historial y los campos de nombre.
CREATE OR REPLACE FUNCTION public.ticket_nombre_usuario(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(NULLIF(btrim(up.nombre_completo), ''), up.email, '—')
    FROM user_profiles up WHERE up.user_id = p_user_id LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.ticket_nombre_usuario(UUID) FROM PUBLIC;
-- Solo la usan las funciones de abajo (definer) y el servidor; no se expone a la API.
-- Las funciones definer la llaman con los permisos de su dueño, por eso no necesita
-- GRANT para authenticated: no "corregirlo", rompería el flujo.
GRANT EXECUTE ON FUNCTION public.ticket_nombre_usuario(UUID) TO service_role;

-- ─── Tomar ───────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.tomar_ticket(p_ticket_id BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre TEXT;
BEGIN
  IF NOT es_gestor_tickets() THEN RAISE EXCEPTION 'Sin permiso para gestionar tickets'; END IF;
  IF NOT EXISTS (SELECT 1 FROM tickets WHERE id = p_ticket_id) THEN RAISE EXCEPTION 'Ticket no encontrado'; END IF;

  v_nombre := ticket_nombre_usuario(auth.uid());
  UPDATE tickets SET tecnico_id = auth.uid(), nombre_tecnico = v_nombre
   WHERE id = p_ticket_id AND tecnico_id IS NULL AND estado IN ('ABIERTO','EN_PROCESO');
  IF NOT FOUND THEN RAISE EXCEPTION 'Este ticket ya fue tomado por otro técnico.'; END IF;

  INSERT INTO ticket_historial (ticket_id, tipo_evento, usuario_id, nombre_usuario)
  VALUES (p_ticket_id, 'ASIGNACION', auth.uid(), v_nombre);
END;
$$;

-- ─── Primer contacto ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.registrar_contacto_ticket(p_ticket_id BIGINT, p_nota TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t tickets%ROWTYPE;
  v_nombre TEXT;
BEGIN
  IF NOT es_gestor_tickets() THEN RAISE EXCEPTION 'Sin permiso para gestionar tickets'; END IF;
  SELECT * INTO t FROM tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ticket no encontrado'; END IF;
  IF t.tecnico_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Solo el técnico asignado puede registrar el contacto.';
  END IF;
  IF t.fecha_primer_contacto IS NOT NULL THEN
    RAISE EXCEPTION 'Ya se registró el primer contacto de este ticket.';
  END IF;

  v_nombre := ticket_nombre_usuario(auth.uid());
  UPDATE tickets SET fecha_primer_contacto = NOW() WHERE id = p_ticket_id;
  INSERT INTO ticket_historial (ticket_id, tipo_evento, nota, usuario_id, nombre_usuario)
  VALUES (p_ticket_id, 'CONTACTO', NULLIF(btrim(p_nota), ''), auth.uid(), v_nombre);
END;
$$;

-- ─── Cambio de estado (EN_PROCESO / RESUELTO) ────────────────────────────────
CREATE OR REPLACE FUNCTION public.cambiar_estado_ticket(
  p_ticket_id BIGINT, p_estado TEXT, p_solucion TEXT DEFAULT NULL, p_nota TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t tickets%ROWTYPE;
  v_nombre TEXT;
  v_solucion TEXT := NULLIF(btrim(p_solucion), '');
BEGIN
  IF NOT es_gestor_tickets() THEN RAISE EXCEPTION 'Sin permiso para gestionar tickets'; END IF;
  IF p_estado NOT IN ('EN_PROCESO', 'RESUELTO') THEN RAISE EXCEPTION 'Estado inválido'; END IF;

  SELECT * INTO t FROM tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ticket no encontrado'; END IF;
  IF t.tecnico_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Solo el técnico asignado puede actualizar este ticket.';
  END IF;

  v_nombre := ticket_nombre_usuario(auth.uid());

  IF p_estado = 'EN_PROCESO' THEN
    IF t.estado <> 'ABIERTO' THEN RAISE EXCEPTION 'El ticket ya no está en Abierto.'; END IF;
    UPDATE tickets SET estado = 'EN_PROCESO' WHERE id = p_ticket_id;
    INSERT INTO ticket_historial (ticket_id, tipo_evento, estado_anterior, estado_nuevo, nota, usuario_id, nombre_usuario)
    VALUES (p_ticket_id, 'CAMBIO_ESTADO', 'ABIERTO', 'EN_PROCESO', NULLIF(btrim(p_nota), ''), auth.uid(), v_nombre);
  ELSE
    IF t.estado <> 'EN_PROCESO' THEN RAISE EXCEPTION 'El ticket debe estar En Proceso primero.'; END IF;
    IF v_solucion IS NULL THEN RAISE EXCEPTION 'La solución es obligatoria.'; END IF;
    -- Se resuelve y se cierra en el mismo momento; el solicitante puede reabrir.
    UPDATE tickets
       SET estado = 'CERRADO', solucion = v_solucion, fecha_resuelto = NOW(), fecha_cierre = NOW()
     WHERE id = p_ticket_id;
    INSERT INTO ticket_historial (ticket_id, tipo_evento, estado_anterior, estado_nuevo, nota, usuario_id, nombre_usuario)
    VALUES
      (p_ticket_id, 'CAMBIO_ESTADO', 'EN_PROCESO', 'RESUELTO', v_solucion, auth.uid(), v_nombre),
      (p_ticket_id, 'CIERRE_CONFIRMADO', 'RESUELTO', 'CERRADO', 'Cerrado automáticamente al marcar como resuelto', auth.uid(), v_nombre);
  END IF;
END;
$$;

-- ─── Cambio de prioridad ─────────────────────────────────────────────────────
-- Cualquier gestor (no solo quien lo tomó): corrige el "Urgente" que el
-- solicitante marca sin serlo, para no falsear el SLA.
CREATE OR REPLACE FUNCTION public.cambiar_prioridad_ticket(p_ticket_id BIGINT, p_prioridad TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t tickets%ROWTYPE;
BEGIN
  IF NOT es_gestor_tickets() THEN RAISE EXCEPTION 'Sin permiso para gestionar tickets'; END IF;
  IF p_prioridad NOT IN ('BAJA','MEDIA','ALTA','URGENTE') THEN RAISE EXCEPTION 'Prioridad inválida'; END IF;

  SELECT * INTO t FROM tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ticket no encontrado'; END IF;
  IF t.estado IN ('RESUELTO','CERRADO') THEN
    RAISE EXCEPTION 'No se puede cambiar la prioridad de un ticket resuelto o cerrado.';
  END IF;
  IF t.prioridad = p_prioridad THEN RAISE EXCEPTION 'El ticket ya tiene esa prioridad.'; END IF;

  UPDATE tickets SET prioridad = p_prioridad WHERE id = p_ticket_id;
  INSERT INTO ticket_historial (ticket_id, tipo_evento, estado_anterior, estado_nuevo, nota, usuario_id, nombre_usuario)
  VALUES (p_ticket_id, 'CAMBIO_PRIORIDAD', t.prioridad, p_prioridad,
          'De ' || t.prioridad || ' a ' || p_prioridad, auth.uid(), ticket_nombre_usuario(auth.uid()));
END;
$$;

-- ─── Registrar a nombre de otra persona ─────────────────────────────────────
-- Un gestor busca a la persona por cédula (exacta) o nombre (parcial, mínimo 3
-- letras). Devuelve solo lo necesario, y solo a gestores: user_profiles no es
-- legible para todos los roles.
CREATE OR REPLACE FUNCTION public.buscar_usuarios_ticket(p_busqueda TEXT)
RETURNS TABLE (user_id UUID, nombre_completo TEXT, cedula TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  q TEXT := btrim(COALESCE(p_busqueda, ''));
  patron TEXT;
BEGIN
  IF NOT es_gestor_tickets() THEN RAISE EXCEPTION 'Sin permiso para gestionar tickets'; END IF;
  IF q = '' THEN RETURN; END IF;
  patron := '%' || replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_') || '%';

  RETURN QUERY
  SELECT up.user_id, up.nombre_completo::text, up.cedula::text
    FROM user_profiles up
   WHERE up.activo
     AND (up.cedula = q OR (char_length(q) >= 3 AND up.nombre_completo ILIKE patron))
   ORDER BY up.nombre_completo
   LIMIT 15;
END;
$$;

-- Nombre real del solicitante, leído en el servidor: nunca se confía en el que
-- diga el formulario (igual que insertarTicket.php, que lo relee de `usuarios`).
CREATE OR REPLACE FUNCTION public.nombre_solicitante_ticket(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF NOT es_gestor_tickets() THEN RAISE EXCEPTION 'Sin permiso para gestionar tickets'; END IF;
  RETURN (SELECT COALESCE(NULLIF(btrim(up.nombre_completo), ''), up.email)
            FROM user_profiles up WHERE up.user_id = p_user_id AND up.activo LIMIT 1);
END;
$$;

-- Permisos de ejecución: solo usuarios con sesión (y el servicio). Cada función
-- vuelve a validar el rol adentro.
DO $$
DECLARE
  f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'tomar_ticket(bigint)',
    'registrar_contacto_ticket(bigint,text)',
    'cambiar_estado_ticket(bigint,text,text,text)',
    'cambiar_prioridad_ticket(bigint,text)',
    'buscar_usuarios_ticket(text)',
    'nombre_solicitante_ticket(uuid)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', f);
  END LOOP;
END $$;

-- ─── Borrar (solo ADMIN) ─────────────────────────────────────────────────────
-- El historial cae en cascada. La imagen adjunta la borra la aplicación, con la
-- sesión del ADMIN: por eso también necesita su política de borrado en Storage.
DROP POLICY IF EXISTS tickets_delete ON tickets;
CREATE POLICY tickets_delete ON tickets
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS tickets_adjuntos_delete ON storage.objects;
CREATE POLICY tickets_adjuntos_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'tickets-adjuntos' AND get_user_role() = 'ADMIN');
