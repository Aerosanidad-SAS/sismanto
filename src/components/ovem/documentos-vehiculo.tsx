import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { diasHasta, documentosVehiculo, type VehiculoConDocumentos } from "@/lib/vencimientos";

/** Días de anticipación para avisar al OVEM (Regulación ve 30). */
const AVISO_DIAS = 15;

function estado(fecha: string | null, hoy: string) {
  if (!fecha) return { texto: "Sin fecha registrada", variant: "secondary" as const };
  const dias = diasHasta(fecha, hoy);
  if (dias < 0) return { texto: `Vencido hace ${Math.abs(dias)} d`, variant: "destructive" as const };
  if (dias === 0) return { texto: "Vence hoy", variant: "destructive" as const };
  if (dias <= AVISO_DIAS) return { texto: `Vence en ${dias} d`, variant: "warning" as const };
  return { texto: "Vigente", variant: "success" as const };
}

function fechaCorta(fecha: string) {
  const [y, m, d] = fecha.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Documentos del vehículo que el OVEM va a manejar, solo lectura. Si alguno
 * está vencido, el OVEM no debe salir: lo reporta a Regulación.
 */
export function DocumentosVehiculo({
  placa,
  vehiculo,
  hoy,
  esAeroportuario,
}: {
  placa: string;
  vehiculo: VehiculoConDocumentos;
  hoy: string;
  esAeroportuario: boolean;
}) {
  const documentos = documentosVehiculo(vehiculo).filter(([doc]) => doc !== "Pase aeroportuario" || esAeroportuario);
  const hayVencido = documentos.some(([, fecha]) => fecha && diasHasta(fecha, hoy) <= 0);

  return (
    <Card className={hayVencido ? "border-red-300" : undefined}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5" />
          Documentos de {placa}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {documentos.map(([doc, fecha]) => {
          const e = estado(fecha, hoy);
          return (
            <div key={doc} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{doc}</p>
                {fecha && <p className="text-xs text-muted-foreground">{fechaCorta(fecha)}</p>}
              </div>
              <Badge variant={e.variant} className="shrink-0">
                {e.texto}
              </Badge>
            </div>
          );
        })}
        {hayVencido && (
          <p className="pt-1 text-sm font-medium text-red-700">
            No salgas con este vehículo: avisa a Regulación.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
