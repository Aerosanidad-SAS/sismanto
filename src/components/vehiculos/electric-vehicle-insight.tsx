import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CHANGAN_ESTAR_BATTERY_KWH,
  CHANGAN_ESTAR_KWH_PER_100KM,
  CHANGAN_ESTAR_MOTOR_KW,
  CHANGAN_ESTAR_RANGE_NEDC_KM,
  KIA_PICANTO_L_PER_100KM,
  kiaPicantoKmPerGalApprox,
} from "@/lib/electric-reference";

function formatCop(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(
    Math.round(n)
  );
}

/**
 * Comparación orientativa combustible vs eléctrico en un recorrido dado.
 * Precios ejemplo CO (ajústelos en operación cuando tenga valores reales por kWh y galón).
 */
export function ElectricVehicleInsight({ kilometrosEjemplo = 1000 }: { kilometrosEjemplo?: number }) {
  const picantoKmGal = kiaPicantoKmPerGalApprox();
  const galCombustible = kilometrosEjemplo / picantoKmGal;
  const kwhElectric = (kilometrosEjemplo / 100) * CHANGAN_ESTAR_KWH_PER_100KM;

  const precioGasolinaGal = 12000;
  const precioKwh = 800;

  const costoPicanto = galCombustible * precioGasolinaGal;
  const costoElectric = kwhElectric * precioKwh;
  const ahorro = costoPicanto - costoElectric;

  return (
    <Card className="border-primary/25 bg-primary/[0.03]">
      <CardHeader>
        <CardTitle className="text-lg">Referencia técnica Changan E-Star (2021)</CardTitle>
        <CardDescription>
          Motor ~{CHANGAN_ESTAR_MOTOR_KW} kW, batería ~{CHANGAN_ESTAR_BATTERY_KWH} kWh, consumo homologación
          orientativo ~{CHANGAN_ESTAR_KWH_PER_100KM} kWh/100 km, autonomía NEDC típica ~{CHANGAN_ESTAR_RANGE_NEDC_KM}{" "}
          km (según fichas tipo BenBen/E-Star).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          <strong>Rendimiento eléctrico:</strong> ≈ {(100 / CHANGAN_ESTAR_KWH_PER_100KM).toFixed(2)} km por kWh
          (inverso de {CHANGAN_ESTAR_KWH_PER_100KM} kWh/100 km).
        </p>
        <p>
          <strong>Referencia Kia Picanto 2022 (gasolina):</strong> ~{KIA_PICANTO_L_PER_100KM} L/100 km mixto
          (orientativo) ≈ {picantoKmGal.toFixed(1)} km/gal.
        </p>
        <div className="rounded-lg border bg-card p-3 space-y-1">
          <p className="font-medium">Estimación de costos en {kilometrosEjemplo.toLocaleString()} km recorridos</p>
          <p className="text-muted-foreground">
            Hipótesis illustrative: gasolina ≈ {formatCop(precioGasolinaGal)}/gal, energía ≈ {formatCop(precioKwh)}
            /kWh (ajústelas según tarifas reales).
          </p>
          <ul className="list-disc pl-5 pt-2 space-y-1">
            <li>Consumo térmico tipo Picanto: ~{galCombustible.toFixed(2)} gal → ~{formatCop(costoPicanto)}</li>
            <li>Consumo eléctrico E-Star (~{CHANGAN_ESTAR_KWH_PER_100KM} kWh/100 km): ~{kwhElectric.toFixed(1)} kWh → ~{formatCop(costoElectric)}</li>
            <li>
              <strong>Diferencia aproximada (ahorro eléctrico en este ejemplo):</strong> {formatCop(ahorro)}{" "}
              {ahorro >= 0 ? "(menor costo energético)" : ""}
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
