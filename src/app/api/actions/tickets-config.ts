"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile, requireAuth } from "@/app/api/actions/auth";
import { puedeConfigurarTickets, puedeGestionarTickets } from "@/lib/auth-utils";
import { auditar } from "@/lib/auditoria";
import {
  ticketCatalogoTipoSchema,
  ticketCorreoSchema,
  ticketDisponibilidadSchema,
  ticketHorarioSchema,
  ticketMensajeSchema,
  ticketSlaSchema,
} from "@/lib/validations";
import {
  calcularIndicadores,
  type ConfigSla,
  type DisponibilidadMes,
  type HorarioLaboral,
  type Indicadores,
  type TicketParaIndicadores,
} from "@/lib/tickets-indicadores";

// Soporte técnico — configuración (solo ADMIN) e indicadores (gestores). Migración 067.
// La base repite cada regla (RLS y funciones); aquí se valida para dar mensajes claros.

export interface ConfigTickets {
  sla: { baja: number; media: number; alta: number; urgente: number };
  horario: { dias: number[]; inicio: string; fin: string };
  mensaje: string;
}

const CONFIG_POR_DEFECTO: ConfigTickets = {
  sla: { baja: 72, media: 24, alta: 8, urgente: 4 },
  horario: { dias: [1, 2, 3, 4, 5], inicio: "08:00", fin: "17:00" },
  mensaje: "",
};

const hhmm = (t: string) => t.slice(0, 5);

async function admin() {
  const profile = await getProfile();
  if (!profile || !puedeConfigurarTickets(profile.role_codigo)) return null;
  return profile;
}

/** Cualquier usuario con sesión: el mensaje se muestra al registrar un ticket. */
export async function getConfigTickets(): Promise<ConfigTickets> {
  await requireAuth();
  const { data } = await createClient().from("ticket_config").select("*").eq("id", 1).maybeSingle();
  const c = data as unknown as {
    sla_baja_horas: number; sla_media_horas: number; sla_alta_horas: number; sla_urgente_horas: number;
    horario_dias: number[]; horario_inicio: string; horario_fin: string; mensaje_adicional: string | null;
  } | null;
  if (!c) return CONFIG_POR_DEFECTO;
  return {
    sla: { baja: c.sla_baja_horas, media: c.sla_media_horas, alta: c.sla_alta_horas, urgente: c.sla_urgente_horas },
    horario: { dias: [...c.horario_dias].sort(), inicio: hhmm(c.horario_inicio), fin: hhmm(c.horario_fin) },
    mensaje: c.mensaje_adicional ?? "",
  };
}

async function actualizarConfig(campos: Record<string, unknown>, detalle: string) {
  const profile = await admin();
  if (!profile) return { error: "Solo un Administrador puede configurar el soporte técnico" };
  const { data, error } = await createClient()
    .from("ticket_config")
    .update({ ...campos, updated_at: new Date().toISOString(), updated_by: profile.user_id } as never)
    .eq("id", 1)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "No se pudo guardar (la configuración no existe todavía)" };
  await auditar("MODIFICAR", "configuracion", "ticket_config", detalle);
  revalidatePath("/soporte/configuracion");
  revalidatePath("/soporte");
  return { success: true as const };
}

export async function guardarSlaTickets(datos: z.input<typeof ticketSlaSchema>) {
  const p = ticketSlaSchema.safeParse(datos);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Datos inválidos" };
  return actualizarConfig({
    sla_baja_horas: p.data.baja,
    sla_media_horas: p.data.media,
    sla_alta_horas: p.data.alta,
    sla_urgente_horas: p.data.urgente,
  }, `Tiempos de respuesta actualizados (horas: baja ${p.data.baja}, media ${p.data.media}, alta ${p.data.alta}, urgente ${p.data.urgente})`);
}

export async function guardarHorarioTickets(datos: z.input<typeof ticketHorarioSchema>) {
  const p = ticketHorarioSchema.safeParse(datos);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Datos inválidos" };
  return actualizarConfig({
    horario_dias: [...new Set(p.data.dias)].sort(),
    horario_inicio: p.data.inicio,
    horario_fin: p.data.fin,
  }, `Horario laboral actualizado (días ${[...new Set(p.data.dias)].sort().join(",")} ${p.data.inicio}-${p.data.fin})`);
}

export async function guardarMensajeTickets(mensaje: string) {
  const p = ticketMensajeSchema.safeParse(mensaje);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Datos inválidos" };
  return actualizarConfig({ mensaje_adicional: p.data || null }, "Mensaje adicional de tickets actualizado");
}

export async function guardarCatalogoTickets(tipo: string, nombres: string[]) {
  const t = ticketCatalogoTipoSchema.safeParse(tipo);
  const n = z.array(z.string().trim().max(100, "Cada nombre puede tener máximo 100 caracteres")).max(200).safeParse(nombres);
  if (!t.success || !n.success) return { error: n.success ? "Catálogo desconocido" : (n.error.issues[0]?.message ?? "Datos inválidos") };
  if (!(await admin())) return { error: "Solo un Administrador puede configurar los catálogos" };

  const { error } = await createClient().rpc("guardar_catalogo_ticket", { p_tipo: t.data, p_nombres: n.data } as never);
  if (error) return { error: error.message };
  await auditar("MODIFICAR", "configuracion", `catalogo_${t.data}`, `Catálogo «${t.data}» actualizado (${n.data.length} elementos)`);
  revalidatePath("/soporte/configuracion");
  revalidatePath("/soporte");
  return { success: true as const };
}

/** Catálogos completos (activos e inactivos) para la pantalla de configuración. */
export async function getCatalogosConfig() {
  if (!(await admin())) return null;
  const s = createClient();
  const leer = async (tabla: "ticket_sedes" | "ticket_areas" | "ticket_categorias") => {
    const { data } = await s.from(tabla).select("nombre, activo").order("nombre");
    return (data ?? []) as unknown as { nombre: string; activo: boolean }[];
  };
  const [sedes, areas, categorias] = await Promise.all([leer("ticket_sedes"), leer("ticket_areas"), leer("ticket_categorias")]);
  return { sedes, areas, categorias };
}

// ─── Correos de los gestores ────────────────────────────────────────────────

export async function getCorreosGestores(): Promise<string[]> {
  if (!(await admin())) return [];
  const { data } = await createClient().from("ticket_correos_gestores").select("correo").order("correo");
  return ((data ?? []) as unknown as { correo: string }[]).map((r) => r.correo);
}

export async function guardarCorreosGestores(correos: string[]) {
  if (!(await admin())) return { error: "Solo un Administrador puede configurar los correos" };
  const lista: string[] = [];
  for (const c of correos) {
    if (!c.trim()) continue;
    const p = ticketCorreoSchema.safeParse(c);
    if (!p.success) return { error: `Correo inválido: ${c.trim().slice(0, 60)}` };
    if (!lista.includes(p.data)) lista.push(p.data);
  }
  if (lista.length > 30) return { error: "Máximo 30 correos" };

  const s = createClient();
  const actuales = ((await s.from("ticket_correos_gestores").select("correo")).data ?? []) as unknown as { correo: string }[];
  const sobran = actuales.map((a) => a.correo).filter((c) => !lista.includes(c.toLowerCase()));
  const nuevos = lista.filter((c) => !actuales.some((a) => a.correo.toLowerCase() === c));

  if (nuevos.length) {
    const { error } = await s.from("ticket_correos_gestores").insert(nuevos.map((correo) => ({ correo })) as never);
    if (error) return { error: error.message };
  }
  if (sobran.length) {
    const { error } = await s.from("ticket_correos_gestores").delete().in("correo", sobran);
    if (error) return { error: error.message };
  }
  if (nuevos.length || sobran.length) await auditar("MODIFICAR", "configuracion", "ticket_correos_gestores", `Correos de gestores actualizados (+${nuevos.length} / -${sobran.length})`);
  revalidatePath("/soporte/configuracion");
  return { success: true as const };
}

// ─── Disponibilidad mensual ─────────────────────────────────────────────────

export interface DisponibilidadRow {
  anio: number;
  mes: number;
  porcentaje: number;
  notas: string | null;
}

export async function getDisponibilidad(): Promise<DisponibilidadRow[]> {
  const profile = await getProfile();
  if (!profile || !puedeGestionarTickets(profile.role_codigo)) return [];
  const { data } = await createClient()
    .from("tickets_disponibilidad_mensual")
    .select("anio, mes, porcentaje, notas")
    .order("anio", { ascending: false })
    .order("mes", { ascending: false })
    .limit(60);
  return ((data ?? []) as unknown as (DisponibilidadRow & { porcentaje: number | string })[]).map((d) => ({
    ...d,
    porcentaje: Number(d.porcentaje),
  }));
}

export async function guardarDisponibilidad(datos: z.input<typeof ticketDisponibilidadSchema>) {
  const p = ticketDisponibilidadSchema.safeParse(datos);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Datos inválidos" };
  const profile = await admin();
  if (!profile) return { error: "Solo un Administrador puede registrar la disponibilidad" };

  const { error } = await createClient()
    .from("tickets_disponibilidad_mensual")
    .upsert(
      {
        anio: p.data.anio,
        mes: p.data.mes,
        porcentaje: p.data.porcentaje,
        notas: p.data.notas || null,
        registrado_por: profile.user_id,
        registrado_at: new Date().toISOString(),
      } as never,
      { onConflict: "anio,mes" },
    );
  if (error) return { error: error.message };
  await auditar("MODIFICAR", "configuracion", "disponibilidad", `Disponibilidad ${p.data.anio}-${String(p.data.mes).padStart(2, "0")} = ${p.data.porcentaje}%`);
  revalidatePath("/soporte/configuracion");
  revalidatePath("/soporte/indicadores");
  return { success: true as const };
}

// ─── Indicadores ────────────────────────────────────────────────────────────

const fechaIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export async function getIndicadores(desde?: string, hasta?: string): Promise<(Indicadores & { config: ConfigTickets }) | null> {
  const profile = await getProfile();
  if (!profile || !puedeGestionarTickets(profile.role_codigo)) return null;
  const s = createClient();
  const config = await getConfigTickets();

  // Periodo por defecto: los últimos 90 días (días de Bogotá).
  const ahoraBogota = new Date(Date.now() - 5 * 3_600_000);
  const hastaDia = fechaIso.safeParse(hasta).success ? (hasta as string) : ahoraBogota.toISOString().slice(0, 10);
  const desdeDia = fechaIso.safeParse(desde).success
    ? (desde as string)
    : new Date(ahoraBogota.getTime() - 90 * 86_400_000).toISOString().slice(0, 10);

  const { data: filas } = await s
    .from("tickets")
    .select("id, categoria, area, prioridad, estado, nombre_tecnico, created_at, fecha_primer_contacto, fecha_cierre")
    .gte("created_at", `${desdeDia}T00:00:00-05:00`)
    .lte("created_at", `${hastaDia}T23:59:59.999-05:00`)
    .order("id", { ascending: true })
    .limit(5000);
  const tickets = (filas ?? []) as unknown as TicketParaIndicadores[];

  // Se consulta por lotes: la lista en la URL de PostgREST tiene un tamaño máximo.
  const reabiertos = new Set<number>();
  for (let i = 0; i < tickets.length; i += 500) {
    const lote = tickets.slice(i, i + 500).map((t) => t.id);
    const { data: reaperturas } = await s
      .from("ticket_historial")
      .select("ticket_id")
      .eq("tipo_evento", "REAPERTURA")
      .in("ticket_id", lote);
    for (const r of (reaperturas ?? []) as unknown as { ticket_id: number }[]) reabiertos.add(r.ticket_id);
  }

  // Disponibilidad: promedio de los últimos 12 meses registrados.
  const { data: disp } = await s
    .from("tickets_disponibilidad_mensual")
    .select("anio, mes, porcentaje")
    .order("anio", { ascending: false })
    .order("mes", { ascending: false })
    .limit(12);
  const disponibilidad = ((disp ?? []) as unknown as { anio: number; mes: number; porcentaje: number | string }[]).map(
    (d): DisponibilidadMes => ({ anio: d.anio, mes: d.mes, porcentaje: Number(d.porcentaje) }),
  );

  const horario: HorarioLaboral = config.horario;
  const sla: ConfigSla = {
    sla_baja_horas: config.sla.baja,
    sla_media_horas: config.sla.media,
    sla_alta_horas: config.sla.alta,
    sla_urgente_horas: config.sla.urgente,
  };
  return { ...calcularIndicadores(tickets, reabiertos, horario, sla, disponibilidad), config };
}
