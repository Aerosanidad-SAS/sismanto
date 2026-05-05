import { createClient } from "@/lib/supabase/server";
import { getMetricasConsumo } from "@/app/api/actions/consumo";
import { ConsumoCliente } from "@/components/consumo/consumo-cliente";

async function getInitialData() {
  try {
    const supabase = createClient();
    const [{ data: vehicles }, { data: centros }] = await Promise.all([
      supabase.from("vehicles").select("id, placa, marca").order("placa"),
      supabase.from("operational_centers").select("id, nombre").eq("activo", true).order("nombre"),
    ]);
    return { vehicles: vehicles || [], centros: centros || [] };
  } catch {
    return { vehicles: [], centros: [] };
  }
}

export default async function ConsumoPage({
  searchParams,
}: {
  searchParams: { inicio?: string; fin?: string; vehiculo?: string; centro?: string };
}) {
  const hoy = new Date();
  const hace3Meses = new Date();
  hace3Meses.setMonth(hoy.getMonth() - 3);

  const fechaInicio = searchParams.inicio || hace3Meses.toISOString().split("T")[0];
  const fechaFin = searchParams.fin || hoy.toISOString().split("T")[0];
  const vehicleId = searchParams.vehiculo || undefined;
  const centroId = searchParams.centro ? parseInt(searchParams.centro) : undefined;

  const [{ vehicles, centros }, metricas] = await Promise.all([
    getInitialData(),
    getMetricasConsumo(fechaInicio, fechaFin, vehicleId, centroId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Consumo y Kilometraje</h1>
        <p className="mt-2 text-muted-foreground">
          Consumo promedio km/gal y km recorridos por vehículo
        </p>
      </div>

      <ConsumoCliente
        metricas={metricas}
        vehicles={vehicles}
        centros={centros}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        vehicleIdFiltro={vehicleId}
        centroIdFiltro={centroId}
      />
    </div>
  );
}
