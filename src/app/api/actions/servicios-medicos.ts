"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MedicalServiceFormData } from "@/lib/validations";
import { medicalServiceSchema, ETAPAS_SERVICIO } from "@/lib/validations";
import { CAMPOS_PASO_SERVICIO } from "@/lib/estado-servicio";
import { sanitizarTelefono, enviarPlantilla } from "@/lib/notifications/whatsapp";
import { getProfile, requireRole } from "@/app/api/actions/auth";
import { centroVisible, type UserRole } from "@/lib/auth-utils";
import { filaConHoraColombia } from "@/lib/hora-colombia";
import { z } from "zod";
import { auditar } from "@/lib/auditoria";
import {
  EXPORT_MAX_FILAS,
  SERVICIOS_POR_PAGINA,
  prefijoCiudad,
  type FiltrosServicios,
} from "@/lib/servicios-lista";

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

/** Campos de fecha/hora que el formulario captura sin zona (hora de Colombia). */
const CAMPOS_FECHA_SERVICIO = [
  "fecha_hora_programacion",
  "fecha_hora_inicio_desplazamiento",
  "fecha_hora_llegada_origen",
  "fecha_hora_salida_origen",
  "fecha_hora_llegada_intermedia",
  "fecha_hora_salida_intermedia",
  "fecha_hora_llegada_destino",
  "fecha_hora_salida_destino",
] as const;

function aFilaServicio(parsed: z.output<typeof medicalServiceSchema>) {
  const tiempos = calcularTiempos(parsed);
  return filaConHoraColombia({
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
  }, CAMPOS_FECHA_SERVICIO);
}

/**
 * Centro del servicio (migración 059): el del vehículo asignado; sin
 * vehículo (médico en su propio carro), el de quien lo registra.
 */
async function centroDelServicio(
  supabase: ReturnType<typeof createClient>,
  vehicleId: string | null,
  centroDelUsuario: number | null
): Promise<number | null> {
  if (vehicleId) {
    const { data: vehiculo } = await supabase
      .from("vehicles")
      .select("centro_operativo")
      .eq("id", vehicleId)
      .maybeSingle();
    if (vehiculo?.centro_operativo) {
      const { data: centro } = await supabase
        .from("operational_centers")
        .select("id")
        .eq("codigo", vehiculo.centro_operativo)
        .maybeSingle();
      if (centro) return centro.id;
    }
  }
  return centroDelUsuario;
}

export async function getServiciosMedicos(filtro?: { etapa?: string; desde?: string; hasta?: string }) {
  const supabase = createClient();
  let query = supabase
    .from("medical_services")
    .select("*, patients(cedula, nombre1, apellido1), vehicles(placa)")
    .order("fecha_hora_registro", { ascending: false })
    .limit(500);

  // Servicios de su centro, más los que no tienen centro (históricos de
  // antes de la migración 059, o registrados sin vehículo por alguien sin
  // centro asignado): ocultarlos los dejaría invisibles para todo Regulación.
  const centro = centroVisible(await getProfile());
  if (centro) query = query.or(`operational_center_id.eq.${centro.id},operational_center_id.is.null`);

  if (filtro?.etapa && (ETAPAS_SERVICIO as readonly string[]).includes(filtro.etapa)) {
    query = query.eq("etapa", filtro.etapa);
  }
  if (filtro?.desde) query = query.gte("fecha_hora_registro", filtro.desde);
  if (filtro?.hasta) query = query.lte("fecha_hora_registro", filtro.hasta);

  const { data } = await query;
  return data || [];
}

// ── Lista de servicios con filtros de SISRES (mostrarServicios.php) ────────

const ROLES_LISTA_SERVICIOS: UserRole[] = ["ADMIN", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA", "ANALISTA", "VISTA"];

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este
// repo (ver CLAUDE.md), y el builder solo recibe filtros encadenados.
function aplicarFiltrosServicios(query: any, filtros: FiltrosServicios, centroId: number | null) {
  let q = query;
  if (centroId) q = q.or(`operational_center_id.eq.${centroId},operational_center_id.is.null`);
  if (filtros.etapa && (ETAPAS_SERVICIO as readonly string[]).includes(filtros.etapa)) q = q.eq("etapa", filtros.etapa);
  if (filtros.tipo) q = q.eq("tipo_servicio", filtros.tipo);
  if (filtros.cliente) q = q.eq("cliente", filtros.cliente);
  const prefijo = prefijoCiudad(filtros.ciudad);
  if (prefijo) q = q.ilike("ciudad_origen", `${prefijo}%`);
  if (filtros.origen) q = q.eq("ciudad_origen", filtros.origen);
  if (filtros.destino) q = q.eq("ciudad_destino", filtros.destino);
  if (filtros.cedula) q = q.ilike("cedula_paciente", `%${filtros.cedula.replace(/[%_\\]/g, "")}%`);
  // Como SISRES: el rango es sobre la fecha programada, en hora de Colombia.
  if (filtros.desde) q = q.gte("fecha_hora_programacion", `${filtros.desde}T00:00:00-05:00`);
  if (filtros.hasta) q = q.lte("fecha_hora_programacion", `${filtros.hasta}T23:59:59.999-05:00`);
  return q;
}

/** Una página de servicios con el total, para la lista paginada de 100. */
export async function buscarServicios(filtros: FiltrosServicios, pagina: number) {
  const profile = await requireRole(ROLES_LISTA_SERVICIOS);
  const supabase = createClient();
  const desde = (Math.max(1, pagina) - 1) * SERVICIOS_POR_PAGINA;

  const query = supabase
    .from("medical_services")
    .select("*, patients(cedula, nombre1, apellido1), vehicles(placa)", { count: "exact" })
    .order("fecha_hora_registro", { ascending: false })
    .order("id", { ascending: false })
    .range(desde, desde + SERVICIOS_POR_PAGINA - 1);

  const { data, count, error } = await aplicarFiltrosServicios(query, filtros, centroVisible(profile)?.id ?? null);
  if (error) return { servicios: [], total: 0, error: error.message as string };
  return { servicios: data ?? [], total: count ?? 0 };
}

/** Valores reales para los desplegables de cliente y ciudades (distintos, ordenados). */
export async function getOpcionesFiltroServicios() {
  const profile = await requireRole(ROLES_LISTA_SERVICIOS);
  const supabase = createClient();
  const query = supabase
    .from("medical_services")
    .select("cliente, ciudad_origen, ciudad_destino")
    .order("fecha_hora_registro", { ascending: false })
    .limit(5000);
  const { data } = await aplicarFiltrosServicios(query, {}, centroVisible(profile)?.id ?? null);
  const distintos = (campo: string) =>
    Array.from(new Set(((data ?? []) as Record<string, string | null>[]).map((r) => r[campo]).filter(Boolean) as string[])).sort(
      (a, b) => a.localeCompare(b, "es")
    );
  return { clientes: distintos("cliente"), origenes: distintos("ciudad_origen"), destinos: distintos("ciudad_destino") };
}

/** Filas para el Excel, con los mismos filtros de la lista (tope EXPORT_MAX_FILAS). */
export async function exportarServicios(filtros: FiltrosServicios) {
  const profile = await requireRole(ROLES_LISTA_SERVICIOS);
  const supabase = createClient();
  const filas: Record<string, unknown>[] = [];
  const LOTE = 1000; // PostgREST devuelve máximo 1000 filas por consulta
  for (let desde = 0; desde < EXPORT_MAX_FILAS; desde += LOTE) {
    const query = supabase
      .from("medical_services")
      .select("*, vehicles(placa)")
      .order("fecha_hora_registro", { ascending: false })
      .order("id", { ascending: false })
      .range(desde, desde + LOTE - 1);
    const { data, error } = await aplicarFiltrosServicios(query, filtros, centroVisible(profile)?.id ?? null);
    if (error) return { error: error.message as string };
    filas.push(...((data ?? []) as Record<string, unknown>[]));
    if (!data || data.length < LOTE) break;
  }
  // Quién sacó datos de servicios (pacientes, diagnósticos) a un archivo y cuántas filas: solo la cuenta, no el contenido.
  await auditar("EXPORTAR", "servicios", "", `Exportación de servicios (${filas.length} filas${filas.length >= EXPORT_MAX_FILAS ? ", truncada" : ""})`);
  return {
    filas: filas.map((s) => ({
      ...s,
      movil: (s.vehicles as { placa?: string } | null)?.placa ?? s.movil_placa ?? "",
      diagnostico: [s.cie_codigo, s.cie_descripcion].filter(Boolean).join(" — "),
    })),
    truncado: filas.length >= EXPORT_MAX_FILAS,
  };
}

/**
 * Servicios que necesitan aviso sonoro: PROGRAMADO que empieza en la próxima
 * hora, y PROGRAMADO/CURSO que ya pasaron su hora (candidatos a estancado).
 * Independiente de la página y los filtros, como en SISRES.
 */
export async function getServiciosParaAvisos() {
  const profile = await requireRole(ROLES_LISTA_SERVICIOS);
  const supabase = createClient();
  const en60 = new Date(Date.now() + 60 * 60_000).toISOString();
  const query = supabase
    .from("medical_services")
    .select("id, etapa, nombre_completo, tipo_servicio, fecha_hora_programacion")
    .in("etapa", ["PROGRAMADO", "CURSO"])
    .not("fecha_hora_programacion", "is", null)
    .lte("fecha_hora_programacion", en60)
    .order("fecha_hora_programacion", { ascending: true })
    .limit(500);
  const { data } = await aplicarFiltrosServicios(query, {}, centroVisible(profile)?.id ?? null);
  return (data ?? []) as {
    id: number;
    etapa: string;
    nombre_completo: string;
    tipo_servicio: string;
    fecha_hora_programacion: string;
  }[];
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
  const profile = await getProfile();
  const fila = aFilaServicio(parsed.data);

  const { data, error } = await supabase
    .from("medical_services")
    .insert({
      ...fila,
      etapa,
      operational_center_id: await centroDelServicio(supabase, fila.vehicle_id, profile?.operational_center_id ?? null),
      created_by: userData.user?.id ?? null,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  await notificarEtapaServicio(supabase, data.id, etapa, data.tipo_servicio, data.patient_id);
  await auditar("INSERTAR", "servicios", data.id, `Servicio creado (${data.tipo_servicio}, etapa ${etapa})`);
  revalidatePath("/servicios");
  return { success: true, data };
}

export async function actualizarServicioMedico(id: number, formData: MedicalServiceFormData) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const parsed = medicalServiceSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const fila = aFilaServicio(parsed.data);
  // Solo el vehículo redefine el centro al editar: sin vehículo se conserva
  // el que ya tenía, no el de quien edita.
  const centro = fila.vehicle_id ? await centroDelServicio(supabase, fila.vehicle_id, null) : null;
  const { data, error } = await supabase
    .from("medical_services")
    .update({
      ...fila,
      ...(centro !== null ? { operational_center_id: centro } : {}),
      updated_at: new Date().toISOString(),
    })
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
  await auditar("MODIFICAR", "servicios", idParsed.data, "Servicio actualizado");
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
  await auditar("MODIFICAR", "servicios", data[0].id, `Etapa: ${actual} → ${nueva}`);
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
  await auditar("MODIFICAR", "servicios", data[0].id, `Paso ${campoValido}${nueva ? ` (etapa ${actual} → ${nueva})` : ""}`);
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
  await auditar("ELIMINAR", "servicios", idParsed.data, "Servicio eliminado");
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

  // PostgREST lee , ( ) " como sintaxis del filtro .or() — sin quitarlos, el
  // texto del usuario puede agregar condiciones propias al filtro.
  const termino = parsed.data.replace(/[,()"*%\\]/g, " ").trim();
  if (!termino) return [];

  const supabase = createClient();
  const { data } = await supabase
    .from("cie10")
    .select("codigo, descripcion")
    .or(`codigo.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
    .limit(20);
  return data || [];
}
