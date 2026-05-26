import { redirect } from "next/navigation";
import { getProfile } from "@/app/api/actions/auth";
import { getJobsForReview } from "@/app/api/actions/invoice-jobs";
import { createClient } from "@/lib/supabase/server";
import { ReviewJobList } from "./review-job-list";

async function getVehicles() {
  const supabase = createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("id, placa")
    .order("placa");
  return (data ?? []) as { id: string; placa: string }[];
}

async function getCategories() {
  const supabase = createClient();
  const { data } = await supabase
    .from("maintenance_categories")
    .select("id, nombre, grupo_padre")
    .eq("activo", true)
    .order("nombre");
  return (data ?? []) as { id: number; nombre: string; grupo_padre: string | null }[];
}

export default async function InvoicesReviewPage() {
  const profile = await getProfile();
  if (!profile || !["ADMIN", "MANTENIMIENTO"].includes(profile.role_codigo)) {
    redirect("/");
  }

  const [{ data: jobs, error }, vehicles, categories] = await Promise.all([
    getJobsForReview(),
    getVehicles(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Facturas por revisar</h1>
        <p className="mt-1 text-muted-foreground">
          Archivos con baja confianza de extracción. Revisa los datos antes de aprobar.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <ReviewJobList
        jobs={jobs ?? []}
        vehicles={vehicles}
        categories={categories}
      />
    </div>
  );
}
