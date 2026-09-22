import type { MantenimientoPendiente, VencimientoVehiculo } from "@/app/api/actions/regulacion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpTrigger } from "@/components/ui/help-trigger";

/** "hoy", "vencido hace 3 días" o "en 12 días". */
function plazo(dias: number): { texto: string; vencido: boolean } {
  if (dias < 0) return { texto: `vencido hace ${Math.abs(dias)} d`, vencido: true };
  if (dias === 0) return { texto: "vence hoy", vencido: true };
  return { texto: `en ${dias} d`, vencido: false };
}

export function VencimientosCard({ vencimientos }: { vencimientos: VencimientoVehiculo[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            Próximos vencimientos
            <HelpTrigger text="SOAT, técnico-mecánica y pase aeroportuario de los vehículos de tu centro: vencidos o que vencen dentro de 30 días." />
          </span>
          <Badge variant={vencimientos.length > 0 ? "warning" : "secondary"}>{vencimientos.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-72 space-y-2 overflow-y-auto">
        {vencimientos.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sin vencimientos en los próximos 30 días.
          </p>
        )}
        {vencimientos.map((v) => {
          const p = plazo(v.dias);
          return (
            <div
              key={`${v.placa}-${v.documento}`}
              className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
            >
              <div className="min-w-0">
                <p className="font-semibold">{v.placa}</p>
                <p className="text-xs text-muted-foreground">{v.documento}</p>
              </div>
              <Badge variant={p.vencido ? "destructive" : "warning"} className="shrink-0">
                {p.texto}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function MantenimientoCard({ mantenimiento }: { mantenimiento: MantenimientoPendiente[] }) {
  const vencidos = mantenimiento.filter((m) => m.nivel === "ROJA");
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            Mantenimiento próximo
            <HelpTrigger text="Ítems del plan de mantenimiento de los vehículos de tu centro: en rojo los vencidos por kilometraje o tiempo, en ámbar los próximos." />
          </span>
          <Badge variant={vencidos.length > 0 ? "destructive" : mantenimiento.length > 0 ? "warning" : "secondary"}>
            {mantenimiento.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-72 space-y-2 overflow-y-auto">
        {mantenimiento.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sin mantenimientos vencidos ni próximos.
          </p>
        )}
        {mantenimiento.map((m, i) => (
          <div
            key={`${m.placa}-${m.descripcion}-${i}`}
            className="flex items-start justify-between gap-2 rounded-md border p-2 text-sm"
          >
            <div className="min-w-0">
              <p className="font-semibold">{m.placa}</p>
              <p className="text-xs text-muted-foreground">{m.descripcion}</p>
              <p className="text-xs text-muted-foreground">
                {m.km_restantes !== null && `${m.km_restantes.toLocaleString("es-CO")} km`}
                {m.km_restantes !== null && m.dias_restantes !== null && " · "}
                {m.dias_restantes !== null && `${m.dias_restantes} días`}
              </p>
            </div>
            <Badge variant={m.nivel === "ROJA" ? "destructive" : "warning"} className="shrink-0">
              {m.nivel === "ROJA" ? "Vencido" : "Próximo"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
