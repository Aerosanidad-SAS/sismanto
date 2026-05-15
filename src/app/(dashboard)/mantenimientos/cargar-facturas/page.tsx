import { redirect } from "next/navigation";
import { getProfile } from "@/app/api/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { InvoiceUploader } from "./invoice-uploader";

async function getFormCatalogs() {
  try {
    const supabase = createClient();
    const [{ data: vehicles }, { data: categories }] = await Promise.all([
      supabase.from("vehicles").select("id, placa").order("placa"),
      supabase
        .from("maintenance_categories")
        .select("id, nombre, grupo_padre")
        .eq("activo", true)
        .order("grupo_padre")
        .order("nombre"),
    ]);
    return {
      vehicles: (vehicles || []) as { id: string; placa: string }[],
      categories: (categories || []) as { id: number; nombre: string; grupo_padre: string | null }[],
    };
  } catch {
    return { vehicles: [], categories: [] };
  }
}

export default async function CargarFacturasPage() {
  const profile = await getProfile();
  if (!profile || !["ADMIN", "MANTENIMIENTO"].includes(profile.role_codigo)) {
    redirect("/");
  }

  const { vehicles, categories } = await getFormCatalogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Cargar Facturas</h1>
        <p className="mt-2 text-muted-foreground">
          Arrastra PDFs o imágenes de facturas — se extraen los datos automáticamente para que los
          revises y apruebes antes de guardar.
        </p>
      </div>

      <InvoiceUploader vehicles={vehicles} categories={categories} />
    </div>
  );
}
