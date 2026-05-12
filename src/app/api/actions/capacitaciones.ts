"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/app/api/actions/auth";
import { z } from "zod";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const trainingSchema = z.object({
  titulo: z.string().min(3).max(200),
  descripcion: z.string().max(1000).optional().nullable(),
  contenido_texto: z.string().optional().nullable(),
  video_url: z.string().url({ message: "URL de video inválida" }).optional().nullable().or(z.literal("")),
  duracion_estimada_minutos: z.number().int().positive().optional().nullable(),
  mes_ciclo: z.number().int().min(1).max(12).optional().nullable(),
  tiempo_limite_minutos: z.number().int().min(5).max(300).default(60),
});

const questionSchema = z.object({
  training_id: z.number().int().positive(),
  orden: z.number().int().min(1),
  tipo: z.enum(["SELECCION_MULTIPLE", "RESPUESTA_ABIERTA", "JUSTIFICACION"]),
  pregunta: z.string().min(5).max(2000),
  puntaje: z.number().int().min(1).max(10).default(1),
  opciones: z
    .array(
      z.object({
        orden: z.number().int().min(1).max(4),
        texto: z.string().min(1).max(500),
        es_correcta: z.boolean(),
      })
    )
    .optional(),
});

const assignSchema = z.object({
  training_id: z.number().int().positive(),
  user_ids: z.array(z.string().uuid()).min(1),
  fecha_limite: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

const gradeSchema = z.object({
  session_id: z.number().int().positive(),
  puntaje_final: z.number().min(0).max(100),
  observaciones: z.string().max(2000).optional().nullable(),
});

const responseSchema = z.object({
  session_id: z.number().int().positive(),
  question_id: z.number().int().positive(),
  opcion_id: z.number().int().positive().optional().nullable(),
  respuesta_texto: z.string().max(5000).optional().nullable(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role_codigo !== "ADMIN") return null;
  return profile;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function listTrainings() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function getTrainingWithQuestions(trainingId: number) {
  const supabase = createClient();
  const [{ data: training, error }, { data: questions }] = await Promise.all([
    supabase.from("trainings").select("*").eq("id", trainingId).single(),
    supabase
      .from("training_questions")
      .select("*, training_question_options(*)")
      .eq("training_id", trainingId)
      .eq("activo", true)
      .order("orden"),
  ]);
  if (error) return { data: null, error: error.message };
  return { data: { ...training, questions: questions ?? [] }, error: null };
}

export async function getMyAssignments() {
  const profile = await getProfile();
  if (!profile) return { data: [], error: "No autenticado" };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("training_assignments")
    .select(`
      *,
      trainings(id, titulo, descripcion, video_url, tiempo_limite_minutos, mes_ciclo, contenido_texto),
      training_sessions(id, estado, puntaje_final, puntaje_mc, fecha_fin, fecha_inicio)
    `)
    .eq("user_id", profile.user_id)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getPendingGrading() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("training_sessions")
    .select(`
      id, fecha_fin, puntaje_mc, estado, fecha_inicio,
      training_assignments(
        id, user_id,
        user_profiles(nombre_completo, email),
        trainings(titulo)
      )
    `)
    .eq("estado", "COMPLETADA")
    .order("fecha_fin", { ascending: true });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getSessionDetail(sessionId: number) {
  const supabase = createClient();
  const [{ data: session, error }, { data: responses }] = await Promise.all([
    supabase
      .from("training_sessions")
      .select(`
        *,
        training_assignments(
          id, user_id,
          user_profiles(nombre_completo, email),
          trainings(titulo, tiempo_limite_minutos)
        )
      `)
      .eq("id", sessionId)
      .single(),
    supabase
      .from("training_responses")
      .select(`
        *,
        training_questions(orden, tipo, pregunta, puntaje),
        training_question_options(texto)
      `)
      .eq("session_id", sessionId),
  ]);
  if (error) return { data: null, error: error.message };
  const sorted = (responses ?? []).sort(
    (a: any, b: any) => (a.training_questions?.orden ?? 0) - (b.training_questions?.orden ?? 0)
  );
  return { data: { ...session, responses: sorted }, error: null };
}

export async function listAllOvems() {
  const profile = await getProfile();
  if (!profile || !["ADMIN", "COORDINACION"].includes(profile.role_codigo)) return [];

  const supabase = createClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("user_id, nombre_completo, email, activo")
    .eq("activo", true)
    .order("nombre_completo");
  const roleRows = await supabase
    .from("roles")
    .select("id")
    .eq("codigo", "OVEM")
    .single();
  const ovemRoleId = roleRows.data?.id;
  if (!ovemRoleId) return [];
  const { data: ovems } = await supabase
    .from("user_profiles")
    .select("user_id, nombre_completo, email")
    .eq("activo", true)
    .eq("role_id", ovemRoleId)
    .order("nombre_completo");
  return ovems ?? [];
}

export async function getTrainingAssignments(trainingId: number) {
  const supabase = createClient();
  const { data } = await supabase
    .from("training_assignments")
    .select(`
      *,
      user_profiles(nombre_completo, email),
      training_sessions(id, estado, puntaje_final, fecha_fin)
    `)
    .eq("training_id", trainingId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ─── Mutations — Admin ────────────────────────────────────────────────────────

export async function crearTraining(input: unknown) {
  const parsed = trainingSchema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const profile = await requireAdmin();
  if (!profile) return { error: "Sin permisos" };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("trainings")
    .insert({
      ...parsed.data,
      video_url: parsed.data.video_url || null,
      created_by: profile.user_id,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data, error: null };
}

export async function actualizarTraining(id: number, input: unknown) {
  const parsed = trainingSchema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const profile = await requireAdmin();
  if (!profile) return { error: "Sin permisos" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("trainings")
    .update({
      ...parsed.data,
      video_url: parsed.data.video_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function desactivarTraining(id: number) {
  const profile = await requireAdmin();
  if (!profile) return { error: "Sin permisos" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("trainings")
    .update({ activo: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function guardarPregunta(input: unknown) {
  const parsed = questionSchema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const profile = await requireAdmin();
  if (!profile) return { error: "Sin permisos" };

  if (parsed.data.tipo === "SELECCION_MULTIPLE") {
    if (!parsed.data.opciones || parsed.data.opciones.length !== 4)
      return { error: "Selección múltiple requiere exactamente 4 opciones" };
    if (!parsed.data.opciones.some((o) => o.es_correcta))
      return { error: "Debe marcar una opción como correcta" };
  }

  const admin = createAdminClient();
  const { data: q, error: qErr } = await admin
    .from("training_questions")
    .insert({
      training_id: parsed.data.training_id,
      orden: parsed.data.orden,
      tipo: parsed.data.tipo,
      pregunta: parsed.data.pregunta,
      puntaje: parsed.data.puntaje,
    })
    .select()
    .single();

  if (qErr) return { error: qErr.message };

  if (parsed.data.tipo === "SELECCION_MULTIPLE" && parsed.data.opciones) {
    const { error: oErr } = await admin
      .from("training_question_options")
      .insert(
        parsed.data.opciones.map((o) => ({
          question_id: q.id,
          orden: o.orden,
          texto: o.texto,
          es_correcta: o.es_correcta,
        }))
      );
    if (oErr) return { error: oErr.message };
  }

  return { data: q, error: null };
}

export async function eliminarPregunta(questionId: number) {
  const profile = await requireAdmin();
  if (!profile) return { error: "Sin permisos" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("training_questions")
    .update({ activo: false })
    .eq("id", questionId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function asignarCapacitacion(input: unknown) {
  const parsed = assignSchema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const profile = await requireAdmin();
  if (!profile) return { error: "Sin permisos" };

  const admin = createAdminClient();
  const registros = parsed.data.user_ids.map((uid) => ({
    training_id: parsed.data.training_id,
    user_id: uid,
    fecha_limite: parsed.data.fecha_limite ?? null,
    asignado_por: profile.user_id,
  }));

  const { error } = await admin
    .from("training_assignments")
    .upsert(registros, { onConflict: "training_id,user_id", ignoreDuplicates: true });

  if (error) return { error: error.message };
  return { error: null };
}

export async function asignarPorCicloMes(mes: number, fechaLimite?: string) {
  if (mes < 1 || mes > 12) return { error: "Mes inválido" };

  const profile = await requireAdmin();
  if (!profile) return { error: "Sin permisos" };

  const supabase = createClient();
  const [{ data: trainings }, { data: roles }] = await Promise.all([
    supabase.from("trainings").select("id").eq("activo", true).eq("mes_ciclo", mes),
    supabase.from("roles").select("id, codigo"),
  ]);

  if (!trainings?.length) return { error: `No hay capacitaciones activas para el mes ${mes}` };

  const ovemRoleId = (roles ?? []).find((r: any) => r.codigo === "OVEM")?.id;
  if (!ovemRoleId) return { error: "Rol OVEM no encontrado" };

  const { data: ovems } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("activo", true)
    .eq("role_id", ovemRoleId);

  if (!ovems?.length) return { error: "No hay OVEM activos" };

  const admin = createAdminClient();
  const rows: any[] = [];
  for (const t of trainings) {
    for (const u of ovems) {
      rows.push({
        training_id: t.id,
        user_id: u.user_id,
        fecha_limite: fechaLimite ?? null,
        asignado_por: profile.user_id,
      });
    }
  }

  const { error } = await admin
    .from("training_assignments")
    .upsert(rows, { onConflict: "training_id,user_id", ignoreDuplicates: true });

  if (error) return { error: error.message };
  return { cantidad: rows.length, error: null };
}

export async function calificarSesion(input: unknown) {
  const parsed = gradeSchema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const profile = await getProfile();
  if (!profile || !["ADMIN", "COORDINACION"].includes(profile.role_codigo))
    return { error: "Sin permisos" };

  const admin = createAdminClient();
  const { data: session, error: sErr } = await admin
    .from("training_sessions")
    .update({
      puntaje_final: parsed.data.puntaje_final,
      observaciones: parsed.data.observaciones ?? null,
      estado: "CALIFICADA",
      calificado_por: profile.user_id,
      fecha_calificacion: new Date().toISOString(),
    })
    .eq("id", parsed.data.session_id)
    .select("assignment_id")
    .single();

  if (sErr) return { error: sErr.message };

  await admin
    .from("training_assignments")
    .update({ completado: true })
    .eq("id", session.assignment_id);

  return { error: null };
}

// ─── Mutations — OVEM ────────────────────────────────────────────────────────

export async function iniciarSesion(assignmentId: number) {
  const profile = await getProfile();
  if (!profile) return { data: null, error: "No autenticado" };

  const supabase = createClient();
  const { data: assign } = await supabase
    .from("training_assignments")
    .select("id, user_id, completado")
    .eq("id", assignmentId)
    .single();

  if (!assign || assign.user_id !== profile.user_id)
    return { data: null, error: "Asignación no encontrada" };
  if (assign.completado)
    return { data: null, error: "Esta capacitación ya fue completada" };

  const { data: existing } = await supabase
    .from("training_sessions")
    .select("id, estado, fecha_inicio")
    .eq("assignment_id", assignmentId)
    .eq("estado", "EN_CURSO")
    .maybeSingle();

  if (existing) return { data: existing, error: null };

  const admin = createAdminClient();
  const { data: session, error } = await admin
    .from("training_sessions")
    .insert({ assignment_id: assignmentId })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: session, error: null };
}

export async function guardarRespuesta(input: unknown) {
  const parsed = responseSchema.safeParse(input);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };

  // Verify ownership via RLS: createClient only returns sessions the user owns
  const supabase = createClient();
  const { data: sessionCheck } = await supabase
    .from("training_sessions")
    .select("id")
    .eq("id", parsed.data.session_id)
    .eq("estado", "EN_CURSO")
    .maybeSingle();
  if (!sessionCheck) return { error: "Sesión no encontrada o no autorizada" };

  const admin = createAdminClient();

  let es_correcta: boolean | null = null;
  if (parsed.data.opcion_id) {
    const { data: opt } = await admin
      .from("training_question_options")
      .select("es_correcta")
      .eq("id", parsed.data.opcion_id)
      .single();
    es_correcta = opt?.es_correcta ?? null;
  }

  const { error } = await admin.from("training_responses").upsert(
    {
      session_id: parsed.data.session_id,
      question_id: parsed.data.question_id,
      opcion_id: parsed.data.opcion_id ?? null,
      respuesta_texto: parsed.data.respuesta_texto ?? null,
      es_correcta,
    },
    { onConflict: "session_id,question_id" }
  );

  if (error) return { error: error.message };
  return { error: null };
}

export async function getAssignmentEvidence(assignmentId: number) {
  const profile = await getProfile();
  if (!profile) return { data: null, error: "No autenticado" };

  const admin = createAdminClient();
  const { data: assignment, error: aErr } = await admin
    .from("training_assignments")
    .select(`
      *,
      trainings(titulo, descripcion, mes_ciclo),
      training_sessions(id, estado, puntaje_mc, puntaje_final, observaciones, fecha_inicio, fecha_fin, fecha_calificacion),
      user_profiles(nombre_completo, email)
    `)
    .eq("id", assignmentId)
    .single();

  if (aErr || !assignment) return { data: null, error: "Asignación no encontrada" };

  const isOwner = assignment.user_id === profile.user_id;
  const canView = ["ADMIN", "COORDINACION"].includes(profile.role_codigo);
  if (!isOwner && !canView) return { data: null, error: "No autorizado" };

  const sessions = (assignment.training_sessions ?? []) as any[];
  const latestSession = sessions[0] ?? null;

  if (!latestSession) return { data: { assignment, session: null, responses: [] }, error: null };

  const { data: responses } = await admin
    .from("training_responses")
    .select(`
      *,
      training_questions(orden, tipo, pregunta),
      training_question_options(texto)
    `)
    .eq("session_id", latestSession.id);

  const sorted = (responses ?? []).sort(
    (a: any, b: any) => (a.training_questions?.orden ?? 0) - (b.training_questions?.orden ?? 0)
  );

  return { data: { assignment, session: latestSession, responses: sorted }, error: null };
}

export async function finalizarSesion(sessionId: number) {
  const profile = await getProfile();
  if (!profile) return { error: "No autenticado" };

  // Verify ownership via RLS
  const supabase = createClient();
  const { data: sessionCheck } = await supabase
    .from("training_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("estado", "EN_CURSO")
    .maybeSingle();
  if (!sessionCheck) return { error: "Sesión no encontrada o no autorizada" };

  const admin = createAdminClient();
  const { data: responses } = await admin
    .from("training_responses")
    .select("es_correcta, training_questions(puntaje, tipo)")
    .eq("session_id", sessionId);

  let totalPts = 0;
  let correctPts = 0;
  (responses ?? []).forEach((r: any) => {
    if (r.training_questions?.tipo === "SELECCION_MULTIPLE") {
      const pts = r.training_questions.puntaje ?? 1;
      totalPts += pts;
      if (r.es_correcta) correctPts += pts;
    }
  });

  const pct = totalPts > 0 ? Math.round((correctPts / totalPts) * 10000) / 100 : 0;

  const { error } = await admin
    .from("training_sessions")
    .update({
      estado: "COMPLETADA",
      fecha_fin: new Date().toISOString(),
      puntaje_mc: pct,
    })
    .eq("id", sessionId);

  if (error) return { error: error.message };
  return { error: null };
}
