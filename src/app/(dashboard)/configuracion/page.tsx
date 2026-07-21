import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { isAdminLike } from "@/lib/auth-utils";
import { ConfiguracionTabs } from "@/components/configuracion/configuracion-tabs";

async function getConfiguracionData() {
  try {
    const supabase = createClient();
    const [
      { data: vehicles },
      { data: centros },
      { data: proveedores },
      { data: clientes },
    ] = await Promise.all([
      supabase
        .from("vehicles")
        .select("*, operational_centers(id, nombre, codigo)")
        .order("placa"),
      supabase
        .from("operational_centers")
        .select("*")
        .order("nombre"),
      supabase
        .from("suppliers")
        .select("*")
        .order("nombre"),
      supabase
        .from("clients")
        .select("*")
        .eq("activo", true)
        .order("nombre"),
    ]);

    const serviceTypesRes = await supabase.from("service_types").select("*").order("orden");
    const serviceTypes = serviceTypesRes.error ? [] : serviceTypesRes.data || [];

    return {
      vehicles: vehicles || [],
      centros: centros || [],
      proveedores: proveedores || [],
      clientes: clientes || [],
      serviceTypes,
    };
  } catch {
    return { vehicles: [], centros: [], proveedores: [], clientes: [], serviceTypes: [] };
  }
}

export default async function ConfiguracionPage() {
  const profile = await getProfile();
  if (!profile || !isAdminLike(profile.role_codigo)) {
    redirect("/");
  }

  const data = await getConfiguracionData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Configuración</h1>
        <p className="mt-2 text-muted-foreground">
          Administre vehículos, centros de operaciones, proveedores y carga de datos
        </p>
      </div>

      <ConfiguracionTabs
        vehicles={data.vehicles}
        centros={data.centros}
        proveedores={data.proveedores}
        clientes={data.clientes}
        serviceTypes={(data.serviceTypes || []) as any}
      />
    </div>
  );
}
