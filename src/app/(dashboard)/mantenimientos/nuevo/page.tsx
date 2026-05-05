import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { MaintenanceForm } from "@/components/forms/maintenance-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

async function getFormData() {
  try {
    const supabase = createClient();
    const [{ data: vehicles }, { data: categories }, { data: proveedores }] = await Promise.all([
      supabase.from("vehicles").select("id, placa").order("placa"),
      supabase
        .from("maintenance_categories")
        .select("id, nombre, grupo_padre")
        .eq("activo", true)
        .order("grupo_padre")
        .order("nombre"),
      supabase.from("suppliers").select("*").eq("activo", true).order("nombre"),
    ]);
    return { vehicles: vehicles || [], categories: categories || [], proveedores: proveedores || [] };
  } catch {
    return { vehicles: [], categories: [], proveedores: [] };
  }
}

export default async function NuevoMantenimientoPage() {
  const profile = await getProfile();
  if (!profile || !["ADMIN", "MANTENIMIENTO"].includes(profile.role_codigo)) {
    redirect("/");
  }

  const { vehicles, categories, proveedores } = await getFormData();

  const categoriasAgrupadas = categories.reduce((acc, cat) => {
    const grupo = cat.grupo_padre || "Otros";
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(cat);
    return acc;
  }, {} as Record<string, typeof categories>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Nuevo Mantenimiento</h1>
        <p className="mt-2 text-muted-foreground">Registre un nuevo mantenimiento para un vehículo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Mantenimiento</CardTitle>
          <CardDescription>
            Complete todos los campos requeridos para registrar el mantenimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Cargando formulario...</div>}>
            <MaintenanceForm
              vehicles={vehicles}
              categories={categoriasAgrupadas}
              proveedores={proveedores}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
