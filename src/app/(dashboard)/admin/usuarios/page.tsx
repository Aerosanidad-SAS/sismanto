import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/api/actions/auth";
import { isAdminLike } from "@/lib/auth-utils";
import { AdminUsuarios } from "@/components/admin/admin-usuarios";

export default async function AdminUsuariosPage() {
  const profile = await getProfile();
  if (!profile || !isAdminLike(profile.role_codigo)) redirect("/");

  const supabase = createClient();
  const { data: users } = await supabase
    .from("user_profiles")
    .select("id, user_id, nombre_completo, email, cedula, ciudad, activo, role_id")
    .order("nombre_completo");

  const { data: roles } = await supabase.from("roles").select("id, codigo, nombre").order("codigo");
  const roleMap = new Map((roles || []).map((r) => [r.id, r]));

  const usersWithRole = (users || []).map((u) => {
    const r = roleMap.get(u.role_id);
    return {
      ...u,
      role_codigo: r?.codigo || "",
      role_nombre: r?.nombre || "",
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Gestión de Usuarios</h1>
        <p className="mt-2 text-muted-foreground">Crear, editar y deshabilitar usuarios y roles</p>
      </div>
      <AdminUsuarios users={usersWithRole} roles={roles || []} />
    </div>
  );
}
