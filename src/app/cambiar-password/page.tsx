import { redirect } from "next/navigation";

import { getProfile } from "@/app/api/actions/auth";
import { CambiarClaveForm } from "@/components/auth/cambiar-clave-form";
import { getDefaultRoute } from "@/lib/auth-utils";

export default async function CambiarPasswordPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!profile.debe_cambiar_password) redirect(getDefaultRoute(profile.role_codigo));

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/40 px-4 py-6">
      <CambiarClaveForm nombre={profile.nombre_completo ?? profile.email ?? ""} destino={getDefaultRoute(profile.role_codigo)} />
    </div>
  );
}
