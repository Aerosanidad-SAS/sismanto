import { hoyBogota } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/app/api/actions/auth";
import { getChecklistItemsActivos } from "@/app/api/actions/ovem";
import { centroVisible } from "@/lib/auth-utils";
import { DotacionPanel } from "@/components/dotacion/dotacion-panel";

/**
 * Dotación e insumos de la ambulancia. La verifica la auxiliar de enfermería
 * al recibir el turno; el OVEM responde por el vehículo en el preoperacional.
 */
export default async function DotacionPage() {
  const profile = await requireRole(["AUXILIAR_ENFERMERIA", "ADMIN", "ANALISTA"]);
  const supabase = createClient();
  const hoy = hoyBogota();

  let vehiclesQuery = supabase.from("vehicles").select("id, placa, marca").order("placa");
  const centro = centroVisible(profile);
  if (centro) vehiclesQuery = vehiclesQuery.eq("centro_operativo", centro.codigo);

  const [{ data: vehicles }, { data: asignacion }, items] = await Promise.all([
    vehiclesQuery,
    // La ambulancia que Regulación le asignó hoy, para preseleccionarla.
    supabase
      .from("vehicle_assignments")
      .select("vehicle_id")
      .eq("user_id", profile.user_id)
      .eq("activo", true)
      .lte("fecha_inicio", hoy)
      .or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`)
      .limit(1)
      .maybeSingle(),
    getChecklistItemsActivos("DOTACION"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Dotación e insumos</h1>
        <p className="mt-2 text-muted-foreground">
          Oxígeno, medicamentos y consumibles de la ambulancia que recibes.
        </p>
      </div>
      <DotacionPanel
        vehicles={(vehicles ?? []) as { id: string; placa: string; marca: string | null }[]}
        vehiculoAsignadoId={(asignacion as { vehicle_id: string } | null)?.vehicle_id ?? null}
        items={items}
      />
    </div>
  );
}
