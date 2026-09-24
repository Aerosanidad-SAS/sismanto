"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile, requireAuth } from "@/app/api/actions/auth";
import { puedeGestionarTickets } from "@/lib/auth-utils";
import { auditar } from "@/lib/auditoria";
import { TICKET_ESTADOS, TICKET_PRIORIDADES } from "@/lib/validations";
import type { TicketHistorialRow } from "@/app/api/actions/tickets";

// Soporte técnico — lado del gestor. Funciones y RLS: migración 066.
// Toda acción revisa el rol aquí (para responder con un mensaje claro) y otra vez
// en la base, que es la que manda.

export interface TicketGestionRow {
  id: number;
  categoria: string;
  prioridad: string;
  asunto: string;
  descripcion: string;
  adjunto_path: string | null;
  estado: string;
  solicitante_id: string;
  nombre_solicitante: string;
  celular_contacto: string;
  nombre_registrado_por: string | null;
  sede: string;
  area: string;
  tecnico_id: string | null;
  nombre_tecnico: string | null;
  solucion: string | null;
  created_at: string;
  fecha_primer_contacto: string | null;
  fecha_resuelto: string | null;
  fecha_cierre: string | null;
}

export interface FiltrosTicketsGestion {
  estado?: string;
  categoria?: string;
  prioridad?: string;
  buscar?: string;
  desde?: string; // YYYY-MM-DD, día de Bogotá
  hasta?: string;
  soloMios?: boolean;
}

const COLUMNAS =
  "id, categoria, prioridad, asunto, descripcion, adjunto_path, estado, solicitante_id, nombre_solicitante, celular_contacto, nombre_registrado_por, sede, area, tecnico_id, nombre_tecnico, solucion, created_at, fecha_primer_contacto, fecha_resuelto, fecha_cierre";

const fechaIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const idTicket = z.number().int().positive();

async function gestor() {
  const profile = await getProfile();
  if (!profile || !puedeGestionarTickets(profile.role_codigo)) return null;
  return profile;
}

export async function getTicketsGestion(filtros: FiltrosTicketsGestion = {}): Promise<TicketGestionRow[]> {
  if (!(await gestor())) return [];
  const { user } = await requireAuth();
  const supabase = createClient();

  let query = supabase.from("tickets").select(COLUMNAS);
  if ((TICKET_ESTADOS as readonly string[]).includes(filtros.estado ?? "")) query = query.eq("estado", filtros.estado as string);
  if ((TICKET_PRIORIDADES as readonly string[]).includes(filtros.prioridad ?? ""))
    query = query.eq("prioridad", filtros.prioridad as string);
  if (filtros.categoria) query = query.eq("categoria", filtros.categoria.slice(0, 60));
  if (filtros.soloMios) query = query.eq("tecnico_id", user.id);
  // Las fechas del filtro son días de Bogotá (UTC-5, sin horario de verano).
  if (fechaIso.safeParse(filtros.desde).success) query = query.gte("created_at", `${filtros.desde}T00:00:00-05:00`);
  if (fechaIso.safeParse(filtros.hasta).success) query = query.lte("created_at", `${filtros.hasta}T23:59:59.999-05:00`);
  const texto = (filtros.buscar ?? "").trim().slice(0, 80);
  if (texto) {
    // Se quitan los caracteres con significado dentro del filtro .or() de PostgREST.
    const limpio = texto.replace(/[%_,()\\*"]/g, " ").trim();
    if (limpio) {
      const numero = /^\d+$/.test(limpio) ? `id.eq.${Number(limpio)},` : "";
      query = query.or(`${numero}asunto.ilike.%${limpio}%,nombre_solicitante.ilike.%${limpio}%,descripcion.ilike.%${limpio}%`);
    }
  }

  const { data } = await query.order("id", { ascending: false }).limit(500);
  return (data ?? []) as unknown as TicketGestionRow[];
}

export async function getTicketGestion(id: number) {
  const parsed = idTicket.safeParse(id);
  if (!parsed.success || !(await gestor())) return null;
  const supabase = createClient();

  const [ticket, historial] = await Promise.all([
    supabase.from("tickets").select(COLUMNAS).eq("id", parsed.data).maybeSingle(),
    supabase
      .from("ticket_historial")
      .select("id, tipo_evento, estado_anterior, estado_nuevo, nota, nombre_usuario, created_at")
      .eq("ticket_id", parsed.data)
      .order("id", { ascending: true }),
  ]);
  if (!ticket.data) return null;

  let urlAdjunto: string | null = null;
  const ruta = (ticket.data as unknown as TicketGestionRow).adjunto_path;
  if (ruta) {
    const firmada = await supabase.storage.from("tickets-adjuntos").createSignedUrl(ruta, 3600);
    urlAdjunto = firmada.data?.signedUrl ?? null;
  }
  return {
    ticket: ticket.data as unknown as TicketGestionRow,
    historial: (historial.data ?? []) as unknown as TicketHistorialRow[],
    urlAdjunto,
  };
}

type Cliente = ReturnType<typeof createClient>;

async function accion(id: number, detalle: string, ejecutar: (supabase: Cliente, id: number) => PromiseLike<{ error: { message: string } | null }>) {
  const parsed = idTicket.safeParse(id);
  if (!parsed.success) return { error: "Ticket inválido" };
  if (!(await gestor())) return { error: "Sin permisos para gestionar tickets" };
  const { error } = await ejecutar(createClient(), parsed.data);
  if (error) return { error: error.message };
  await auditar("MODIFICAR", "tickets", parsed.data, detalle);
  revalidatePath("/soporte");
  revalidatePath("/soporte/gestion");
  revalidatePath(`/soporte/gestion/${parsed.data}`);
  return { success: true as const };
}

export async function tomarTicket(id: number) {
  return accion(id, "Ticket tomado", (s, t) => s.rpc("tomar_ticket", { p_ticket_id: t }) as never);
}

export async function registrarContactoTicket(id: number, nota?: string) {
  const n = z.string().trim().max(1000).safeParse(nota ?? "");
  if (!n.success) return { error: "La nota no puede pasar de 1000 caracteres" };
  return accion(id, "Contacto con el solicitante registrado", (s, t) => s.rpc("registrar_contacto_ticket", { p_ticket_id: t, p_nota: n.data || null }) as never);
}

const cambioEstadoSchema = z.object({
  estado: z.enum(["EN_PROCESO", "RESUELTO"]),
  solucion: z.string().trim().max(5000).optional(),
  nota: z.string().trim().max(1000).optional(),
});

export async function cambiarEstadoTicket(id: number, estado: string, solucion?: string, nota?: string) {
  const parsed = cambioEstadoSchema.safeParse({ estado, solucion, nota });
  if (!parsed.success) return { error: "Datos inválidos" };
  if (parsed.data.estado === "RESUELTO" && !parsed.data.solucion) return { error: "Describe la solución aplicada" };
  return accion(
    id,
    `Estado → ${parsed.data.estado}`,
    (s, t) =>
      s.rpc("cambiar_estado_ticket", {
        p_ticket_id: t,
        p_estado: parsed.data.estado,
        p_solucion: parsed.data.solucion || null,
        p_nota: parsed.data.nota || null,
      }) as never,
  );
}

export async function cambiarPrioridadTicket(id: number, prioridad: string) {
  const p = z.enum(TICKET_PRIORIDADES).safeParse(prioridad);
  if (!p.success) return { error: "Prioridad inválida" };
  return accion(id, `Prioridad → ${p.data}`, (s, t) => s.rpc("cambiar_prioridad_ticket", { p_ticket_id: t, p_prioridad: p.data }) as never);
}

/** Solo ADMIN (política tickets_delete). El historial cae en cascada; la imagen se borra aquí. */
export async function eliminarTicket(id: number) {
  const parsed = idTicket.safeParse(id);
  if (!parsed.success) return { error: "Ticket inválido" };
  const profile = await getProfile();
  if (!profile || profile.role_codigo !== "ADMIN") return { error: "Solo un Administrador puede eliminar tickets" };

  const supabase = createClient();
  const { data: ticket } = await supabase.from("tickets").select("adjunto_path").eq("id", parsed.data).maybeSingle();
  const { data: borrados, error } = await supabase.from("tickets").delete().eq("id", parsed.data).select("id");
  if (error) return { error: error.message };
  if (!borrados || borrados.length === 0) return { error: "No se pudo eliminar el ticket" };

  const ruta = (ticket as { adjunto_path: string | null } | null)?.adjunto_path;
  let aviso: string | undefined;
  if (ruta) {
    const { error: errorImagen } = await supabase.storage.from("tickets-adjuntos").remove([ruta]);
    if (errorImagen) {
      console.error("No se pudo borrar la imagen del ticket eliminado:", errorImagen.message);
      aviso = "El ticket se eliminó, pero no se pudo borrar su imagen adjunta.";
    }
  }

  await auditar("ELIMINAR", "tickets", parsed.data, "Ticket eliminado");
  revalidatePath("/soporte/gestion");
  return { success: true as const, aviso };
}

export interface UsuarioBuscado {
  user_id: string;
  nombre_completo: string | null;
  cedula: string | null;
}

export async function buscarUsuariosTicket(busqueda: string): Promise<UsuarioBuscado[]> {
  const q = z.string().trim().min(1).max(60).safeParse(busqueda);
  if (!q.success || !(await gestor())) return [];
  const { data } = await createClient().rpc("buscar_usuarios_ticket", { p_busqueda: q.data });
  return (data ?? []) as unknown as UsuarioBuscado[];
}
