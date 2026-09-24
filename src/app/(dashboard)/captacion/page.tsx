import { requireRole } from "@/app/api/actions/auth";
import { getCaptaciones, getCatalogosCaptacion } from "@/app/api/actions/captacion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListaCaptaciones } from "@/components/captacion/lista-captaciones";
import { ROLES_CAPTACION_LISTA, puedeAdministrarCaptacion } from "@/lib/captacion";

interface Props {
  searchParams: { buscar?: string; desde?: string; hasta?: string; aeropuerto?: string };
}

export default async function CaptacionPage({ searchParams }: Props) {
  // Mismos roles que puede_captacion() en la base (migración 080).
  const profile = await requireRole(ROLES_CAPTACION_LISTA);

  const [captaciones, catalogos] = await Promise.all([getCaptaciones(searchParams), getCatalogosCaptacion()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Captación aeroportuaria</h1>
        <p className="mt-2 text-muted-foreground">
          Atenciones a pacientes en aeropuertos. Cada registro alimenta el reporte SISPRO del mes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros</CardTitle>
          <CardDescription>Se muestran los 500 más recientes que cumplan los filtros.</CardDescription>
        </CardHeader>
        <CardContent>
          <ListaCaptaciones
            captaciones={captaciones}
            aeropuertos={catalogos.aeropuertosAtencion}
            filtros={searchParams}
            esAdmin={puedeAdministrarCaptacion(profile.role_codigo)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
