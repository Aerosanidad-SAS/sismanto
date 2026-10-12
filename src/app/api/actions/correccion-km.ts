"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auditar } from "@/lib/auditoria";
import { validarKmEnLinea, type LecturaKm, type OrigenLectura } from "@/lib/kilometraje";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "./auth";

/**
 * Corrección de lecturas de kilometraje por el ADMIN. El km solo avanza (trigger de `mileage_logs` y regla del portal OVEM),
 * así que un número mal digitado queda como tope y bloquea todo lo posterior. Aquí el ADMIN lo corrige: se cambia el valor
 * en todas las filas de ese día que lo repiten (odómetro, tanqueo, preoperacional) y se recalcula `vehicles.km_actual`.
 * Todo queda en la auditoría con el motivo.
 */

export interface LecturaListada {
  origen: OrigenLectura;
  fecha: string;
  km: number;
  /** Quién o qué la registró, si se sabe (solo informativo). */
  detalle: string | null;
}

type Fila = Record<string, unknown>;

/** Todas las lecturas del vehículo (una fila por valor), de las tres fuentes. Clave de servicio: el ADMIN ve todo. */
async function leerTodas(vehicleId: string) {
  const admin = createAdminClient() as any;
  const [odo, tanq, preop] = await Promise.all([
    admin.from("mileage_logs").select("fecha, lectura_kilometraje").eq("vehicle_id", vehicleId).order("fecha", { ascending: false }).limit(300),
    admin.from("fuel_logs").select("id, fecha, kilometraje").eq("vehicle_id", vehicleId).order("fecha", { ascending: false }).limit(300),
    admin
      .from("daily_checks")
      .select("id, fecha, kilometraje_inicial, kilometraje_final")
      .eq("vehicle_id", vehicleId)
      .order("fecha", { ascending: false })
      .limit(300),
  ]);
  for (const r of [odo, tanq, preop]) if (r.error) throw new Error(r.error.message);
  return {
    odo: (odo.data ?? []) as Fila[],
    tanq: (tanq.data ?? []) as Fila[],
    preop: (preop.data ?? []) as Fila[],
  };
}

function aLecturas(t: Awaited<ReturnType<typeof leerTodas>>): LecturaListada[] {
  const out: LecturaListada[] = [];
  for (const r of t.odo) out.push({ origen: "odómetro", fecha: String(r.fecha), km: Number(r.lectura_kilometraje), detalle: null });
  for (const r of t.tanq) out.push({ origen: "tanqueo", fecha: String(r.fecha), km: Number(r.kilometraje), detalle: null });
  for (const r of t.preop) {
    const ini = Number(r.kilometraje_inicial);
    const fin = Number(r.kilometraje_final);
    if (Number.isFinite(ini) && ini > 0) out.push({ origen: "preoperacional", fecha: String(r.fecha), km: ini, detalle: "km inicial" });
    if (Number.isFinite(fin) && fin > 0 && fin !== ini) out.push({ origen: "preoperacional", fecha: String(r.fecha), km: fin, detalle: "km final" });
  }
  return out
    .filter((l) => Number.isFinite(l.km))
    .sort((a, b) => (a.fecha === b.fecha ? b.km - a.km : a.fecha < b.fecha ? 1 : -1));
}

const idSchema = z.string().uuid("Vehículo inválido");

export async function listarLecturasKm(vehicleId: string): Promise<{ lecturas: LecturaListada[]; kmActual: number | null } | { error: string }> {
  await requireRole(["ADMIN"]);
  const id = idSchema.safeParse(vehicleId);
  if (!id.success) return { error: id.error.issues[0].message };
  try {
    const admin = createAdminClient() as any;
    const [todas, v] = await Promise.all([leerTodas(id.data), admin.from("vehicles").select("km_actual").eq("id", id.data).maybeSingle()]);
    return { lecturas: aLecturas(todas).slice(0, 60), kmActual: v.data?.km_actual ?? null };
  } catch (e) {
    console.error("[correccion-km] no se pudieron leer las lecturas:", e instanceof Error ? e.message : e);
    return { error: "No se pudieron leer las lecturas del vehículo." };
  }
}

const correccionSchema = z.object({
  vehicleId: z.string().uuid("Vehículo inválido"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  kmActual: z.number().int().positive(),
  kmNuevo: z.number().int().positive("El kilometraje nuevo debe ser mayor a cero").max(2_000_000, "El kilometraje es demasiado alto"),
  motivo: z.string().trim().min(5, "Escribe el motivo de la corrección (mínimo 5 caracteres)").max(300),
});

export async function corregirLecturaKm(input: z.infer<typeof correccionSchema>): Promise<{ success: true } | { error: string }> {
  await requireRole(["ADMIN"]);
  const parsed = correccionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const { vehicleId, fecha, kmActual, kmNuevo, motivo } = parsed.data;
  if (kmActual === kmNuevo) return { error: "El kilometraje nuevo es igual al actual." };

  const admin = createAdminClient() as any;
  try {
    const t = await leerTodas(vehicleId);
    const todas = aLecturas(t);
    if (!todas.some((l) => l.fecha === fecha && l.km === kmActual)) return { error: "Esa lectura ya cambió. Recarga la lista." };

    // El valor nuevo tiene que encajar con el resto de la línea de tiempo (sin contar las filas que se van a corregir).
    const otras: LecturaKm[] = todas.filter((l) => !(l.fecha === fecha && l.km === kmActual)).map((l) => ({ fecha: l.fecha, km: l.km, origen: l.origen }));
    const errorLinea = validarKmEnLinea(kmNuevo, fecha, otras);
    if (errorLinea) return { error: errorLinea };

    let filas = 0;
    // 1) Odómetro (primero: el trigger de preoperacional lo compara con GREATEST).
    {
      const { data, error } = await admin
        .from("mileage_logs")
        .update({ lectura_kilometraje: kmNuevo })
        .eq("vehicle_id", vehicleId)
        .eq("fecha", fecha)
        .eq("lectura_kilometraje", kmActual)
        .select("fecha");
      if (error) return { error: error.message };
      filas += (data ?? []).length;
    }
    // 2) Tanqueos del día con ese valor.
    {
      const { data, error } = await admin
        .from("fuel_logs")
        .update({ kilometraje: kmNuevo })
        .eq("vehicle_id", vehicleId)
        .eq("fecha", fecha)
        .eq("kilometraje", kmActual)
        .select("id");
      if (error) return { error: error.message };
      filas += (data ?? []).length;
    }
    // 3) Preoperacionales del día: inicial y final juntos (la base exige final >= inicial).
    for (const r of t.preop.filter((x) => String(x.fecha) === fecha)) {
      const ini = Number(r.kilometraje_inicial);
      const fin = Number(r.kilometraje_final);
      if (ini !== kmActual && fin !== kmActual) continue;
      const cambios = {
        kilometraje_inicial: ini === kmActual ? kmNuevo : r.kilometraje_inicial,
        kilometraje_final: fin === kmActual ? kmNuevo : r.kilometraje_final,
      };
      const { error } = await admin.from("daily_checks").update(cambios).eq("id", r.id);
      if (error) return { error: error.message };
      filas++;
    }
    if (filas === 0) return { error: "No se encontró ninguna fila para corregir." };

    // 4) `km_actual` solo sube por trigger: se recalcula desde el odómetro para que baje si hacía falta.
    const { data: mayor } = await admin
      .from("mileage_logs")
      .select("fecha, lectura_kilometraje")
      .eq("vehicle_id", vehicleId)
      .order("lectura_kilometraje", { ascending: false })
      .limit(1)
      .maybeSingle();
    await admin
      .from("vehicles")
      .update({ km_actual: mayor?.lectura_kilometraje ?? null, fecha_km_actual: mayor?.fecha ?? null })
      .eq("id", vehicleId);

    await auditar(
      "MODIFICAR",
      "vehiculos",
      vehicleId,
      `Corrección de kilometraje del ${fecha}: ${kmActual} → ${kmNuevo} km (${filas} registro${filas === 1 ? "" : "s"}). Motivo: ${motivo}`
    );
    revalidatePath(`/vehiculos/${vehicleId}`);
    revalidatePath("/vehiculos");
    revalidatePath("/ovem");
    return { success: true };
  } catch (e) {
    console.error("[correccion-km] no se pudo corregir:", e instanceof Error ? e.message : e);
    return { error: "No se pudo corregir el kilometraje. Inténtalo de nuevo." };
  }
}
