"use server";

import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/app/api/actions/auth";
import { z } from "zod";

const createServiceTypeSchema = z.object({
  codigo: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[A-Z0-9_]+$/i, "Solo letras, números y guión bajo"),
  nombre: z.string().min(3).max(200),
});

const upsertRevenueSchema = z.object({
  vehicleId: z.string().uuid(),
  serviceTypeId: z.number().int().positive(),
  /** Primer día del mes (YYYY-MM-01) */
  periodo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  monto: z.number().nonnegative(),
  notas: z.string().optional(),
});

export async function listServiceTypesAdmin() {
  await requireRole(["ADMIN", "ANALISTA"]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("service_types")
    .select("*")
    .order("orden", { ascending: true })
    .order("codigo", { ascending: true });

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function createServiceType(raw: z.infer<typeof createServiceTypeSchema>) {
  await requireRole(["ADMIN", "ANALISTA"]);
  const parsed = createServiceTypeSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const codigo = parsed.data.codigo.toUpperCase();
  const { error } = await supabase.from("service_types").insert({
    codigo,
    nombre: parsed.data.nombre.trim(),
    activo: true,
    orden: 99,
  });

  if (error) return { error: error.message };
  await auditar("INSERTAR", "configuracion", "", "Tipo de servicio creado");
  revalidatePath("/configuracion");
  return { success: true };
}

export async function listVehicleServiceRevenue(vehicleId: string) {
  await requireRole(["ADMIN", "ANALISTA", "GERENCIAL"]);
  const idParsed = z.string().uuid().safeParse(vehicleId);
  if (!idParsed.success) return { error: "Vehículo inválido", data: [] };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicle_service_revenue")
    .select(`*, service_types (codigo, nombre)`)
    .eq("vehicle_id", idParsed.data)
    .order("periodo", { ascending: false });

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function upsertVehicleServiceRevenue(raw: z.infer<typeof upsertRevenueSchema>) {
  await requireRole(["ADMIN", "ANALISTA"]);
  const parsed = upsertRevenueSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id ?? null;

  const { error } = await supabase.from("vehicle_service_revenue").upsert(
    {
      vehicle_id: parsed.data.vehicleId,
      service_type_id: parsed.data.serviceTypeId,
      periodo: parsed.data.periodo,
      monto: parsed.data.monto,
      notas: parsed.data.notas?.trim() || null,
      created_by: userId,
    },
    { onConflict: "vehicle_id,service_type_id,periodo" }
  );

  if (error) return { error: error.message };
  await auditar("MODIFICAR", "vehiculos", parsed.data.vehicleId, `Ingreso por servicio registrado (periodo ${parsed.data.periodo})`);
  revalidatePath(`/vehiculos/${parsed.data.vehicleId}`);
  revalidatePath("/configuracion");
  return { success: true };
}

export async function deleteVehicleServiceRevenue(id: number, vehicleId: string) {
  await requireRole(["ADMIN", "ANALISTA"]);
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };
  const vidParsed = z.string().uuid().safeParse(vehicleId);
  if (!vidParsed.success) return { error: "Vehículo inválido" };
  const supabase = createClient();
  const { error } = await supabase.from("vehicle_service_revenue").delete().eq("id", idParsed.data);
  if (error) return { error: error.message };
  await auditar("ELIMINAR", "vehiculos", vidParsed.data, "Ingreso por servicio eliminado");
  revalidatePath(`/vehiculos/${vidParsed.data}`);
  return { success: true };
}
