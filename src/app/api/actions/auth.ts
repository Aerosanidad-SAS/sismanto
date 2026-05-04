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
  updateUserRoleSchema,
} from "@/lib/validations";

export type { UserRole };

export interface UserProfile {
  id: number;
  user_id: string;
  role_id: number;
  role_codigo: UserRole;
  nombre_completo: string | null;
  email: string | null;
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
      activo,
      roles!inner(codigo)
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
    activo: data.activo,
  };
}

export async function signIn(email: string, password: string) {
  const parsed = signInSchema.safeParse({ email, password });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: error.message };
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
  roleCodigo: UserRole;
}) {
  await requireRole(["ADMIN"]);
  const parsed = createUserAsAdminSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

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
    activo: true,
  });

  if (profileError) return { error: profileError.message };
  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function updateUserRole(userId: string, roleCodigo: UserRole) {
  await requireRole(["ADMIN"]);
  const parsed = updateUserRoleSchema.safeParse({ userId, roleCodigo });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { data: role } = await supabase.from("roles").select("id").eq("codigo", parsed.data.roleCodigo).single();
  if (!role) return { error: "Rol no encontrado" };

  const { error } = await supabase
    .from("user_profiles")
    .update({ role_id: role.id, updated_at: new Date().toISOString() })
    .eq("user_id", parsed.data.userId);

  if (error) return { error: error.message };
  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function toggleUserActive(userId: string, activo: boolean) {
  await requireRole(["ADMIN"]);
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
