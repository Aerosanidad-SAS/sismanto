"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/app/api/actions/auth";
import { reabrirTicketSchema, ticketSchema, TICKET_ESTADOS } from "@/lib/validations";

// Soporte técnico (tickets) — lado del solicitante. Esquema y RLS: migración 065.
// La base ya limita cada consulta a "los tickets del usuario" (o todos, si es
// gestor); aquí además se filtra por solicitante para que "Mis tickets" sea
// siempre lo propio, también para un gestor.

const ADJUNTO_TAMANO_MAXIMO = 5 * 1024 * 1024;
// SISRES (imagenHelper.php) acepta solo JPEG y PNG y comprueba el contenido real
// del archivo, no el tipo que declara el navegador. Aquí igual: se leen los
// primeros bytes.
const FIRMAS_IMAGEN: { ext: "jpg" | "png"; mime: string; bytes: number[] }[] = [
  { ext: "jpg", mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { ext: "png", mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];

export interface TicketRow {
  id: number;
  categoria: string;
  prioridad: string;
  asunto: string;
  descripcion: string;
  adjunto_path: string | null;
  estado: string;
  nombre_solicitante: string;
  celular_contacto: string;
  nombre_registrado_por: string | null;
  sede: string;
  area: string;
  nombre_tecnico: string | null;
  solucion: string | null;
  created_at: string;
  fecha_cierre: string | null;
}

export interface TicketHistorialRow {
  id: number;
  tipo_evento: string;
  estado_anterior: string | null;
  estado_nuevo: string | null;
  nota: string | null;
  nombre_usuario: string;
  created_at: string;
}

export interface CatalogosTickets {
  sedes: string[];
  areas: string[];
  categorias: string[];
}

const COLUMNAS_TICKET =
  "id, categoria, prioridad, asunto, descripcion, adjunto_path, estado, nombre_solicitante, celular_contacto, nombre_registrado_por, sede, area, nombre_tecnico, solucion, created_at, fecha_cierre";

export async function getMisTickets(estado?: string): Promise<TicketRow[]> {
  const { user } = await requireAuth();
  const supabase = createClient();

  let query = supabase.from("tickets").select(COLUMNAS_TICKET).eq("solicitante_id", user.id);
  const estadoValido = (TICKET_ESTADOS as readonly string[]).includes(estado ?? "");
  if (estadoValido) query = query.eq("estado", estado as string);

  const { data } = await query.order("id", { ascending: false });
  return (data ?? []) as unknown as TicketRow[];
}

export async function getCatalogosTickets(): Promise<CatalogosTickets> {
  await requireAuth();
  const supabase = createClient();
  const [sedes, areas, categorias] = await Promise.all([
    supabase.from("ticket_sedes").select("nombre").eq("activo", true).order("nombre"),
    supabase.from("ticket_areas").select("nombre").eq("activo", true).order("nombre"),
    supabase.from("ticket_categorias").select("nombre").eq("activo", true).order("nombre"),
  ]);
  const nombres = (r: { data: { nombre: string }[] | null }) => (r.data ?? []).map((x) => x.nombre);
  return { sedes: nombres(sedes as never), areas: nombres(areas as never), categorias: nombres(categorias as never) };
}

export async function getHistorialTicket(ticketId: number): Promise<TicketHistorialRow[]> {
  const parsed = z.number().int().positive().safeParse(ticketId);
  if (!parsed.success) return [];
  await requireAuth();
  const supabase = createClient();
  const { data } = await supabase
    .from("ticket_historial")
    .select("id, tipo_evento, estado_anterior, estado_nuevo, nota, nombre_usuario, created_at")
    .eq("ticket_id", parsed.data)
    .order("id", { ascending: true });
  return (data ?? []) as unknown as TicketHistorialRow[];
}

/** Devuelve la extensión real si los primeros bytes son de un JPEG o PNG. */
function tipoImagenReal(cabecera: Uint8Array) {
  return FIRMAS_IMAGEN.find((f) => f.bytes.every((b, i) => cabecera[i] === b)) ?? null;
}

export async function crearTicket(formData: FormData) {
  const { user, profile } = await requireAuth();

  const parsed = ticketSchema.safeParse({
    sede: formData.get("sede"),
    area: formData.get("area"),
    categoria: formData.get("categoria"),
    prioridad: formData.get("prioridad"),
    celular: formData.get("celular"),
    asunto: formData.get("asunto"),
    descripcion: formData.get("descripcion"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const datos = parsed.data;

  // Categoría, área y sede deben estar en el catálogo activo (mismo control que insertarTicket.php).
  const catalogos = await getCatalogosTickets();
  if (
    !catalogos.categorias.includes(datos.categoria) ||
    !catalogos.areas.includes(datos.area) ||
    !catalogos.sedes.includes(datos.sede)
  ) {
    return { error: "Categoría, área o sede inválida" };
  }

  const supabase = createClient();

  // Guarda de idempotencia (insertarTicket.php): el mismo solicitante no crea dos
  // veces el mismo ticket en 60 s — cubre el doble clic y el "reenviar formulario".
  const hace60s = new Date(Date.now() - 60_000).toISOString();
  const { data: duplicado } = await supabase
    .from("tickets")
    .select("id")
    .eq("solicitante_id", user.id)
    .eq("categoria", datos.categoria)
    .eq("asunto", datos.asunto)
    .eq("descripcion", datos.descripcion)
    .gt("created_at", hace60s)
    .limit(1)
    .maybeSingle();
  if (duplicado) return { success: true as const, id: (duplicado as { id: number }).id };

  // Adjunto opcional: solo JPEG/PNG reales de hasta 5 MB. El nombre nunca es el que
  // manda el usuario (evita colisiones y rutas manipuladas); va en su carpeta <uid>/.
  let adjuntoPath: string | null = null;
  const archivo = formData.get("adjunto");
  if (archivo instanceof File && archivo.size > 0) {
    if (archivo.size > ADJUNTO_TAMANO_MAXIMO) return { error: "El adjunto no puede pesar más de 5 MB" };
    const cabecera = new Uint8Array(await archivo.slice(0, 8).arrayBuffer());
    const tipo = tipoImagenReal(cabecera);
    if (!tipo) return { error: "El adjunto debe ser una imagen JPG o PNG" };

    adjuntoPath = `${user.id}/${randomUUID()}.${tipo.ext}`;
    const { error: errorSubida } = await supabase.storage
      .from("tickets-adjuntos")
      .upload(adjuntoPath, archivo, { contentType: tipo.mime, cacheControl: "3600", upsert: false });
    if (errorSubida) return { error: "No se pudo subir el adjunto: " + errorSubida.message };
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      categoria: datos.categoria,
      prioridad: datos.prioridad,
      asunto: datos.asunto,
      descripcion: datos.descripcion,
      adjunto_path: adjuntoPath,
      solicitante_id: user.id,
      nombre_solicitante: profile.nombre_completo ?? profile.email ?? "Usuario",
      celular_contacto: datos.celular,
      sede: datos.sede,
      area: datos.area,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (adjuntoPath) await supabase.storage.from("tickets-adjuntos").remove([adjuntoPath]);
    return { error: error?.message ?? "No se pudo registrar el ticket" };
  }

  revalidatePath("/soporte");
  return { success: true as const, id: (data as { id: number }).id };
}

export async function reabrirTicket(ticketId: number, nota: string) {
  const parsed = reabrirTicketSchema.safeParse({ id: ticketId, nota });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  await requireAuth();

  // La función de la base valida que sea del solicitante y esté CERRADO, y escribe el historial.
  const supabase = createClient();
  const { error } = await supabase.rpc("reabrir_ticket", { p_ticket_id: parsed.data.id, p_nota: parsed.data.nota });
  if (error) return { error: error.message };

  revalidatePath("/soporte");
  return { success: true as const };
}

export async function getUrlAdjuntoTicket(ruta: string) {
  const parsed = z.string().trim().min(1).max(200).safeParse(ruta);
  if (!parsed.success) return null;
  await requireAuth();

  // La política de Storage solo deja firmar rutas de la carpeta propia (o de cualquier ticket, a un gestor).
  const supabase = createClient();
  const { data, error } = await supabase.storage.from("tickets-adjuntos").createSignedUrl(parsed.data, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}
