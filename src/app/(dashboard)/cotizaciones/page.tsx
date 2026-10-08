import { requireRole } from "@/app/api/actions/auth";
import { getLlaveMapsNavegador, listarCotizaciones } from "@/app/api/actions/cotizaciones";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CotizadorRutas } from "@/components/cotizaciones/cotizador-rutas";
import { HistorialCotizaciones } from "@/components/cotizaciones/historial-cotizaciones";
import { ROLES_COTIZACION } from "@/lib/cotizacion-ruta";

export default async function CotizacionesPage() {
  await requireRole([...ROLES_COTIZACION]);
  const [llave, cotizaciones] = await Promise.all([getLlaveMapsNavegador(), listarCotizaciones()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Cotizador de rutas</h1>
        <p className="mt-2 text-muted-foreground">
          Calcule la ruta con tráfico en Google Maps, elija una y guarde la cotización para imprimirla en PDF o enviarla
          por correo. Total = kilómetros × valor por km + valor adicional.
        </p>
      </div>
      <CotizadorRutas llave={llave} />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimas cotizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <HistorialCotizaciones cotizaciones={cotizaciones} />
        </CardContent>
      </Card>
    </div>
  );
}
