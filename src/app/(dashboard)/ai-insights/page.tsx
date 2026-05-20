import { redirect } from "next/navigation";
import { getProfile } from "@/app/api/actions/auth";
import { InsightsPanel } from "@/components/ai/InsightsPanel";

export default async function AIInsightsPage() {
  const profile = await getProfile();
  if (!profile || !["ADMIN", "GERENCIAL", "COORDINACION"].includes(profile.role_codigo)) {
    redirect("/");
  }

  return (
    <div className="p-4 md:p-6 space-y-2">
      <div>
        <h1 className="text-xl font-semibold">AI Insights</h1>
        <p className="text-sm text-muted-foreground">
          Análisis inteligente de la flota: patrones, anomalías y oportunidades de mejora.
        </p>
      </div>
      <InsightsPanel />
    </div>
  );
}
