-- ============================================================
-- Migración 003: RBAC - Roles y Permisos
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. TABLA roles
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (codigo, nombre, descripcion) VALUES
  ('OVEM', 'Operador de Vehículo de Emergencias', 'Conductores - checklist diario, kilometraje, novedades'),
  ('ADMIN', 'Administrador del Sistema', 'Acceso total, gestión de usuarios'),
  ('REGULACION', 'Regulación / Despacho', 'Estado flota, asignar conductores'),
  ('GERENCIAL', 'Gerencial / Analítica', 'Dashboard y KPIs read-only')
ON CONFLICT (codigo) DO NOTHING;

-- 2. TABLA user_profiles (vincula auth.users con rol)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  nombre_completo VARCHAR(200),
  email VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role_id);

-- 3. TABLA vehicle_assignments (asignación OVEM a vehículo por turno)
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_assignments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT true,
  asignado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vehicle_id, fecha_inicio)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_user ON vehicle_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_vehicle ON vehicle_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_fecha ON vehicle_assignments(fecha_inicio, fecha_fin);

-- 4. TABLA daily_checks (checklist pre-operacional diario)
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_checks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  kilometraje_inicial INTEGER CHECK (kilometraje_inicial >= 0),
  kilometraje_final INTEGER CHECK (kilometraje_final >= 0),
  checklist_ok BOOLEAN NOT NULL DEFAULT false,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vehicle_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_daily_checks_user ON daily_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checks_vehicle ON daily_checks(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_daily_checks_fecha ON daily_checks(fecha DESC);

-- Trigger: validar kilometraje_final >= kilometraje_inicial en daily_checks
CREATE OR REPLACE FUNCTION validar_km_daily_check()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.kilometraje_final IS NOT NULL AND NEW.kilometraje_inicial IS NOT NULL 
     AND NEW.kilometraje_final < NEW.kilometraje_inicial THEN
    RAISE EXCEPTION 'Kilometraje final no puede ser menor al inicial';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_km_daily ON daily_checks;
CREATE TRIGGER trg_validar_km_daily
BEFORE INSERT OR UPDATE ON daily_checks
FOR EACH ROW EXECUTE FUNCTION validar_km_daily_check();

-- 5. RLS para nuevas tablas
-- ============================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checks ENABLE ROW LEVEL SECURITY;

-- roles: lectura para todos autenticados
CREATE POLICY "Auth: leer roles" ON roles FOR SELECT TO authenticated USING (true);

-- user_profiles: cada usuario ve su propio perfil; Admin ve todos
CREATE POLICY "Auth: leer propio perfil" ON user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Auth: actualizar propio perfil" ON user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin insert/update/delete user_profiles (se valida en app por rol)
CREATE POLICY "Auth: admin user_profiles" ON user_profiles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- vehicle_assignments
CREATE POLICY "Auth: leer vehicle_assignments" ON vehicle_assignments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth: escribir vehicle_assignments" ON vehicle_assignments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- daily_checks
CREATE POLICY "Auth: leer daily_checks" ON daily_checks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth: insertar daily_checks" ON daily_checks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth: actualizar daily_checks" ON daily_checks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- NOTA: Para crear el primer usuario Admin:
-- 1. En Supabase Dashboard: Authentication > Users > Add user (email + password)
-- 2. Copie el UUID del usuario creado
-- 3. Ejecute: INSERT INTO user_profiles (user_id, role_id, nombre_completo, email, activo)
--    VALUES ('<UUID>', (SELECT id FROM roles WHERE codigo='ADMIN'), 'Administrador', 'admin@ejemplo.com', true);

-- 6. Función para obtener rol del usuario actual
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID DEFAULT auth.uid())
RETURNS VARCHAR(50) AS $$
  SELECT r.codigo FROM user_profiles up
  JOIN roles r ON r.id = up.role_id
  WHERE up.user_id = p_user_id AND up.activo = true
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
