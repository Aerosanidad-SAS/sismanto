import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/api/actions/auth";
import { centroVisible, isAdminLike } from "@/lib/auth-utils";
import { OvemPortal } from "@/components/ovem/ovem-portal";
import { getChecklistItemsActivos } from "@/app/api/actions/ovem";
import { getServiciosMedicos } from "@/app/api/actions/servicios-medicos";
import { fechaBogota } from "@/lib/vencimientos";

export const metadata = { title: "Portal OVEM" };

// El envío del preoperacional (portal del OVEM) se ejecuta como acción de servidor bajo la configuración de esta página: guarda ~100 ítems,
// abre las novedades y puede mandar el correo de NO APTO (token de Microsoft + envío). El tope por defecto de una función en
// Vercel es corto para eso en hora pico; 60 s es el máximo del plan Hobby y no cuesta nada si no se usa.
export const maxDuration = 60;

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
    .select(
      "id, placa, marca, modelo, estado_actual, centro_operativo, tipo_vehiculo, vencimiento_soat, vencimiento_rtm, vencimiento_tecnicomecanica, fecha_pase_aeroportuario"
    )
    .order("placa");
  const centro = centroVisible(profile);
  if (centro) vehiclesQuery = vehiclesQuery.eq("centro_operativo", centro.codigo);
  const { data: vehicles = [] } = await vehiclesQuery;

  const hoy = fechaBogota(new Date());
  const ids = (vehicles ?? []).map((v: { id: string }) => v.id);

  // Vehículo(s) que Regulación le programó hoy a este conductor (migración 108): se preselecciona en el portal.
  let vehiculosDeHoy: string[] = [];
  if (profile.role_codigo === "OVEM") {
    const { data: operacion } = await (supabase as any)
      .from("vehicle_operacion_diaria")
      .select("vehicle_id")
      .eq("fecha", hoy)
      .eq("user_id", user.id);
    vehiculosDeHoy = ((operacion ?? []) as { vehicle_id: string }[])
      .map((o) => o.vehicle_id)
      .filter((id) => ids.includes(id));
  }

  // Último kilometraje conocido por vehículo (lecturas, tanqueos y preoperacionales): ayuda y aviso al digitar.
  // Si alguna tabla no es legible para este rol, simplemente no hay ayuda; nada se bloquea.
  const ultimoKmPorVehiculo: Record<string, number> = {};
  if (ids.length > 0) {
    const fuentes: Array<[string, string]> = [
      ["mileage_logs", "lectura_kilometraje"],
      ["fuel_logs", "kilometraje"],
      ["daily_checks", "kilometraje_inicial"],
    ];
    const resultados = await Promise.all(
      fuentes.map(async ([tabla, columna]) => {
        try {
          const { data } = await (supabase as any)
            .from(tabla)
            .select(`vehicle_id, ${columna}`)
            .in("vehicle_id", ids)
            .order("fecha", { ascending: false })
            .limit(400);
          return { columna, filas: (data ?? []) as Record<string, number | string | null>[] };
        } catch {
          return { columna, filas: [] };
        }
      })
    );
    for (const { columna, filas } of resultados) {
      const visto = new Set<string>();
      for (const f of filas) {
        const id = String(f.vehicle_id);
        if (visto.has(id)) continue; // la primera fila de cada vehículo es la más reciente de esa tabla
        visto.add(id);
        const km = Number(f[columna]);
        if (Number.isFinite(km) && km > (ultimoKmPorVehiculo[id] ?? 0)) ultimoKmPorVehiculo[id] = km;
      }
    }
  }

  const checklistItems = await getChecklistItemsActivos("PREOPERACIONAL");
  const servicios = profile.role_codigo === "OVEM" ? await getServiciosMedicos() : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Portal OVEM</h1>
        <p className="mt-2 text-muted-foreground">
          Preoperacional, tanqueos, novedades y siniestros
        </p>
      </div>

      <OvemPortal
        userId={user.id}
        userName={profile.nombre_completo || profile.email || "Usuario"}
        vehicles={vehicles ?? []}
        checklistItems={checklistItems}
        hoyBogota={hoy}
        vehiculosDeHoy={vehiculosDeHoy}
        ultimoKmPorVehiculo={ultimoKmPorVehiculo}
        servicios={servicios as any}
        isAdmin={isAdminLike(profile.role_codigo)}
        viewerRole={profile.role_codigo === "OVEM" ? "OVEM" : "ADMIN"}
      />
    </div>
  );
}
