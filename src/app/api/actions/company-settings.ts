"use server";

import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/app/api/actions/auth";
import { tipoImagenPorContenido } from "@/lib/imagen-contenido";

const TAMANO_MAXIMO = 2 * 1024 * 1024; // 2MB — es un logo, no una foto

export async function getCompanyBranding() {
  const supabase = createClient();
  const { data } = await supabase.from("company_settings").select("logo_url").eq("id", 1).maybeSingle();
  return { logo_url: data?.logo_url ?? null };
}

/**
 * Logo en el bucket PÚBLICO `branding`: se valida por el contenido real del archivo, no por lo que declare el
 * navegador — y a propósito ya no se acepta SVG (puede llevar <script>; auditoría 2026-10-01, hallazgo #5).
 */
export async function updateCompanyLogo(file: File) {
  const profile = await requireRole(["ADMIN"]);

  if (file.size > TAMANO_MAXIMO) {
    return { error: "La imagen no puede pesar más de 2MB" };
  }
  const cabecera = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const tipo = tipoImagenPorContenido(cabecera);
  if (!tipo) {
    return { error: "Formato no soportado — usa PNG, JPG o WEBP" };
  }

  const supabase = createClient();
  const ruta = `logo-${Date.now()}.${tipo.ext}`;

  const { error: uploadError } = await supabase.storage.from("branding").upload(ruta, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: tipo.mime, // el real, no el que declaró el navegador
  });
  if (uploadError) return { error: uploadError.message };

  const { data: pub } = supabase.storage.from("branding").getPublicUrl(ruta);

  const { error } = await supabase
    .from("company_settings")
    .update({ logo_url: pub.publicUrl, updated_at: new Date().toISOString(), updated_by: profile.user_id })
    .eq("id", 1);

  if (error) return { error: error.message };

  await auditar("MODIFICAR", "configuracion", "company_settings", "Logo de la empresa actualizado");
  revalidatePath("/configuracion");
  revalidatePath("/", "layout");
  return { success: true, logo_url: pub.publicUrl };
}
