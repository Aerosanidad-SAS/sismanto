import { requireRole } from "@/app/api/actions/auth";
import { getCatalogosCaptacion, getDatosInformeCaptacion } from "@/app/api/actions/captacion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InformesCaptacion } from "@/components/captacion/informes-captacion";
import { ROLES_CAPTACION_LISTA } from "@/lib/captacion";
import { esDia, hoyBogota, primerDiaDelMes } from "@/lib/fechas";
import {
  calcularInformeAcm,
  calcularInformeAerocivil,
  calcularInformePae,
  calcularInformePme,
} from "@/lib/informes-captacion";

interface Props {
  searchParams: { informe?: string; desde?: string; hasta?: string; aeropuerto?: string };
}

export default async function InformesCaptacionPage({ searchParams }: Props) {
  // Mismos roles que la lista de captaciones (puede_captacion() en la base, migración 080).
  await requireRole(ROLES_CAPTACION_LISTA);

  const hoy = hoyBogota();
  const desde = esDia(searchParams.desde) ? searchParams.desde : primerDiaDelMes(hoy);
  const hasta = esDia(searchParams.hasta) ? searchParams.hasta : hoy;
  const aeropuerto = (searchParams.aeropuerto ?? "").trim();

  const [datos, catalogos] = await Promise.all([
    getDatosInformeCaptacion(desde, hasta, aeropuerto || undefined),
    getCatalogosCaptacion(),
  ]);

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-3xl">Informes de captación</h1>
        <p className="mt-2 text-muted-foreground">
          Informes ACM, Aerocivil, PME y PAE, calculados en vivo con las captaciones del período.
        </p>
      </div>

      {"error" in datos ? (
        <Alert variant="destructive">
          <AlertDescription>{datos.error}</AlertDescription>
        </Alert>
      ) : (
        <InformesCaptacion
          filtros={{ desde, hasta, aeropuerto }}
          informeInicial={searchParams.informe}
          aeropuertos={catalogos.aeropuertosAtencion}
          acm={calcularInformeAcm(datos.filas)}
          aerocivil={calcularInformeAerocivil(datos.filas)}
          pme={calcularInformePme(datos.filas)}
          pae={calcularInformePae(datos.filas, datos.aerolineas)}
        />
      )}
    </div>
  );
}
