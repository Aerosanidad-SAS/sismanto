import { getSeguimientoPublico } from "@/app/api/actions/seguimiento-gps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapaSeguimiento } from "@/components/gps/mapa-seguimiento";

// Página pública (sin sesión) del enlace que recibe el paciente. Solo muestra placa y posición; el servidor valida el
// token (vigencia de 24 h y servicio activo) en cada consulta.
export const dynamic = "force-dynamic";

export default function SeguimientoPublicoPage({ params }: { params: { token: string } }) {
  return (
    <div className="flex min-h-screen min-h-[100dvh] items-start justify-center bg-muted/40 px-4 py-6 sm:items-center">
      <Card className="w-full max-w-3xl border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Su ambulancia va en camino</CardTitle>
          <CardDescription>Aerosanidad S.A.S. · La ubicación se actualiza sola cada 30 segundos.</CardDescription>
        </CardHeader>
        <CardContent>
          <MapaSeguimiento cargar={getSeguimientoPublico.bind(null, params.token)} />
        </CardContent>
      </Card>
    </div>
  );
}
