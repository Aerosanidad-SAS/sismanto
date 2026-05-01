import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/api/actions/auth";
import { isAdminLike } from "@/lib/auth-utils";
import { getAssignedVehicles } from "@/app/api/actions/ovem";
import { OvemPortal } from "@/components/ovem/ovem-portal";

export default async function OvemPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (!profile || !["OVEM", "ADMIN", "SUPERADMIN"].includes(profile.role_codigo)) {
    redirect("/");
  }

  const vehicles = isAdminLike(profile.role_codigo)
    ? (await supabase.from("vehicles").select("id, placa, marca, modelo, estado_actual").order("placa")).data || []
    : await getAssignedVehicles(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Portal OVEM</h1>
        <p className="text-gray-600 mt-2">
          Checklist pre-operacional, kilometraje y reporte de novedades
        </p>
      </div>

      <OvemPortal
        userId={user.id}
        userName={profile.nombre_completo || profile.email || "Usuario"}
        vehicles={vehicles}
        isAdmin={isAdminLike(profile.role_codigo)}
      />
    </div>
  );
}
