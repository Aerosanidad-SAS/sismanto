import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/api/actions/auth";
import { isAdminLike } from "@/lib/auth-utils";
import { OvemPortal } from "@/components/ovem/ovem-portal";
import { getChecklistItemsActivos } from "@/app/api/actions/ovem";

export default async function OvemPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (!profile || !["OVEM", "ADMIN"].includes(profile.role_codigo)) {
    redirect("/");
  }

  const { data: vehicles = [] } = await supabase
    .from("vehicles")
    .select("id, placa, marca, modelo, estado_actual")
    .order("placa");

  const checklistItems = await getChecklistItemsActivos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Portal OVEM</h1>
        <p className="mt-2 text-muted-foreground">
          Checklist pre-operacional, kilometraje y reporte de novedades
        </p>
      </div>

      <OvemPortal
        userId={user.id}
        userName={profile.nombre_completo || profile.email || "Usuario"}
        vehicles={vehicles}
        checklistItems={checklistItems}
        isAdmin={isAdminLike(profile.role_codigo)}
      />
    </div>
  );
}
