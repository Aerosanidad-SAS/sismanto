import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cronAutorizado } from "@/lib/cron-auth";
import { enviarCorreo } from "@/lib/notifications/email";
import {
  alertasEquipoBiomedico,
  armarCorreoVencimientosBiomedico,
  asuntoCorreoVencimientosBiomedico,
  type EquipoVencimientos,
} from "@/lib/notifications/biomedical-expiry-digest";
import { AREAS_INVENTARIO, areaDeEquipo, destinatariosArea, type AreaInventario } from "@/lib/inventario-notificaciones";

// Solo consultas y un correo por área — muy por debajo del límite de Hobby.
export const maxDuration = 30;

/** YYYY-MM-DD de hoy en hora de Colombia — mismo criterio que el resto del sistema. */
function hoyBogota(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

// PostgREST devuelve máximo 1000 filas por consulta y lo hace en silencio; el inventario tiene más de 1000 equipos.
const LOTE = 1000;

export async function POST(request: NextRequest): Promise<Response> {
  // Mismo patrón que /api/cron/send-expiry-alerts: falla cerrado si falta el secreto.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  if (!cronAutorizado(auth, cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const hoy = hoyBogota();

  // ── 1. Destinatarios por área (migración 100). Biomédica sin correos configurados → los roles operativos de
  //      siempre; Sistemas sin correos → no avisa (como SISRES). Si la tabla aún no existe, config vacía. ──
  const { data: config } = await supabase.from("inventario_notificaciones_config").select("area, correos");
  const correosPorArea = new Map(((config ?? []) as { area: string; correos: string[] | null }[]).map((c) => [c.area, c.correos ?? []]));

  const { data: perfiles } = await supabase
    .from("user_profiles")
    .select("email, roles!inner(codigo)")
    .eq("activo", true)
    .in("roles.codigo", ["ADMIN", "MANTENIMIENTO", "COORDINACION"]);
  const respaldo = [
    ...new Set(
      ((perfiles ?? []) as { email: string | null; roles: { codigo: string } }[])
        .map((p) => p.email)
        .filter((email): email is string => Boolean(email))
    ),
  ];

  const destinatarios = new Map<AreaInventario, string[]>(
    AREAS_INVENTARIO.map(({ area }) => [area, destinatariosArea(area, correosPorArea.get(area), respaldo)])
  );

  // ── 2. Candidatas: los 4 campos de vencimiento de cada equipo activo, separadas por área ──
  const equipos: (EquipoVencimientos & { area: string | null })[] = [];
  for (let desde = 0; ; desde += LOTE) {
    const { data, error } = await supabase
      .from("biomedical_equipment")
      .select("id, placa_equipo, equipo, area, proximo_mantenimiento, proxima_calibracion, vencimiento_parche_adulto, vencimiento_parche_pediatrico")
      .eq("activo", true)
      .order("id")
      .range(desde, desde + LOTE - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    equipos.push(...((data ?? []) as (EquipoVencimientos & { area: string | null })[]));
    if (!data || data.length < LOTE) break;
  }

  const resultado: Record<string, unknown> = {};
  let enviados = 0;

  for (const { area } of AREAS_INVENTARIO) {
    const para = destinatarios.get(area) ?? [];
    // Un área sin destinatarios no marca nada como avisado: si se configura después, sus hitos siguen pendientes.
    if (para.length === 0) {
      resultado[area] = { enviados: 0, mensaje: "Sin destinatarios configurados" };
      continue;
    }

    const candidatas = equipos.filter((e) => areaDeEquipo(e.area) === area).flatMap((e) => alertasEquipoBiomedico(e, hoy));
    if (candidatas.length === 0) {
      resultado[area] = { enviados: 0, mensaje: "Sin vencimientos en ningún hito hoy" };
      continue;
    }

    // ── 3. Solo las que no se han avisado en este hito (el upsert que ignora duplicados devuelve las nuevas) ──
    const { data: insertadas, error: errLog } = await supabase
      .from("biomedical_alerts_log")
      .upsert(
        candidatas.map((a) => ({ equipment_id: a.equipmentId, item_type: a.itemType, milestone: a.milestone })),
        { onConflict: "equipment_id,item_type,milestone", ignoreDuplicates: true }
      )
      .select("equipment_id, item_type, milestone");
    if (errLog) return NextResponse.json({ error: errLog.message }, { status: 500 });

    const clavesNuevas = new Set((insertadas ?? []).map((r) => `${r.equipment_id}:${r.item_type}:${r.milestone}`));
    const nuevas = candidatas.filter((a) => clavesNuevas.has(`${a.equipmentId}:${a.itemType}:${a.milestone}`));
    if (nuevas.length === 0) {
      resultado[area] = { enviados: 0, mensaje: "Todos los hitos de hoy ya se avisaron" };
      continue;
    }

    // ── 4. Un correo grupal por área, igual que includes/alertasInventarioNotificacion.php de SISRES ──
    const sistemas = area === "SISTEMAS";
    const res = await enviarCorreo(
      para,
      asuntoCorreoVencimientosBiomedico(nuevas, sistemas),
      armarCorreoVencimientosBiomedico(nuevas, sistemas ? "del área de Sistemas" : "biomédicos")
    );
    enviados++;
    resultado[area] = { enviados: 1, nuevas: nuevas.length, destinatarios: para.length, ok: res.ok, error: res.error };
  }

  return NextResponse.json({ enviados, areas: resultado });
}

// Vercel Cron invoca con GET; POST queda para lanzarlo a mano con el mismo secreto.
export const GET = POST;
