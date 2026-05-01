import { createClient } from "@/lib/supabase/server";
import { ConfiguracionTabs } from "@/components/configuracion/configuracion-tabs";

async function getConfiguracionData() {
  try {
    const supabase = createClient();
    const [
      { data: vehicles },
      { data: centros },
      { data: proveedores },
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
    ]);

    return {
      vehicles: vehicles || [],
      centros: centros || [],
      proveedores: proveedores || [],
    };
  } catch {
    return { vehicles: [], centros: [], proveedores: [] };
  }
}

export default async function ConfiguracionPage() {
  const data = await getConfiguracionData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">
          Administre vehículos, centros de operaciones, proveedores y carga de datos
        </p>
      </div>

      <ConfiguracionTabs
        vehicles={data.vehicles}
        centros={data.centros}
        proveedores={data.proveedores}
      />
    </div>
  );
}
