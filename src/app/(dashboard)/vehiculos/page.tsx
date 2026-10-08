import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VehiculosTablaExpandible } from "@/components/vehiculos/vehiculos-tabla-expandible";
import { getProfile } from "@/app/api/actions/auth";
import { centroVisible, puedeCambiarEstadoOperativoVehiculo } from "@/lib/auth-utils";
import { AlertasHojaDeVida } from "@/components/vehiculos/alertas-hoja-de-vida";
import { hoyBogota } from "@/lib/fechas";

export const metadata = { title: "Vehículos" };

async function getVehicles(centroCodigo: string | null) {
  try {
    const supabase = createClient();
    let query = supabase.from("vehicles").select("*").order("placa");
    // Regulación y Coordinación ven los vehículos de su centro (DEU-05 de PARIDAD_REGULACION.md).
    if (centroCodigo) query = query.eq("centro_operativo", centroCodigo);
    const { data } = await query;

    return data || [];
  } catch {
    return [];
  }
}

async function contarCostosEstimados(): Promise<number> {
  try {
    const { count } = await createClient().from("vehicle_annual_costs").select("id", { count: "exact", head: true }).eq("estimado", true);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function VehiculosPage() {
  const profile = await getProfile();
  const [vehicles, estimados] = await Promise.all([getVehicles(centroVisible(profile)?.codigo ?? null), contarCostosEstimados()]);
  const puedeEditarEstado = puedeCambiarEstadoOperativoVehiculo(profile?.role_codigo);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Vehículos</h1>
        <p className="mt-2 text-muted-foreground">Gestión de la flota de ambulancias</p>
      </div>

      <AlertasHojaDeVida vehiculos={vehicles as any[]} hoy={hoyBogota()} estimados={estimados} />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vehículos</CardTitle>
          <CardDescription>
            Todos los vehículos registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Pulse la fila para desplegar opciones. En el detalle puede actualizar el kilometraje (obligatorio fecha y
            lectura).
            {puedeEditarEstado
              ? " Si su rol lo permite, pulse el estado (OPERATIVO / FDS) para alternarlo."
              : ""}
          </p>
          <VehiculosTablaExpandible vehicles={vehicles} puedeEditarEstado={puedeEditarEstado} />
        </CardContent>
      </Card>
    </div>
  );
}
