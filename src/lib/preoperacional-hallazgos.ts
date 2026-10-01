import { auditar } from "@/lib/auditoria";
import {
  hallazgosPreoperacional,
  novedadesDeHallazgos,
  resumirHallazgos,
  type ItemEvaluado,
  type ResumenHallazgos,
} from "@/lib/preoperacional-alertas";
import type { Dia } from "@/lib/fechas";

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este repo (ver CLAUDE.md).
type Cliente = any;

export interface ResultadoHallazgos extends ResumenHallazgos {
  novedadesCreadas: number;
}

/**
 * Convierte los hallazgos de un preoperacional en novedades (módulo servidor, sin "use server": no es una acción que el
 * navegador pueda invocar). Cada novedad crítica lleva `afecta_operatividad` y el trigger de la base (094) saca el
 * vehículo de servicio con fecha e historial. No duplica: si ya hay una novedad abierta con la misma descripción para el
 * vehículo (p. ej. el mismo SOAT vencido de ayer), no abre otra.
 */
export async function registrarHallazgosPreoperacional(
  supabase: Cliente,
  args: { vehicleId: string; items: ItemEvaluado[]; reportadoPor: string; hoy: Dia }
): Promise<ResultadoHallazgos> {
  const { data: vehiculo } = await supabase
    .from("vehicles")
    .select("vencimiento_soat, vencimiento_tecnicomecanica, vencimiento_rtm")
    .eq("id", args.vehicleId)
    .maybeSingle();

  const hallazgos = hallazgosPreoperacional(args.items, vehiculo ?? {}, args.hoy);
  const resumen = resumirHallazgos(hallazgos);
  const novedades = novedadesDeHallazgos(hallazgos, args.hoy);
  if (novedades.length === 0) return { ...resumen, novedadesCreadas: 0 };

  const { data: abiertas } = await supabase
    .from("incidents")
    .select("descripcion")
    .eq("vehicle_id", args.vehicleId)
    .in("estado", ["ABIERTO", "EN_PROCESO"]);
  const yaAbiertas = new Set<string>((abiertas ?? []).map((i: { descripcion: string }) => i.descripcion));

  let creadas = 0;
  for (const n of novedades) {
    if (yaAbiertas.has(n.descripcion)) continue;
    const { data, error } = await supabase
      .from("incidents")
      .insert({
        vehicle_id: args.vehicleId,
        descripcion: n.descripcion,
        severidad: n.severidad,
        reportado_por: args.reportadoPor,
        afecta_operatividad: n.afectaOperatividad,
        estado: "ABIERTO",
      })
      .select("id")
      .single();
    if (error || !data) continue;
    creadas++;
    await auditar(
      "INSERTAR",
      "novedades",
      data.id as number,
      n.afectaOperatividad ? "Novedad automática del preoperacional (crítica: vehículo a FDS)" : "Novedad automática del preoperacional"
    );
  }
  return { ...resumen, novedadesCreadas: creadas };
}
