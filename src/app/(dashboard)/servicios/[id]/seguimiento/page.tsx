import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile, requireRole } from "@/app/api/actions/auth";
import { getSeguimientoServicio } from "@/app/api/actions/seguimiento-gps";
import { Card, CardContent } from "@/components/ui/card";
import { MapaSeguimiento } from "@/components/gps/mapa-seguimiento";
import { EnviarUbicacionPaciente } from "@/components/gps/enviar-ubicacion-paciente";

export default async function SeguimientoServicioPage({ params }: { params: { id: string } }) {
  await requireRole(["ADMIN", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA", "ANALISTA", "VISTA"]);
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const profile = await getProfile();
  const puedeNotificar = ["ADMIN", "REGULACION", "ANALISTA"].includes(profile?.role_codigo ?? "");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/servicios" className="text-sm text-muted-foreground underline">
          ← Volver a los servicios
        </Link>
        <h1 className="mt-2 text-3xl">Seguimiento del servicio #{id}</h1>
        <p className="mt-2 text-muted-foreground">Ubicación en vivo de la ambulancia asignada (GPS ProTrack365).</p>
      </div>
      {puedeNotificar && <EnviarUbicacionPaciente servicioId={id} />}
      <Card>
        <CardContent className="pt-6">
          <MapaSeguimiento cargar={getSeguimientoServicio.bind(null, id)} />
        </CardContent>
      </Card>
    </div>
  );
}
