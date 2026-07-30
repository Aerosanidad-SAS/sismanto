"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/app/api/actions/auth";

const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const TAMANO_MAXIMO = 2 * 1024 * 1024; // 2MB — es un logo, no una foto

export async function getCompanyBranding() {
  const supabase = createClient();
  const { data } = await supabase.from("company_settings").select("logo_url").eq("id", 1).maybeSingle();
  return { logo_url: data?.logo_url ?? null };
}

export async function updateCompanyLogo(file: File) {
  const profile = await requireRole(["ADMIN"]);

  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return { error: "Formato no soportado — usa PNG, JPG, SVG o WEBP" };
  }
  if (file.size > TAMANO_MAXIMO) {
    return { error: "La imagen no puede pesar más de 2MB" };
  }

  const supabase = createClient();
  const extension = file.name.split(".").pop() || "png";
  const ruta = `logo-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from("branding").upload(ruta, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  const { data: pub } = supabase.storage.from("branding").getPublicUrl(ruta);

  const { error } = await supabase
    .from("company_settings")
    .update({ logo_url: pub.publicUrl, updated_at: new Date().toISOString(), updated_by: profile.user_id })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/configuracion");
  revalidatePath("/", "layout");
  return { success: true, logo_url: pub.publicUrl };
}
