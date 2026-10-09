"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { leerIntegracionesGuardadas, valorIntegracion } from "@/lib/integraciones-servidor";
import { posicionProtrack, type PosicionGps } from "@/lib/gps/protrack";
import { enlaceVigente, esTokenSeguimiento, etapaConSeguimiento, nuevoTokenSeguimiento } from "@/lib/gps/seguimiento";
import { enviarPlantilla, sanitizarTelefono } from "@/lib/notifications/whatsapp";
import { enviarCorreo } from "@/lib/notifications/email";
import { permitirIntento } from "@/lib/rate-limit-memoria";

// Rastreo GPS de la ambulancia de un servicio (ProTrack365), portado de PHPMailer/seguimiento.php y
// enviarNotificacion.php de SISRES. Credenciales: Administración → Integraciones (migración 104). Token: migración 105.

/** Mismos roles que ven la lista de servicios. La RLS de medical_services decide qué servicio puede leer cada uno. */
const ROLES_SEGUIMIENTO = ["ADMIN", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA", "ANALISTA", "VISTA"];
/** Quiénes despachan y pueden avisarle al paciente (en SISRES, quien tiene mod_servicios en seguimiento.php). */
const ROLES_NOTIFICAR = ["ADMIN", "REGULACION", "ANALISTA"];

export interface EstadoSeguimiento {
  placa: string | null;
  etapa: string;
  posicion: PosicionGps | null;
  aviso: string | null;
}

type VehiculoServicio = { placa: string | null; imei_gps: string | null } | null;

async function posicionDelVehiculo(vehiculo: VehiculoServicio): Promise<{ posicion: PosicionGps | null; aviso: string | null }> {
  if (!vehiculo) return { posicion: null, aviso: "El servicio no tiene una ambulancia asignada" };
  const imei = (vehiculo.imei_gps ?? "").replace(/\D/g, "");
  // 18 móviles traen IMEI «0» desde SISRES: es lo mismo que no tener GPS registrado.
  if (!imei || /^0+$/.test(imei)) return { posicion: null, aviso: `La ambulancia ${vehiculo.placa ?? ""} no tiene IMEI de GPS registrado`.trim() };
  const guardados = await leerIntegracionesGuardadas();
  const [cuenta, llave] = await Promise.all([valorIntegracion("protrack_cuenta", guardados), valorIntegracion("protrack_api_key", guardados)]);
  if (!cuenta || !llave) return { posicion: null, aviso: "El rastreo GPS no está configurado (Administración → Integraciones)" };
  const r = await posicionProtrack(cuenta, llave, imei);
  return "error" in r ? { posicion: null, aviso: r.error } : { posicion: r.posicion, aviso: null };
}

/** Posición actual de la ambulancia de un servicio, para el personal. */
export async function getSeguimientoServicio(id: number): Promise<EstadoSeguimiento | { error: string }> {
  const profile = await getProfile();
  if (!profile || !ROLES_SEGUIMIENTO.includes(profile.role_codigo)) return { error: "Sin permisos" };
  if (!z.number().int().positive().safeParse(id).success) return { error: "Servicio inválido" };
  const { data } = await createClient()
    .from("medical_services")
    .select("etapa, vehicles(placa, imei_gps)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return { error: "Servicio no encontrado o sin acceso" };
  const s = data as unknown as { etapa: string; vehicles: VehiculoServicio };
  const { posicion, aviso } = await posicionDelVehiculo(s.vehicles);
  return { placa: s.vehicles?.placa ?? null, etapa: s.etapa, posicion, aviso };
}

/** Posición para el enlace público del paciente (sin sesión). Solo placa y posición: ningún dato del paciente. */
export async function getSeguimientoPublico(token: string): Promise<EstadoSeguimiento | { error: string }> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "sin-ip";
  if (!permitirIntento(`seguimiento-publico:${ip}`, 120, 60 * 60_000)) return { error: "Demasiadas consultas. Espere unos minutos." };
  if (!esTokenSeguimiento(token) || !process.env.SUPABASE_SERVICE_ROLE_KEY) return { error: "Enlace inválido o vencido" };
  const { data } = await createAdminClient()
    .from("medical_services")
    .select("etapa, token_seguimiento_creado, vehicles(placa, imei_gps)")
    .eq("token_seguimiento", token)
    .maybeSingle();
  const s = data as unknown as { etapa: string; token_seguimiento_creado: string | null; vehicles: VehiculoServicio } | null;
  if (!s || !enlaceVigente(s.token_seguimiento_creado, s.etapa)) return { error: "Enlace inválido o vencido" };
  const { posicion, aviso } = await posicionDelVehiculo(s.vehicles);
  return { placa: s.vehicles?.placa ?? null, etapa: s.etapa, posicion, aviso };
}

async function origenSitio(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Genera (o reutiliza, si sigue vigente) el enlace público y se lo envía al paciente por WhatsApp (plantilla
 * configurada en Integraciones) y por correo. Devuelve el enlace y por dónde salió.
 */
export async function enviarUbicacionAlPaciente(id: number) {
  const profile = await getProfile();
  if (!profile || !ROLES_NOTIFICAR.includes(profile.role_codigo)) return { error: "Sin permisos para avisar al paciente" };
  if (!z.number().int().positive().safeParse(id).success) return { error: "Servicio inválido" };

  const supabase = createClient();
  const { data } = await supabase
    .from("medical_services")
    .select("id, etapa, vehicle_id, token_seguimiento, token_seguimiento_creado, patients(celular, correo)")
    .eq("id", id)
    .maybeSingle();
  const s = data as unknown as {
    id: number;
    etapa: string;
    vehicle_id: string | null;
    token_seguimiento: string | null;
    token_seguimiento_creado: string | null;
    patients: { celular: string | null; correo: string | null } | null;
  } | null;
  if (!s) return { error: "Servicio no encontrado o sin acceso" };
  if (!etapaConSeguimiento(s.etapa)) return { error: "Solo se puede enviar la ubicación de un servicio en PROGRAMADO o CURSO" };
  if (!s.vehicle_id) return { error: "El servicio no tiene una ambulancia asignada" };

  let token = s.token_seguimiento;
  if (!token || !enlaceVigente(s.token_seguimiento_creado, s.etapa)) {
    token = nuevoTokenSeguimiento();
    const { error } = await supabase
      .from("medical_services")
      .update({ token_seguimiento: token, token_seguimiento_creado: new Date().toISOString() } as never)
      .eq("id", s.id);
    if (error) return { error: error.message };
  }
  const enlace = `${await origenSitio()}/seguimiento/${token}`;

  const canales: string[] = [];
  const telefono = s.patients?.celular ? sanitizarTelefono(s.patients.celular) : null;
  if (telefono) {
    const guardados = await leerIntegracionesGuardadas();
    const [plantilla, idioma] = await Promise.all([
      valorIntegracion("wa_plantilla_ubicacion", guardados),
      valorIntegracion("wa_plantilla_ubicacion_idioma", guardados),
    ]);
    if (plantilla && idioma) {
      const r = await enviarPlantilla(telefono, plantilla, idioma, [enlace]);
      await supabase.from("notification_log").insert({
        canal: "WHATSAPP",
        destinatario: telefono,
        plantilla,
        referencia: `servicio:${s.id}:ubicacion`,
        ok: r.ok,
        error: r.error,
      } as never);
      if (r.ok) canales.push("WhatsApp");
    }
  }
  const correo = s.patients?.correo?.trim();
  if (correo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    const r = await enviarCorreo(
      [correo],
      "Su ambulancia va en camino — Aerosanidad S.A.S.",
      `<div style="font-family:sans-serif;color:#111827">
        <p>Le informamos que <strong>hemos asignado una ambulancia de Aerosanidad</strong> para su servicio y va en camino.</p>
        <p>Puede ver su ubicación en tiempo real aquí:</p>
        <p><a href="${enlace}" style="display:inline-block;padding:12px 24px;background:#0f766e;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">📍 Ver ubicación de la ambulancia</a></p>
        <p style="color:#6b7280;font-size:12px">El enlace funciona mientras el servicio está en curso y hasta por 24 horas.</p>
      </div>`
    );
    if (r.ok) canales.push("correo");
  }
  await auditar("NOTIFICAR", "servicios", s.id, `Enlace de seguimiento GPS enviado al paciente (${canales.join(" y ") || "sin canal"})`);
  return { success: true as const, enlace, canales };
}
