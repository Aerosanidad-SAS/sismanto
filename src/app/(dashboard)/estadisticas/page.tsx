import { hoyBogota } from "@/lib/fechas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstadisticasServicios, getResumenOperativoDiario } from "@/app/api/actions/estadisticas-servicios";
import { EstadisticasCharts } from "@/components/servicios/estadisticas-charts";
import { ResumenOperativo } from "@/components/gerencial/resumen-operativo";
import { requireRole } from "@/app/api/actions/auth";
import { FiltroCiudadUrl } from "@/components/servicios/filtro-ciudad";
import { CIUDADES_SERVICIO, prefijoCiudad } from "@/lib/servicios-lista";

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireRole(["ADMIN", "GERENCIAL", "ANALISTA", "COORDINACION"]);
  const hoyIso = hoyBogota();
  const pedida = Array.isArray(searchParams.ciudad) ? searchParams.ciudad[0] : searchParams.ciudad;
  const ciudad = prefijoCiudad(pedida) ? (pedida as string) : "";
  const nombreCiudad = CIUDADES_SERVICIO.find((c) => c.clave === ciudad)?.nombre;
  const [stats, resumenHoy] = await Promise.all([
    getEstadisticasServicios(ciudad),
    getResumenOperativoDiario({ desde: hoyIso, hasta: hoyIso }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl">Estadísticas de servicios</h1>
          <p className="mt-2 text-muted-foreground">
            Servicios médicos de los últimos 12 meses{nombreCiudad ? ` en ${nombreCiudad}` : ""} — volumen, etapas, tipos y tiempos de atención.
          </p>
        </div>
        <FiltroCiudadUrl conEtiqueta />
      </div>

      <ResumenOperativo inicial={resumenHoy} ciudad={ciudad} />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Servicios (12 meses){nombreCiudad ? ` — ${nombreCiudad}` : ""}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        {stats.tiemposPromedio.slice(0, 3).map((t) => (
          <Card key={t.concepto}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t.concepto}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {t.minutos} <span className="text-sm font-normal text-muted-foreground">min prom.</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análisis de servicios</CardTitle>
          <CardDescription>
            Equivalente al dashboard de estadísticas de SISRES, sobre los datos de Aeromanto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EstadisticasCharts stats={stats} />
        </CardContent>
      </Card>
    </div>
  );
}
