"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { VehicleFormData } from "@/lib/validations";
import { vehicleSchema } from "@/lib/validations";
import { z } from "zod";
import { requireRole } from "@/app/api/actions/auth";

const fechaKmRegex = z
  .string()
  .min(1)
  .refine((s) => !Number.isNaN(Date.parse(s)), "Fecha inválida");

const registrarKmVehSchema = z.object({
  vehicleId: z.string().uuid("ID de vehículo inválido"),
  fecha: fechaKmRegex,
  lecturaKilometraje: z.number().int().positive("El kilometraje debe ser mayor a cero"),
});

export async function registrarKilometrajeVehiculo(input: z.infer<typeof registrarKmVehSchema>) {
  await requireRole(["ADMIN", "REGULACION", "MANTENIMIENTO"]);
  const parsed = registrarKmVehSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const { vehicleId: vid, fecha: fechaVal, lecturaKilometraje: kmVal } = parsed.data;
  const supabase = createClient();

  const { data: ultimo } = await supabase
    .from("mileage_logs")
    .select("lectura_kilometraje")
    .eq("vehicle_id", vid)
    .order("fecha", { ascending: false })
    .limit(1)
    .maybeSingle();

  const ultimoKm = ultimo?.lectura_kilometraje ?? 0;
  if (kmVal < ultimoKm) {
    return { error: `El kilometraje no puede ser menor al último registrado (${ultimoKm})` };
  }

  const { error } = await supabase.from("mileage_logs").upsert(
    {
      vehicle_id: vid,
      fecha: fechaVal,
      lectura_kilometraje: kmVal,
    },
    { onConflict: "vehicle_id,fecha" }
  );

  if (error) return { error: error.message };
  revalidatePath("/vehiculos");
  revalidatePath(`/vehiculos/${vid}`);
  revalidatePath("/");
  return { success: true };
}

export async function getVehiculos() {
  const supabase = createClient();
  const { data } = await supabase
    .from("vehicles")
    .select(`*, operational_centers(id, nombre, codigo)`)
    .order("placa");
  return data || [];
}

export async function getVehiculoPorId(id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("vehicles")
    .select(`*, operational_centers(id, nombre, codigo)`)
    .eq("id", id)
    .single();
  return data;
}

export async function crearVehiculo(formData: VehicleFormData) {
  await requireRole(["ADMIN"]);
  const parsed = vehicleSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();

  // Obtener el codigo del centro para guardar en centro_operativo (compatibilidad)
  const fd = parsed.data;

  const { data: centro } = await supabase
    .from("operational_centers")
    .select("codigo, nombre")
    .eq("id", fd.centro_operativo_id)
    .single();

  const { error } = await supabase.from("vehicles").insert({
    placa: fd.placa.toUpperCase(),
    marca: fd.marca || null,
    modelo: fd.modelo || null,
    linea: fd.linea || null,
    tipo_combustible: fd.tipo_combustible || null,
    tipo_llantas: fd.tipo_llantas || null,
    tipo_bombillos: fd.tipo_bombillos || null,
    tipo_refrigerante: fd.tipo_refrigerante || null,
    aceite_usado: fd.aceite_usado || null,
    ref_filtro_aire_motor: fd.ref_filtro_aire_motor || null,
    ref_filtro_aceite: fd.ref_filtro_aceite || null,
    ref_filtro_combustible: fd.ref_filtro_combustible || null,
    notas: fd.notas || null,
    vencimiento_soat: fd.vencimiento_soat || null,
    vencimiento_tecnicomecanica: fd.vencimiento_tecnicomecanica || null,
    costo_soat_anual: fd.costo_soat_anual ?? null,
    costo_tecnomecanica_anual: fd.costo_tecnomecanica_anual ?? null,
    costo_poliza_anual: fd.costo_poliza_anual ?? null,
    centro_operativo: centro?.codigo || "OTRO",
    centro_operativo_id: fd.centro_operativo_id,
    estado_actual: "OPERATIVO",
  });

  if (error) return { error: error.message };
  revalidatePath("/configuracion");
  revalidatePath("/vehiculos");
  return { success: true };
}

export async function actualizarVehiculo(id: string, formData: VehicleFormData) {
  await requireRole(["ADMIN", "REGULACION"]);
  const idParsed = z.string().uuid("ID de vehículo inválido").safeParse(id);
  if (!idParsed.success) return { error: idParsed.error.issues[0]?.message ?? "Datos inválidos" };

  const parsed = vehicleSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const fd = parsed.data;

  const { data: centro } = await supabase
    .from("operational_centers")
    .select("codigo")
    .eq("id", fd.centro_operativo_id)
    .single();

  const { error } = await supabase
    .from("vehicles")
    .update({
      placa: fd.placa.toUpperCase(),
      marca: fd.marca || null,
      modelo: fd.modelo || null,
      linea: fd.linea || null,
      tipo_combustible: fd.tipo_combustible || null,
      tipo_llantas: fd.tipo_llantas || null,
      tipo_bombillos: fd.tipo_bombillos || null,
      tipo_refrigerante: fd.tipo_refrigerante || null,
      aceite_usado: fd.aceite_usado || null,
      ref_filtro_aire_motor: fd.ref_filtro_aire_motor || null,
      ref_filtro_aceite: fd.ref_filtro_aceite || null,
      ref_filtro_combustible: fd.ref_filtro_combustible || null,
      notas: fd.notas || null,
      vencimiento_soat: fd.vencimiento_soat || null,
      vencimiento_tecnicomecanica: fd.vencimiento_tecnicomecanica || null,
      costo_soat_anual: fd.costo_soat_anual ?? null,
      costo_tecnomecanica_anual: fd.costo_tecnomecanica_anual ?? null,
      costo_poliza_anual: fd.costo_poliza_anual ?? null,
      centro_operativo: centro?.codigo || "OTRO",
      centro_operativo_id: fd.centro_operativo_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idParsed.data);

  if (error) return { error: error.message };
  revalidatePath("/configuracion");
  revalidatePath("/vehiculos");
  revalidatePath(`/vehiculos/${idParsed.data}`);
  return { success: true };
}

export async function eliminarVehiculo(id: string) {
  await requireRole(["ADMIN"]);
  const idParsed = z.string().uuid("ID de vehículo inválido").safeParse(id);
  if (!idParsed.success) return { error: idParsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();

  // Verificar si tiene mantenimientos
  const { count } = await supabase
    .from("maintenance_records")
    .select("*", { count: "exact", head: true })
    .eq("vehicle_id", idParsed.data);

  if (count && count > 0) {
    return {
      error: `No se puede eliminar: el vehículo tiene ${count} registro(s) de mantenimiento.`,
    };
  }

  const { error } = await supabase.from("vehicles").delete().eq("id", idParsed.data);
  if (error) return { error: error.message };
  revalidatePath("/configuracion");
  revalidatePath("/vehiculos");
  return { success: true };
}
