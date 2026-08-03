"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MedicalServiceFormData } from "@/lib/validations";
import { medicalServiceSchema, ETAPAS_SERVICIO, CAMPOS_PASO_SERVICIO } from "@/lib/validations";
import { sanitizarTelefono, enviarPlantilla } from "@/lib/notifications/whatsapp";
import { requireRole } from "@/app/api/actions/auth";
import type { UserRole } from "@/lib/auth-utils";
import { z } from "zod";

// Mismo rol que ve la sección completa en SISRES (editarServicio.php,
// "!$esMedicoAux") — Médico/Auxiliar no ven ni suben la Boleta de Salida.
const ROLES_BOLETA_SALIDA: UserRole[] = ["ADMIN", "REGULACION", "ANALISTA"];
const BOLETA_TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];
const BOLETA_TAMANO_MAXIMO = 8 * 1024 * 1024; // 8MB — foto de un documento físico

// SISRES no tiene una máquina de estados fija (Ronda 2, pregunta 3 en
// sisres/RESPUESTAS_LEON.md): el dropdown de etapa está gobernado por
// permisos por cargo (`etapa_ver_*`), no por la etapa actual — cualquier
// cargo con permiso puede mover un servicio a cualquier etapa, incluso
// "hacia atrás". Aeromanto no replica permisos dinámicos en runtime (ver
// PLAN_INTEGRACION_SISRES.md §5), así que aquí el control de acceso es el
// mismo RLS estático de la tabla (quién puede hacer UPDATE) — no se valida
// una transición específica.

// Plantillas reales de WhatsApp por etapa (Ronda 2, pregunta 5) — solo se
// disparan para MEDICINA DOMICILIARIA, igual que en SISRES.
const PLANTILLA_POR_ETAPA: Partial<Record<string, string>> = {
  PROGRAMADO: "servicio_programado",
  CURSO: "servicio_en_curso",
  FINALIZADO: "servicio_terminado",
};
const IDIOMA_PLANTILLA = "es_CO";

async function notificarEtapaServicio(
  supabase: ReturnType<typeof createClient>,
  servicioId: number,
  etapa: string,
  tipoServicio: string,
  patientId: number | null
) {
  const plantilla = PLANTILLA_POR_ETAPA[etapa];
  if (!plantilla || tipoServicio !== "MEDICINA DOMICILIARIA" || !patientId) return;

  const { data: paciente } = await supabase
    .from("patients")
    .select("celular")
    .eq("id", patientId)
    .maybeSingle();
  const telefono = paciente?.celular ? sanitizarTelefono(paciente.celular) : null;
  if (!telefono) return;

  const resultado = await enviarPlantilla(telefono, plantilla, IDIOMA_PLANTILLA);
  await supabase.from("notification_log").insert({
    canal: "WHATSAPP",
    destinatario: telefono,
    plantilla,
    referencia: `servicio:${servicioId}`,
    ok: resultado.ok,
    error: resultado.error,
  });
}

/** Minutos entre dos timestamps ISO; null si falta alguno o el resultado es negativo. */
function minutosEntre(desde?: string | null, hasta?: string | null): number | null {
  if (!desde || !hasta) return null;
  const d = new Date(desde).getTime();
  const h = new Date(hasta).getTime();
  if (Number.isNaN(d) || Number.isNaN(h) || h < d) return null;
  return Math.round(((h - d) / 60000) * 100) / 100;
}

// Mismos cálculos que insertarServicios.php:
// oportunidad = programación → llegada a origen; origen = estancia en origen;
// intermedia = estancia en punto intermedio; destino = estancia en destino;
// total = suma de los cuatro.
function calcularTiempos(d: {
  fecha_hora_programacion?: string;
  fecha_hora_llegada_origen?: string;
  fecha_hora_salida_origen?: string;
  fecha_hora_llegada_intermedia?: string;
  fecha_hora_salida_intermedia?: string;
  fecha_hora_llegada_destino?: string;
  fecha_hora_salida_destino?: string;
}) {
  const oportunidad = minutosEntre(d.fecha_hora_programacion, d.fecha_hora_llegada_origen);
  const origen = minutosEntre(d.fecha_hora_llegada_origen, d.fecha_hora_salida_origen);
  const intermedia = minutosEntre(d.fecha_hora_llegada_intermedia, d.fecha_hora_salida_intermedia);
  const destino = minutosEntre(d.fecha_hora_llegada_destino, d.fecha_hora_salida_destino);
  const partes = [oportunidad, origen, intermedia, destino].filter((v): v is number => v !== null);
  const total = partes.length > 0 ? Math.round(partes.reduce((a, b) => a + b, 0) * 100) / 100 : null;
  return {
    oportunidad_atencion: oportunidad,
    tiempo_total_origen: origen,
    tiempo_espera_intermedia: intermedia,
    tiempo_espera_destino: destino,
    tiempo_total: total,
  };
}

function aFilaServicio(parsed: z.output<typeof medicalServiceSchema>) {
  const tiempos = calcularTiempos(parsed);
  return {
    ...parsed,
    patient_id: parsed.patient_id ?? null,
    vehicle_id: parsed.vehicle_id ?? null,
    valor_servicio: parsed.valor_servicio ?? null,
    fecha_hora_programacion: parsed.fecha_hora_programacion || null,
    fecha_hora_llegada_origen: parsed.fecha_hora_llegada_origen || null,
    fecha_hora_salida_origen: parsed.fecha_hora_salida_origen || null,
    fecha_hora_llegada_intermedia: parsed.fecha_hora_llegada_intermedia || null,
    fecha_hora_salida_intermedia: parsed.fecha_hora_salida_intermedia || null,
    fecha_hora_llegada_destino: parsed.fecha_hora_llegada_destino || null,
    fecha_hora_salida_destino: parsed.fecha_hora_salida_destino || null,
    ...tiempos,
  };
}

export async function getServiciosMedicos(filtro?: { etapa?: string; desde?: string; hasta?: string }) {
  const supabase = createClient();
  let query = supabase
    .from("medical_services")
    .select("*, patients(cedula, nombre1, apellido1), vehicles(placa)")
    .order("fecha_hora_registro", { ascending: false })
    .limit(500);

  if (filtro?.etapa && (ETAPAS_SERVICIO as readonly string[]).includes(filtro.etapa)) {
    query = query.eq("etapa", filtro.etapa);
  }
  if (filtro?.desde) query = query.gte("fecha_hora_registro", filtro.desde);
  if (filtro?.hasta) query = query.lte("fecha_hora_registro", filtro.hasta);

  const { data } = await query;
  return data || [];
}

export async function crearServicioMedico(formData: MedicalServiceFormData, etapaInicial: string) {
  const parsed = medicalServiceSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  // SISRES pide la etapa como select obligatorio al registrar
  // (registroServicios.php) — permite loguear directo un servicio que ya
  // sucedió (ej. FALLIDO, NO EFECTIVO) sin pasarlo primero por PROGRAMADO.
  const etapa = ETAPAS_SERVICIO.find((e) => e === etapaInicial);
  if (!etapa) return { error: "Debes seleccionar la etapa del servicio" };

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("medical_services")
    .insert({
      ...aFilaServicio(parsed.data),
      etapa,
      created_by: userData.user?.id ?? null,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  await notificarEtapaServicio(supabase, data.id, etapa, data.tipo_servicio, data.patient_id);
  revalidatePath("/servicios");
  return { success: true, data };
}

export async function actualizarServicioMedico(id: number, formData: MedicalServiceFormData) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const parsed = medicalServiceSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("medical_services")
    .update({ ...aFilaServicio(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", idParsed.data)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    // RLS bloqueó la fila sin lanzar error (comportamiento normal de
    // Postgres en UPDATE: 0 filas afectadas, no "permission denied") —
    // el caso real hoy es un servicio FINALIZADO que solo puede tocar
    // ADMIN/ANALISTA/REGULACION (migración 055).
    return { error: "No tiene permiso para editar este servicio — si ya está FINALIZADO, solo Regulación, Analista o Administrador pueden modificarlo." };
  }
  revalidatePath("/servicios");
  return { success: true };
}

/**
 * Cambio de etapa con guarda optimista — port de cambiarEtapaRapido.php:
 * el UPDATE incluye la etapa actual esperada en el WHERE, así dos usuarios
 * simultáneos no pisan la transición del otro. No valida una transición
 * específica (ver nota arriba de PLANTILLA_POR_ETAPA) — cualquier etapa
 * destino válida es aceptada, igual que en SISRES.
 */
export async function cambiarEtapaServicio(id: number, etapaActual: string, etapaNueva: string) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const actual = ETAPAS_SERVICIO.find((e) => e === etapaActual);
  const nueva = ETAPAS_SERVICIO.find((e) => e === etapaNueva);
  if (!actual || !nueva) return { error: "Etapa inválida" };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("medical_services")
    .update({ etapa: nueva, updated_at: new Date().toISOString() })
    .eq("id", idParsed.data)
    .eq("etapa", actual)
    .select("id, tipo_servicio, patient_id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: `El servicio ya no está en ${actual}. Puede que otro usuario ya lo haya actualizado.` };
  }
  await notificarEtapaServicio(supabase, data[0].id, nueva, data[0].tipo_servicio, data[0].patient_id);
  revalidatePath("/servicios");
  return { success: true };
}

/**
 * Botón de "siguiente paso" de Mis Servicios (OVEM/médico/auxiliar): graba
 * el timestamp del paso y, si corresponde, mueve la etapa — mismo guardado
 * optimista que cambiarEtapaServicio (WHERE etapa = etapaActual). El acceso
 * real (solo puede tocar servicios donde la tripulación es él mismo) lo
 * impone RLS (migración 053), no esta función.
 */
export async function marcarPasoServicio(
  id: number,
  etapaActual: string,
  campo: string,
  etapaNueva?: string
) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const campoValido = (CAMPOS_PASO_SERVICIO as readonly string[]).find((c) => c === campo);
  if (!campoValido) return { error: "Campo inválido" };

  const actual = ETAPAS_SERVICIO.find((e) => e === etapaActual);
  if (!actual) return { error: "Etapa inválida" };
  const nueva = etapaNueva ? ETAPAS_SERVICIO.find((e) => e === etapaNueva) : undefined;
  if (etapaNueva && !nueva) return { error: "Etapa inválida" };

  const supabase = createClient();
  const ahora = new Date().toISOString();
  const update: Record<string, string> = { [campoValido]: ahora, updated_at: ahora };
  if (nueva) update.etapa = nueva;

  const { data, error } = await supabase
    .from("medical_services")
    .update(update)
    .eq("id", idParsed.data)
    .eq("etapa", actual)
    .select("id, tipo_servicio, patient_id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: `El servicio ya no está en ${actual}. Puede que otro usuario ya lo haya actualizado.` };
  }
  if (nueva) await notificarEtapaServicio(supabase, data[0].id, nueva, data[0].tipo_servicio, data[0].patient_id);
  revalidatePath("/servicios");
  revalidatePath("/ovem");
  return { success: true };
}

export async function eliminarServicioMedico(id: number) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { error } = await supabase.from("medical_services").delete().eq("id", idParsed.data);
  if (error) return { error: error.message };
  revalidatePath("/servicios");
  return { success: true };
}

/**
 * Boleta de Salida — equivalente a la columna `imagen` de SISRES
 * (editarServicio.php: subida real de foto al editar el servicio, ya
 * existente en producción). Bucket privado (migración 057): se guarda
 * la ruta, no una URL pública — ver getUrlBoletaSalida() para mostrarla.
 */
export async function subirBoletaSalida(servicioId: number, file: File) {
  await requireRole(ROLES_BOLETA_SALIDA);

  const idParsed = z.number().int().positive().safeParse(servicioId);
  if (!idParsed.success) return { error: "ID inválido" };
  if (!BOLETA_TIPOS_PERMITIDOS.includes(file.type)) {
    return { error: "Formato no soportado — usa PNG, JPG o WEBP" };
  }
  if (file.size > BOLETA_TAMANO_MAXIMO) {
    return { error: "La imagen no puede pesar más de 8MB" };
  }

  const supabase = createClient();
  const extension = file.name.split(".").pop() || "jpg";
  const ruta = `servicio-${idParsed.data}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from("servicios-boletas").upload(ruta, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  const { error } = await supabase
    .from("medical_services")
    .update({ imagen_boleta_salida: ruta, updated_at: new Date().toISOString() })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };

  revalidatePath("/servicios");
  return { success: true, ruta };
}

export async function getUrlBoletaSalida(ruta: string) {
  const parsed = z.string().trim().min(1).safeParse(ruta);
  if (!parsed.success) return null;

  const supabase = createClient();
  const { data, error } = await supabase.storage.from("servicios-boletas").createSignedUrl(parsed.data, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function getCatalogoCie(busqueda: string) {
  const parsed = z.string().trim().min(1).max(60).safeParse(busqueda);
  if (!parsed.success) return [];

  const supabase = createClient();
  const { data } = await supabase
    .from("cie10")
    .select("codigo, descripcion")
    .or(`codigo.ilike.%${parsed.data}%,descripcion.ilike.%${parsed.data}%`)
    .limit(20);
  return data || [];
}
