import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/api/actions/auth";
import { centroVisible, isAdminLike } from "@/lib/auth-utils";
import { OvemPortal } from "@/components/ovem/ovem-portal";
import { getChecklistItemsActivos } from "@/app/api/actions/ovem";
import { getServiciosMedicos } from "@/app/api/actions/servicios-medicos";

export default async function OvemPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (!profile || !["OVEM", "ADMIN"].includes(profile.role_codigo)) {
    redirect("/");
  }

  let vehiclesQuery = supabase
    .from("vehicles")
    .select("id, placa, marca, modelo, estado_actual, centro_operativo")
    .order("placa");
  const centro = centroVisible(profile);
  if (centro) vehiclesQuery = vehiclesQuery.eq("centro_operativo", centro.codigo);
  const { data: vehicles = [] } = await vehiclesQuery;

  const checklistItems = await getChecklistItemsActivos();
  const servicios = profile.role_codigo === "OVEM" ? await getServiciosMedicos() : [];

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
        vehicles={vehicles ?? []}
        checklistItems={checklistItems}
        servicios={servicios as any}
        isAdmin={isAdminLike(profile.role_codigo)}
        viewerRole={profile.role_codigo === "OVEM" ? "OVEM" : "ADMIN"}
      />
    </div>
  );
}
