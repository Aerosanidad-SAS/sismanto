"use server";

import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { revalidatePath } from "next/cache";
import type { MaintenanceFormData } from "@/lib/validations";
import { maintenanceSchema } from "@/lib/validations";
import { requireRole } from "@/app/api/actions/auth";
import { randomUUID } from "node:crypto";
import {
  esRutaSoporteDe,
  rutaSoporte,
  SOPORTE_BUCKET,
  SOPORTE_FORMATOS,
  SOPORTE_TAMANO_MAXIMO,
  tipoSoportePorContenido,
} from "@/lib/soporte-mantenimiento";

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
  const perfil = await requireRole(["ADMIN", "ANALISTA", "MANTENIMIENTO"]);
  const parsed = maintenanceSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const payload = parsed.data;
  // El soporte ya está subido (ver `subirSoporteMantenimiento`): si el registro no se completa, se quita para no dejar huérfanos.
  if (payload.soportePath && !esRutaSoporteDe(perfil.user_id, payload.soportePath)) return { error: "Soporte inválido. Súbelo de nuevo." };
  const quitarSoporte = async () => {
    if (payload.soportePath) await supabase.storage.from(SOPORTE_BUCKET).remove([payload.soportePath]);
  };
  // La ruta debe corresponder a un archivo realmente subido: sin esto se podría marcar «con soporte» una ruta inventada.
  if (payload.soportePath) {
    const [carpeta, nombre] = payload.soportePath.split("/");
    const { data: existente } = await supabase.storage.from(SOPORTE_BUCKET).list(carpeta, { search: nombre, limit: 1 });
    if (!existente?.some((o) => o.name === nombre)) return { error: "Soporte inválido. Súbelo de nuevo." };
  }

  try {
    // 1. Validar que el kilometraje sea >= al último registrado
    const ultimoKm = await getUltimoKilometraje(payload.vehicleId);
    if (payload.kilometrajeActual < ultimoKm) {
      await quitarSoporte();
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
        soporte_path: payload.soportePath || null,
        // Regla de Airplan: un correctivo se puede guardar sin soporte, pero queda marcado «sin soporte».
        requiere_soporte: payload.tipo === "CORRECTIVO",
      })
      .select()
      .single();

    if (error) {
      await quitarSoporte();
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

    await auditar("INSERTAR", "mantenimientos", payload.vehicleId, "Mantenimiento registrado");
    revalidatePath("/mantenimientos");
    revalidatePath(`/vehiculos/${payload.vehicleId}`);
    revalidatePath("/");
    revalidatePath("/novedades");

    return { success: true, data: manto };
  } catch (error) {
    await quitarSoporte();
    return {
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
/**
 * Sube el soporte de un mantenimiento (factura, orden de trabajo o foto) al bucket privado. El tipo se valida por el contenido
 * del archivo, no por su nombre; el nombre lo genera el servidor y va en la carpeta del usuario. Devuelve la ruta para pasarla
 * a `crearMantenimiento`.
 */
export async function subirSoporteMantenimiento(formData: FormData): Promise<{ path: string } | { error: string }> {
  const perfil = await requireRole(["ADMIN", "ANALISTA", "MANTENIMIENTO"]);
  const archivo = formData.get("soporte");
  if (!(archivo instanceof File) || archivo.size === 0) return { error: "Elige un archivo" };
  if (archivo.size > SOPORTE_TAMANO_MAXIMO) return { error: "El soporte no puede pesar más de 8 MB" };
  const tipo = tipoSoportePorContenido(new Uint8Array(await archivo.slice(0, 16).arrayBuffer()));
  if (!tipo) return { error: `El soporte debe ser un archivo ${SOPORTE_FORMATOS}` };

  const path = rutaSoporte(perfil.user_id, randomUUID(), tipo);
  const { error } = await createClient()
    .storage.from(SOPORTE_BUCKET)
    .upload(path, archivo, { contentType: tipo.mime, cacheControl: "3600", upsert: false });
  if (error) return { error: "No se pudo subir el soporte: " + error.message };
  return { path };
}

/** URL firmada (1 hora) para abrir el soporte de un mantenimiento; el bucket es privado. */
export async function urlSoporteMantenimiento(idManto: number): Promise<{ url: string } | { error: string }> {
  await requireRole(["ADMIN", "ANALISTA", "MANTENIMIENTO"]);
  if (!Number.isInteger(idManto) || idManto <= 0) return { error: "ID inválido" };
  const supabase = createClient();
  const { data } = await supabase.from("maintenance_records").select("soporte_path").eq("id_manto", idManto).maybeSingle();
  const ruta = (data as { soporte_path: string | null } | null)?.soporte_path;
  if (!ruta) return { error: "Este mantenimiento no tiene soporte" };
  const firmada = await supabase.storage.from(SOPORTE_BUCKET).createSignedUrl(ruta, 3600);
  if (firmada.error || !firmada.data?.signedUrl) return { error: "No se pudo abrir el soporte" };
  return { url: firmada.data.signedUrl };
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

  await auditar("MODIFICAR", "mantenimientos", idManto, "Mantenimiento actualizado");
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
