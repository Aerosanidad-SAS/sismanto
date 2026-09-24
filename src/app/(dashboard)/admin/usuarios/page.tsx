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
    .select("id, user_id, nombre_completo, email, cedula, ciudad, operational_center_id, activo, role_id")
    .order("nombre_completo");

  const { data: roles } = await supabase.from("roles").select("id, codigo, nombre").order("codigo");
  const { data: centros } = await supabase
    .from("operational_centers")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");
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
      <AdminUsuarios users={usersWithRole} roles={roles || []} centros={centros || []} />
    </div>
  );
}
