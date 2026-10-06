"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { tipoImagenPorContenido, type FirmaImagen } from "@/lib/imagen-contenido";
import {
  BUCKET_FOTOS_VEHICULO,
  MAX_BYTES_FOTO_VEHICULO,
  MAX_MB_FOTO_VEHICULO,
  columnaDeLado,
  esLadoVehiculo,
  rutaFotoVehiculo,
  type LadoVehiculo,
} from "@/lib/vehiculo-fotos";

// 4 fotos opcionales del vehículo por costado (migración 111), en dos lugares: el registro del vehículo y cada
// preoperacional puntual. Bucket privado `vehiculos-fotos`: se guarda la ruta, no una URL pública — se sirve con
// signed URL, igual que la boleta de salida de servicios.

const ROLES_FOTO_VEHICULO = ["ADMIN", "ANALISTA", "REGULACION"] as const;

// `ok` como discriminante explícito: con dos formas sin una propiedad en común ("error" vs "tipo"), TypeScript no
// angosta de forma confiable con un simple `if ("error" in v)` — ambas formas declaran la clave "error" a efectos
// de ese chequeo en cuanto una la tiene como opcional, y el narrowing no la descarta.
async function archivoValido(file: File): Promise<{ ok: false; error: string } | { ok: true; tipo: FirmaImagen }> {
  if (file.size > MAX_BYTES_FOTO_VEHICULO) return { ok: false, error: `La foto no puede pesar más de ${MAX_MB_FOTO_VEHICULO} MB` };
  const cabecera = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const tipo = tipoImagenPorContenido(cabecera);
  if (!tipo) return { ok: false, error: "Formato no soportado — usa PNG, JPG o WEBP" };
  return { ok: true, tipo };
}

/** Foto de un vehículo registrado. Reemplaza solo el lado elegido; las otras 3 quedan intactas. */
export async function subirFotoVehiculo(
  vehicleId: string,
  lado: string,
  file: File
): Promise<{ error: string; success?: undefined } | { error?: undefined; success: true; ruta: string }> {
  await requireRole([...ROLES_FOTO_VEHICULO]);
  const idParsed = z.string().uuid("ID de vehículo inválido").safeParse(vehicleId);
  if (!idParsed.success) return { error: "ID inválido" };
  if (!esLadoVehiculo(lado)) return { error: "Lado inválido" };

  const v = await archivoValido(file);
  if (!v.ok) return { error: v.error };

  const supabase = createClient();
  const ruta = rutaFotoVehiculo("vehiculo", idParsed.data, lado, v.tipo.ext, randomUUID());
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_FOTOS_VEHICULO)
    .upload(ruta, file, { cacheControl: "3600", upsert: false, contentType: v.tipo.mime });
  if (uploadError) return { error: uploadError.message };

  const columna = columnaDeLado(lado);
  const anterior = await supabase.from("vehicles").select(columna).eq("id", idParsed.data).maybeSingle();
  const { error } = await supabase
    .from("vehicles")
    .update({ [columna]: ruta, updated_at: new Date().toISOString() } as never)
    .eq("id", idParsed.data);
  if (error) {
    await supabase.storage.from(BUCKET_FOTOS_VEHICULO).remove([ruta]);
    return { error: error.message };
  }
  const rutaAnterior = (anterior.data as Record<string, string | null> | null)?.[columna];
  if (rutaAnterior) await supabase.storage.from(BUCKET_FOTOS_VEHICULO).remove([rutaAnterior]);

  await auditar("MODIFICAR", "vehiculos", idParsed.data, `Foto del vehículo (${lado}) actualizada`);
  revalidatePath("/configuracion");
  revalidatePath("/vehiculos");
  return { success: true as const, ruta };
}

const dailyCheckIdSchema = z.number().int().positive("ID de preoperacional inválido");

/**
 * Foto del preoperacional de hoy. Solo el propio OVEM, y solo el de hoy — lo exige la RLS de `daily_checks`
 * (`update_daily_checks`: `user_id = auth.uid() AND fecha = hoy_bogota()`), no esta acción.
 */
export async function subirFotoPreoperacional(
  dailyCheckId: number,
  lado: string,
  file: File
): Promise<{ error: string; success?: undefined } | { error?: undefined; success: true; ruta: string }> {
  const profile = await requireRole(["OVEM"]);
  const idParsed = dailyCheckIdSchema.safeParse(dailyCheckId);
  if (!idParsed.success) return { error: idParsed.error.issues[0]?.message ?? "Datos inválidos" };
  if (!esLadoVehiculo(lado)) return { error: "Lado inválido" };

  const v = await archivoValido(file);
  if (!v.ok) return { error: v.error };

  const supabase = createClient();
  const ruta = rutaFotoVehiculo("preoperacional", idParsed.data, lado, v.tipo.ext, randomUUID());
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_FOTOS_VEHICULO)
    .upload(ruta, file, { cacheControl: "3600", upsert: false, contentType: v.tipo.mime });
  if (uploadError) return { error: uploadError.message };

  const columna = columnaDeLado(lado);
  // La RLS de daily_checks (update_daily_checks) ya exige que sea el preoperacional de HOY del propio OVEM; si no
  // lo es, la actualización no afecta ninguna fila y se avisa en vez de dejar la foto huérfana en el bucket.
  const { data, error } = await supabase
    .from("daily_checks")
    .update({ [columna]: ruta } as never)
    .eq("id", idParsed.data)
    .eq("user_id", profile.user_id)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    await supabase.storage.from(BUCKET_FOTOS_VEHICULO).remove([ruta]);
    return { error: error?.message ?? "Ese preoperacional no es tuyo o ya no es el de hoy" };
  }

  revalidatePath("/ovem");
  return { success: true as const, ruta };
}

/** Enlace temporal (1 hora) para mostrar una foto guardada — el bucket es privado. */
export async function getUrlFotoVehiculo(ruta: string) {
  const parsed = z.string().trim().min(1).safeParse(ruta);
  if (!parsed.success) return null;

  const supabase = createClient();
  const { data, error } = await supabase.storage.from(BUCKET_FOTOS_VEHICULO).createSignedUrl(parsed.data, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}

export type { LadoVehiculo };
