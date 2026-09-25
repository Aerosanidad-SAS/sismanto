import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarCorreo } from "@/lib/notifications/email";
import {
  alertasEquipoBiomedico,
  armarCorreoVencimientosBiomedico,
  asuntoCorreoVencimientosBiomedico,
  type EquipoVencimientos,
} from "@/lib/notifications/biomedical-expiry-digest";

// Solo consulta y un correo — muy por debajo del límite de Hobby.
export const maxDuration = 30;

/** YYYY-MM-DD de hoy en hora de Colombia — mismo criterio que el resto del sistema. */
function hoyBogota(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

export async function POST(request: NextRequest): Promise<Response> {
  // Mismo patrón que /api/cron/send-expiry-alerts: falla cerrado si falta el secreto.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const hoy = hoyBogota();

  // ── 1. Candidatas: los 4 campos de vencimiento de cada equipo activo ──
  // La tabla también guarda el inventario de Sistemas (computadores, tablets: area = 'SISTEMAS',
  // 191 de 1155 en los datos reales de SISRES). En SISRES cada área avisa a sus propios
  // destinatarios; estos correos son solo de equipos biomédicos.
  const { data: equipos, error: errEquipos } = await supabase
    .from("biomedical_equipment")
    .select("id, placa_equipo, equipo, proximo_mantenimiento, proxima_calibracion, vencimiento_parche_adulto, vencimiento_parche_pediatrico")
    .eq("activo", true)
    .or("area.is.null,area.neq.SISTEMAS");
  if (errEquipos) return NextResponse.json({ error: errEquipos.message }, { status: 500 });

  const candidatas = ((equipos ?? []) as EquipoVencimientos[]).flatMap((e) => alertasEquipoBiomedico(e, hoy));

  if (candidatas.length === 0) {
    return NextResponse.json({ enviados: 0, mensaje: "Sin vencimientos biomédicos en ningún hito hoy" });
  }

  // ── 2. Filtrar a las que no se han avisado en este hito (upsert que ignora duplicados
  //      devuelve solo las filas nuevas) ──
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
    return NextResponse.json({ enviados: 0, mensaje: "Todos los hitos de hoy ya se avisaron" });
  }

  // ── 3. Destinatarios: sin scoping por centro (biomedical_equipment no tiene esa
  //      columna) — igual que includes/alertasInventarioNotificacion.php de SISRES,
  //      un solo correo grupal por área, acá a los roles operativos del equipo. ──
  const { data: perfiles } = await supabase
    .from("user_profiles")
    .select("email, roles!inner(codigo)")
    .eq("activo", true)
    .in("roles.codigo", ["ADMIN", "MANTENIMIENTO", "COORDINACION"]);

  const destinatarios = [
    ...new Set(
      ((perfiles ?? []) as { email: string | null; roles: { codigo: string } }[])
        .map((p) => p.email)
        .filter((email): email is string => Boolean(email))
    ),
  ];

  if (destinatarios.length === 0) {
    return NextResponse.json({ enviados: 0, nuevas: nuevas.length, mensaje: "Sin destinatarios activos (ADMIN/MANTENIMIENTO/COORDINACION)" });
  }

  const res = await enviarCorreo(destinatarios, asuntoCorreoVencimientosBiomedico(nuevas), armarCorreoVencimientosBiomedico(nuevas));

  return NextResponse.json({
    enviados: 1,
    nuevas: nuevas.length,
    resultado: { destinatarios: destinatarios.length, ok: res.ok, error: res.error },
  });
}

// Vercel Cron invoca con GET; POST queda para lanzarlo a mano con el mismo secreto.
export const GET = POST;
