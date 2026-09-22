"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { type UserRole, getDefaultRoute } from "@/lib/auth-utils";
import {
  createUserAsAdminSchema,
  signInSchema,
  toggleUserActiveSchema,
  updateUserAsAdminSchema,
} from "@/lib/validations";

export type { UserRole };

export interface UserProfile {
  id: number;
  user_id: string;
  role_id: number;
  role_codigo: UserRole;
  nombre_completo: string | null;
  email: string | null;
  ciudad: string | null;
  operational_center_id: number | null;
  centro_codigo: string | null;
  centro_nombre: string | null;
  activo: boolean;
}

export async function getSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_profiles")
    .select(`
      id,
      user_id,
      role_id,
      nombre_completo,
      email,
      ciudad,
      operational_center_id,
      activo,
      roles!inner(codigo),
      operational_centers(codigo, nombre)
    `)
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    user_id: data.user_id,
    role_id: data.role_id,
    role_codigo: (data as any).roles?.codigo as UserRole,
    nombre_completo: data.nombre_completo,
    email: data.email || user.email || null,
    ciudad: (data as any).ciudad ?? null,
    operational_center_id: (data as any).operational_center_id ?? null,
    centro_codigo: (data as any).operational_centers?.codigo ?? null,
    centro_nombre: (data as any).operational_centers?.nombre ?? null,
    activo: data.activo,
  };
}

const CREDENCIALES_INVALIDAS = "Usuario o contraseña incorrectos";

// Destino de los intentos con cédula inexistente. Dominio .invalid (RFC 2606):
// nunca puede pertenecer a una cuenta real.
const EMAIL_INEXISTENTE = "login-no-encontrado@sisres.invalid";

/**
 * Resuelve lo que el usuario escribe en el login al email de Supabase Auth.
 * Los usuarios migrados de SISRES entran con su cédula, como en
 * login_users.php, y tienen un email sintético que nunca ven; los de
 * Aeromanto siguen entrando con su correo.
 */
async function resolverEmailLogin(identificador: string): Promise<string | null> {
  if (identificador.includes("@")) return identificador.toLowerCase();

  // Tolera cédulas escritas con puntos o espacios ("1.020.458.300").
  const cedula = identificador.replace(/[\s.]/g, "");
  if (!/^\d{5,15}$/.test(cedula)) return null;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  // Cliente admin: quien intenta entrar todavía no tiene sesión, y la RLS de
  // user_profiles no deja leer perfiles ajenos sin ella.
  const admin = createAdminClient();
  const { data: perfil } = await admin
    .from("user_profiles")
    .select("user_id")
    .eq("cedula", cedula)
    .eq("activo", true)
    .maybeSingle<{ user_id: string }>();
  if (!perfil) return null;

  const { data } = await admin.auth.admin.getUserById(perfil.user_id);
  return data.user?.email ?? null;
}

export async function signIn(identificador: string, password: string) {
  const parsed = signInSchema.safeParse({ identificador, password });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  // Una cédula inexistente también pasa por Supabase Auth: si respondiera
  // antes, la diferencia de tiempo delataría qué cédulas tienen cuenta y el
  // intento quedaría fuera del límite de intentos de Auth.
  const email = (await resolverEmailLogin(parsed.data.identificador)) ?? EMAIL_INEXISTENTE;

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });
  if (error) {
    // Mismo mensaje para cédula inexistente y clave errada, para no revelar
    // qué cédulas tienen cuenta. Solo el bloqueo por intentos se distingue.
    if (error.status === 429) return { error: "Demasiados intentos. Espere unos minutos e intente de nuevo." };
    // Sin status (fallo de red) o 5xx: Auth no respondió. No es una clave
    // errada, y decirlo así haría pasar una caída por un problema del usuario.
    if (!error.status || error.status >= 500) {
      return { error: "No se pudo conectar con el servicio de autenticación. Intente de nuevo en unos minutos." };
    }
    return { error: CREDENCIALES_INVALIDAS };
  }
  revalidatePath("/");
  return { success: true };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/login");
}

export async function requireAuth(): Promise<{ user: { id: string }; profile: UserProfile }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (!profile || !profile.activo) redirect("/pending");

  return { user: { id: user.id }, profile };
}

export async function requireRole(allowed: UserRole[]): Promise<UserProfile> {
  const { profile } = await requireAuth();
  if (!allowed.includes(profile.role_codigo)) {
    redirect(getDefaultRoute(profile.role_codigo));
  }
  return profile;
}

export async function createUserAsAdmin(data: {
  email: string;
  password: string;
  nombreCompleto: string;
  cedula?: string;
  ciudad?: string;
  operationalCenterId?: number | null;
  roleCodigo: UserRole;
}) {
  const caller = await requireRole(["ADMIN", "ANALISTA"]);
  const parsed = createUserAsAdminSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  // Igual que SISRES (includes/insertar_usuarios.php): solo un ADMIN puede
  // crear otro ADMIN — ANALISTA tiene paridad de creación de usuarios, pero
  // no puede otorgar el rol más alto.
  if (parsed.data.roleCodigo === "ADMIN" && caller.role_codigo !== "ADMIN") {
    return { error: "Solo un Administrador puede crear otro Administrador" };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY no configurado. Añada la clave en .env.local" };
  }
  const admin = createAdminClient();

  const { data: newUser, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (authError) return { error: authError.message };
  if (!newUser.user) return { error: "No se pudo crear el usuario" };

  const { data: role } = await admin.from("roles").select("id").eq("codigo", parsed.data.roleCodigo).single();
  if (!role) return { error: "Rol no encontrado" };

  const { error: profileError } = await admin.from("user_profiles").insert({
    user_id: newUser.user.id,
    role_id: role.id,
    nombre_completo: parsed.data.nombreCompleto,
    email: parsed.data.email,
    cedula: parsed.data.cedula || null,
    ciudad: parsed.data.ciudad || null,
    operational_center_id: parsed.data.operationalCenterId ?? null,
    activo: true,
  });

  if (profileError) return { error: profileError.message };
  revalidatePath("/admin/usuarios");
  return { success: true };
}

/**
 * Edición de un usuario desde Administración → Usuarios: nombre, cédula,
 * ciudad, centro operativo y rol en una sola operación. El email no se
 * edita aquí: es la identidad de Supabase Auth.
 */
export async function updateUserAsAdmin(data: {
  userId: string;
  nombreCompleto: string;
  cedula?: string;
  ciudad?: string;
  operationalCenterId: number | null;
  roleCodigo: UserRole;
}) {
  const caller = await requireRole(["ADMIN", "ANALISTA"]);
  const parsed = updateUserAsAdminSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { data: actual } = await supabase
    .from("user_profiles")
    .select("roles!inner(codigo)")
    .eq("user_id", parsed.data.userId)
    .maybeSingle();
  if (!actual) return { error: "Usuario no encontrado" };

  // Misma regla que createUserAsAdmin: solo un ADMIN otorga el rol ADMIN, y
  // tampoco un no-ADMIN puede editar (ni degradar) a un ADMIN existente.
  const rolActual = (actual as any).roles?.codigo as UserRole | undefined;
  if (caller.role_codigo !== "ADMIN" && (parsed.data.roleCodigo === "ADMIN" || rolActual === "ADMIN")) {
    return { error: "Solo un Administrador puede editar o asignar el rol de Administrador" };
  }

  const { data: role } = await supabase.from("roles").select("id").eq("codigo", parsed.data.roleCodigo).single();
  if (!role) return { error: "Rol no encontrado" };

  const { error } = await supabase
    .from("user_profiles")
    .update({
      nombre_completo: parsed.data.nombreCompleto,
      cedula: parsed.data.cedula || null,
      ciudad: parsed.data.ciudad || null,
      operational_center_id: parsed.data.operationalCenterId,
      role_id: role.id,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", parsed.data.userId);

  if (error) {
    // Índice único parcial sobre cédula (migración 043).
    if (error.code === "23505") return { error: "Esa cédula ya está registrada en otro usuario" };
    return { error: error.message };
  }
  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function toggleUserActive(userId: string, activo: boolean) {
  await requireRole(["ADMIN", "ANALISTA"]);
  const parsed = toggleUserActiveSchema.safeParse({ userId, activo });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { error } = await supabase
    .from("user_profiles")
    .update({ activo: parsed.data.activo, updated_at: new Date().toISOString() })
    .eq("user_id", parsed.data.userId);

  if (error) return { error: error.message };
  revalidatePath("/admin/usuarios");
  return { success: true };
}
