import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstadisticasServicios } from "@/app/api/actions/estadisticas-servicios";
import { EstadisticasCharts } from "@/components/servicios/estadisticas-charts";

export default async function EstadisticasPage() {
  const stats = await getEstadisticasServicios();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Estadísticas de servicios</h1>
        <p className="mt-2 text-muted-foreground">
          Servicios médicos de los últimos 12 meses — volumen, etapas, tipos y tiempos de atención.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Servicios (12 meses)</CardTitle>
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
