import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/api/actions/auth";
import { isAdminLike } from "@/lib/auth-utils";
import { AdminUsuarios } from "@/components/admin/admin-usuarios";
import { datosDesdeFila, type DatosPersonalesUsuario } from "@/lib/usuarios-sisres";

// La carga masiva crea los usuarios por lotes desde esta página (acciones de servidor): sin un tope propio, el límite por
// defecto de la función es corto y un lote lento se cortaría a medias.
export const maxDuration = 60;

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

  // Datos personales de SISRES (RH, nacimiento, celular…): solo para un ADMIN. La política de la base los deja leer
  // únicamente al propio usuario y al ADMIN; un ANALISTA no los ve ni los edita (y por eso aquí ni se piden).
  const puedeDatosPersonales = profile.role_codigo === "ADMIN";
  const extras: Record<string, DatosPersonalesUsuario> = {};
  if (puedeDatosPersonales) {
    const { data: filas } = await (supabase as any)
      .from("user_profile_extra")
      .select("user_id, tipo_documento, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, rh, celular, departamento");
    for (const f of (filas ?? []) as Record<string, string | null>[]) {
      if (f.user_id) extras[f.user_id] = datosDesdeFila(f);
    }
  }

  const usersWithRole = (users || []).map((u) => {
    const r = roleMap.get(u.role_id);
    return {
      ...u,
      role_codigo: r?.codigo || "",
      role_nombre: r?.nombre || "",
    };
  });

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Gestión de usuarios</h1>
      <AdminUsuarios
        users={usersWithRole}
        roles={roles || []}
        centros={centros || []}
        extras={extras}
        puedeDatosPersonales={puedeDatosPersonales}
        esAdmin={profile.role_codigo === "ADMIN"}
        yoUserId={profile.user_id}
      />
    </div>
  );
}
