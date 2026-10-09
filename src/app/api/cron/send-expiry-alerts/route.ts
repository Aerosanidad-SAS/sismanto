import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cronAutorizado } from "@/lib/cron-auth";
import { emailConfigurado, enviarCorreo } from "@/lib/notifications/email";
import { clavesSinEntregar, soloEnviables } from "@/lib/correo-destinatarios";
import {
  alertaMantenimientoFila,
  alertasDocumentosVehiculo,
  armarCorreoVencimientos,
  asuntoCorreoVencimientos,
  type Alerta,
  type FilaMantenimiento,
  type VehiculoVencimientos,
} from "@/lib/notifications/expiry-digest";

// Solo consulta y unos pocos envíos de correo — muy por debajo del límite de Hobby.
export const maxDuration = 30;

/** YYYY-MM-DD de hoy en hora de Colombia — mismo criterio que el resto del sistema. */
function hoyBogota(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

export async function POST(request: NextRequest): Promise<Response> {
  // Mismo patrón que /api/cron/process-invoices: falla cerrado si falta el secreto.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  if (!cronAutorizado(auth, cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Sin proveedor de correo, enviarCorreo «sale» sin salir (modo desarrollo): marcar los hitos como avisados los daría
  // por entregados para siempre. Si no hay correo, no se toca nada y la próxima corrida lo intenta de nuevo.
  if (!(await emailConfigurado())) {
    return NextResponse.json({ enviados: 0, mensaje: "El correo no está configurado: no se marcó ningún hito como avisado" });
  }

  const supabase = createAdminClient();
  const hoy = hoyBogota();

  // ── 1. Candidatos: documentos de todos los vehículos + plan de mantenimiento en alerta ──
  const [{ data: vehiculos, error: errVeh }, { data: filasMtto, error: errMtto }] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, placa, vencimiento_soat, vencimiento_tecnicomecanica, vencimiento_rtm, fecha_pase_aeroportuario"),
    supabase
      .from("vehicle_maintenance_alerts")
      .select("vehicle_id, placa, plan_item_id, descripcion, categoria, km_restantes, dias_restantes, km_ultimo, ultimo_mantenimiento, nivel_alerta")
      .in("nivel_alerta", ["ROJA", "NARANJA"]),
  ]);
  if (errVeh) return NextResponse.json({ error: errVeh.message }, { status: 500 });
  if (errMtto) return NextResponse.json({ error: errMtto.message }, { status: 500 });

  const candidatas: Alerta[] = [
    ...((vehiculos ?? []) as VehiculoVencimientos[]).flatMap((v) => alertasDocumentosVehiculo(v, hoy)),
    ...((filasMtto ?? []) as FilaMantenimiento[])
      .map((f) => alertaMantenimientoFila(f, hoy))
      .filter((a): a is NonNullable<typeof a> => a !== null),
  ];

  if (candidatas.length === 0) {
    return NextResponse.json({ enviados: 0, mensaje: "Sin vencimientos en ningún hito hoy" });
  }

  // ── 2. Filtrar a las que no se han avisado en este hito (upsert que ignora duplicados
  //      devuelve solo las filas nuevas) ──
  const { data: insertadas, error: errLog } = await supabase
    .from("expiry_alerts_log")
    .upsert(
      candidatas.map((a) => ({ vehicle_id: a.vehicleId, item_type: a.itemType, item_key: a.itemKey, milestone: a.milestone })),
      { onConflict: "vehicle_id,item_type,item_key,milestone", ignoreDuplicates: true }
    )
    .select("id, vehicle_id, item_type, item_key, milestone");
  if (errLog) return NextResponse.json({ error: errLog.message }, { status: 500 });

  const filasLog = (insertadas ?? []) as unknown as { id: number; vehicle_id: string; item_type: string; item_key: string; milestone: string }[];
  const idPorClave = new Map(filasLog.map((r) => [`${r.vehicle_id}:${r.item_type}:${r.item_key}:${r.milestone}`, r.id]));
  const clavesNuevas = new Set(idPorClave.keys());
  const nuevas = candidatas.filter((a) => clavesNuevas.has(`${a.vehicleId}:${a.itemType}:${a.itemKey}:${a.milestone}`));

  if (nuevas.length === 0) {
    return NextResponse.json({ enviados: 0, mensaje: "Todos los hitos de hoy ya se avisaron" });
  }

  // ── 3. Destinatarios: global (ve todo) + uno por centro operativo (solo lo suyo) ──
  const { data: perfiles } = await supabase
    .from("user_profiles")
    .select("email, operational_center_id, roles!inner(codigo)")
    .eq("activo", true)
    .in("roles.codigo", ["ADMIN", "MANTENIMIENTO", "COORDINACION", "REGULACION"]);

  const globales = new Set<string>();
  const porCentro = new Map<number, Set<string>>();
  for (const p of (perfiles ?? []) as { email: string | null; operational_center_id: number | null; roles: { codigo: string } }[]) {
    if (!p.email || soloEnviables([p.email]).length === 0) continue; // sin cuentas de prueba (@sismanto.test, @staging.local…)
    if (p.roles.codigo === "REGULACION") {
      if (p.operational_center_id == null) continue; // sin centro asignado: no sabemos qué le corresponde
      if (!porCentro.has(p.operational_center_id)) porCentro.set(p.operational_center_id, new Set());
      porCentro.get(p.operational_center_id)!.add(p.email);
    } else {
      globales.add(p.email);
    }
  }

  // vehicle_id -> centro operativo, para poder recortar el correo de cada centro.
  // vehicles.centro_operativo es un código de texto (no una FK), igual que en
  // centroDelServicio() de servicios-medicos.ts: se resuelve contra operational_centers.
  const { data: centrosVehiculo } = await supabase
    .from("vehicles")
    .select("id, centro_operativo")
    .in("id", Array.from(new Set(nuevas.map((a) => a.vehicleId))));
  const { data: centros } = await supabase.from("operational_centers").select("id, codigo");
  const idPorCodigo = new Map((centros ?? []).map((c) => [c.codigo, c.id]));
  const centroPorVehiculo = new Map<string, number | null>(
    ((centrosVehiculo ?? []) as { id: string; centro_operativo: string | null }[]).map((v) => [
      v.id,
      v.centro_operativo ? idPorCodigo.get(v.centro_operativo) ?? null : null,
    ])
  );

  const envios: { destinatarios: string[]; alcance: string; alertas: Alerta[] }[] = [];
  if (globales.size > 0) {
    envios.push({ destinatarios: [...globales], alcance: " de toda la flota", alertas: nuevas });
  }
  for (const [centroId, correos] of porCentro) {
    const propias = nuevas.filter((a) => centroPorVehiculo.get(a.vehicleId) === centroId);
    if (propias.length > 0) envios.push({ destinatarios: [...correos], alcance: " de su centro", alertas: propias });
  }

  const clave = (a: Alerta) => `${a.vehicleId}:${a.itemType}:${a.itemKey}:${a.milestone}`;
  const resultados: { destinatarios: number; alertas: number; ok: boolean; error: string | null }[] = [];
  const realizados: { claves: string[]; ok: boolean }[] = [];
  for (const envio of envios) {
    const res = await enviarCorreo(envio.destinatarios, asuntoCorreoVencimientos(envio.alertas), armarCorreoVencimientos(envio.alertas, envio.alcance));
    resultados.push({ destinatarios: envio.destinatarios.length, alertas: envio.alertas.length, ok: res.ok, error: res.error });
    realizados.push({ claves: envio.alertas.map(clave), ok: res.ok });
  }

  // Los avisos que no llegaron a nadie (envío fallido, sin destinatarios) se desmarcan para que la próxima corrida los
  // reintente; antes quedaban «avisados» sin que nadie los hubiera recibido.
  const sinEntregar = clavesSinEntregar(nuevas.map(clave), realizados);
  const ids = sinEntregar.map((k) => idPorClave.get(k)).filter((id): id is number => id !== undefined);
  for (let i = 0; i < ids.length; i += 200) {
    await supabase.from("expiry_alerts_log").delete().in("id", ids.slice(i, i + 200));
  }

  return NextResponse.json({ enviados: resultados.filter((r) => r.ok).length, nuevas: nuevas.length, sinEntregar: sinEntregar.length, resultados });
}

// Vercel Cron invoca con GET; POST queda para lanzarlo a mano con el mismo secreto.
export const GET = POST;
