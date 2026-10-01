"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import {
  BUCKET_DOCUMENTOS_EQUIPO,
  MAX_BYTES_DOCUMENTO,
  MAX_MB_DOCUMENTO,
  esTipoDocumento,
  extensionPorContenido,
  validarRutaDocumento,
} from "@/lib/biomedico-documentos";

// Documentos del equipo biomédico. Esquema, bucket y RLS: migración 099. El navegador sube el archivo a Storage con la
// sesión del usuario; aquí se verifica el contenido y se registra (o se descarta el archivo).

const ROLES_VER = ["ADMIN", "MANTENIMIENTO", "COORDINACION", "GERENCIAL", "ANALISTA", "VISTA"];
const ROLES_SUBIR = ["ADMIN", "MANTENIMIENTO", "ANALISTA"];
const ROLES_ELIMINAR = ["ADMIN", "MANTENIMIENTO"];

export interface DocumentoEquipo {
  id: number;
  tipo: string;
  nombre: string;
  nombre_original: string | null;
  tamano_bytes: number | null;
  subido_en: string;
}

const idSchema = z.number().int().positive();

/** Documentos de un equipo, más recientes primero, con lo que el usuario puede hacer. Vacío si la tabla aún no existe. */
export async function getDocumentosEquipo(equipmentId: number) {
  const profile = await getProfile();
  const sinAcceso = { documentos: [] as DocumentoEquipo[], puedeSubir: false, puedeEliminar: false };
  if (!profile || !ROLES_VER.includes(profile.role_codigo) || !idSchema.safeParse(equipmentId).success) return sinAcceso;
  const permisos = {
    puedeSubir: ROLES_SUBIR.includes(profile.role_codigo),
    puedeEliminar: ROLES_ELIMINAR.includes(profile.role_codigo),
  };
  const { data, error } = await createClient()
    .from("biomedical_equipment_documents")
    .select("id, tipo, nombre, nombre_original, tamano_bytes, subido_en")
    .eq("equipment_id", equipmentId)
    .order("subido_en", { ascending: false })
    .order("id", { ascending: false });
  if (error) return { documentos: [] as DocumentoEquipo[], ...permisos, sinTabla: true };
  return { documentos: (data ?? []) as unknown as DocumentoEquipo[], ...permisos };
}

/** Borra un archivo que no llegó a registrarse (clave de servicio: el ANALISTA no puede borrar en el bucket). */
async function descartarArchivo(ruta: string) {
  await createAdminClient().storage.from(BUCKET_DOCUMENTOS_EQUIPO).remove([ruta]);
}

const registroSchema = z.object({
  equipmentId: idSchema,
  tipo: z.string().refine(esTipoDocumento, "Tipo de documento inválido"),
  nombre: z.string().trim().min(1, "Escribe el nombre del documento").max(200),
  ruta: z.string().max(200),
  nombreOriginal: z.string().max(255).optional(),
});

/**
 * Registra un documento ya subido al bucket. Verifica que la ruta sea del equipo, que el archivo exista, que no pase
 * de 15 MB y que su contenido real sea PDF, JPG o PNG (coincidiendo con la extensión). Si algo falla, lo borra.
 */
export async function registrarDocumentoEquipo(datos: z.input<typeof registroSchema>) {
  const profile = await getProfile();
  if (!profile || !ROLES_SUBIR.includes(profile.role_codigo)) return { error: "Sin permisos para subir documentos" };
  const parsed = registroSchema.safeParse(datos);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;
  const ext = validarRutaDocumento(d.ruta, d.equipmentId);
  if (!ext) return { error: "Ruta de archivo inválida" };

  const supabase = createClient();
  const { data: blob, error: errDescarga } = await supabase.storage.from(BUCKET_DOCUMENTOS_EQUIPO).download(d.ruta);
  if (errDescarga || !blob) return { error: "No se encontró el archivo subido" };
  if (blob.size > MAX_BYTES_DOCUMENTO) {
    await descartarArchivo(d.ruta);
    return { error: `El archivo supera ${MAX_MB_DOCUMENTO} MB` };
  }
  const inicio = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
  if (extensionPorContenido(inicio) !== ext) {
    await descartarArchivo(d.ruta);
    return { error: "El archivo no es un PDF, JPG o PNG válido" };
  }

  const { data, error } = await supabase
    .from("biomedical_equipment_documents")
    .insert({
      equipment_id: d.equipmentId,
      tipo: d.tipo,
      nombre: d.nombre,
      ruta: d.ruta,
      nombre_original: d.nombreOriginal?.trim() || null,
      tamano_bytes: blob.size,
      subido_por: profile.user_id,
    } as never)
    .select("id, tipo, nombre, nombre_original, tamano_bytes, subido_en")
    .single();
  if (error) {
    await descartarArchivo(d.ruta);
    return { error: error.message };
  }
  await auditar("INSERTAR", "inventario", d.equipmentId, `Documento del equipo: ${d.tipo} «${d.nombre}»`);
  revalidatePath("/equipos");
  return { success: true as const, documento: data as unknown as DocumentoEquipo };
}

/** Enlace temporal (10 minutos) para ver o descargar un documento. */
export async function getUrlDocumentoEquipo(id: number) {
  const profile = await getProfile();
  if (!profile || !ROLES_VER.includes(profile.role_codigo) || !idSchema.safeParse(id).success) return { error: "Sin permisos" };
  const supabase = createClient();
  const { data: doc } = await supabase.from("biomedical_equipment_documents").select("ruta").eq("id", id).maybeSingle();
  const ruta = (doc as { ruta?: string } | null)?.ruta;
  if (!ruta) return { error: "Documento no encontrado" };
  const { data, error } = await supabase.storage.from(BUCKET_DOCUMENTOS_EQUIPO).createSignedUrl(ruta, 600);
  if (error || !data) return { error: "No se pudo abrir el documento" };
  return { url: data.signedUrl };
}

/** Elimina un documento (fila y archivo). Solo ADMIN y MANTENIMIENTO. */
export async function eliminarDocumentoEquipo(id: number) {
  const profile = await getProfile();
  if (!profile || !ROLES_ELIMINAR.includes(profile.role_codigo)) return { error: "Sin permisos para eliminar documentos" };
  if (!idSchema.safeParse(id).success) return { error: "Documento inválido" };
  const supabase = createClient();
  const { data, error } = await supabase
    .from("biomedical_equipment_documents")
    .delete()
    .eq("id", id)
    .select("equipment_id, ruta, nombre");
  if (error) return { error: error.message };
  const borrado = (data ?? [])[0] as { equipment_id: number; ruta: string; nombre: string } | undefined;
  if (!borrado) return { error: "El documento no existe" };
  // Si falla el borrado del archivo, la fila ya no existe: queda un archivo huérfano, no un documento roto.
  await supabase.storage.from(BUCKET_DOCUMENTOS_EQUIPO).remove([borrado.ruta]);
  await auditar("ELIMINAR", "inventario", borrado.equipment_id, `Documento del equipo eliminado: «${borrado.nombre}»`);
  revalidatePath("/equipos");
  return { success: true as const };
}
