import Link from "next/link";
import { getProfile, requireRole } from "@/app/api/actions/auth";
import { getChecklistsBiomedicos } from "@/app/api/actions/inventario-biomedico";
import { ChecklistsBiomedicos } from "@/components/equipos/checklists-biomedicos";

export default async function ChecklistsBiomedicosPage() {
  // Mismos roles que ven Equipos biomédicos; editar, solo ADMIN y MANTENIMIENTO (la RLS de la 092 lo exige igual).
  await requireRole(["ADMIN", "MANTENIMIENTO", "COORDINACION", "ANALISTA", "VISTA"]);
  const [profile, checklists] = await Promise.all([getProfile(), getChecklistsBiomedicos()]);
  const puedeEditar = ["ADMIN", "MANTENIMIENTO"].includes(profile?.role_codigo ?? "");

  return (
    <div className="space-y-8">
      <div>
        <Link href="/equipos" className="text-sm text-muted-foreground underline">
          ← Volver a equipos biomédicos
        </Link>
        <h1 className="mt-2 text-3xl">Listas de chequeo de mantenimiento</h1>
        <p className="mt-2 text-muted-foreground">
          Cada tipo de equipo tiene su lista de ítems, que aparece al registrar un mantenimiento. Los equipos que no
          tienen una propia usan la lista GENERAL.
        </p>
      </div>
      <ChecklistsBiomedicos inicial={checklists} puedeEditar={puedeEditar} />
    </div>
  );
}
