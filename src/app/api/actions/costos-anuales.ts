"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireRole } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { costoAnualSchema, ROLES_EDITAN_COSTOS_ANUALES, type CostoAnualFila, type CostoAnualInput } from "@/lib/costos-anuales";
import { createClient } from "@/lib/supabase/server";

const idVehiculo = z.string().uuid("ID de vehículo inválido");

// La tabla es nueva y aún no está en database.types.ts: se usa el cliente sin tipos generados.
function db(): SupabaseClient<any> {
  return createClient() as unknown as SupabaseClient<any>;
}

/** Traduce el error de la base a un mensaje que el usuario pueda actuar. */
function mensajeDeError(e: { code?: string; message: string }): string {
  if (e.code === "23P01") return "Esas fechas se solapan con otro registro del mismo tipo para este vehículo.";
  if (e.code === "42501") return "No tienes permiso para esta acción.";
  return e.message;
}

function refrescar(vehicleId: string) {
  revalidatePath(`/vehiculos/${vehicleId}`);
  revalidatePath("/");
  revalidatePath("/kpis");
}

export async function listarCostosAnuales(vehicleId: string): Promise<CostoAnualFila[]> {
  if (!idVehiculo.safeParse(vehicleId).success) return [];
  const { data, error } = await db()
    .from("vehicle_annual_costs")
    .select("id, tipo, vigencia_desde, vigencia_hasta, valor, fecha_pago, proveedor, numero_documento, estimado, notas")
    .eq("vehicle_id", vehicleId)
    .order("tipo")
    .order("vigencia_desde", { ascending: false });
  if (error) {
    console.error("listarCostosAnuales:", error.message);
    return [];
  }
  return (data ?? []).map((r: any) => ({ ...r, valor: Number(r.valor) })) as CostoAnualFila[];
}

export async function registrarCostoAnual(vehicleId: string, input: CostoAnualInput) {
  await requireRole([...ROLES_EDITAN_COSTOS_ANUALES]);
  const vid = idVehiculo.safeParse(vehicleId);
  if (!vid.success) return { error: "ID de vehículo inválido" };
  const p = costoAnualSchema.safeParse(input);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Datos inválidos" };
  const v = p.data;

  const { data, error } = await db().rpc("registrar_costo_anual", {
    p_vehicle_id: vid.data,
    p_tipo: v.tipo,
    p_desde: v.vigenciaDesde,
    p_hasta: v.vigenciaHasta,
    p_valor: v.valor,
    p_fecha_pago: v.fechaPago ?? null,
    p_proveedor: v.proveedor ?? null,
    p_numero_documento: v.numeroDocumento ?? null,
    p_notas: v.notas ?? null,
  });
  if (error) return { error: mensajeDeError(error) };

  await auditar("INSERTAR", "costos_anuales", String(data ?? ""), `${v.tipo} ${v.vigenciaDesde} a ${v.vigenciaHasta}: $${v.valor}`);
  refrescar(vid.data);
  return { success: true as const };
}

/** Corrige un registro. Al guardarlo deja de ser un estimado: alguien lo confirmó. */
export async function actualizarCostoAnual(vehicleId: string, id: number, input: CostoAnualInput) {
  await requireRole([...ROLES_EDITAN_COSTOS_ANUALES]);
  const vid = idVehiculo.safeParse(vehicleId);
  if (!vid.success || !Number.isInteger(id)) return { error: "Datos inválidos" };
  const p = costoAnualSchema.safeParse(input);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Datos inválidos" };
  const v = p.data;

  const { data, error } = await db()
    .from("vehicle_annual_costs")
    .update({
      tipo: v.tipo,
      vigencia_desde: v.vigenciaDesde,
      vigencia_hasta: v.vigenciaHasta,
      valor: v.valor,
      fecha_pago: v.fechaPago ?? null,
      proveedor: v.proveedor ?? null,
      numero_documento: v.numeroDocumento ?? null,
      notas: v.notas ?? null,
      estimado: false,
    })
    .eq("id", id)
    .eq("vehicle_id", vid.data)
    .select("id");
  if (error) return { error: mensajeDeError(error) };
  if (!data || data.length === 0) return { error: "No se encontró el registro o no tienes permiso para modificarlo." };

  await auditar("MODIFICAR", "costos_anuales", String(id), `${v.tipo} ${v.vigenciaDesde} a ${v.vigenciaHasta}: $${v.valor}`);
  refrescar(vid.data);
  return { success: true as const };
}

export async function eliminarCostoAnual(vehicleId: string, id: number) {
  await requireRole(["ADMIN"]);
  const vid = idVehiculo.safeParse(vehicleId);
  if (!vid.success || !Number.isInteger(id)) return { error: "Datos inválidos" };

  const { data, error } = await db().from("vehicle_annual_costs").delete().eq("id", id).eq("vehicle_id", vid.data).select("id");
  if (error) return { error: mensajeDeError(error) };
  if (!data || data.length === 0) return { error: "No se encontró el registro." };

  await auditar("ELIMINAR", "costos_anuales", String(id));
  refrescar(vid.data);
  return { success: true as const };
}
