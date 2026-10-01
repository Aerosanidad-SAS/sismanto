import Link from "next/link";
import { requireRole } from "@/app/api/actions/auth";
import { getPlantillasBiomedicas } from "@/app/api/actions/biomedico-plantillas";
import { PlantillasBiomedicas } from "@/components/equipos/plantillas-biomedicas";

export default async function PlantillasBiomedicasPage() {
  // Mismos roles que ven Equipos biomédicos; editar, solo ADMIN y MANTENIMIENTO (la RLS de la 098 lo exige igual).
  await requireRole(["ADMIN", "MANTENIMIENTO", "COORDINACION", "ANALISTA", "VISTA"]);
  const { plantillas, puedeEditar } = await getPlantillasBiomedicas();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/equipos" className="text-sm text-muted-foreground underline">
          ← Volver a equipos biomédicos
        </Link>
        <h1 className="mt-2 text-3xl">Plantillas de texto de mantenimiento</h1>
        <p className="mt-2 text-muted-foreground">
          Textos predefinidos que se pegan con «Usar plantilla…» al registrar un mantenimiento.
        </p>
      </div>
      <PlantillasBiomedicas inicial={plantillas} puedeEditar={puedeEditar} />
    </div>
  );
}
