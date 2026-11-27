import { auditar } from "@/lib/auditoria";
import {
  hallazgosPreoperacional,
  novedadesDeHallazgos,
  resumirHallazgos,
  type EstadoAviso,
  type ItemEvaluado,
  type ResumenHallazgos,
} from "@/lib/preoperacional-alertas";
import type { Dia } from "@/lib/fechas";
import { avisarVehiculoNoApto } from "@/lib/notifications/alerta-no-apto";

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este repo (ver CLAUDE.md).
type Cliente = any;

export interface ResultadoHallazgos extends ResumenHallazgos {
  novedadesCreadas: number;
}

/**
 * Convierte los hallazgos de un preoperacional en novedades (módulo servidor, sin "use server": no es una acción que el
 * navegador pueda invocar). Cada novedad crítica lleva `afecta_operatividad` y el trigger de la base (094) saca el
 * vehículo de servicio con fecha e historial. No duplica: si ya hay una novedad abierta con la misma clave para el vehículo
 * (el mismo bombillo quemado de ayer, el mismo SOAT vencido), no abre otra hasta que se cierre.
 */
export async function registrarHallazgosPreoperacional(
  supabase: Cliente,
  args: { vehicleId: string; items: ItemEvaluado[]; reportadoPor: string; hoy: Dia }
): Promise<ResultadoHallazgos> {
  const { data: vehiculo, error: errVehiculo } = await supabase
    .from("vehicles")
    .select("vencimiento_soat, vencimiento_tecnicomecanica, vencimiento_rtm")
    .eq("id", args.vehicleId)
    .maybeSingle();
  if (errVehiculo) console.error("[preoperacional] no se pudo leer la ficha del vehículo:", errVehiculo.code, errVehiculo.message);

  // Sin la ficha no se pueden evaluar los documentos: mejor omitirlos que inventar un «sin fecha de vencimiento».
  const documentosSinEvaluar = Boolean(errVehiculo);
  const hallazgos = hallazgosPreoperacional(args.items, vehiculo ?? {}, args.hoy, { sinDocumentos: documentosSinEvaluar });
  let resumen = resumirHallazgos(hallazgos, "ENVIADO", { criticos: 0, otros: 0, documentosSinEvaluar });
  const novedades = novedadesDeHallazgos(hallazgos, args.hoy);
  if (novedades.length === 0) return { ...resumen, novedadesCreadas: 0 };

  const { data: abiertas, error: errAbiertas } = await supabase
    .from("incidents")
    .select("descripcion")
    .eq("vehicle_id", args.vehicleId)
    .in("estado", ["ABIERTO", "EN_PROCESO"]);
  // Sin esta lectura no se puede evitar un duplicado, pero perder un crítico es peor: se sigue y se deja el rastro.
  if (errAbiertas) console.error("[preoperacional] no se pudieron leer las novedades abiertas (puede haber duplicados):", errAbiertas.code, errAbiertas.message);
  const yaAbiertas: string[] = (abiertas ?? []).map((i: { descripcion: string }) => i.descripcion);

  let creadas = 0;
  const noRegistrados = { criticos: 0, otros: 0 };
  const criticosNuevos: string[] = [];
  for (const n of novedades) {
    // La clave es un prefijo estable: «[Preoperacional] Luz de freno» sigue abierta aunque el detalle cambie.
    if (yaAbiertas.some((d) => d.startsWith(n.clave))) continue;
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
    if (error || !data) {
      // Antes se saltaba en silencio: el OVEM leía «ya estaba reportado» sin que se hubiera creado nada. Ahora se cuenta y
      // se le dice; reenviar el checklist reintenta (la clave estable evita duplicar lo que sí quedó abierto).
      console.error("[preoperacional] no se pudo abrir la novedad:", n.clave, error?.code, error?.message);
      if (n.afectaOperatividad) noRegistrados.criticos++;
      else noRegistrados.otros++;
      continue;
    }
    creadas++;
    if (n.afectaOperatividad) criticosNuevos.push(n.clave.replace(/^\[Preoperacional\]\s*/, ""));
    await auditar(
      "INSERTAR",
      "novedades",
      data.id as number,
      n.afectaOperatividad ? "Novedad automática del preoperacional (crítica: vehículo a FDS)" : "Novedad automática del preoperacional"
    );
  }
  // Aviso inmediato solo por los críticos que se abren ahora: un crítico que sigue abierto no repite el correo cada día.
  let aviso: EstadoAviso = "YA_REPORTADO";
  if (criticosNuevos.length > 0) {
    const r = await avisarVehiculoNoApto(supabase, { vehicleId: args.vehicleId, hallazgos: criticosNuevos, reportadoPor: args.reportadoPor });
    // Sin destinatarios o sin correo configurado el aviso no salió: el conductor debe saberlo para llamar.
    aviso = r.enviado && r.destinatarios > 0 ? "ENVIADO" : "FALLO";
  }
  resumen = resumirHallazgos(hallazgos, aviso, { ...noRegistrados, documentosSinEvaluar });
  return { ...resumen, novedadesCreadas: creadas };
}
