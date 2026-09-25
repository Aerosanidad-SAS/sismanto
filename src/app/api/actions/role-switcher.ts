"use server";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { getDefaultRoute, type UserRole } from "@/lib/auth-utils";
import {
  ORIGIN_COOKIE,
  ORIGIN_TTL_SECONDS,
  ROLES_SELECTOR,
  roleSwitcherEnabled,
  testEmailForRole,
} from "@/lib/role-switcher";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Selector de roles para desarrollo. Un ADMIN cambia su sesión a la de un usuario de prueba del rol elegido, así el
 * menú, las redirecciones y el RLS (que lee el rol del usuario real logueado) son los del rol. Ver ENTORNOS.md.
 *
 * Salvaguardas: apagado salvo `ROLE_SWITCHER_ENABLED=true` fuera de producción; solo un ADMIN real (o una sesión de
 * prueba con cookie de origen válida) puede iniciarlo; el destino debe ser un usuario de prueba (`app_metadata`,
 * que el propio usuario no puede editar) con el correo esperado; todo queda en la bitácora con el actor real.
 */

interface Origen {
  uid: string;
  email: string;
  exp: number;
}

export interface RoleSwitcherState {
  enabled: boolean;
  /** `admin`: sesión real de ADMIN. `impersonating`: sesión de un usuario de prueba. */
  mode?: "admin" | "impersonating";
  currentRole?: UserRole;
  /** En modo `impersonating`: si la cookie de origen es válida y se puede volver a ADMIN. */
  canReturn?: boolean;
}

// ─── Cookie de origen firmada ────────────────────────────────────────────────
// La clave se deriva de la clave de servicio, que ya es secreta y solo existe en el servidor.
function firmar(payload: string): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  return createHmac("sha256", key).update(`role-switcher:${payload}`).digest("base64url");
}

function codificarOrigen(o: Origen): string {
  const payload = Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${payload}.${firmar(payload)}`;
}

function leerOrigen(valor: string | undefined): Origen | null {
  if (!valor) return null;
  const [payload, firma] = valor.split(".");
  if (!payload || !firma) return null;
  const esperada = Buffer.from(firmar(payload));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;
  try {
    const o = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as Origen;
    if (!o.uid || !o.email || typeof o.exp !== "number" || o.exp < Date.now()) return null;
    return o;
  } catch {
    return null;
  }
}

function esUsuarioDePrueba(user: { app_metadata?: Record<string, unknown> } | null | undefined): boolean {
  return user?.app_metadata?.role_switch_test === true;
}

/** Canjea un magic link del correo dado en el servidor: las cookies de sesión pasan a ser las de ese usuario. */
async function cambiarSesionA(email: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) return "No se pudo generar el acceso";
  const { error: verifyError } = await createClient().auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
  return verifyError ? "No se pudo iniciar la sesión del rol" : null;
}

// ─── Estado ──────────────────────────────────────────────────────────────────
export async function getRoleSwitcherState(): Promise<RoleSwitcherState> {
  if (!roleSwitcherEnabled()) return { enabled: false };
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return { enabled: false };

  const profile = await getProfile();
  if (esUsuarioDePrueba(user)) {
    const origen = leerOrigen(cookies().get(ORIGIN_COOKIE)?.value);
    return { enabled: true, mode: "impersonating", currentRole: profile?.role_codigo, canReturn: origen !== null };
  }
  if (profile?.role_codigo === "ADMIN") return { enabled: true, mode: "admin", currentRole: "ADMIN" };
  return { enabled: false };
}

// ─── Cambiar a un rol ────────────────────────────────────────────────────────
export async function switchToRole(codigo: string): Promise<{ error?: string; route?: string }> {
  if (!roleSwitcherEnabled()) return { error: "El selector de roles está deshabilitado en este entorno" };
  if (!ROLES_SELECTOR.includes(codigo as UserRole)) return { error: "Rol no válido" };

  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return { error: "Sin sesión" };

  // Quién es el ADMIN de origen: la sesión actual si es ADMIN real; si ya estamos en un rol de prueba, la cookie.
  let origen: Origen | null;
  if (esUsuarioDePrueba(user)) {
    origen = leerOrigen(cookies().get(ORIGIN_COOKIE)?.value);
    if (!origen) return { error: "La sesión de origen expiró: cierra sesión y entra como administrador" };
  } else {
    const profile = await getProfile();
    if (!profile || profile.role_codigo !== "ADMIN") return { error: "Solo un administrador puede usar el selector de roles" };
    origen = { uid: user.id, email: user.email ?? "", exp: Date.now() + ORIGIN_TTL_SECONDS * 1000 };
  }

  // El destino tiene que ser el usuario de prueba de ese rol; nunca personal real.
  const email = testEmailForRole(codigo);
  const admin = createAdminClient();
  const { data: perfil } = await admin
    .from("user_profiles")
    .select("user_id, roles!inner(codigo)")
    .eq("email", email)
    .eq("activo", true)
    .maybeSingle();
  const destino = perfil as { user_id: string; roles: { codigo: string } } | null;
  if (!destino || destino.roles.codigo !== codigo) {
    return { error: `No existe el usuario de prueba de ${codigo}. Ejecuta npm run db:seed-role-users` };
  }
  const { data: authDestino } = await admin.auth.admin.getUserById(destino.user_id);
  if (!esUsuarioDePrueba(authDestino?.user) || authDestino?.user?.email !== email) {
    return { error: "El usuario destino no está marcado como usuario de prueba" };
  }

  // Bitácora ANTES de cambiar la sesión, con el actor real.
  await auditar("LOGIN", "role_switch", destino.user_id, `ADMIN ${origen.email} entra como ${codigo}`, {
    userId: origen.uid,
    label: origen.email,
    role: "ADMIN",
  });

  const fallo = await cambiarSesionA(email);
  if (fallo) return { error: fallo };

  cookies().set(ORIGIN_COOKIE, codificarOrigen(origen), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ORIGIN_TTL_SECONDS,
  });
  return { route: getDefaultRoute(codigo as UserRole) };
}

// ─── Volver a ADMIN ──────────────────────────────────────────────────────────
export async function returnToAdmin(): Promise<{ error?: string; route?: string }> {
  if (!roleSwitcherEnabled()) return { error: "El selector de roles está deshabilitado en este entorno" };

  // Solo se vuelve desde una sesión de prueba: la cookie por sí sola no basta.
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!esUsuarioDePrueba(user)) return { error: "No estás en una sesión de prueba" };

  const origen = leerOrigen(cookies().get(ORIGIN_COOKIE)?.value);
  if (!origen) return { error: "La sesión de origen expiró: cierra sesión y entra como administrador" };

  // Se revalida en la base que el origen sigue siendo un ADMIN activo (no basta con la cookie).
  const admin = createAdminClient();
  const { data: perfil } = await admin
    .from("user_profiles")
    .select("roles!inner(codigo)")
    .eq("user_id", origen.uid)
    .eq("activo", true)
    .maybeSingle();
  if ((perfil as { roles: { codigo: string } } | null)?.roles.codigo !== "ADMIN") {
    return { error: "El usuario de origen ya no es administrador" };
  }

  const fallo = await cambiarSesionA(origen.email);
  if (fallo) return { error: fallo };

  cookies().delete(ORIGIN_COOKIE);
  await auditar("LOGIN", "role_switch", origen.uid, `ADMIN ${origen.email} vuelve a su sesión`, {
    userId: origen.uid,
    label: origen.email,
    role: "ADMIN",
  });
  return { route: "/" };
}
