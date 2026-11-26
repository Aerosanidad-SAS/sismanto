"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { aTimestamptzColombia } from "@/lib/hora-colombia";
import { puedeAdministrarCaptacion, puedeUsarCaptacion } from "@/lib/captacion";
import {
  captacionProcedimientosSchema,
  esEnvioRepetido,
  type CaptacionProcedimientosInput,
  type FilaProcedimientoGuardada,
} from "@/lib/captacion-procedimientos";

// Captación: registro de «solo procedimiento» (ambulancias externas sin paciente). Esquema y RLS: migración 144.
// Cada acción revisa el rol aquí (mensaje claro) y la base lo vuelve a exigir (RLS).

const fechaIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const COLUMNAS = "id, lote, fecha_atencion, aeropuerto_atencion, procedimiento, cantidad, emergencia_tipo, notas, nombre_registrado_por, created_at";
const MAX_FILAS_LISTA = 1000;

async function usuario() {
  const profile = await getProfile();
  return profile && puedeUsarCaptacion(profile.role_codigo) ? profile : null;
}

export interface FiltrosProcedimientos {
  desde?: string; // YYYY-MM-DD (día de Bogotá)
  hasta?: string;
  aeropuerto?: string;
}

/** Líneas activas más recientes (máx. 1000), con los filtros dados. Se agrupan por lote con `agruparPorLote`. */
export async function getProcedimientosExternos(filtros: FiltrosProcedimientos = {}): Promise<FilaProcedimientoGuardada[]> {
  if (!(await usuario())) return [];
  let query = createClient().from("captacion_procedimientos").select(COLUMNAS).eq("activo", true);
  if (fechaIso.safeParse(filtros.desde).success) query = query.gte("fecha_atencion", `${filtros.desde}T00:00:00-05:00`);
  if (fechaIso.safeParse(filtros.hasta).success) query = query.lte("fecha_atencion", `${filtros.hasta}T23:59:59.999-05:00`);
  if (filtros.aeropuerto) query = query.eq("aeropuerto_atencion", filtros.aeropuerto.slice(0, 150));
  const { data } = await query.order("fecha_atencion", { ascending: false }).order("id", { ascending: true }).limit(MAX_FILAS_LISTA);
  return (data ?? []) as unknown as FilaProcedimientoGuardada[];
}

/** Guarda un registro de «solo procedimiento»: una fila por línea, unidas por el mismo `lote`, en un solo INSERT. */
export async function crearProcedimientosExternos(datos: CaptacionProcedimientosInput) {
  const profile = await usuario();
  if (!profile) return { error: "Sin permisos para registrar procedimientos" };
  const parsed = captacionProcedimientosSchema.safeParse(datos);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;

  const supabase = createClient();
  // El aeropuerto debe venir del catálogo (el formulario no es de fiar).
  const { data: aeropuerto } = await supabase.from("sispro_aeropuertos_atencion").select("nombre").eq("nombre", d.aeropuerto_atencion).maybeSingle();
  if (!aeropuerto) return { error: "El aeropuerto no está en el catálogo" };

  const fecha = aTimestamptzColombia(d.fecha_atencion) as string;
  if (new Date(fecha).getTime() > Date.now() + 5 * 60_000) return { error: "La fecha no puede ser futura" };

  // Idempotencia: el formulario genera el lote al abrirse; si ya existe (doble clic o reenvío), no se vuelve a guardar.
  const lote = d.lote ?? randomUUID();
  if (d.lote) {
    const { data: existente } = await supabase.from("captacion_procedimientos").select("id").eq("lote", lote).limit(1).maybeSingle();
    if (existente) return { success: true as const, lote };
  }

  const nombre = profile.nombre_completo ?? profile.email ?? "Usuario";
  const filas = d.lineas.map((l) => ({
    lote,
    fecha_atencion: fecha,
    aeropuerto_atencion: d.aeropuerto_atencion,
    procedimiento: l.procedimiento,
    cantidad: l.cantidad,
    emergencia_tipo: d.emergencia_tipo ?? null,
    notas: d.notas ?? null,
    registrado_por_id: profile.user_id,
    nombre_registrado_por: nombre,
  }));
  const { error } = await supabase.from("captacion_procedimientos").insert(filas as never);
  // Dos envíos simultáneos pasan los dos la consulta de arriba: el índice único (lote, procedimiento) rechaza el segundo.
  if (error && d.lote && esEnvioRepetido(error)) return { success: true as const, lote };
  if (error) return { error: error.message };

  await auditar("INSERTAR", "captacion", lote, `Procedimientos sin paciente registrados: ${filas.length} línea(s)`);
  revalidatePath("/captacion/procedimientos");
  revalidatePath("/captacion/informes");
  return { success: true as const, lote };
}

/** Eliminar = desactivar todas las líneas del lote (como la captación completa). Solo ADMIN. */
export async function eliminarProcedimientosExternos(lote: string) {
  const loteOk = z.string().uuid().safeParse(lote);
  const profile = await getProfile();
  if (!loteOk.success) return { error: "Registro inválido" };
  if (!profile || !puedeAdministrarCaptacion(profile.role_codigo)) return { error: "Solo un Administrador puede eliminar estos registros" };

  const { data, error } = await createClient()
    .from("captacion_procedimientos")
    .update({ activo: false, updated_at: new Date().toISOString() } as never)
    .eq("lote", loteOk.data)
    .eq("activo", true)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "No se pudo eliminar (el registro no existe)" };

  await auditar("ELIMINAR", "captacion", loteOk.data, `Procedimientos sin paciente desactivados: ${data.length} línea(s)`);
  revalidatePath("/captacion/procedimientos");
  revalidatePath("/captacion/informes");
  return { success: true as const };
}
