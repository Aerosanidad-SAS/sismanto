"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MaintenanceFormData } from "@/lib/validations";
import { maintenanceSchema } from "@/lib/validations";
import { requireRole } from "@/app/api/actions/auth";

async function getUltimoKilometraje(vehicleId: string): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from("mileage_logs")
    .select("lectura_kilometraje")
    .eq("vehicle_id", vehicleId)
    .order("fecha", { ascending: false })
    .limit(1)
    .single();

  return data?.lectura_kilometraje || 0;
}

async function countNovedadesAbiertas(vehicleId: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("vehicle_id", vehicleId)
    .eq("estado", "ABIERTO");

  return count || 0;
}

export async function crearMantenimiento(formData: MaintenanceFormData) {
  await requireRole(["ADMIN", "ANALISTA", "MANTENIMIENTO"]);
  const parsed = maintenanceSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const payload = parsed.data;

  try {
    // 1. Validar que el kilometraje sea >= al último registrado
    const ultimoKm = await getUltimoKilometraje(payload.vehicleId);
    if (payload.kilometrajeActual < ultimoKm) {
      return {
        error: `Kilometraje inválido. Último registrado: ${ultimoKm}`,
      };
    }

    // 2. Insertar el mantenimiento
    const { data: manto, error } = await supabase
      .from("maintenance_records")
      .insert({
        vehicle_id: payload.vehicleId,
        fecha: payload.fecha.toISOString().split("T")[0],
        kilometraje_actual: payload.kilometrajeActual,
        tipo: payload.tipo,
        categoria_id: payload.categoriaId,
        descripcion_trabajo: payload.descripcionTrabajo,
        proveedor: payload.proveedor,
        supplier_id: payload.supplierId || null,
        valor: payload.valor,
        numero_factura: payload.numeroFactura || null,
        tiempo_fuera_servicio_horas: payload.tiempoFueraServicioHoras || 0,
        notas_adicionales: payload.notasAdicionales || null,
        incident_id: payload.incidentId || null,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // 3. Si cierra una novedad, actualizar incident
    if (payload.incidentId) {
      await supabase
        .from("incidents")
        .update({
          estado: "CERRADO",
          fecha_cierre: new Date().toISOString(),
          mantenimiento_cierre_id: manto.id_manto,
        })
        .eq("id", payload.incidentId);
    }

    // 4. Registrar el kilometraje en mileage_logs
    await supabase.from("mileage_logs").upsert(
      {
        vehicle_id: payload.vehicleId,
        fecha: payload.fecha.toISOString().split("T")[0],
        lectura_kilometraje: payload.kilometrajeActual,
      },
      { onConflict: "vehicle_id,fecha" }
    );

    // 5. Si el vehículo estaba fuera de servicio, evaluar si debe volver a operativo
    if (payload.incidentId) {
      const novedadesAbiertas = await countNovedadesAbiertas(payload.vehicleId);
      if (novedadesAbiertas === 0) {
        await supabase
          .from("vehicles")
          .update({ estado_actual: "OPERATIVO" })
          .eq("id", payload.vehicleId);
      }
    }

    revalidatePath("/mantenimientos");
    revalidatePath(`/vehiculos/${payload.vehicleId}`);
    revalidatePath("/");
    revalidatePath("/novedades");

    return { success: true, data: manto };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
export async function getUltimoKilometrajeVehiculo(vehicleId: string) {
  return await getUltimoKilometraje(vehicleId);
}

export async function actualizarMantenimientoCampo(
  idManto: number,
  campos: {
    tipo?: "PREVENTIVO" | "CORRECTIVO";
    categoriaId?: number | null;
    descripcionTrabajo?: string;
  }
): Promise<{ success?: boolean; error?: string }> {
  await requireRole(["ADMIN", "ANALISTA", "MANTENIMIENTO"]);

  if (!idManto) return { error: "ID inválido" };

  const payload: Record<string, unknown> = {};
  if (campos.tipo !== undefined) payload.tipo = campos.tipo;
  if (campos.categoriaId !== undefined) payload.categoria_id = campos.categoriaId;
  if (campos.descripcionTrabajo !== undefined) {
    if (campos.descripcionTrabajo.trim().length < 3) return { error: "Descripción muy corta" };
    payload.descripcion_trabajo = campos.descripcionTrabajo.trim();
  }

  if (Object.keys(payload).length === 0) return { error: "Sin campos para actualizar" };

  const supabase = createClient();
  const { error } = await supabase
    .from("maintenance_records")
    .update(payload)
    .eq("id_manto", idManto);

  if (error) return { error: error.message };

  revalidatePath("/mantenimientos");
  revalidatePath("/");
  return { success: true };
}

export async function getNovedadesAbiertasPorVehiculo(vehicleId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("incidents")
    .select("id, descripcion, severidad, fecha_reporte")
    .eq("vehicle_id", vehicleId)
    .eq("estado", "ABIERTO")
    .order("fecha_reporte", { ascending: false });

  return data || [];
}
