import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/api/actions/auth";
import { getMisModulosOcultos } from "@/app/api/actions/permisos";
import { DashboardShell } from "@/components/layout/dashboard-shell";

// Server layout: the profile and the hidden modules are resolved before any HTML is sent, so the menu is there on first
// paint and the checks that do not depend on the route (no profile, first-login password change) never flash content.
// Route-dependent redirects per role live in the client shell, because a layout does not know the current path.
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [profile, ocultos] = await Promise.all([getProfile(), getMisModulosOcultos()]);
  if (!profile) redirect("/pending");
  // Primer ingreso tras la carga masiva: hay que elegir una clave propia antes de usar nada.
  if (profile.debe_cambiar_password) redirect("/cambiar-password");

  return (
    <DashboardShell profile={profile} ocultos={ocultos}>
      {children}
    </DashboardShell>
  );
}
