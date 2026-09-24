/**
 * Adjuntar / quitar / renovar el encabezado multimedia de una campaña. Recibe base de datos, almacenamiento y la subida
 * a Meta por parámetro (sin Next ni red) para poder probarlo con dobles.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { WaMediaHeader } from "@/lib/notifications/whatsapp";
import type { CampanaLote } from "@/lib/campanas-lote";
import { mediaVencida, nombreSeguro, rutaMediaValida, validarMedia } from "@/lib/campanas-media";

type Cliente = SupabaseClient<Database>;

export interface AlmacenMedia {
  descargar: (ruta: string) => Promise<Uint8Array | null>;
  borrar: (ruta: string) => Promise<void>;
}

export type SubirAMeta = (
  bytes: Uint8Array,
  mime: string,
  nombre: string
) => Promise<{ ok: true; mediaId: string } | { ok: false; error: string }>;

/** Nombre con el que el archivo llega al destinatario: el de la ruta sin el prefijo aleatorio de subida. */
function nombreVisible(ruta: string): string {
  return nombreSeguro(ruta.split("/").pop() ?? "archivo").replace(/^\d{10,}_/, "");
}

/**
 * Toma el archivo que el navegador subió a Storage, lo valida por su contenido, lo sube a Meta y lo deja en la campaña.
 * Solo campañas en BORRADOR: cambiar el adjunto de una campaña ya en envío mezclaría mensajes distintos.
 */
export async function adjuntarMedia(
  db: Cliente,
  almacen: AlmacenMedia,
  args: { campaignId: number; ruta: string; userId: string; subir: SubirAMeta; ahora?: () => Date }
): Promise<{ error: string } | { success: true; tipo: string; nombre: string }> {
  const ahora = args.ahora ?? (() => new Date());
  if (!rutaMediaValida(args.ruta, args.userId)) return { error: "Ruta de archivo inválida" };

  const { data } = await db.from("wa_campaigns").select("id, estado, media_ruta").eq("id", args.campaignId).maybeSingle();
  const campana = data as unknown as { id: number; estado: string; media_ruta: string | null } | null;
  if (!campana) return { error: "Campaña no encontrada" };
  if (campana.estado !== "BORRADOR") return { error: "Solo se puede cambiar el adjunto de una campaña en BORRADOR" };

  const bytes = await almacen.descargar(args.ruta);
  if (!bytes) return { error: "No se encontró el archivo subido" };

  const nombre = nombreVisible(args.ruta);
  const v = validarMedia(nombre, bytes);
  if (!v.ok) {
    await almacen.borrar(args.ruta); // no dejar basura rechazada en el bucket
    return { error: v.error };
  }

  const subida = await args.subir(bytes, v.info.mime, nombre);
  if (!subida.ok) return { error: `Meta rechazó el archivo: ${subida.error}` };

  // Condicional a BORRADOR otra vez: si alguien la lanzó mientras se subía a Meta, no se toca.
  const { data: act } = await db
    .from("wa_campaigns")
    .update({
      media_tipo: v.info.tipo,
      media_id: subida.mediaId,
      media_nombre: nombre,
      media_ruta: args.ruta,
      media_subido_at: ahora().toISOString(),
      updated_at: ahora().toISOString(),
    } as never)
    .eq("id", campana.id)
    .eq("estado", "BORRADOR")
    .select("id");
  if (!act || act.length === 0) return { error: "La campaña cambió de estado; no se adjuntó el archivo" };

  if (campana.media_ruta && campana.media_ruta !== args.ruta) await almacen.borrar(campana.media_ruta);
  return { success: true, tipo: v.info.tipo, nombre };
}

export async function quitarMedia(
  db: Cliente,
  almacen: AlmacenMedia,
  campaignId: number,
  ahora: () => Date = () => new Date()
): Promise<{ error: string } | { success: true }> {
  const { data } = await db.from("wa_campaigns").select("id, estado, media_ruta").eq("id", campaignId).maybeSingle();
  const campana = data as unknown as { id: number; estado: string; media_ruta: string | null } | null;
  if (!campana) return { error: "Campaña no encontrada" };
  if (campana.estado !== "BORRADOR") return { error: "Solo se puede quitar el adjunto de una campaña en BORRADOR" };

  const { data: act } = await db
    .from("wa_campaigns")
    .update({ media_tipo: null, media_id: null, media_nombre: null, media_ruta: null, media_subido_at: null, updated_at: ahora().toISOString() } as never)
    .eq("id", campaignId)
    .eq("estado", "BORRADOR")
    .select("id");
  if (!act || act.length === 0) return { error: "La campaña cambió de estado" };
  if (campana.media_ruta) await almacen.borrar(campana.media_ruta);
  return { success: true };
}

/**
 * Encabezado para el envío. Si el `media_id` de Meta ya caducó (>25 días) vuelve a subir el archivo guardado y guarda
 * el nuevo id; si eso falla devuelve error (el lote no envía mensajes sin su adjunto).
 */
export async function resolverMediaEnvio(
  db: Cliente,
  almacen: AlmacenMedia,
  campana: CampanaLote,
  subir: SubirAMeta,
  ahora: () => Date = () => new Date()
): Promise<WaMediaHeader | null | { error: string }> {
  if (!campana.media_ruta || !campana.media_tipo) return null;
  const tipo = campana.media_tipo as WaMediaHeader["tipo"];
  const nombre = campana.media_nombre ?? undefined;

  if (campana.media_id && !mediaVencida(campana.media_subido_at, ahora())) {
    return { tipo, mediaId: campana.media_id, nombre };
  }

  const bytes = await almacen.descargar(campana.media_ruta);
  if (!bytes) return { error: "El adjunto de la campaña ya no está disponible; vuelve a adjuntarlo" };
  const v = validarMedia(nombre ?? nombreVisible(campana.media_ruta), bytes);
  if (!v.ok) return { error: v.error };
  const subida = await subir(bytes, v.info.mime, nombre ?? nombreVisible(campana.media_ruta));
  if (!subida.ok) return { error: `No se pudo renovar el adjunto en Meta: ${subida.error}` };

  await db
    .from("wa_campaigns")
    .update({ media_id: subida.mediaId, media_subido_at: ahora().toISOString() } as never)
    .eq("id", campana.id);
  return { tipo, mediaId: subida.mediaId, nombre };
}
