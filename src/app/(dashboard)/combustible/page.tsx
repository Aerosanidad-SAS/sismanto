import { esDia, hoyBogota, sumarMeses } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { getMetricasConsumo, getRendimientoCombustibleSerieMensual } from "@/app/api/actions/consumo";
import { ConsumoCliente } from "@/components/consumo/consumo-cliente";
import { requireRole } from "@/app/api/actions/auth";

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

export default async function CombustiblePage({
  searchParams,
}: {
  searchParams: { inicio?: string; fin?: string; vehiculo?: string; centro?: string };
}) {
  await requireRole(["ADMIN", "GERENCIAL", "ANALISTA"]);
  const hoy = hoyBogota();
  const fechaInicio = esDia(searchParams.inicio) ? searchParams.inicio : sumarMeses(hoy, -3);
  const fechaFin = esDia(searchParams.fin) ? searchParams.fin : hoy;
  const vehicleId = searchParams.vehiculo || undefined;
  const centroId = searchParams.centro ? parseInt(searchParams.centro, 10) : undefined;

  const [{ vehicles, centros }, metricas, serieRendimientoMensual] = await Promise.all([
    getInitialData(),
    getMetricasConsumo(fechaInicio, fechaFin, vehicleId, centroId, "operativa"),
    getRendimientoCombustibleSerieMensual(fechaInicio, fechaFin, vehicleId, centroId, "operativa"),
  ]);
  const metricasReferencia = await getMetricasConsumo(
    fechaInicio,
    fechaFin,
    vehicleId,
    centroId,
    "referencia"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Combustible</h1>
        <p className="mt-2 text-muted-foreground">
          Kilometraje, rendimiento km/gal y consumo por vehículo
        </p>
      </div>

      <ConsumoCliente
        metricas={metricas}
        metricasReferencia={metricasReferencia}
        serieRendimientoMensual={serieRendimientoMensual}
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
