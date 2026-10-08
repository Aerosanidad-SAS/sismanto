import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { KpisMantenimiento } from "@/app/api/actions/kpis-mantenimiento";

const pct = (v: number | null) => (v == null ? "—" : v.toFixed(1) + "%");
const num = (v: number) => new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(v);

function Dato({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota?: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{etiqueta}</p>
      <p className="text-2xl font-semibold">{valor}</p>
      {nota ? <p className="text-xs text-muted-foreground">{nota}</p> : null}
    </div>
  );
}

function SinDatos() {
  return <p className="text-sm text-muted-foreground">No se pudo calcular este indicador. Intenta de nuevo más tarde.</p>;
}

export function KpiMantenimiento({ datos }: { datos: KpisMantenimiento }) {
  const { preoperacional: pre, combustible: fuel, hojasDeVida: hv, costoPorKm: cxk } = datos;
  return (
    <section className="space-y-4" aria-labelledby="kpi-mant-titulo">
      <div>
        <h2 id="kpi-mant-titulo" className="text-2xl">Mantenimiento y operación</h2>
        <p className="mt-1 text-sm text-muted-foreground">Mismo rango de fechas de arriba.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cumplimiento del preoperacional</CardTitle>
            <CardDescription>Cobertura calculada sobre la flota operativa de hoy; mejora cuando exista la programación diaria.</CardDescription>
          </CardHeader>
          <CardContent>
            {pre ? (
              <div className="grid grid-cols-2 gap-4">
                <Dato etiqueta="Cobertura diaria promedio" valor={pct(pre.coberturaDiariaPromedio)} nota={pre.diasConRegistro + " días con registro"} />
                <Dato etiqueta="Preoperacionales realizados" valor={num(pre.realizados)} nota={pre.vehiculosConPreoperacional + " vehículos distintos"} />
                <Dato etiqueta="Con falla" valor={num(pre.conFalla)} nota={pct(pre.porcentajeConFalla)} />
              </div>
            ) : <SinDatos />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Combustible</CardTitle>
            <CardDescription>Cargas del periodo, incluida la carga semanal del proveedor.</CardDescription>
          </CardHeader>
          <CardContent>
            {fuel ? (
              <div className="grid grid-cols-2 gap-4">
                <Dato etiqueta="Galones" valor={num(fuel.galones)} nota={num(fuel.cargas) + " cargas"} />
                <Dato etiqueta="Costo" valor={formatCurrency(fuel.costo)} />
                <Dato etiqueta="Costo por galón" valor={fuel.costoPorGalon == null ? "—" : formatCurrency(fuel.costoPorGalon)} />
                <Dato etiqueta="Km sospechosos" valor={num(fuel.sospechosas)} nota="Lecturas que retroceden o saltan" />
              </div>
            ) : <SinDatos />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hojas de vida y documentos</CardTitle>
            <CardDescription>Flota sin ninguna alerta: FDS prolongado, SOAT, técnico-mecánica u hoja incompleta.</CardDescription>
          </CardHeader>
          <CardContent>
            {hv ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Dato etiqueta="Flota al día" valor={pct(hv.porcentajeAlDia)} nota={hv.alDia + " de " + hv.flota + " vehículos"} />
                  <Dato etiqueta="Hojas incompletas" valor={num(hv.porTipo.INCOMPLETA)} />
                  <Dato etiqueta="SOAT" valor={num(hv.porTipo.SOAT)} nota="vencidos o por vencer (30 d)" />
                  <Dato etiqueta="Técnico-mecánica" valor={num(hv.porTipo.RTM)} nota="vencidas o por vencer (30 d)" />
                </div>
                {hv.vencimientos.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {hv.vencimientos.slice(0, 8).map((v, i) => (
                      <li key={v.placa + "-" + i} className="flex justify-between gap-2">
                        <span className="font-medium">{v.placa}</span>
                        <span className={v.gravedad === "alta" ? "text-destructive" : "text-muted-foreground"}>{v.detalle}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : <SinDatos />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Costo por km</CardTitle>
            <CardDescription>Costo total del periodo / km recorridos según las lecturas de odómetro. Mayor a menor.</CardDescription>
          </CardHeader>
          <CardContent>
            {cxk == null ? <SinDatos /> : cxk.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ningún vehículo tiene dos lecturas de km y costo en este rango.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-1 font-normal">Placa</th>
                    <th className="pb-1 text-right font-normal">Km periodo</th>
                    <th className="pb-1 text-right font-normal">$ / km</th>
                    <th className="pb-1 text-right font-normal">Km actual</th>
                  </tr>
                </thead>
                <tbody>
                  {cxk.slice(0, 10).map((f) => (
                    <tr key={f.vehicleId}>
                      <td className="py-0.5 font-medium">{f.placa}</td>
                      <td className="py-0.5 text-right">{num(f.kmRecorridos)}</td>
                      <td className="py-0.5 text-right">{formatCurrency(f.costoPorKm)}</td>
                      <td className="py-0.5 text-right">{f.kmActual == null ? "—" : num(f.kmActual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
