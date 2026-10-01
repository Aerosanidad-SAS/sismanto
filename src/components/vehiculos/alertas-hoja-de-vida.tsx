import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { alertasDeVehiculo, type TipoAlertaHojaDeVida, type VehiculoParaAlertas } from "@/lib/hoja-de-vida-alertas";
import type { Dia } from "@/lib/fechas";

const GRUPOS: { tipo: TipoAlertaHojaDeVida; titulo: string }[] = [
  { tipo: "FDS_LARGO", titulo: "Fuera de servicio por más de 7 días" },
  { tipo: "FDS_SIN_FECHA", titulo: "Fuera de servicio sin fecha de inicio" },
  { tipo: "SOAT", titulo: "SOAT vencido o por vencer" },
  { tipo: "RTM", titulo: "Técnico-mecánica vencida o por vencer" },
  { tipo: "INCOMPLETA", titulo: "Hoja de vida incompleta" },
];

/**
 * Alertas de la hoja de vida de la flota (FDS, vencimientos, incompletas). Cada grupo se despliega para ver qué
 * vehículos son y qué les falta; los grupos sin casos no aparecen.
 */
export function AlertasHojaDeVida({ vehiculos, hoy, estimados }: { vehiculos: VehiculoParaAlertas[]; hoy: Dia; estimados: number }) {
  const porGrupo = new Map<TipoAlertaHojaDeVida, { placa: string; detalle: string; gravedad: "alta" | "media" }[]>();
  for (const v of vehiculos) {
    for (const a of alertasDeVehiculo(v, hoy)) {
      const lista = porGrupo.get(a.tipo) ?? [];
      lista.push({ placa: v.placa, detalle: a.detalle, gravedad: a.gravedad });
      porGrupo.set(a.tipo, lista);
    }
  }
  const grupos = GRUPOS.filter((g) => porGrupo.has(g.tipo));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas de hojas de vida</CardTitle>
        <CardDescription>
          {grupos.length === 0 ? "Sin alertas: las hojas de vida están al día." : "Despliega cada grupo para ver los vehículos."}
          {estimados > 0 && ` · ${estimados} costos anuales son estimados (no pagados reales).`}
        </CardDescription>
      </CardHeader>
      {grupos.length > 0 && (
        <CardContent className="space-y-2">
          {grupos.map((g) => {
            const filas = porGrupo.get(g.tipo) ?? [];
            return (
              <details key={g.tipo} className="rounded-md border">
                <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm font-medium">
                  {g.titulo}
                  <Badge variant={filas.some((f) => f.gravedad === "alta") ? "destructive" : "warning"}>{filas.length}</Badge>
                </summary>
                <ul className="max-h-64 space-y-1 overflow-auto border-t px-3 py-2 text-sm">
                  {filas.map((f) => (
                    <li key={f.placa}>
                      <span className="font-medium">{f.placa}</span> <span className="text-muted-foreground">— {f.detalle}</span>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
